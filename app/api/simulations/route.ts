import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

interface Simulation {
  id: number;
  title: string;
  scenario: string;
  choices: string[];
  correctAction: number;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const simulations = await prisma.simulation.findMany();
  return NextResponse.json(simulations, { status: 200 });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { title, scenario, choices, correctAction } = await request.json();
  try {
    const simulation = await prisma.simulation.create({
      data: {
        title,
        scenario,
        choices,
        correctAction,
      },
    });
    return NextResponse.json({ message: 'Simulation added' }, { status: 200 });
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
    const url = new URL(request.url);
    const id = parseInt(url.pathname.split('/').pop() || '0');
    const { title, scenario, choices, correctAction } = await request.json();

    const simulation = await prisma.simulation.update({
      where: { id },
      data: {
        title,
        scenario,
        choices,
        correctAction,
      },
    });
    return NextResponse.json({ message: 'Simulation updated' }, { status: 200 });
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
    const url = new URL(request.url);
    const id = parseInt(url.pathname.split('/').pop() || '0');

    await prisma.simulation.delete({ where: { id } });
    return NextResponse.json({ message: 'Simulation deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}