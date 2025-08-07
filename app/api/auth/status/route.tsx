import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/Users';
import jwt from 'jsonwebtoken';

// Define a type for our decoded token payload for type safety
interface DecodedToken {
  id: string;
  key: string;
  iat: number;
  exp: number;
}

/**
 * @route   GET /api/auth/status
 * @desc    Checks if the current user's session is still valid.
 * @access  Private
 */
export async function GET(request: NextRequest) {
  await dbConnect();

  try {
    // 1. Get the token from the 'Authorization' header.
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ isValid: false, message: 'No token provided.' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];

    // 2. Verify and decode the token.
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not configured on server.');
    }
    const decoded = jwt.verify(token, secret) as DecodedToken;

    // 3. Find the user in the database and select only the activeSessionKey.
    const user = await User.findById(decoded.id).select('+activeSessionKey');

    if (!user) {
      return NextResponse.json({ isValid: false, message: 'User not found.' }, { status: 404 });
    }

    // 4. The core logic: Compare the key from the token with the key in the database.
    if (user.activeSessionKey === decoded.key) {
      // If they match, the session is valid.
      return NextResponse.json({ isValid: true }, { status: 200 });
    } else {
      // If they don't match, it means another session has been started.
      return NextResponse.json({ isValid: false, message: 'Session expired by new login.' }, { status: 401 });
    }

  } catch (error) {
    // FIX: Log the error and remove the unused variable.
    console.error("Auth status error:", error);
    return NextResponse.json({ isValid: false, message: 'Invalid token.' }, { status: 401 });
  }
}