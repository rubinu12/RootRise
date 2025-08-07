import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/Users';
import jwt from 'jsonwebtoken';

// --- CRUCIAL FIX: Disables caching for this route ---
// This ensures our "Magic Key" check runs on every request.
export const dynamic = 'force-dynamic';

// Define a type for our decoded token payload, now including the key
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

    // Find the user and explicitly select the activeSessionKey
    const user = await User.findById(decoded.id).select('-password +activeSessionKey');

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // --- The "Magic Key" Check ---
    // Compare the key from the token with the key stored in the database.
    if (user.activeSessionKey !== decoded.key) {
      // If they don't match, this is an old, invalid session.
      // We clear the cookie and return an unauthorized error.
      const response = NextResponse.json(
        { success: false, message: 'Session expired by new login.' },
        { status: 401 }
      );
      response.cookies.set('token', '', { expires: new Date(0) });
      return response;
    }

    // If the keys match, the session is valid. Return the user data.
    return NextResponse.json({ success: true, user }, { status: 200 });

  } catch (error) {
    // This will catch other invalid/expired tokens.
    return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 });
  }
}
