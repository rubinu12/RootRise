import { NextResponse, NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin'; // Use our new Admin SDK initializer

/**
 * @route   POST /api/users
 * @desc    Create a user profile document in Firestore after Firebase Auth creation
 * @access  Public (called from client after successful signup)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, name, email, phoneNo, role } = body;

    // Basic validation
    if (!uid || !name || !email || !phoneNo) {
        return NextResponse.json({ success: false, message: 'Missing required fields.' }, { status: 400 });
    }

    // Reference to the new user document in the 'users' collection
    const userDocRef = adminDb.collection('users').doc(uid);

    const newUserProfile = {
      uid,
      name,
      email,
      phoneNo,
      role: role || 'paid', // Default new signups to 'paid' role
      createdAt: new Date(),
      lastLogin: new Date(),
      // Add any other default fields here
      profilePicture: '',
      targetExamYear: new Date().getFullYear() + 1,
    };

    // Set the data for the new user document
    await userDocRef.set(newUserProfile);
    
    return NextResponse.json({ success: true, data: newUserProfile }, { status: 201 });

  } catch (error) {
    console.error('Failed to create user profile:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: `Server Error: ${errorMessage}` }, { status: 500 });
  }
}