import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const url = `${BACKEND_URL}/api/memorial-pages/${params.id}/timeline`;
    console.log('[Timeline API] GET request to:', url);
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('[Timeline API] Backend response status:', response.status);
    
    const data = await response.json();
    console.log('[Timeline API] Backend response data:', data);

    if (!response.ok) {
      console.error('[Timeline API] Backend error:', data);
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Timeline API] Error fetching timeline events:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка при загрузке событий' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization');
    const body = await request.json();

    const response = await fetch(
      `${BACKEND_URL}/api/memorial-pages/${params.id}/timeline`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: token }),
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating timeline event:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка при создании события' },
      { status: 500 }
    );
  }
}
