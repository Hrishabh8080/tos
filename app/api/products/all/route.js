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
      .select('_id name slug price images category featured stock isActive specifications minOrderQuantity createdAt') // Only select needed fields
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json(
      { message: 'Server error. Please try again later.' },
      { status: 500 }
    );
  }
}

