import { NextResponse } from 'next/server';

/**
 * @route   POST /api/auth/logout
 * @desc    Log the user out by clearing the auth cookie
 * @access  Private
 */
export async function POST() {
  try {
    // Create a response object.
    const response = NextResponse.json({
      success: true,
      message: 'Logout successful',
    });

    // Set the 'token' cookie with an empty value and an expiry date in the past.
    // This effectively deletes the cookie from the user's browser.
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(0), // Set to a past date
      path: '/',
    });

    return response;
    
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
