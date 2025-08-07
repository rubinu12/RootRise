import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Question from '@/models/Question';
import { validateSession } from '@/lib/authUtils';

export const dynamic = 'force-dynamic';

/**
 * @route   GET /api/questions/all
 * @desc    Fetches ALL questions, intended for the admin panel.
 * @access  Private (Admin Only)
 */
export async function GET(request: NextRequest) {
  const session = await validateSession(request);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized: Admins only.' }, { status: 401 });
  }

  await dbConnect();

  try {
    const questions = await Question.find({});
    
    return NextResponse.json({ success: true, data: questions }, { status: 200 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: `Server Error: ${errorMessage}` }, { status: 500 });
  }
}