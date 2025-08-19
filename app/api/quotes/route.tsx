// app/api/quotes/route.tsx
import { NextResponse, NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

/**
 * Handles GET requests to /api/quotes.
 * Fetches ALL quotes from Firestore for the admin panel.
 */
export async function GET() {
  try {
    const quotesSnapshot = await adminDb.collection('quotes').orderBy('createdAt', 'desc').get();
    
    const quotes = quotesSnapshot.docs.map(doc => ({
      _id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ success: true, data: quotes }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server Error: ' + (error as Error).message }, { status: 500 });
  }
}

/**
 * Handles POST requests to /api/quotes.
 * Creates a single new quote in Firestore.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, author } = body;

    if (!text) {
        return NextResponse.json({ success: false, error: 'Quote text is required.' }, { status: 400 });
    }

    const newQuote = {
        text,
        author: author || 'Anonymous',
        createdAt: new Date(),
    };

    const newQuoteRef = await adminDb.collection('quotes').add(newQuote);
    
    return NextResponse.json({ success: true, data: { _id: newQuoteRef.id, ...newQuote } }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}