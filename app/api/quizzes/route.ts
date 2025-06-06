import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

const prisma = new PrismaClient();

const validateQuiz = (quiz: any): boolean => {
  if (!quiz.title || !quiz.type || !['public', 'module-linked', 'pin-protected'].includes(quiz.type)) {
    return false;
  }
  if (quiz.type === 'pin-protected' && !quiz.pin) {
    return false;
  }
  if (!Array.isArray(quiz.questions)) {
    return false;
  }
  return quiz.questions.every((q: any) => {
    if (!q.text || !q.type || !q.correct || typeof q.score !== 'number') {
      return false;
    }
    if (q.type === 'true-false') {
      return q.correct === 'true' || q.correct === 'false';
    }
    if (!Array.isArray(q.options) || q.options.length < 2) {
      return false;
    }
    return q.options.includes(q.correct);
  });
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type');
  let id = url.searchParams.get('id');
  const path = url.pathname;
  console.log('[QUIZ API] GET handler called');
  console.log('[QUIZ API] Request URL:', request.url);
  console.log('[QUIZ API] Path:', path);
  console.log('[QUIZ API] Query type:', type, 'Initial id:', id);
  if (!id) {
    const pathId = path.split('/').pop();
    if (pathId && pathId !== 'quizzes') {
      id = pathId;
    }
  }
  console.log('[QUIZ API] Resolved id:', id);

  // If fetching a single quiz by ID
  if (id && id !== 'quizzes') {
    const parsedId = parseInt(id);
    console.log('[QUIZ API] Fetching quiz by ID', parsedId);
    if (isNaN(parsedId)) {
      console.log('[QUIZ API] Invalid quiz ID', id);
      return NextResponse.json({ error: 'Invalid quiz ID' }, { status: 400 });
    }
    try {
      const quiz = await prisma.quiz.findUnique({
        where: { id: parsedId },
        include: { questions: true },
      });
      console.log('[QUIZ API] Prisma result for quiz by ID', quiz);
      if (!quiz) {
        console.log('[QUIZ API] Quiz not found', parsedId);
        return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
      }
      // If public, allow access; otherwise, require auth
      if (quiz.type === 'public') {
        return NextResponse.json(quiz);
      } else {
        const session = await getServerSession(authOptions);
        if (!session) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.json(quiz);
      }
    } catch (error) {
      console.log('[QUIZ API] Error', error);
      return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    } finally {
      await prisma.$disconnect();
    }
  }

  // If fetching a list of quizzes
  if (type === 'public') {
    try {
      const quizzes = await prisma.quiz.findMany({ where: { type: 'public' }, include: { questions: true } });
      return NextResponse.json(quizzes);
    } catch (error) {
      console.log('[QUIZ API] Error', error);
      return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    } finally {
      await prisma.$disconnect();
    }
  } else {
    // For all other quiz types, require authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
      const where: any = {};
      if (type) {
        where.type = type;
      }
      const quizzes = await prisma.quiz.findMany({ where, include: { questions: true } });
      return NextResponse.json(quizzes);
    } catch (error) {
      console.log('[QUIZ API] (AUTH) Error', error);
      return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    } finally {
      await prisma.$disconnect();
    }
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const quiz = await request.json();
    if (!validateQuiz(quiz)) {
      return NextResponse.json({ error: 'Invalid input: title, type, and valid questions required' }, { status: 400 });
    }
    const createdQuiz = await prisma.quiz.create({
      data: {
        title: quiz.title,
        type: quiz.type,
        pin: quiz.pin || null,
        moduleId: quiz.type === 'module-linked' ? quiz.moduleId : null,
        questions: {
          create: quiz.questions.map((q: any) => ({
            type: q.type,
            text: q.text,
            options: q.type === 'true-false' ? ['true', 'false'] : q.options,
            correct: q.correct,
            score: q.score,
            feedback: q.feedback || null,
          })),
        },
      },
    });
    return NextResponse.json({ message: 'Quiz created', quiz: createdQuiz }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: 'Invalid quiz ID' }, { status: 400 });
    }
    const data = await request.json();
    // Update quiz and replace all questions
    const updatedQuiz = await prisma.$transaction(async (tx) => {
      // Update quiz title and other fields
      const quiz = await tx.quiz.update({
        where: { id: Number(id) },
        data: {
          title: data.title,
          // Add more quiz-level fields as needed
        },
      });
      // Delete old questions
      await tx.question.deleteMany({ where: { quizId: Number(id) } });
      // Create new questions
      if (Array.isArray(data.questions)) {
        for (const q of data.questions) {
          await tx.question.create({
            data: {
              quizId: Number(id),
              type: q.type,
              text: q.text,
              options: q.type === 'true-false' ? ['true', 'false'] : q.options,
              correct: q.correct,
              score: q.score,
              feedback: q.feedback || null,
            },
          });
        }
      }
      // Return updated quiz with new questions
      return tx.quiz.findUnique({
        where: { id: Number(id) },
        include: { questions: true },
      });
    });
    return NextResponse.json(updatedQuiz);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: 'Invalid quiz ID' }, { status: 400 });
    }
    await prisma.quiz.delete({ where: { id: Number(id) } });
    return NextResponse.json({ message: 'Quiz deleted' });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}