import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/Users';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

interface DecodedToken {
  id: string;
  key: string;
}

/**
 * @route   GET /api/auth/me
 * @desc    Get the current logged-in user's data and validate their session key
 * @access  Private (requires a valid token cookie)
 */
export async function GET(request: NextRequest) {
  await dbConnect();

  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not configured on server.');
    }
    const decoded = jwt.verify(token, secret) as DecodedToken;

    const user = await User.findById(decoded.id).select('-password +activeSessionKey');

    // --- BUG FIX STARTS HERE ---
    if (!user) {
      // If the user ID from the token doesn't exist in the DB, it's an invalid session.
      // We must clear the cookie on the client side to break the redirect loop.
      const response = NextResponse.json(
        { success: false, message: 'User not found. Clearing invalid session.' },
        { status: 404 }
      );
      // Set the cookie to an empty value with an expiration date in the past.
      response.cookies.set('token', '', { httpOnly: true, expires: new Date(0), path: '/' });
      return response;
    }
    // --- BUG FIX ENDS HERE ---

    if (user.activeSessionKey !== decoded.key) {
      const response = NextResponse.json(
        { success: false, message: 'Session expired by new login.' },
        { status: 401 }
      );
      response.cookies.set('token', '', { httpOnly: true, expires: new Date(0), path: '/' });
      return response;
    }

    return NextResponse.json({ success: true, user }, { status: 200 });

  } catch (error) {
    // If the token is malformed or expired, clear it as well.
    console.error("Auth 'me' route error:", error);
    const response = NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 401 }
    );
    response.cookies.set('token', '', { httpOnly: true, expires: new Date(0), path: '/' });
    return response;
  }
}