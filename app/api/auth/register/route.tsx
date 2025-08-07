import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/Users';
import PaidUser from '@/models/PaidUsers';

const calculatePlanEndDate = (plan: 'monthly' | 'yearly' | 'lifetime'): Date | null => {
    if (plan === 'lifetime') return null;
    const date = new Date();
    if (plan === 'monthly') date.setMonth(date.getMonth() + 1);
    else if (plan === 'yearly') date.setFullYear(date.getFullYear() + 1);
    return date;
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new paid user and set an auth token cookie
 * @access  Public
 */
export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    const { name, email, password, phoneNo, plan } = await request.json();

    if (!name || !email || !password || !phoneNo || !plan) {
        return NextResponse.json({ success: false, message: 'Please provide all required fields.' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ success: false, message: 'A user with this email already exists.' }, { status: 400 });
    }

    const newUser = await User.create({ name, email, password, phoneNo, role: 'paid' });

    const planEndDate = calculatePlanEndDate(plan);
    
    await PaidUser.create({
        userId: newUser._id,
        subscription: { plan, status: 'active', planEndDate },
    });

    const token = newUser.getSignedJwtToken();

    // --- FIX: Set the token as a secure, httpOnly cookie ---
    const response = NextResponse.json({ success: true, message: "Registration successful" });

    response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
    });

    return response;

  } catch (error: any) {
    console.error('Registration Error:', error);
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((val: any) => val.message);
        return NextResponse.json({ success: false, message: messages.join(', ') }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}
