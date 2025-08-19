// app/api/test-result/route.tsx
import { NextResponse, NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { verifyFirebaseSession } from '@/lib/auth/server';

export const dynamic = 'force-dynamic';

/**
 * @route   POST /api/test-results
 * @desc    Save a user's test result to the Firestore database.
 * @access  Private
 */
export async function POST(request: NextRequest) {
  const decodedToken = await verifyFirebaseSession(request);
  if (!decodedToken) {
    return NextResponse.json({ success: false, message: 'Unauthorized: Please log in.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    // Attach the user's ID (uid from Firebase) and a timestamp to the result data
    const resultData = { 
        ...body, 
        userId: decodedToken.uid,
        createdAt: new Date(),
    };
    
    // Add the new test result document to the 'testResults' collection
    const newTestResultRef = await adminDb.collection('testResults').add(resultData);
    
    return NextResponse.json({ 
        success: true, 
        data: { id: newTestResultRef.id, ...resultData } 
    }, { status: 201 });

  } catch (error) {
    console.error('Failed to save test result:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: `Server Error: ${errorMessage}` }, { status: 500 });
  }
}