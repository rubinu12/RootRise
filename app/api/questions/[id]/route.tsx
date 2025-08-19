// app/api/questions/[id]/route.tsx
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { verifyFirebaseSession } from '@/lib/auth/server';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: {
    id: string;
  };
};

/**
 * Handles GET requests to /api/questions/[id].
 * Fetches a single question by its ID from Firestore.
 */
export async function GET(req: NextRequest, { params }: RouteContext) {
  // This route can remain public or be protected based on requirements.
  // For now, let's assume it's public for simplicity.
  try {
    const questionDoc = await adminDb.collection('questions').doc(params.id).get();
    if (!questionDoc.exists) {
      return NextResponse.json({ success: false, error: 'Question not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: { _id: questionDoc.id, ...questionDoc.data() } }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Server Error: ' + error.message }, { status: 500 });
  }
}

/**
 * Handles PUT requests to /api/questions/[id].
 * Updates a specific question in Firestore.
 */
export async function PUT(req: NextRequest, { params }: RouteContext) {
  const decodedToken = await verifyFirebaseSession(req);
  const userDoc = decodedToken ? await adminDb.collection('users').doc(decodedToken.uid).get() : null;
  const userRole = userDoc?.data()?.role;

  if (userRole !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized: Admins only.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const questionRef = adminDb.collection('questions').doc(params.id);

    // Ensure the document exists before trying to update
    const docSnap = await questionRef.get();
    if (!docSnap.exists) {
        return NextResponse.json({ success: false, error: 'Question not found' }, { status: 404 });
    }

    await questionRef.update(body);

    const updatedDoc = await questionRef.get();

    return NextResponse.json({ success: true, data: { _id: updatedDoc.id, ...updatedDoc.data() } }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

/**
 * Handles DELETE requests to /api/questions/[id].
 * Deletes a specific question from Firestore.
 */
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const decodedToken = await verifyFirebaseSession(req);
  const userDoc = decodedToken ? await adminDb.collection('users').doc(decodedToken.uid).get() : null;
  const userRole = userDoc?.data()?.role;

  if (userRole !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized: Admins only.' }, { status: 401 });
  }
  
  try {
    const questionRef = adminDb.collection('questions').doc(params.id);

    const docSnap = await questionRef.get();
    if (!docSnap.exists) {
        return NextResponse.json({ success: false, error: 'Question not found' }, { status: 404 });
    }

    await questionRef.delete();

    return NextResponse.json({ success: true, data: {} }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Server Error: ' + error.message }, { status: 500 });
  }
}