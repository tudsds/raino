import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/require-auth';
import { verifyProjectOwnership } from '@/lib/data/project-queries';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  try {
    const { id } = await params;
    console.log('[api/projects/[id]] Fetching project:', id, 'for user:', auth.user.id);
    
    const ownership = await verifyProjectOwnership(id, auth.user.id);
    
    if (!ownership.authorized) {
      console.log('[api/projects/[id]] Unauthorized access or project not found');
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ project: ownership.project });
  } catch (error: any) {
    console.error('[api/projects/[id]] GET failed:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch project',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 400 });
  }
}
