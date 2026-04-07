import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tributeId = params.id;
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/api/tributes/${tributeId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Error liking tribute:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to like tribute' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tributeId = params.id;
    const { searchParams } = new URL(request.url);
    const fingerprint = searchParams.get('fingerprint');

    const response = await fetch(
      `${BACKEND_URL}/api/tributes/${tributeId}/like?fingerprint=${fingerprint}`,
      {
        method: 'DELETE',
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Error unliking tribute:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to unlike tribute' },
      { status: 500 }
    );
  }
}
