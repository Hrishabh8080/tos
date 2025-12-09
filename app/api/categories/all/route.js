import { NextResponse } from 'next/server';
import Category from '@/lib/models/Category';
import connectDB from '@/lib/db';
import { authMiddleware } from '@/lib/middleware/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const auth = await authMiddleware(request);
    if (auth.error) {
      return NextResponse.json(
        { message: auth.error.message },
        { status: auth.error.status }
      );
    }

    await connectDB();
    const categories = await Category.find()
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

