// app/api/quizzes/route.tsx
import { NextResponse, NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { verifyFirebaseSession } from '@/lib/auth/server';

export const dynamic = 'force-dynamic';

interface QuestionData {
  exam: string;
  year: number;
}

interface ExamInfo {
  name: string;
  count: number;
}

interface AggregatedQuizzes {
  [year: number]: {
    [exam: string]: number;
  };
}

/**
 * @route   GET /api/quizzes
 * @desc    Fetches a structured list of available quizzes (exam and year combinations).
 * @access  Private
 */
export async function GET(request: NextRequest) {
  const decodedToken = await verifyFirebaseSession(request);
  if (!decodedToken) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Fetch all documents from the questions collection.
    // We only select the 'exam' and 'year' fields to minimize data transfer.
    const questionsSnapshot = await adminDb.collection('questions').select('exam', 'year').get();
    
    if (questionsSnapshot.empty) {
      return NextResponse.json({ success: true, data: [] }, { status: 200 });
    }
    
    const questions = questionsSnapshot.docs.map(doc => doc.data() as QuestionData);

    // 2. Perform the aggregation logic in-memory.
    const aggregated: AggregatedQuizzes = {};
    for (const question of questions) {
      if (!question.year || !question.exam) continue;

      if (!aggregated[question.year]) {
        aggregated[question.year] = {};
      }
      if (!aggregated[question.year][question.exam]) {
        aggregated[question.year][question.exam] = 0;
      }
      aggregated[question.year][question.exam]++;
    }

    // 3. Transform the aggregated data into the desired final structure.
    const availableQuizzes = Object.entries(aggregated)
      .map(([year, exams]) => {
        return {
          year: parseInt(year, 10),
          exams: Object.entries(exams).map(([name, count]) => ({
            name,
            count,
          })),
        };
      })
      // 4. Sort the final results by year in descending order.
      .sort((a, b) => b.year - a.year);

    return NextResponse.json({ success: true, data: availableQuizzes }, { status: 200 });

  } catch (error) {
    console.error("Failed to fetch available quizzes:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: `Server Error: ${errorMessage}` }, { status: 500 });
  }
}