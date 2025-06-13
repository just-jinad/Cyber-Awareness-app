import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userId = session.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { level: true },
    });

    const userProgress = await prisma.userProgress.findMany({
      where: { userId },
      select: {
        id: true, // Include ID for each progress entry
        module: { select: { title: true } },
        simulation: { select: { title: true } },
        quiz: { select: { title: true } },
        level: true,
        status: true,
        score: true,
      },
    });

    const completedCount = userProgress.filter(up => up.status === 'completed').length;
    const averageScore = userProgress.length > 0
      ? userProgress.reduce((sum: number, up: { score?: number }) => sum + (up.score || 0), 0) / userProgress.length
      : 0;

    const progressData = {
      level: user?.level || 'beginner',
      progress: averageScore,
      completedCount,
      modules: userProgress
        .filter(up => up.module)
        .map(up => ({
          id: up.id,
          title: up.module!.title,
          level: up.level,
          status: up.status || 'not started',
          score: up.score || 0,
        })),
      simulations: userProgress
        .filter(up => up.simulation)
        .map(up => ({
          id: up.id,
          title: up.simulation!.title,
          level: up.level,
          status: up.status || 'not started',
          score: up.score || 0,
        })),
      quizzes: userProgress
        .filter(up => up.quiz)
        .map(up => ({
          id: up.id,
          title: up.quiz!.title,
          level: up.level,
          status: up.status || 'not started',
          score: up.score || 0,
        })),
    };

    return NextResponse.json(progressData, { status: 200 });
  } catch (error) {
    console.error('Error fetching user progress:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { userId, moduleId, simulationId, quizId, score, status, timeTaken } = await request.json();
    if (userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized to update progress for another user' }, { status: 403 });
    }

    // Check if progress already exists for this content
    const existingProgress = await prisma.userProgress.findFirst({
      where: {
        userId: Number(userId),
        OR: [
          { moduleId: moduleId ? Number(moduleId) : undefined },
          { simulationId: simulationId ? Number(simulationId) : undefined },
          { quizId: quizId ? Number(quizId) : undefined },
        ],
      },
    });

    if (existingProgress && existingProgress.status === 'completed') {
      return NextResponse.json({ error: 'Content already completed' }, { status: 400 });
    }

    const progress = await prisma.userProgress.create({
      data: {
        userId: Number(userId),
        moduleId: moduleId ? Number(moduleId) : undefined,
        simulationId: simulationId ? Number(simulationId) : undefined,
        quizId: quizId ? Number(quizId) : undefined,
        score: Number(score),
        status,
        timeTaken: timeTaken !== undefined ? Number(timeTaken) : 0,
        completedAt: new Date(),
      },
    });
    return NextResponse.json({ message: 'Progress recorded', progress }, { status: 201 });
  } catch (error) {
    console.error('Error recording user progress:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}