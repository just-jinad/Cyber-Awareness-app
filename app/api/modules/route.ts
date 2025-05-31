import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Module {
  id: number;
  title: string;
  content: string;
}

export async function GET() {
  const modules = await prisma.module.findMany();
  return NextResponse.json(modules, { status: 200 });
}

export async function POST(request: Request) {
  const { title, content } = await request.json() as { title: string; content: string };
  try {
    const module = await prisma.module.create({
      data: { title, content },
    });
    return NextResponse.json({ message: 'Module added' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}