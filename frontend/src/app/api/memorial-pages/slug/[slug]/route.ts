import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const authorization = request.headers.get('authorization');
    const { searchParams } = new URL(request.url);
    const password = searchParams.get('password');
    
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    
    // Build URL with password if provided
    const url = new URL(`${backendUrl}/api/memorial-pages/slug/${slug}`);
    if (password) {
      url.searchParams.set('password', password);
    }
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        ...(authorization && { 'Authorization': authorization }),
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { success: false, message: 'Ошибка подключения к серверу' },
      { status: 500 }
    );
  }
}