import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  // Validate userId
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }
  const userIdNum = Number(userId);
  if (isNaN(userIdNum)) {
    return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
  }

  // Restrict access: Admins can fetch any user, users can only fetch their own
  if (session.user.role !== 'ADMIN' && userIdNum !== session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userIdNum },
      select: { username: true, level: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userProgress = await prisma.userProgress.findMany({
      where: { userId: userIdNum },
      select: {
        id: true,
        module: { select: { title: true } },
        simulation: { select: { title: true } },
        quiz: { select: { title: true } },
        level: true,
        status: true,
        score: true,
      },
    });

    // Calculate total activities for progress percentage
    const totalActivities = await prisma.$transaction([
      prisma.quiz.count(),
      prisma.simulation.count(),
      prisma.module.count(),
    ]);
    const total = totalActivities.reduce((sum, count) => sum + count, 0);

    const activities = userProgress.map(up => ({
      title: up.module?.title || up.simulation?.title || up.quiz?.title || 'Unknown',
      type: up.module ? 'Module' : up.simulation ? 'Simulation' : 'Quiz',
      level: up.level || 'unknown',
      status: up.status || 'not started',
      score: up.score || 0,
    }));

    const progressData = {
      userId: userId, // Keep as string for consistency with dashboard
      username: user.username || 'Unknown User',
      level: user.level || 'beginner',
      progress: total > 0 ? (userProgress.filter(up => up.status === 'completed').length / total) * 100 : 0,
      activities,
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
    const userIdNum = Number(userId);
    if (isNaN(userIdNum) || userIdNum !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized to update progress for another user' }, { status: 403 });
    }

    // Check if progress already exists for this content
    const existingProgress = await prisma.userProgress.findFirst({
      where: {
        userId: userIdNum,
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
        userId: userIdNum,
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