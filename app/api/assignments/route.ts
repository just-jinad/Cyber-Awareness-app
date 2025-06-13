import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== 'ADMIN' || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized or invalid session' }, { status: 401 });
  }

  try {
    const { userId, contentId, contentType } = await request.json();
    if (!userId || !contentId || !contentType) {
      return NextResponse.json({ error: 'Missing required fields (userId, contentId, contentType)' }, { status: 400 });
    }

    const assignment = await prisma.assignment.create({
      data: {
        userId: Number(userId), // Ensure type is number
        contentId: Number(contentId), // Ensure type is number
        contentType,
        assignedBy: session.user.id, // Safe to use since checked above
        status: 'pending',
      },
    });
    return NextResponse.json({ message: 'Assignment created', assignment }, { status: 201 });
  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');
  try {
    const assignments = await prisma.assignment.findMany({
      where: { userId: userId ? parseInt(userId) : undefined },
      include: { user: true, admin: true }, // Include related User data
    });
    return NextResponse.json(assignments, { status: 200 });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}