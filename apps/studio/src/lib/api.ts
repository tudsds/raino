const API_BASE = '/api';

export interface ApiProject {
  id: string;
  name: string;
  description: string | null;
  status: string;
  currentStep: number;
  totalSteps: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  attachments?: string[];
}

export interface ApiBOMRow {
  id: string;
  ref: string;
  value: string;
  mpn: string;
  manufacturer: string;
  package: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  lifecycle: string;
  risk: string;
  description: string;
  alternates: string[];
}

export interface ApiBOM {
  id: string;
  totalCost: number;
  currency: string;
  lineCount: number;
  isEstimate: boolean;
  items: ApiBOMRow[];
}

export interface ApiQuote {
  id: string;
  low: number;
  mid: number;
  high: number;
  confidence: string;
  breakdown: Array<{ label: string; value: number }>;
  assumptions: string[];
  isEstimate: boolean;
  quantity: number;
  generatedAt: string;
  validUntil: string;
}

export interface ApiDownload {
  id: string;
  name: string;
  type: string;
  sizeBytes: number;
  checksum: string;
  generatedAt: string;
  mimeType: string;
}

export async function fetchProjects(): Promise<ApiProject[]> {
  const response = await fetch(`${API_BASE}/projects`);
  if (!response.ok) throw new Error('Failed to fetch projects');
  const data = await response.json();
  return data.projects;
}

export async function createProject(project: Partial<ApiProject>): Promise<ApiProject> {
  const response = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project),
  });
  if (!response.ok) throw new Error('Failed to create project');
  const data = await response.json();
  return data.project;
}

export async function sendIntakeMessage(projectId: string, message: string): Promise<ApiMessage> {
  const response = await fetch(`${API_BASE}/projects/${projectId}/intake`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  if (!response.ok) throw new Error('Failed to send message');
  const data = await response.json();
  return data.message;
}

export async function fetchBOM(projectId: string): Promise<ApiBOM> {
  const response = await fetch(`${API_BASE}/projects/${projectId}/bom`);
  if (!response.ok) throw new Error('Failed to fetch BOM');
  const data = await response.json();
  return data.bom;
}

export async function updateBOM(projectId: string, item: unknown): Promise<void> {
  const response = await fetch(`${API_BASE}/projects/${projectId}/bom`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  if (!response.ok) throw new Error('Failed to update BOM');
}

export async function generateQuote(projectId: string, quantity: number): Promise<ApiQuote> {
  const response = await fetch(`${API_BASE}/projects/${projectId}/quote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity }),
  });
  if (!response.ok) throw new Error('Failed to generate quote');
  const data = await response.json();
  return data.quote;
}

export async function submitHandoff(
  projectId: string,
  type: string,
  quantity: number,
): Promise<{ handoffId: string; status: string }> {
  const response = await fetch(`${API_BASE}/projects/${projectId}/handoff`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, quantity }),
  });
  if (!response.ok) throw new Error('Failed to submit handoff');
  return response.json();
}

export async function downloadFile(file: ApiDownload): Promise<void> {
  console.log('Downloading file:', file.name);
}
