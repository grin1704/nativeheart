import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authorization = request.headers.get('authorization');

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authorization) headers['Authorization'] = authorization;

    const response = await fetch(`${BACKEND_URL}/api/tributes/like-status`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Error fetching like status:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch like status' },
      { status: 500 }
    );
  }
}
