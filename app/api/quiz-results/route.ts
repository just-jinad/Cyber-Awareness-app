import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
export const dynamic = 'force-dynamic';


const prisma = new PrismaClient();

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  try {
    const { quizId, score, answers, userId } = await request.json();
    const result = await prisma.quizResult.create({
      data: {
        userId: userId || (session?.user?.id || null),
        quizId,
        score,
        answers,
      },
    });
    return NextResponse.json({ message: 'Result saved', result }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}