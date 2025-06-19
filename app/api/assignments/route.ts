import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

const prisma = new PrismaClient();

type ContentType = 'module' | 'quiz' | 'simulation';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== 'ADMIN' || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized or invalid session' }, { status: 401 });
  }

  try {
    const { userId, username, contentId, contentType } = await request.json();
    if ((!userId && !username) || !contentId || !contentType) {
      return NextResponse.json({ error: 'Missing required fields (userId or username, contentId, contentType)' }, { status: 400 });
    }
    if (!['module', 'quiz', 'simulation'].includes(contentType)) {
      return NextResponse.json({ error: 'Invalid contentType. Must be module, quiz, or simulation' }, { status: 400 });
    }

    // Resolve user
    let user;
    if (userId) {
      user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    } else if (username) {
      user = await prisma.user.findUnique({ where: { username } });
    }
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Validate content existence
    let content;
    switch (contentType as ContentType) {
      case 'module':
        content = await prisma.module.findUnique({ where: { id: Number(contentId) } });
        break;
      case 'quiz':
        content = await prisma.quiz.findUnique({ where: { id: Number(contentId) } });
        break;
      case 'simulation':
        content = await prisma.simulation.findUnique({ where: { id: Number(contentId) } });
        break;
    }
    if (!content) {
      return NextResponse.json({ error: `${contentType} not found` }, { status: 404 });
    }

    // Check completion status
    const progress = await prisma.userProgress.findFirst({
      where: {
        userId: user.id,
        [`${contentType}Id`]: Number(contentId),
        status: 'completed',
      },
    });
    const status = progress ? 'done' : 'pending';

    // Create or update assignment
    const assignment = await prisma.assignment.upsert({
      where: {
        userId_contentId_contentType: { userId: user.id, contentId: Number(contentId), contentType },
      },
      update: { status, assignedBy: Number(session.user.id) },
      create: {
        userId: user.id,
        contentId: Number(contentId),
        contentType,
        assignedBy: Number(session.user.id),
        status,
      },
    });

    return NextResponse.json({ message: 'Assignment created or updated', assignment }, { status: 201 });
  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const contentType = url.searchParams.get('contentType');
    const status = url.searchParams.get('status');

    const assignments = await prisma.assignment.findMany({
      where: {
        userId: userId ? parseInt(userId) : undefined,
        contentType: contentType || undefined,
        status: status || undefined,
      },
      include: {
        user: { select: { username: true } },
        admin: { select: { username: true } },
      },
    });

    return NextResponse.json(assignments, { status: 200 });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { userId, contentId, contentType, status } = await request.json();
    if (!userId || !contentId || !contentType || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const assignment = await prisma.assignment.update({
      where: {
        userId_contentId_contentType: { userId: Number(userId), contentId: Number(contentId), contentType },
      },
      data: { status },
    });

    return NextResponse.json({ message: 'Assignment updated', assignment }, { status: 200 });
  } catch (error) {
    console.error('Error updating assignment:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}