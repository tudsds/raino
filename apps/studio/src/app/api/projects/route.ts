import { NextRequest, NextResponse } from 'next/server';
import { mockProjects } from '@/lib/mock-data';

export async function GET() {
  return NextResponse.json({
    projects: mockProjects,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newProject = {
      id: `proj-${Date.now()}`,
      name: body.name || 'Untitled Project',
      description: body.description || '',
      status: 'draft' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progress: 0,
    };

    return NextResponse.json(
      {
        project: newProject,
        message: 'Project created successfully',
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ error: 'Failed to create project' }, { status: 400 });
  }
}
