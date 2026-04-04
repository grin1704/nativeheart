import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET(
  request: NextRequest,
  { params }: { params: { pageId: string } }
) {
  try {
    const { pageId } = params;
    const { searchParams } = new URL(request.url);
    
    // Forward query parameters (format, size, etc.)
    const queryString = searchParams.toString();
    const url = `${API_BASE_URL}/api/qr-code/${pageId}/download${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
      },
    });

    if (!response.ok) {
      const data = await response.json();
      return NextResponse.json(
        { error: data.error || 'Failed to download QR code' },
        { status: response.status }
      );
    }

    // Forward the file response
    const blob = await response.blob();
    const contentType = response.headers.get('content-type') || 'image/png';
    const contentDisposition = response.headers.get('content-disposition') || 'attachment; filename="qr-code.png"';

    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': contentDisposition,
      },
    });
  } catch (error) {
    console.error('QR code download API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
