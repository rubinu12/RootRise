import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Question from '@/models/Question';

// This line forces the route to be dynamic.
export const dynamic = 'force-dynamic';

// Define a specific type for the route's context, including params.
type RouteContext = {
  params: {
    id: string;
  };
};

/**
 * Handles GET requests to /api/questions/[id].
 * Fetches a single question by its ID.
 */
export async function GET(req: NextRequest, { params }: RouteContext) {
  await dbConnect();

  try {
    const question = await Question.findById(params.id);
    if (!question) {
      return NextResponse.json({ success: false, error: 'Question not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: question }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Server Error: ' + error.message }, { status: 500 });
  }
}

/**
 * Handles PUT requests to /api/questions/[id].
 * Updates a specific question in the database.
 */
export async function PUT(req: NextRequest, { params }: RouteContext) {
  await dbConnect();

  try {
    const body = await req.json();
    const question = await Question.findByIdAndUpdate(
      params.id,
      body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!question) {
      return NextResponse.json({ success: false, error: 'Question not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: question }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

/**
 * Handles DELETE requests to /api/questions/[id].
 * Deletes a specific question from the database.
 */
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  await dbConnect();

  try {
    const deletedQuestion = await Question.deleteOne({ _id: params.id });

    if (deletedQuestion.deletedCount === 0) {
      return NextResponse.json({ success: false, error: 'Question not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: {} }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Server Error: ' + error.message }, { status: 500 });
  }
}