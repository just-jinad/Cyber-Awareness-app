import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

const prisma = new PrismaClient();

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const quizId = parseInt(id);
  if (isNaN(quizId)) {
    return NextResponse.json({ error: 'Invalid quiz ID' }, { status: 400 });
  }
  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    });
    if (!quiz) {
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
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await context.params;
  const quizId = parseInt(id);
  if (isNaN(quizId)) {
    return NextResponse.json({ error: 'Invalid quiz ID' }, { status: 400 });
  }
  try {
    const data = await request.json();
    // Update quiz and replace all questions
    const updatedQuiz = await prisma.$transaction(async (tx) => {
      // Update quiz title and other fields
      const quiz = await tx.quiz.update({
        where: { id: quizId },
        data: {
          title: data.title,
          // Add more quiz-level fields as needed
        },
      });
      // Delete old questions
      await tx.question.deleteMany({ where: { quizId } });
      // Create new questions
      if (Array.isArray(data.questions)) {
        for (const q of data.questions) {
          await tx.question.create({
            data: {
              quizId,
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
        where: { id: quizId },
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

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await context.params;
  const quizId = parseInt(id);
  if (isNaN(quizId)) {
    return NextResponse.json({ error: 'Invalid quiz ID' }, { status: 400 });
  }
  try {
    await prisma.quiz.delete({ where: { id: quizId } });
    return NextResponse.json({ message: 'Quiz deleted' });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
