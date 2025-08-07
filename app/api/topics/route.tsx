import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Question from '@/models/Question';
import { validateSession } from '@/lib/authUtils';

export const dynamic = 'force-dynamic';

/**
 * @route   GET /api/topics
 * @desc    Fetches a unique list of topics for a given subject.
 * @access  Private
 */
export async function GET(request: NextRequest) {
  const session = await validateSession(request);
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject');

    if (!subject) {
      return NextResponse.json({ success: false, error: 'Subject parameter is required.' }, { status: 400 });
    }

    // Use the distinct() method for efficiency with the corrected query
    const topics = await Question.distinct('topic', { 
      subject: subject, 
      topic: { $nin: [null, ""] } // CORRECTED: Use $nin (not in) for multiple conditions
    });

    return NextResponse.json({ success: true, data: topics.sort() }, { status: 200 });

  } catch (error) {
    console.error("Failed to fetch topics:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: `Server Error: ${errorMessage}` }, { status: 500 });
  }
}