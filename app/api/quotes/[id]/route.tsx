import { NextResponse, NextRequest } from 'next/server'; // Import NextRequest
import dbConnect from '@/lib/dbConnect';
import Quote from '@/models/Quote';

export const dynamic = 'force-dynamic';

/**
 * Handles PUT requests to /api/quotes/[id].
 * Updates a specific quote.
 */
// Add types for the 'request' and 'params' parameters
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();

  try {
    const body = await request.json();
    const quote = await Quote.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });

    if (!quote) {
      return NextResponse.json({ success: false, error: 'Quote not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: quote }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}

/**
 * Handles DELETE requests to /api/quotes/[id].
 * Deletes a specific quote.
 */
// Add types for the 'request' and 'params' parameters
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();

  try {
    const deletedQuote = await Quote.deleteOne({ _id: params.id });
    if (deletedQuote.deletedCount === 0) {
      return NextResponse.json({ success: false, error: 'Quote not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: {} }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
