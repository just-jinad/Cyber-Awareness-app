import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
export const dynamic = 'force-dynamic';


const prisma = new PrismaClient();

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const simulation = await prisma.simulation.findUnique({ where: { id: parseInt(id) } });
    if (!simulation) {
      return NextResponse.json({ error: 'Simulation not found' }, { status: 404 });
    }
    return NextResponse.json(simulation, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id } = await context.params;
    const body = await request.json();
    // Support both old and new simulation structures
    if (body.steps) {
      // New multi-step simulation
      const simulation = await prisma.simulation.update({
        where: { id: parseInt(id) },
        data: {
          title: body.title,
          steps: body.steps,
        },
      });
      return NextResponse.json({ message: 'Simulation updated', simulation }, { status: 200 });
    } else if (body.choices && body.scenario) {
      // Old flat simulation (backward compatibility)
      const simulation = await prisma.simulation.update({
        where: { id: parseInt(id) },
        data: {
          title: body.title,
          steps: [{ scenario: body.scenario, options: body.choices, nextStep: [], outcome: '' }],
        },
      });
      return NextResponse.json({ message: 'Simulation updated', simulation }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id } = await context.params;
    await prisma.simulation.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ message: 'Simulation deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
