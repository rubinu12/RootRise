import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Quote from '@/models/Quote';

export const dynamic = 'force-dynamic';

/**
 * Handles GET requests to /api/quotes/random.
 * Fetches one single random quote from the database.
 */
export async function GET() {
  await dbConnect();

  try {
    // 1. Get the total count of quotes in the database.
    const count = await Quote.countDocuments();
    
    // If there are no quotes, return a default one.
    if (count === 0) {
      return NextResponse.json({ 
        success: true, 
        quote: '"The expert in anything was once a beginner." - Anonymous' 
      }, { status: 200 });
    }
    
    // 2. Generate a random number (index) from 0 to count - 1.
    const randomIndex = Math.floor(Math.random() * count);
    
    // 3. Fetch one single quote at that random index.
    const randomQuote = await Quote.findOne().skip(randomIndex);

    if (!randomQuote) {
      return NextResponse.json({ success: false, error: 'No quotes found.' }, { status: 404 });
    }

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
