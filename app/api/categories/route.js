import { NextResponse } from 'next/server';
import Category from '@/lib/models/Category';
import connectDB from '@/lib/db';
import { authMiddleware } from '@/lib/middleware/auth';
import { uploadToCloudinary } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';
export const revalidate = 120; // Revalidate every 2 minutes

// Helper to parse form data
async function parseFormData(request) {
  const formData = await request.formData();
  const data = {};
  const files = [];

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      files.push({ field: key, file: value });
    } else {
      data[key] = value;
    }
  }

  return { data, files };
}

export async function GET(request) {
  try {
    await connectDB();
    const categories = await Category.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const auth = await authMiddleware(request);
    if (auth.error) {
      return NextResponse.json(
        { message: auth.error.message },
        { status: auth.error.status }
      );
    }

    await connectDB();
    const { data, files } = await parseFormData(request);
    const { name, description } = data;

    if (!name) {
      return NextResponse.json(
        { message: 'Category name is required' },
        { status: 400 }
      );
    }

    const slug = name.toLowerCase().replace(/\s+/g, '-');

    const categoryData = {
      name,
      slug,
      description,
    };

    // Upload image if provided
    if (files.length > 0 && files[0].field === 'image') {
      const file = files[0].file;
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await uploadToCloudinary(buffer, 'tos-categories');
      categoryData.image = {
        url: result.secure_url,
        publicId: result.public_id,
      };
    }

    const category = new Category(categoryData);
    await category.save();

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

