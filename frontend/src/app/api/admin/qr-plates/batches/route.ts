import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  const authorization = request.headers.get('authorization');
  if (!authorization) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  const res = await fetch(`${BACKEND_URL}/api/admin/qr-plates/batches`, {
    headers: { Authorization: authorization },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(request: NextRequest) {
  const authorization = request.headers.get('authorization');
  if (!authorization) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const res = await fetch(`${BACKEND_URL}/api/admin/qr-plates/batches`, {
    method: 'POST',
    headers: { Authorization: authorization, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
