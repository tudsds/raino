/**
 * CLI entrypoint for the KiCad design-worker.
 *
 * Invoked by .github/workflows/design-worker.yml in a runner that has
 * `kicad-cli` installed (apt package `kicad`). Claims a specific
 * `design_jobs` row by id, synthesizes a KiCad project from the project's
 * Supabase state (spec → architecture → BOM), runs ERC, exports the
 * supported artifacts, uploads them to the `artifacts` Storage bucket, and
 * writes `design_artifacts` rows.
 *
 * Env:
 *   JOB_ID                        (required) design_jobs.id to run
 *   NEXT_PUBLIC_SUPABASE_URL      (required)
 *   SUPABASE_SERVICE_ROLE_KEY     (required)
 *   KICAD_CLI_PATH                (required) path to kicad-cli binary
 */
import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { generateKiCadProject } from '../generator/project';
import { runValidationAsync } from '../validator/engine';
import { runExportAsync } from '../exporter/engine';
import { generateArtifactManifest, uploadArtifactsToStorage } from '../artifacts/manifest';
import type { BomComponent, ArchitectureSpec } from '../generator/types';
import type { ExportFormat } from '../exporter/types';

const STORAGE_BUCKET = 'artifacts';

// Export formats we attempt. Skips pcb_glb / gerbers / drc until the
// generator produces routed PCBs; schematic-only exports work on the
// minimal .kicad_sch the generator writes today.
const EXPORT_FORMATS: ExportFormat[] = ['schematic_pdf', 'netlist', 'bom_csv'];

interface ProjectRow {
  id: string;
  name: string;
}
interface BomRow {
  ref: string;
  value: string;
  mpn: string;
  manufacturer: string;
  package: string;
  quantity: number;
}
interface ArchitectureRow {
  template_name: string;
  mcu: string | null;
  power: string | null;
  interfaces: unknown;
}

function log(msg: string, extra?: Record<string, unknown>): void {
  const line = extra ? `${msg} ${JSON.stringify(extra)}` : msg;
  console.log(`[design-worker] ${line}`);
}

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env: ${name}`);
  return v;
}

function bomRowToComponent(r: BomRow): BomComponent {
  return {
    reference: r.ref,
    value: r.value,
    mpn: r.mpn,
    footprint: r.package,
    symbol: r.value,
    manufacturer: r.manufacturer,
    quantity: r.quantity,
  };
}

function architectureRowToSpec(a: ArchitectureRow | null): ArchitectureSpec {
  const interfaces = Array.isArray(a?.interfaces)
    ? (a!.interfaces as unknown[]).map((x) => String(x))
    : [];
  return {
    name: a?.template_name ?? 'unspecified',
    processorType: a?.mcu ?? 'unspecified',
    powerTopology: a?.power ?? 'unspecified',
    interfaceSet: interfaces,
    referenceTopology: {},
  };
}

async function writeBomCsv(projectPath: string, bom: BomRow[]): Promise<string> {
  const header = 'Ref,Value,MPN,Manufacturer,Package,Quantity';
  const lines = bom.map((r) =>
    [r.ref, r.value, r.mpn, r.manufacturer, r.package, String(r.quantity)]
      .map((v) => (v.includes(',') ? `"${v.replace(/"/g, '""')}"` : v))
      .join(','),
  );
  const csvPath = join(projectPath, 'bom.csv');
  await writeFile(csvPath, [header, ...lines].join('\n'), 'utf8');
  return csvPath;
}

async function collectOutputFiles(outputDir: string): Promise<string[]> {
  const out: string[] = [];
  const walk = async (dir: string): Promise<void> => {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const p = join(dir, e.name);
      if (e.isDirectory()) await walk(p);
      else if (e.isFile()) {
        try {
          const s = await stat(p);
          if (s.size > 0) out.push(p);
        } catch {
          // file vanished between readdir and stat — skip
        }
      }
    }
  };
  await walk(outputDir);
  return out;
}

async function main(): Promise<void> {
  const jobId = process.env.JOB_ID || process.argv[2];
  if (!jobId) {
    console.error('usage: run-job <jobId>  (or set JOB_ID env)');
    process.exit(1);
  }

  const supabaseUrl = requireEnv('NEXT_PUBLIC_SUPABASE_URL');
  const supabaseKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY');
  const kicadCliPath = process.env.KICAD_CLI_PATH;
  if (!kicadCliPath) {
    throw new Error(
      'KICAD_CLI_PATH is not set — worker would fall back to fixture mode. Aborting.',
    );
  }

  const db = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  log('claiming job', { jobId });
  const { data: job, error: jobErr } = await db
    .from('design_jobs')
    .select('id, project_id, status')
    .eq('id', jobId)
    .maybeSingle();
  if (jobErr || !job) {
    throw new Error(`design_jobs lookup failed: ${jobErr?.message ?? 'not found'}`);
  }
  if (job.status !== 'pending' && job.status !== 'running') {
    log('job already terminal — exiting', { status: job.status });
    return;
  }

  await db
    .from('design_jobs')
    .update({ status: 'running', started_at: new Date().toISOString(), worker_id: 'gh-actions' })
    .eq('id', jobId);

  const projectId = job.project_id;

  try {
    const projectRes = await db
      .from('projects')
      .select('id, name')
      .eq('id', projectId)
      .maybeSingle();
    const project = projectRes.data as ProjectRow | null;
    if (!project) throw new Error(`project ${projectId} not found`);

    const archRes = await db
      .from('architectures')
      .select('template_name, mcu, power, interfaces')
      .eq('project_id', projectId)
      .maybeSingle();
    const arch = archRes.data as ArchitectureRow | null;

    const bomRes = await db
      .from('boms')
      .select('id')
      .eq('project_id', projectId)
      .maybeSingle();
    const bom = bomRes.data as { id: string } | null;
    if (!bom) throw new Error(`no BOM for project ${projectId}`);

    const bomRowsRes = await db
      .from('bom_rows')
      .select('ref, value, mpn, manufacturer, package, quantity')
      .eq('bom_id', bom.id);
    const bomRows = (bomRowsRes.data ?? []) as BomRow[];
    if (bomRows.length === 0) {
      throw new Error(`BOM ${bom.id} has no rows`);
    }

    log('generating KiCad project', { components: bomRows.length });
    const generation = generateKiCadProject({
      projectId,
      projectName: project.name,
      bom: bomRows.map(bomRowToComponent),
      architecture: architectureRowToSpec(arch),
    });
    if (!generation.success || !generation.projectPath) {
      throw new Error(`generation failed: ${generation.errors.join('; ')}`);
    }
    const projectPath = generation.projectPath;
    const schematicPath = generation.schematicPath!;
    const outputDir = join(projectPath, 'out');
    await mkdir(outputDir, { recursive: true });

    log('running ERC');
    const ercResults = await runValidationAsync({
      projectId,
      projectPath: schematicPath,
      checks: ['erc'],
    });
    const ercPassed = ercResults.every((r) => r.passed);
    log('ERC complete', { passed: ercPassed });

    const exportFiles: string[] = [];
    for (const format of EXPORT_FORMATS) {
      if (format === 'bom_csv') {
        const csvPath = await writeBomCsv(outputDir, bomRows);
        exportFiles.push(csvPath);
        continue;
      }
      const isSchematicFormat = format === 'schematic_pdf' || format === 'netlist';
      const srcPath = isSchematicFormat ? schematicPath : projectPath;
      const outPath =
        format === 'schematic_pdf'
          ? join(outputDir, `${project.name}.schematic.pdf`)
          : format === 'netlist'
            ? join(outputDir, `${project.name}.net`)
            : join(outputDir, format);
      log('exporting', { format, srcPath, outPath });
      const result = await runExportAsync({
        projectId,
        projectPath: srcPath,
        format,
        outputPath: outPath,
      });
      if (result.success) exportFiles.push(...result.outputFiles);
      else log('export failed', { format, errors: result.errors });
    }

    const realFiles = await collectOutputFiles(outputDir);
    const uniqueFiles = Array.from(new Set([...exportFiles, ...realFiles]));
    const manifest = await generateArtifactManifest(projectId, uniqueFiles);
    log('artifact manifest built', { files: manifest.totalFiles, bytes: manifest.totalSize });

    const uploadResult = await uploadArtifactsToStorage(
      manifest,
      STORAGE_BUCKET,
      supabaseUrl,
      supabaseKey,
    );
    const uploadedByName = new Map(uploadResult.entries.map((e) => [e.fileName, e]));

    for (const entry of manifest.entries) {
      const uploaded = uploadedByName.get(entry.fileName);
      await db.from('design_artifacts').insert({
        project_id: projectId,
        artifact_type: entry.artifactType,
        file_path: entry.filePath,
        file_name: entry.fileName,
        file_size: entry.fileSize,
        checksum: entry.checksum,
        mime_type: entry.mimeType,
        storage_bucket: uploaded?.success ? STORAGE_BUCKET : '',
        storage_key: uploaded?.success ? uploaded.storagePath : '',
        metadata: {
          manifestId: manifest.id,
          checksumAlgorithm: entry.checksumAlgorithm,
          generatedAt: entry.generatedAt,
          ...entry.metadata,
        },
      });
    }

    const finalStatus = ercPassed ? 'completed' : 'failed';
    await db
      .from('design_jobs')
      .update({
        status: finalStatus,
        progress: ercPassed ? 100 : 0,
        completed_at: new Date().toISOString(),
        result: {
          kicadCliPath,
          erc: ercResults,
          artifactCount: manifest.totalFiles,
          uploaded: uploadResult.entries.length,
        },
        error: ercPassed
          ? null
          : ercResults
              .flatMap((r) => r.violations.map((v) => v.message))
              .join('; ') || null,
      })
      .eq('id', jobId);

    log('job finished', { status: finalStatus, artifacts: manifest.totalFiles });
    return;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log('job failed', { error: msg });
    await db
      .from('design_jobs')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error: msg,
      })
      .eq('id', jobId);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('[design-worker] unhandled error', err);
  process.exit(1);
});
