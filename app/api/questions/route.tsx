import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Question from '@/models/Question';
import { validateSession } from '@/lib/authUtils';

export const dynamic = 'force-dynamic';

/**
 * @route   GET /api/questions
 * @desc    Fetches questions with advanced filtering.
 * @access  Private
 */
export async function GET(request: NextRequest) {
  const session = await validateSession(request);
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized: Please log in.' }, { status: 401 });
  }

  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    
    const filter: { [key: string]: any } = {};

    // Build the filter object dynamically based on query parameters
    if (searchParams.get('exam')) {
      filter.exam = searchParams.get('exam');
    }
    if (searchParams.get('year')) {
      filter.year = parseInt(searchParams.get('year')!, 10);
    }
    if (searchParams.get('subject')) {
      filter.subject = searchParams.get('subject');
    }
    if (searchParams.get('topic')) {
      filter.topic = searchParams.get('topic');
    }

    if (Object.keys(filter).length === 0) {
        return NextResponse.json({ success: false, error: 'At least one filter (exam, year, subject, topic) is required.' }, { status: 400 });
    }

    const questions = await Question.find(filter).sort({ year: -1, paperQuestionNumber: 1, createdAt: -1 });
    
    return NextResponse.json({ success: true, data: questions }, { status: 200 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: `Server Error: ${errorMessage}` }, { status: 500 });
  }
}

// --- SECURE ADMIN-ONLY ACTIONS (No changes needed here) ---

export async function POST(request: NextRequest) {
  const session = await validateSession(request);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized: Admins only.' }, { status: 401 });
  }
  await dbConnect();
  try {
    const body = await request.json();
    if (Array.isArray(body)) {
      const newQuestions = await Question.insertMany(body);
      return NextResponse.json({ success: true, data: newQuestions }, { status: 201 });
    } else {
      const newQuestion = await Question.create(body);
      return NextResponse.json({ success: true, data: newQuestion }, { status: 201 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
    const session = await validateSession(request);
    if (!session || session.role !== 'admin') {
        return NextResponse.json({ success: false, message: 'Unauthorized: Admins only.' }, { status: 401 });
    }
    await dbConnect();
    try {
        const { ids } = await request.json();
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ success: false, error: 'Please provide an array of IDs to delete.' }, { status: 400 });
        }
        await Question.deleteMany({ _id: { $in: ids } });
        return NextResponse.json({ success: true, message: `Questions deleted successfully.` }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Server Error: ' + (error as Error).message }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    const session = await validateSession(request);
    if (!session || session.role !== 'admin') {
        return NextResponse.json({ success: false, message: 'Unauthorized: Admins only.' }, { status: 401 });
    }
     await dbConnect();
    try {
        const { field, updates } = await request.json();
        if (!field || !updates || !Array.isArray(updates) || updates.length === 0) {
            return NextResponse.json({ success: false, error: 'Invalid update payload.' }, { status: 400 });
        }

        const bulkOps = updates.map(update => ({
            updateOne: {
                filter: { _id: update.id },
                update: { $set: { [field]: update.value } }
            }
        }));

        const result = await Question.bulkWrite(bulkOps);

        return NextResponse.json({ success: true, data: { modifiedCount: result.modifiedCount } }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ success: false, error: 'Server Error: ' + (error as Error).message }, { status: 500 });
    }
}