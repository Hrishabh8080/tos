import { NextResponse } from 'next/server';
import Product from '@/lib/models/Product';
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
    const products = await Product.find()
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching all products:', error);
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

