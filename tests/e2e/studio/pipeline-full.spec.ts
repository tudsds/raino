/**
 * Full 12-Step Pipeline E2E Test
 *
 * Exercises the entire Raino pipeline via API calls with MOCK_LLM=true
 * for deterministic responses. Uses Supabase admin client to set up
 * authenticated test context.
 *
 * Pipeline steps tested:
 *  1. POST /api/projects                     → create project
 *  2. POST /api/projects/:id/intake          → send initial description (SSE stream)
 *  3. Continue intake until status → clarifying
 *  4. Continue intake until status → spec_compiled
 *  5. POST /api/projects/:id/architecture/plan → get architecture recommendation (SSE)
 *  6. POST /api/projects/:id/ingest/candidates → submit candidate parts
 *  7. POST /api/projects/:id/ingest/trigger  → start ingestion pipeline
 *  8. GET  /api/projects/:id/ingest/status   → poll until complete
 *  9. POST /api/projects/:id/bom/generate    → generate BOM (SSE)
 * 10. POST /api/projects/:id/design          → queue design job
 * 11. POST /api/projects/:id/validate        → run validation
 * 12. POST /api/projects/:id/quote           → generate rough quote
 *
 * Final assertion: project status === 'quoted'
 */
import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

// ─── Constants ──────────────────────────────────────────────────────────────────

const EVIDENCE_DIR = join(process.cwd(), '.sisyphus', 'evidence', 'task-29-e2e');
const BASE_URL = 'http://localhost:3001';

const TEST_USER_EMAIL = `e2e-pipeline-${Date.now()}@test.raino.dev`;
const TEST_USER_PASSWORD = 'E2ePipelineTest2024!Secure';

const POLL_INTERVAL_MS = 500;
const POLL_TIMEOUT_MS = 30_000;

// ─── Ensure evidence directory ───────────────────────────────────────────────────

mkdirSync(EVIDENCE_DIR, { recursive: true });

// ─── Shared state across serial tests ────────────────────────────────────────────

let projectId = '';
let authCookieString = '';
const stepEvidence: Array<{ step: number; name: string; status: number; data: unknown }> = [];

// ─── Helpers ─────────────────────────────────────────────────────────────────────

/**
 * Set up a test user with Supabase admin, sign in, and return a cookie string
 * that @supabase/ssr will accept.
 *
 * Strategy:
 *  1. Create user via admin API (with password + auto-confirm)
 *  2. Call `ensure_user_and_org` RPC to provision org membership
 *  3. Sign in with password to get a valid session
 *  4. Build cookie in the format @supabase/ssr reads
 */
async function setupAuthenticatedUser(): Promise<string> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    throw new Error(
      'Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, ' +
        'and SUPABASE_SERVICE_ROLE_KEY to run pipeline E2E tests.',
    );
  }

  // Admin client for user creation
  const admin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Create test user with password
  const { data: userData, error: createError } = await admin.auth.admin.createUser({
    email: TEST_USER_EMAIL,
    password: TEST_USER_PASSWORD,
    email_confirm: true,
  });

  if (createError) {
    throw new Error(`Failed to create test user: ${createError.message}`);
  }

  const supabaseUserId = userData.user.id;

  // Provision user row + org membership via RPC
  const { error: rpcError } = await admin.rpc('ensure_user_and_org', {
    p_email: TEST_USER_EMAIL,
    p_full_name: 'E2E Pipeline Test User',
    p_supabase_user_id: supabaseUserId,
  });

  if (rpcError) {
    throw new Error(`Failed to provision user/org: ${rpcError.message}`);
  }

  // Sign in with password to get a valid session
  const anonClient = createClient(supabaseUrl, supabaseAnonKey);
  const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
    email: TEST_USER_EMAIL,
    password: TEST_USER_PASSWORD,
  });

  if (signInError || !signInData.session) {
    throw new Error(`Failed to sign in test user: ${signInError?.message ?? 'No session'}`);
  }

  // Build the cookie that @supabase/ssr expects
  // The project ref is extracted from the Supabase URL
  const urlObj = new URL(supabaseUrl);
  const projectRef = urlObj.hostname.split('.')[0];
  const cookieName = `sb-${projectRef}-auth-token`;

  // @supabase/ssr v0.10 stores the session as a base64-encoded JSON string
  const cookieValue = Buffer.from(JSON.stringify(signInData.session)).toString('base64');

  return `${cookieName}=${cookieValue}`;
}

/**
 * Collect SSE stream events into a single string and return all parsed events.
 */
async function collectSSE(response: Response): Promise<Array<Record<string, unknown>>> {
  const text = await response.text();
  const events: Array<Record<string, unknown>> = [];

  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('data: ')) {
      try {
        events.push(JSON.parse(trimmed.slice(6)));
      } catch {
        // Skip malformed SSE lines
      }
    }
  }

  return events;
}

/**
 * Save step evidence to disk and record in the evidence array.
 */
function recordStep(step: number, name: string, status: number, data: unknown) {
  stepEvidence.push({ step, name, status, data });
  const filename = join(EVIDENCE_DIR, `step-${String(step).padStart(2, '0')}-${name}.json`);
  writeFileSync(filename, JSON.stringify({ step, name, status, data }, null, 2));
}

/**
 * Poll project status until it matches the expected value or times out.
 */
async function pollStatus(
  request: import('@playwright/test').APIRequestContext,
  expectedStatus: string,
): Promise<Record<string, unknown>> {
  const start = Date.now();

  while (Date.now() - start < POLL_TIMEOUT_MS) {
    const res = await request.get(`${BASE_URL}/api/projects/${projectId}`, {
      headers: { Cookie: authCookieString },
    });
    const body = (await res.json()) as Record<string, unknown>;

    if (body.status === expectedStatus) {
      return body;
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  throw new Error(`Timed out waiting for status '${expectedStatus}' (project: ${projectId})`);
}

/**
 * Write a summary file of all recorded steps.
 */
function writeSummary() {
  const lines = [
    'Raino Full Pipeline E2E Test Summary',
    '='.repeat(40),
    `Timestamp: ${new Date().toISOString()}`,
    `Project ID: ${projectId}`,
    `Base URL: ${BASE_URL}`,
    `MOCK_LLM: ${process.env.MOCK_LLM ?? 'not set'}`,
    '',
    'Steps:',
    '-'.repeat(40),
  ];

  for (const entry of stepEvidence) {
    lines.push(`  Step ${entry.step}: ${entry.name} → HTTP ${entry.status}`);
  }

  lines.push('', '='.repeat(40));
  writeFileSync(join(EVIDENCE_DIR, 'summary.txt'), lines.join('\n'));
}

// ─── Test Suite ──────────────────────────────────────────────────────────────────

test.describe.configure({ mode: 'serial' });

test.describe('Full 12-Step Pipeline E2E', () => {
  // ─── Setup: authenticate ────────────────────────────────────────────────────

  test('setup: authenticate test user', async ({ request }) => {
    test.setTimeout(60_000);
    authCookieString = await setupAuthenticatedUser();

    // Verify auth works by fetching projects
    const res = await request.get(`${BASE_URL}/api/projects`, {
      headers: { Cookie: authCookieString },
    });
    expect(res.ok()).toBeTruthy();
    const body = (await res.json()) as Record<string, unknown>;
    expect(body).toHaveProperty('projects');
  });

  // ─── Step 1: Create Project ─────────────────────────────────────────────────

  test('step 01: POST /api/projects → create project', async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/projects`, {
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookieString,
      },
      data: {
        name: 'E2E Motor Driver Board',
        description: 'A motor driver PCB with RP2040, USB-C, and H-bridge output',
      },
    });

    expect(res.status()).toBe(201);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body).toHaveProperty('project');

    const project = body.project as Record<string, unknown>;
    projectId = project.id as string;
    expect(projectId).toBeTruthy();
    expect(project.name).toBe('E2E Motor Driver Board');
    expect(project.status).toBe('intake');

    recordStep(1, 'create-project', res.status(), body);
  });

  // ─── Step 2: Intake — Send Initial Description ──────────────────────────────

  test('step 02: POST /api/projects/:id/intake → send initial description', async ({ request }) => {
    expect(projectId).toBeTruthy();

    const res = await request.post(`${BASE_URL}/api/projects/${projectId}/intake`, {
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookieString,
      },
      data: {
        message: 'I want to build a motor driver board using an RP2040 microcontroller with USB-C power input and an H-bridge output capable of driving 2A at 12V.',
      },
    });

    expect(res.ok()).toBeTruthy();
    expect(res.headers()['content-type']).toContain('text/event-stream');

    const events = await collectSSE(res as unknown as Response);
    const contentEvents = events.filter((e) => e.type === 'content');
    expect(contentEvents.length).toBeGreaterThan(0);

    const doneEvents = events.filter((e) => e.type === 'done');
    expect(doneEvents.length).toBe(1);

    recordStep(2, 'intake-initial', res.status(), {
      eventCount: events.length,
      contentChunks: contentEvents.length,
      hasDone: doneEvents.length === 1,
    });
  });

  // ─── Step 3: Continue Intake Until Clarifying ───────────────────────────────

  test('step 03: continue intake until status → clarifying', async ({ request }) => {
    expect(projectId).toBeTruthy();

    // Send a second message to trigger clarifying status (need 2+ user messages)
    const res = await request.post(`${BASE_URL}/api/projects/${projectId}/intake`, {
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookieString,
      },
      data: {
        message: 'The board should be compact, around 50mm x 30mm, 2-layer PCB. I need USB-C for power and programming, and at least 4 PWM channels for motor control.',
      },
    });

    expect(res.ok()).toBeTruthy();
    const events = await collectSSE(res as unknown as Response);
    const doneEvents = events.filter((e) => e.type === 'done');
    expect(doneEvents.length).toBe(1);

    // Poll until status is 'clarifying'
    const project = await pollStatus(request, 'clarifying');
    expect(project.status).toBe('clarifying');

    recordStep(3, 'intake-clarifying', 200, { status: project.status });
  });

  // ─── Step 4: Continue Intake Until Spec Compiled ────────────────────────────

  test('step 04: continue intake until status → spec_compiled', async ({ request }) => {
    expect(projectId).toBeTruthy();

    // Send message 3 — answer clarification questions
    const res3 = await request.post(`${BASE_URL}/api/projects/${projectId}/intake`, {
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookieString,
      },
      data: {
        message: 'Target volume is 100 boards for prototyping. No specific regulatory requirements yet, but it should operate in 0-70°C range.',
      },
    });
    expect(res3.ok()).toBeTruthy();
    await collectSSE(res3 as unknown as Response);

    // Send message 4 — trigger spec compilation (need 4+ user messages when in clarifying)
    const res4 = await request.post(`${BASE_URL}/api/projects/${projectId}/intake`, {
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookieString,
      },
      data: {
        message: 'I want to use an AP2112 LDO for 3.3V regulation, and include a WS2812B status LED. Board should have castellated edge pads for the GPIO.',
      },
    });
    expect(res4.ok()).toBeTruthy();
    await collectSSE(res4 as unknown as Response);

    // Poll until status is 'spec_compiled'
    const project = await pollStatus(request, 'spec_compiled');
    expect(project.status).toBe('spec_compiled');

    recordStep(4, 'intake-spec-compiled', 200, { status: project.status });
  });

  // ─── Step 5: Architecture Planning ──────────────────────────────────────────

  test('step 05: POST /api/projects/:id/architecture/plan → plan architecture', async ({ request }) => {
    expect(projectId).toBeTruthy();

    const res = await request.post(`${BASE_URL}/api/projects/${projectId}/architecture/plan`, {
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookieString,
      },
    });

    expect(res.ok()).toBeTruthy();
    expect(res.headers()['content-type']).toContain('text/event-stream');

    const events = await collectSSE(res as unknown as Response);
    const doneEvents = events.filter((e) => e.type === 'done');
    expect(doneEvents.length).toBe(1);

    const doneData = doneEvents[0] as Record<string, unknown>;
    expect(doneData).toHaveProperty('architecture');

    const architecture = doneData.architecture as Record<string, unknown>;
    expect(architecture).toHaveProperty('mcu');
    expect(typeof architecture.mcu).toBe('string');

    // Verify project status advanced
    const project = await pollStatus(request, 'architecture_planned');
    expect(project.status).toBe('architecture_planned');

    recordStep(5, 'architecture-plan', res.status(), {
      architecture: doneData.architecture,
      status: project.status,
    });
  });

  // ─── Step 6: Submit Ingest Candidates ───────────────────────────────────────

  test('step 06: POST /api/projects/:id/ingest/candidates → submit parts', async ({ request }) => {
    expect(projectId).toBeTruthy();

    const res = await request.post(`${BASE_URL}/api/projects/${projectId}/ingest/candidates`, {
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookieString,
      },
      data: {
        candidates: [
          {
            family: 'RP2040',
            manufacturer: 'Raspberry Pi',
            mpns: ['RP2040'],
          },
          {
            family: 'W25Q128',
            manufacturer: 'Winbond',
            mpns: ['W25Q128JVSIM'],
          },
          {
            family: 'AP2112',
            manufacturer: 'Diodes Inc',
            mpns: ['AP2112K-3.3TRG1'],
          },
        ],
      },
    });

    expect(res.ok()).toBeTruthy();
    const body = (await res.json()) as Record<string, unknown>;
    expect(body).toHaveProperty('candidates');
    expect(body).toHaveProperty('manifestId');

    const candidates = body.candidates as Array<Record<string, unknown>>;
    expect(candidates.length).toBe(3);

    recordStep(6, 'ingest-candidates', res.status(), body);
  });

  // ─── Step 7: Trigger Ingestion ──────────────────────────────────────────────

  test('step 07: POST /api/projects/:id/ingest/trigger → start ingestion', async ({ request }) => {
    expect(projectId).toBeTruthy();

    const res = await request.post(`${BASE_URL}/api/projects/${projectId}/ingest/trigger`, {
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookieString,
      },
      data: { mode: 'fixture' },
    });

    expect(res.ok()).toBeTruthy();
    const body = (await res.json()) as Record<string, unknown>;
    expect(body).toHaveProperty('runId');
    expect(body).toHaveProperty('status');
    expect(body).toHaveProperty('stages');

    const stages = body.stages as Array<Record<string, unknown>>;
    expect(stages.length).toBeGreaterThan(0);

    recordStep(7, 'ingest-trigger', res.status(), {
      runId: body.runId,
      status: body.status,
      stageCount: stages.length,
      summary: body.summary,
    });
  });

  // ─── Step 8: Poll Ingestion Status ──────────────────────────────────────────

  test('step 08: GET /api/projects/:id/ingest/status → verify completion', async ({ request }) => {
    expect(projectId).toBeTruthy();

    // Ingestion may already be complete (fixture mode is fast), but poll anyway
    const start = Date.now();
    let body: Record<string, unknown> = {};

    while (Date.now() - start < POLL_TIMEOUT_MS) {
      const res = await request.get(`${BASE_URL}/api/projects/${projectId}/ingest/status`, {
        headers: { Cookie: authCookieString },
      });
      expect(res.ok()).toBeTruthy();
      body = (await res.json()) as Record<string, unknown>;

      if (body.status === 'completed' || body.progress === 100) {
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }

    expect(body.status).toBe('completed');
    expect(body.progress).toBe(100);

    recordStep(8, 'ingest-status', 200, body);
  });

  // ─── Step 9: Generate BOM ───────────────────────────────────────────────────

  test('step 09: POST /api/projects/:id/bom/generate → generate BOM', async ({ request }) => {
    expect(projectId).toBeTruthy();

    const res = await request.post(`${BASE_URL}/api/projects/${projectId}/bom/generate`, {
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookieString,
      },
    });

    expect(res.ok()).toBeTruthy();
    expect(res.headers()['content-type']).toContain('text/event-stream');

    const events = await collectSSE(res as unknown as Response);
    const doneEvents = events.filter((e) => e.type === 'done');
    expect(doneEvents.length).toBe(1);

    const doneData = doneEvents[0] as Record<string, unknown>;
    expect(doneData).toHaveProperty('bom');

    const bom = doneData.bom as Record<string, unknown>;
    expect(bom).toHaveProperty('id');
    expect(bom).toHaveProperty('items');
    expect(bom).toHaveProperty('totalCost');

    const items = bom.items as Array<Record<string, unknown>>;
    expect(items.length).toBeGreaterThan(0);

    // Verify project status
    const project = await pollStatus(request, 'bom_generated');
    expect(project.status).toBe('bom_generated');

    recordStep(9, 'bom-generate', res.status(), {
      bomId: bom.id,
      lineCount: items.length,
      totalCost: bom.totalCost,
    });
  });

  // ─── Step 10: Queue Design Job ──────────────────────────────────────────────

  test('step 10: POST /api/projects/:id/design → queue design job', async ({ request }) => {
    expect(projectId).toBeTruthy();

    const res = await request.post(`${BASE_URL}/api/projects/${projectId}/design`, {
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookieString,
      },
    });

    // Design endpoint returns 202 Accepted
    expect(res.status()).toBe(202);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body).toHaveProperty('jobId');
    expect(body).toHaveProperty('status');
    expect(body).toHaveProperty('message');

    recordStep(10, 'design-job', res.status(), {
      jobId: body.jobId,
      status: body.status,
      message: body.message,
    });
  });

  // ─── Step 11: Run Validation ────────────────────────────────────────────────

  test('step 11: POST /api/projects/:id/validate → run validation', async ({ request }) => {
    expect(projectId).toBeTruthy();

    const res = await request.post(`${BASE_URL}/api/projects/${projectId}/validate`, {
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookieString,
      },
    });

    expect(res.ok()).toBeTruthy();
    const body = (await res.json()) as Record<string, unknown>;
    expect(body).toHaveProperty('validation');
    expect(body).toHaveProperty('jobId');

    const validation = body.validation as Record<string, unknown>;
    expect(validation).toHaveProperty('erc');
    expect(validation).toHaveProperty('drc');

    // Verify project status
    const project = await pollStatus(request, 'validated');
    expect(project.status).toBe('validated');

    recordStep(11, 'validate', res.status(), {
      validation,
      jobId: body.jobId,
    });
  });

  // ─── Step 12: Generate Quote ────────────────────────────────────────────────

  test('step 12: POST /api/projects/:id/quote → generate rough quote', async ({ request }) => {
    expect(projectId).toBeTruthy();

    const res = await request.post(`${BASE_URL}/api/projects/${projectId}/quote`, {
      headers: {
        'Content-Type': 'application/json',
        Cookie: authCookieString,
      },
      data: { quantity: 100 },
    });

    expect(res.ok()).toBeTruthy();
    const body = (await res.json()) as Record<string, unknown>;
    expect(body).toHaveProperty('quote');

    const quote = body.quote as Record<string, unknown>;
    expect(quote).toHaveProperty('id');
    expect(quote).toHaveProperty('low');
    expect(quote).toHaveProperty('mid');
    expect(quote).toHaveProperty('high');
    expect(quote).toHaveProperty('confidence');
    expect(quote).toHaveProperty('breakdown');
    expect(quote).toHaveProperty('assumptions');

    // Quote should have numeric confidence bands
    expect(typeof quote.low).toBe('number');
    expect(typeof quote.mid).toBe('number');
    expect(typeof quote.high).toBe('number');
    expect(quote.low as number).toBeLessThan(quote.mid as number);
    expect(quote.mid as number).toBeLessThan(quote.high as number);

    // Verify final project status
    const project = await pollStatus(request, 'quoted');
    expect(project.status).toBe('quoted');

    recordStep(12, 'quote', res.status(), {
      quoteId: quote.id,
      low: quote.low,
      mid: quote.mid,
      high: quote.high,
      confidence: quote.confidence,
      isEstimate: quote.isEstimate,
    });
  });

  // ─── Final: Write Summary ───────────────────────────────────────────────────

  test('final: write summary and verify all steps completed', async () => {
    expect(stepEvidence.length).toBe(12);
    expect(projectId).toBeTruthy();

    // All steps should have 2xx status codes
    for (const entry of stepEvidence) {
      expect(
        entry.status >= 200 && entry.status < 300,
        `Step ${entry.step} (${entry.name}) returned HTTP ${entry.status}`,
      ).toBeTruthy();
    }

    writeSummary();
  });
});
