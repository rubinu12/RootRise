import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import User, { IUser } from '@/models/Users';

// Define a type for our decoded token payload
interface DecodedToken {
  id: string;
  key: string;
}

/**
 * A server-side helper function to validate a user's session from their token cookie.
 * This can be called at the beginning of any protected API route.
 * @param {NextRequest} request - The incoming Next.js request object.
 * @returns {Promise<IUser | null>} - Returns the full user document if the session is valid, otherwise returns null.
 */
export const validateSession = async (request: NextRequest): Promise<IUser | null> => {
  await dbConnect();

  try {
    // 1. Get the token from the request cookies.
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return null; // No token, session is not valid.
    }

    // 2. Verify the token with the secret key.
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET not configured on server.');
      return null;
    }
    const decoded = jwt.verify(token, secret) as DecodedToken;

    // 3. Find the user and select the activeSessionKey for validation.
    const user = await User.findById(decoded.id).select('+activeSessionKey');
    if (!user) {
      return null; // User not found.
    }

    // 4. The "Magic Key" check.
    if (user.activeSessionKey !== decoded.key) {
      return null; // The session key doesn't match, this is an old session.
    }

    // 5. If all checks pass, return the user object.
    return user;

  } catch (error) {
    // Catches errors from jwt.verify (e.g., expired token)
    console.error('Session validation error:', error);
    return null;
  }
};
