import { NextRequest, NextResponse } from 'next/server';
import tributeService from '@/../../backend/src/services/tributeService';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tributeId = params.id;
    
    // Get user ID from session if authenticated
    // For now, we'll use fingerprint from request body
    const body = await request.json();
    const { fingerprint } = body;

    if (!fingerprint) {
      return NextResponse.json(
        { success: false, error: 'Fingerprint is required' },
        { status: 400 }
      );
    }

    const result = await tributeService.likeTribute(tributeId, undefined, fingerprint);

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Error liking tribute:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to like tribute' },
      { status: error.statusCode || 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tributeId = params.id;
    
    // Get fingerprint from query params
    const { searchParams } = new URL(request.url);
    const fingerprint = searchParams.get('fingerprint');

    if (!fingerprint) {
      return NextResponse.json(
        { success: false, error: 'Fingerprint is required' },
        { status: 400 }
      );
    }

    const result = await tributeService.unlikeTribute(tributeId, undefined, fingerprint);

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Error unliking tribute:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to unlike tribute' },
      { status: error.statusCode || 500 }
    );
  }
}
