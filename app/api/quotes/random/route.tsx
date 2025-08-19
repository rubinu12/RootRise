// app/api/quotes/random/route.tsx
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

/**
 * Handles GET requests to /api/quotes/random.
 * Fetches one single random quote from the Firestore database.
 */
export async function GET() {
  try {
    const quotesSnapshot = await adminDb.collection('quotes').get();
    
    if (quotesSnapshot.empty) {
      // If there are no quotes, return a default one.
      return NextResponse.json({ 
        success: true, 
        quote: '"The expert in anything was once a beginner." - Anonymous' 
      }, { status: 200 });
    }
    
    // 1. Get all quote documents from the snapshot.
    const quotes = quotesSnapshot.docs.map(doc => doc.data());
    
    // 2. Generate a random index.
    const randomIndex = Math.floor(Math.random() * quotes.length);
    
    // 3. Select the quote at that random index.
    const randomQuote = quotes[randomIndex];

    return NextResponse.json({
      success: true,
      quote: `"${randomQuote.text}" - ${randomQuote.author}`,
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Server Error: ' + (error as Error).message,
    }, { status: 500 });
  }
}