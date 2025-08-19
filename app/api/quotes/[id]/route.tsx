// app/api/quotes/[id]/route.tsx
import { NextResponse, NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
// Note: We could add verifyFirebaseSession here if these routes needed to be protected.

export const dynamic = 'force-dynamic';

/**
 * Handles PUT requests to /api/quotes/[id].
 * Updates a specific quote.
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const quoteRef = adminDb.collection('quotes').doc(params.id);

    const docSnap = await quoteRef.get();
    if (!docSnap.exists) {
      return NextResponse.json({ success: false, error: 'Quote not found' }, { status: 404 });
    }

    await quoteRef.update(body);
    const updatedDoc = await quoteRef.get();
    
    return NextResponse.json({ success: true, data: { _id: updatedDoc.id, ...updatedDoc.data() } }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}

/**
 * Handles DELETE requests to /api/quotes/[id].
 * Deletes a specific quote.
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const quoteRef = adminDb.collection('quotes').doc(params.id);
    
    const docSnap = await quoteRef.get();
    if (!docSnap.exists) {
      return NextResponse.json({ success: false, error: 'Quote not found' }, { status: 404 });
    }
    
    await quoteRef.delete();

    return NextResponse.json({ success: true, data: {} }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}