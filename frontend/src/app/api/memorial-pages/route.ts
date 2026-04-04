import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization');
    const body = await request.json();
    
    if (!authorization) {
      return NextResponse.json(
        { success: false, message: 'Authorization header required' },
        { status: 401 }
      );
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    const response = await fetch(`${backendUrl}/api/memorial-pages`, {
      method: 'POST',
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
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

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization');
    
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    const response = await fetch(`${backendUrl}/api/memorial-pages`, {
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