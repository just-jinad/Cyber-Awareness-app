import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

const prisma = new PrismaClient();

interface Step {
  scenario: string;
  options: string[];
  nextStep: (number | null)[];
  outcomes?: string[];
}

const validateSteps = (steps: any[]): boolean => {
  if (!Array.isArray(steps)) return false;
  return steps.every((step, index) => {
    if (typeof step.scenario !== 'string' || !Array.isArray(step.options) || !Array.isArray(step.nextStep)) return false;
    if (step.options.length !== step.nextStep.length) return false;
    if (step.outcomes && (!Array.isArray(step.outcomes) || step.outcomes.length !== step.options.length)) return false;
    return step.nextStep.every((next: number | null, i: number) => {
      if (next === null) return true;
      return typeof next === 'number' && next >= 0 && next < steps.length && next !== index;
    });
  });
};

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    if (id && id !== 'simulations') {
      const parsedId = parseInt(id);
      if (isNaN(parsedId)) return NextResponse.json({ error: 'Invalid simulation ID' }, { status: 400 });
      const simulation = await prisma.simulation.findUnique({ where: { id: parsedId } });
      if (!simulation) return NextResponse.json({ error: 'Simulation not found' }, { status: 404 });
      return NextResponse.json(simulation);
    }
    const simulations = await prisma.simulation.findMany();
    return NextResponse.json(simulations);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title, steps } = await request.json();
    if (!title || !validateSteps(steps)) {
      return NextResponse.json({ error: 'Invalid input: title and valid steps required' }, { status: 400 });
    }
    const simulation = await prisma.simulation.create({ data: { title, steps } });
    return NextResponse.json({ message: 'Simulation created', simulation }, { status: 201 });
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
    const id = parseInt(url.pathname.split('/').pop() || '0');
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid simulation ID' }, { status: 400 });

    const { title, steps } = await request.json();
    if (!title || !validateSteps(steps)) {
      return NextResponse.json({ error: 'Invalid input: title and valid steps required' }, { status: 400 });
    }

    const simulation = await prisma.simulation.update({
      where: { id },
      data: { title, steps },
    });
    return NextResponse.json({ message: 'Simulation updated', simulation }, { status: 200 });
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
    const id = parseInt(url.pathname.split('/').pop() || '0');
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid simulation ID' }, { status: 400 });

    await prisma.simulation.delete({ where: { id } });
    return NextResponse.json({ message: 'Simulation deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}