import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({
      where: { role: 'USER' },
      select: { username: true, level: true, createdAt: true, id: true },
    });
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Prevent deleting admins or self
    const userToDelete = await prisma.user.findUnique({ where: { id }, select: { role: true } });
    if (!userToDelete || userToDelete.role === 'ADMIN' || id === session.user.id) {
      return NextResponse.json({ error: 'Cannot delete admin or self' }, { status: 403 });
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { username, email, password, role = 'USER' } = await request.json();
    if (!username || !email || !password) {
      return NextResponse.json({ error: 'Username, email, and password are required' }, { status: 400 });
    }

    // Check admin limit before creating
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
    if (role === 'ADMIN' && adminCount >= 2) {
      return NextResponse.json({ error: 'Maximum limit of 2 admins reached' }, { status: 403 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role,
        level: 'beginner', // Default level
      },
    });
    return NextResponse.json({ message: 'User created successfully', user: newUser }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, role } = await request.json();
    if (!id || !role) {
      return NextResponse.json({ error: 'User ID and role are required' }, { status: 400 });
    }

    // Check admin limit before updating
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
    if (role === 'ADMIN' && adminCount >= 2) {
      return NextResponse.json({ error: 'Maximum limit of 2 admins reached' }, { status: 403 });
    }

    // Prevent self-demotion or invalid role changes
    if (id === session.user.id && role !== 'ADMIN') {
      return NextResponse.json({ error: 'Cannot demote yourself' }, { status: 403 });
    }

    await prisma.user.update({
      where: { id },
      data: { role },
    });
    return NextResponse.json({ message: 'Role updated successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}