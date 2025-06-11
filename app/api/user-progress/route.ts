import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  console.log('Session:', session);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userId = session.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { level: true },
    });

    const userProgress = await prisma.userprogress.findMany({
      where: { userId },
      select: { module: { select: { title: true } }, level: true, status: true, score: true },
    });

    const averageScore = userProgress.length > 0
      ? userProgress.reduce((sum, up) => sum + up.score, 0) / userProgress.length
      : 0;

    return NextResponse.json({
      level: user?.level || 'beginner',
      progress: averageScore,
      modules: userProgress.map(up => ({
        title: up.module.title,
        level: up.level,
        status: up.status,
        score: up.score,
      })),
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}