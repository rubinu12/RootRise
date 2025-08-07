import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Quote from '@/models/Quote';

export const dynamic = 'force-dynamic';

/**
 * Handles GET requests to /api/quotes.
 * Fetches ALL quotes from the database for the admin panel.
 */
export async function GET() {
  await dbConnect();

  try {
    const quotes = await Quote.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: quotes }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server Error: ' + (error as Error).message }, { status: 500 });
  }
}

/**
 * Handles POST requests to /api/quotes.
 * Creates a single new quote in the database.
 */
export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    const body = await request.json();
    const newQuote = await Quote.create(body);
    return NextResponse.json({ success: true, data: newQuote }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}
