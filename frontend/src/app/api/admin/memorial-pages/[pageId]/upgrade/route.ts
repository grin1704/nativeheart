import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function POST(
  request: NextRequest,
  { params }: { params: { pageId: string } }
) {
  const authorization = request.headers.get('authorization');
  if (!authorization) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const res = await fetch(`${BACKEND_URL}/api/admin/memorial-pages/${params.pageId}/upgrade`, {
    method: 'POST',
    headers: { Authorization: authorization },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
