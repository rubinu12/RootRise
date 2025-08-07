import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Question from '@/models/Question';
import { validateSession } from '@/lib/authUtils';

export const dynamic = 'force-dynamic';

/**
 * @route   GET /api/quizzes
 * @desc    Fetches a structured list of available quizzes (exam and year combinations).
 * @access  Private
 */
export async function GET(request: Request) {
  const session = await validateSession(request as any);
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    // This is an advanced aggregation pipeline to get the desired structure
    const availableQuizzes = await Question.aggregate([
      // 1. Group documents by exam and year to get unique pairs
      {
        $group: {
          _id: { exam: "$exam", year: "$year" },
          questionCount: { $sum: 1 } // Optional: count questions per quiz
        }
      },
      // 2. Further group the results by year
      {
        $group: {
          _id: "$_id.year",
          exams: { 
            $push: { 
              name: "$_id.exam",
              count: "$questionCount"
            } 
          }
        }
      },
      // 3. Rename the '_id' field to 'year' for clarity
      {
        $project: {
          _id: 0,
          year: "$_id",
          exams: 1
        }
      },
      // 4. Sort the final results by year in descending order
      {
        $sort: { year: -1 }
      }
    ]);
    
    return NextResponse.json({ success: true, data: availableQuizzes }, { status: 200 });

  } catch (error) {
    console.error("Failed to fetch available quizzes:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: `Server Error: ${errorMessage}` }, { status: 500 });
  }
}