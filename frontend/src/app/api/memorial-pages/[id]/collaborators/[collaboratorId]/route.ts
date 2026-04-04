import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; collaboratorId: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    const response = await fetch(
      `${BACKEND_URL}/api/memorial-pages/${params.id}/collaborators/${params.collaboratorId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}
