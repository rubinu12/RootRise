// app/api/questions/route.tsx
import { NextResponse, NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { verifyFirebaseSession } from '@/lib/auth/server'; // Our new auth helper

export const dynamic = 'force-dynamic';

/**
 * @route   GET /api/questions
 * @desc    Fetches questions with advanced filtering from Firestore.
 * @access  Private
 */
export async function GET(request: NextRequest) {
  const decodedToken = await verifyFirebaseSession(request);
  if (!decodedToken) {
    return NextResponse.json({ success: false, message: 'Unauthorized: Please log in.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    
    // Start with a reference to the 'questions' collection
    let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = adminDb.collection('questions');

    // Build the query dynamically based on query parameters
    if (searchParams.get('exam')) {
      query = query.where('exam', '==', searchParams.get('exam'));
    }
    if (searchParams.get('year')) {
      // Firestore queries for numbers require the value to be a number
      const year = parseInt(searchParams.get('year')!, 10);
      if (!isNaN(year)) {
        query = query.where('year', '==', year);
      }
    }
    if (searchParams.get('subject')) {
      query = query.where('subject', '==', searchParams.get('subject'));
    }
    if (searchParams.get('topic')) {
      query = query.where('topic', '==', searchParams.get('topic'));
    }

    // Add ordering
    query = query.orderBy('year', 'desc').orderBy('paperQuestionNumber', 'asc');

    const querySnapshot = await query.get();
    
    const questions = querySnapshot.docs.map(doc => ({
      _id: doc.id, // Firestore uses 'id' for the document ID
      ...doc.data(),
    }));
    
    return NextResponse.json({ success: true, data: questions }, { status: 200 });

  } catch (error) {
    console.error("Failed to fetch questions:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: `Server Error: ${errorMessage}` }, { status: 500 });
  }
}

// --- SECURE ADMIN-ONLY ACTIONS (Updated with new session validation) ---

export async function POST(request: NextRequest) {
  const decodedToken = await verifyFirebaseSession(request);
  // We'll need to fetch the user's role from our database to check if they're an admin
  const userDoc = decodedToken ? await adminDb.collection('users').doc(decodedToken.uid).get() : null;
  const userRole = userDoc?.data()?.role;

  if (userRole !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized: Admins only.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const questionsCollection = adminDb.collection('questions');
    
    if (Array.isArray(body)) {
      const batch = adminDb.batch();
      const newQuestions: any[] = [];
      body.forEach(questionData => {
        const docRef = questionsCollection.doc(); // Auto-generate ID
        batch.set(docRef, questionData);
        newQuestions.push({ _id: docRef.id, ...questionData });
      });
      await batch.commit();
      return NextResponse.json({ success: true, data: newQuestions }, { status: 201 });
    } else {
      const newQuestionRef = await questionsCollection.add(body);
      const newQuestion = { _id: newQuestionRef.id, ...body };
      return NextResponse.json({ success: true, data: newQuestion }, { status: 201 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
    const decodedToken = await verifyFirebaseSession(request);
    const userDoc = decodedToken ? await adminDb.collection('users').doc(decodedToken.uid).get() : null;
    const userRole = userDoc?.data()?.role;

    if (userRole !== 'admin') {
        return NextResponse.json({ success: false, message: 'Unauthorized: Admins only.' }, { status: 401 });
    }

    try {
        const { ids } = await request.json();
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ success: false, error: 'Please provide an array of IDs to delete.' }, { status: 400 });
        }
        
        const batch = adminDb.batch();
        const questionsCollection = adminDb.collection('questions');
        ids.forEach(id => {
            batch.delete(questionsCollection.doc(id));
        });
        await batch.commit();

        return NextResponse.json({ success: true, message: `Questions deleted successfully.` }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Server Error: ' + (error as Error).message }, { status: 500 });
    }
}