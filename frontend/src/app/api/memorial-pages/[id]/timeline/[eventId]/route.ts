import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; eventId: string } }
) {
  try {
    const token = request.headers.get('authorization');
    const body = await request.json();

    const response = await fetch(
      `${BACKEND_URL}/api/memorial-pages/timeline-events/${params.eventId}`,
      {
        method: 'PUT',
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
    console.error('Error updating timeline event:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка при обновлении события' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; eventId: string } }
) {
  try {
    const token = request.headers.get('authorization');

    const response = await fetch(
      `${BACKEND_URL}/api/memorial-pages/timeline-events/${params.eventId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: token }),
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error deleting timeline event:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка при удалении события' },
      { status: 500 }
    );
  }
}
