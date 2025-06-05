import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Use global Prisma client
import { uploadImage, deleteImage } from '@/lib/cloudinary';

// Ensure this route is handled at runtime (not prerendered)
export const dynamic = 'force-dynamic';

// GET Module by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const moduleId = parseInt(params.id);
    if (isNaN(moduleId)) {
      return NextResponse.json({ error: 'Invalid module ID' }, { status: 400 });
    }

    const module = await prisma.module.findUnique({ where: { id: moduleId } });
    if (!module) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    return NextResponse.json(module);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// PUT: Update Module
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const moduleId = parseInt(params.id);
    if (isNaN(moduleId)) {
      return NextResponse.json({ error: 'Invalid module ID' }, { status: 400 });
    }

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const image = formData.get('image') as File | null;

    const existingModule = await prisma.module.findUnique({ where: { id: moduleId } });
    if (!existingModule) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    let imageUrl = existingModule.imageUrl;
    if (image) {
      if (existingModule.imageUrl) {
        const publicId = existingModule.imageUrl.split('/').slice(-2).join('/').split('.')[0];
        await deleteImage(publicId);
      }
      imageUrl = await uploadImage(image);
    }

    await prisma.module.update({
      where: { id: moduleId },
      data: { title, content, imageUrl },
    });

    return NextResponse.json({ message: 'Module updated' }, { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// DELETE Module
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const moduleId = parseInt(params.id);
    if (isNaN(moduleId)) {
      return NextResponse.json({ error: 'Invalid module ID' }, { status: 400 });
    }

    const module = await prisma.module.findUnique({ where: { id: moduleId } });
    if (!module) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    if (module.imageUrl) {
      const publicId = module.imageUrl.split('/').slice(-2).join('/').split('.')[0];
      await deleteImage(publicId);
    }

    await prisma.module.delete({ where: { id: moduleId } });

    return NextResponse.json({ message: 'Module deleted' }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}