import { NextResponse } from 'next/server';
import Category from '@/lib/models/Category';
import connectDB from '@/lib/db';
import { authMiddleware } from '@/lib/middleware/auth';
import { clearCacheForPattern } from '@/lib/utils/fetchCache';

export const dynamic = 'force-dynamic';
export const revalidate = 120; // Revalidate every 2 minutes

// Helper to parse form data
async function parseFormData(request) {
  const formData = await request.formData();
  const data = {};

  for (const [key, value] of formData.entries()) {
    if (!(value instanceof File)) {
      data[key] = value;
    }
  }

  return { data };
}

export async function GET(request) {
  try {
    await connectDB();
    const categories = await Category.find({ isActive: true })
      .select('_id name slug description isActive createdAt') // Only select needed fields
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json(
      { message: 'Server error. Please try again later.' },
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
    const { data } = await parseFormData(request);
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

    const category = new Category(categoryData);
    await category.save();

    // Clear cache for categories list
    clearCacheForPattern('/api/categories');

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: 'Server error. Please try again later.' },
      { status: 500 }
    );
  }
}

