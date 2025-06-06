import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { uploadImage, deleteImage } from '@/lib/cloudinary';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

const prisma = new PrismaClient();

interface Module {
  id: number;
  title: string;
  content: string;
  imageUrl?: string;
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { pathname } = new URL(request.url);
  const id = pathname.split('/').pop();

  if (id && id !== 'modules') {
    const module = await prisma.module.findUnique({
      where: { id: parseInt(id) },
    });
    if (!module) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }
    return NextResponse.json(module, { status: 200 });
  }

  const modules = await prisma.module.findMany();
  return NextResponse.json(modules, { status: 200 });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const image = formData.get('image') as File | null;

    let imageUrl: string | undefined;
    if (image) {
      imageUrl = await uploadImage(image);
    }

    const module = await prisma.module.create({
      data: {
        title,
        content,
        imageUrl,
      },
    });
    return NextResponse.json({ message: 'Module added' }, { status: 200 });
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
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const image = formData.get('image') as File | null;

    const existingModule = await prisma.module.findUnique({ where: { id } });
    let imageUrl = existingModule?.imageUrl;

    if (image) {
      if (existingModule?.imageUrl) {
        const publicId = existingModule.imageUrl.split('/').slice(-2).join('/').split('.')[0];
        await deleteImage(publicId);
      }
      imageUrl = await uploadImage(image);
    }

    const module = await prisma.module.update({
      where: { id },
      data: {
        title,
        content,
        imageUrl,
      },
    });
    return NextResponse.json({ message: 'Module updated' }, { status: 200 });
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

    const module = await prisma.module.findUnique({ where: { id } });
    if (module?.imageUrl) {
      const publicId = module.imageUrl.split('/').slice(-2).join('/').split('.')[0];
      await deleteImage(publicId);
    }

    await prisma.module.delete({ where: { id } });
    return NextResponse.json({ message: 'Module deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}