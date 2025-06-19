import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { pin, quizId } = await request.json();

    // Validate input
    if (!pin || typeof pin !== 'string' || pin.length < 4) {
      return NextResponse.json({ error: 'Invalid PIN. Must be at least 4 characters.' }, { status: 400 });
    }

    // Query quiz based on PIN and optional quizId
    let quiz;
    if (quizId) {
      // Detail page case: Validate PIN for specific quiz
      const parsedQuizId = parseInt(quizId);
      if (isNaN(parsedQuizId)) {
        return NextResponse.json({ error: 'Invalid quiz ID' }, { status: 400 });
      }
      quiz = await prisma.quiz.findUnique({
        where: {
          id: parsedQuizId,
          type: 'pin-protected',
          pin,
        },
        select: { id: true },
      });
    } else {
      // List page case: Find quiz by PIN
      quiz = await prisma.quiz.findFirst({
        where: {
          type: 'pin-protected',
          pin,
        },
        select: { id: true },
      });
    }

    if (!quiz) {
      return NextResponse.json({ error: 'Invalid PIN or quiz not found' }, { status: 404 });
    }

    return NextResponse.json({ quizId: quiz.id }, { status: 200 });
  } catch (error) {
    console.error('[PIN VALIDATE API] Error:', error);
    return NextResponse.json({ error: 'An error occurred. Please try again.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}