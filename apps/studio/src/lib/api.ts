import { Project, BOM, Quote, DownloadFile, Message } from './mock-data';

const API_BASE = '/api';

export async function fetchProjects(): Promise<Project[]> {
  const response = await fetch(`${API_BASE}/projects`);
  if (!response.ok) throw new Error('Failed to fetch projects');
  const data = await response.json();
  return data.projects;
}

export async function createProject(project: Partial<Project>): Promise<Project> {
  const response = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project),
  });
  if (!response.ok) throw new Error('Failed to create project');
  const data = await response.json();
  return data.project;
}

export async function sendIntakeMessage(projectId: string, message: string): Promise<Message> {
  const response = await fetch(`${API_BASE}/projects/${projectId}/intake`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  if (!response.ok) throw new Error('Failed to send message');
  const data = await response.json();
  return data.message;
}

export async function fetchBOM(projectId: string): Promise<BOM> {
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

export async function generateQuote(projectId: string, quantity: number): Promise<Quote> {
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

export async function downloadFile(file: DownloadFile): Promise<void> {
  console.log('Downloading file:', file.name);
}
