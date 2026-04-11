import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const response = {
      clarification: {
        id: `clarify-${Date.now()}`,
        question: `Can you clarify the details about: "${body.message}"?`,
        options: [
          'Yes, proceed with the recommended option',
          'No, I want to specify custom parameters',
          'Skip this for now',
        ],
      },
      projectId: id,
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ error: 'Failed to generate clarification' }, { status: 400 });
  }
}
