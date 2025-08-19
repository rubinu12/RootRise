// app/api/questions/all/route.tsx
import { NextResponse, NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { verifyFirebaseSession } from '@/lib/auth/server';

export const dynamic = 'force-dynamic';

/**
 * @route   GET /api/questions/all
 * @desc    Fetches ALL questions, intended for the admin panel.
 * @access  Private (Admin Only)
 */
export async function GET(request: NextRequest) {
  const decodedToken = await verifyFirebaseSession(request);
  // Fetch the user's role from our 'users' collection to check if they are an admin
  const userDoc = decodedToken ? await adminDb.collection('users').doc(decodedToken.uid).get() : null;
  const userRole = userDoc?.data()?.role;

  if (userRole !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized: Admins only.' }, { status: 401 });
  }

  try {
    const questionsSnapshot = await adminDb.collection('questions').get();
    
    const questions = questionsSnapshot.docs.map(doc => ({
      _id: doc.id,
      ...doc.data()
    }));
    
    return NextResponse.json({ success: true, data: questions }, { status: 200 });

  } catch (error) {
    console.error("Failed to fetch all questions:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: `Server Error: ${errorMessage}` }, { status: 500 });
  }
}