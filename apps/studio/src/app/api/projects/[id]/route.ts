import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@raino/db';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    console.log('[api/projects/[id]] Fetching project (BYPASS AUTH):', id);
    
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        specs: { orderBy: { created_at: 'desc' }, take: 1 },
        architectures: { orderBy: { created_at: 'desc' }, take: 1 },
        boms: { orderBy: { created_at: 'desc' }, take: 1 },
      }
    });
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error: any) {
    console.error('[api/projects/[id]] GET failed:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch project',
      message: error.message
    }, { status: 400 });
  }
}
