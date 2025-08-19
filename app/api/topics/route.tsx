// app/api/topics/route.tsx
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { verifyFirebaseSession } from '@/lib/auth/server';

export const dynamic = 'force-dynamic';

/**
 * @route   GET /api/topics
 * @desc    Fetches a unique list of topics for a given subject.
 * @access  Private
 */
export async function GET(request: NextRequest) {
  const decodedToken = await verifyFirebaseSession(request);
  if (!decodedToken) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject');

    if (!subject) {
      return NextResponse.json({ success: false, error: 'Subject parameter is required.' }, { status: 400 });
    }

    // 1. Query for all questions that match the given subject.
    // We only need the 'topic' field for this operation.
    const questionsSnapshot = await adminDb.collection('questions')
      .where('subject', '==', subject)
      .select('topic')
      .get();

    if (questionsSnapshot.empty) {
        return NextResponse.json({ success: true, data: [] }, { status: 200 });
    }

    // 2. Use a Set to automatically handle uniqueness.
    const topics = new Set<string>();
    questionsSnapshot.forEach(doc => {
      const data = doc.data();
      // Add topic to the set only if it exists and is not an empty string
      if (data.topic && typeof data.topic === 'string' && data.topic.trim() !== '') {
        topics.add(data.topic);
      }
    });

    // 3. Convert the Set to a sorted array and return.
    const sortedTopics = Array.from(topics).sort();

    return NextResponse.json({ success: true, data: sortedTopics }, { status: 200 });

  } catch (error) {
    console.error("Failed to fetch topics:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: `Server Error: ${errorMessage}` }, { status: 500 });
  }
}