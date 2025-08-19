// lib/auth/server.ts
import { NextRequest } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin';
import { DecodedIdToken } from 'firebase-admin/auth';

/**
 * A server-side helper function to validate a user's session from their Firebase ID token.
 * This can be called at the beginning of any protected API route.
 * @param {NextRequest} request - The incoming Next.js request object.
 * @returns {Promise<DecodedIdToken | null>} - Returns the decoded token if the session is valid, otherwise returns null.
 */
export const verifyFirebaseSession = async (request: NextRequest): Promise<DecodedIdToken | null> => {
  const authorization = request.headers.get('Authorization');
  
  // Check if the Authorization header exists and starts with "Bearer "
  if (authorization?.startsWith('Bearer ')) {
    const idToken = authorization.split('Bearer ')[1];
    
    try {
      // Use the Firebase Admin SDK to verify the token
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      return decodedToken;
    } catch (error) {
      console.error('Error verifying Firebase ID token:', error);
      // The token is invalid (e.g., expired, malformed)
      return null;
    }
  }
  
  // No token found
  return null;
};