import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { uploadImage, deleteImage } from '@/lib/cloudinary';

const prisma = new PrismaClient();

export async function GET() {
  const modules = await prisma.module.findMany();
  return NextResponse.json(modules, { status: 200 });
}

export async function POST(request: Request) {
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
    console.error('Error in POST /api/modules:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const id = parseInt(formData.get('id') as string);
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

    await prisma.module.update({
      where: { id },
      data: { title, content, imageUrl },
    });
    return NextResponse.json({ message: 'Module updated' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request: Request) {
  try {
    const formData = await request.formData();
    const id = parseInt(formData.get('id') as string);

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