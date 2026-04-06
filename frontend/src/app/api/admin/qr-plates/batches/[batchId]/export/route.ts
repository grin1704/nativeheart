import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET(
  request: NextRequest,
  { params }: { params: { batchId: string } }
) {
  const authorization = request.headers.get('authorization');
  if (!authorization) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const res = await fetch(
    `${BACKEND_URL}/api/admin/qr-plates/batches/${params.batchId}/export`,
    { headers: { Authorization: authorization } }
  );

  if (!res.ok) {
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  }

  const blob = await res.blob();
  const contentDisposition = res.headers.get('content-disposition') || 'attachment; filename="qr-plates.zip"';

  return new NextResponse(blob, {
    status: 200,
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': contentDisposition,
    },
  });
}
