import PreviewsPageClient from './PreviewsPageClient';
import { getSupabaseAdmin, type DbDesignJob } from '@/lib/db/supabase-admin';

interface PreviewsPageProps {
  params: Promise<{ id: string }>;
}

export default async function PreviewsPage({ params }: PreviewsPageProps) {
  const { id } = await params;
  const kicadCliPath = process.env.KICAD_CLI_PATH;

  let degradedMessage: string | undefined;

  if (kicadCliPath) {
    degradedMessage = undefined;
  } else {
    try {
      const db = getSupabaseAdmin();
      const { data: job } = await db
        .from('design_jobs')
        .select('*')
        .eq('project_id', id)
        .eq('job_type', 'DESIGN')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const designJob = (job as DbDesignJob | null) ?? null;

      if (!designJob) {
        degradedMessage =
          'Design generation not yet started. Trigger a design job to generate KiCad artifacts.';
      } else {
        switch (designJob.status) {
          case 'pending':
          case 'running':
            degradedMessage = 'Design generation in progress via GitHub Actions...';
            break;
          case 'completed':
            degradedMessage = undefined;
            break;
          case 'failed':
            degradedMessage = 'Design generation failed. Check GitHub Actions logs.';
            break;
          default:
            degradedMessage = undefined;
        }
      }
    } catch {
      degradedMessage =
        'Design generation not yet started. Trigger a design job to generate KiCad artifacts.';
    }
  }

  return <PreviewsPageClient params={params} degradedMessage={degradedMessage} />;
}
