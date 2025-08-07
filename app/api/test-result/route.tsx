import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import TestResult from '@/models/TestResult';
import { validateSession } from '@/lib/authUtils';

export const dynamic = 'force-dynamic';

/**
 * @route   POST /api/test-results
 * @desc    Save a user's test result to the database.
 * @access  Private
 */
export async function POST(request: NextRequest) {
  const session = await validateSession(request);
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized: Please log in.' }, { status: 401 });
  }

  await dbConnect();

  try {
    const body = await request.json();
    
    // Attach the user's ID to the result data
    const resultData = { ...body, userId: session._id };
    
    const newTestResult = await TestResult.create(resultData);
    
    return NextResponse.json({ success: true, data: newTestResult }, { status: 201 });

  } catch (error) {
    console.error('Failed to save test result:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: `Server Error: ${errorMessage}` }, { status: 500 });
  }
}