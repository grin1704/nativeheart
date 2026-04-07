import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET() {
  const res = await fetch(`${BACKEND_URL}/api/auth/vk/url`);
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
