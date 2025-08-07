import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Question from '@/models/Question';

// This line forces the route to be dynamic, fixing the static export error.
export const dynamic = 'force-dynamic';

/**
 * Handles GET requests to /api/questions/[id].
 * Fetches a single question by its ID.
 * @param {Request} req - The incoming request object.
 * @param {object} context - Contains route parameters. context.params.id is the question ID.
 * @returns {NextResponse} - A response containing the question data or an error message.
 */
export async function GET(req, { params }) {
  await dbConnect();

  try {
    const question = await Question.findById(params.id);
    if (!question) {
      return NextResponse.json({ success: false, error: 'Question not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: question }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server Error: ' + error.message }, { status: 500 });
  }
}

/**
 * Handles PUT requests to /api/questions/[id].
 * Updates a specific question in the database.
 * @param {Request} req - The incoming request object, containing the updated data.
 * @param {object} context - Contains route parameters. context.params.id is the question ID.
 * @returns {NextResponse} - A response containing the updated question or an error message.
 */
export async function PUT(req, { params }) {
  await dbConnect();

  try {
    const body = await req.json();
    const question = await Question.findByIdAndUpdate(
      params.id,
      body,
      {
        new: true, // Return the modified document rather than the original.
        runValidators: true, // Run schema validation on the update operation.
      }
    );

    if (!question) {
      return NextResponse.json({ success: false, error: 'Question not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: question }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

/**
 * Handles DELETE requests to /api/questions/[id].
 * Deletes a specific question from the database.
 * @param {Request} req - The incoming request object.
 * @param {object} context - Contains route parameters. context.params.id is the question ID.
 * @returns {NextResponse} - A success response or an error message.
 */
export async function DELETE(req, { params }) {
  await dbConnect();

  try {
    const deletedQuestion = await Question.deleteOne({ _id: params.id });

    if (deletedQuestion.deletedCount === 0) {
      return NextResponse.json({ success: false, error: 'Question not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: {} }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server Error: ' + error.message }, { status: 500 });
  }
}
