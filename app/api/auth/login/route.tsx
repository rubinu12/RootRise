import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/Users';
import crypto from 'crypto';

/**
 * @route   POST /api/auth/login
 * @desc    Login a user and set an auth token cookie
 * @access  Public
 */
export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Please provide an email and password.' }, { status: 400 });
    }

    const user = await User.findOne({ email }).select('+password +activeSessionKey');

    if (!user) {
      return NextResponse.json({ success: false, message: 'Invalid credentials.' }, { status: 401 });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return NextResponse.json({ success: false, message: 'Invalid credentials.' }, { status: 401 });
    }

    user.activeSessionKey = crypto.randomBytes(32).toString('hex');
    user.lastLogin = new Date();
    await user.save();

    const token = user.getSignedJwtToken();

    // --- FIX: Set the token as a secure, httpOnly cookie ---
    const response = NextResponse.json({ success: true, message: "Login successful" });
    
    response.cookies.set('token', token, {
        httpOnly: true, // The cookie is not accessible via client-side JavaScript
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/', // The cookie is available for all paths
    });

    return response;

  } catch (error: any) {
    console.error('Login Error:', error);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}
