import { NextResponse } from 'next/server';
import Product from '@/lib/models/Product';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Revalidate every 5 minutes

/**
 * GET /api/products/[id]/related
 * Fetch related products (same category) and other products
 * Optimized to fetch only needed fields
 */
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Find the product to get its category
    const product = await Product.findById(id)
      .select('category')
      .lean();

    if (!product || !product.category) {
      return NextResponse.json({
        relatedProducts: [],
        otherProducts: [],
      });
    }

    const categoryId = product.category;

    // Fetch related products (same category, excluding current product)
    // Only select essential fields for display
    const relatedProducts = await Product.find({
      category: categoryId,
      _id: { $ne: id },
      isActive: true,
    })
      .select('_id name price images category featured slug')
      .populate('category', 'name slug')
      .sort({ featured: -1, createdAt: -1 })
      .limit(8) // Limit to 8 related products
      .lean();

    // Fetch products from other categories
    // Only select essential fields
    const otherProducts = await Product.find({
      category: { $ne: categoryId },
      _id: { $ne: id },
      isActive: true,
    })
      .select('_id name price images category featured slug')
      .populate('category', 'name slug')
      .sort({ featured: -1, createdAt: -1 })
      .limit(8) // Limit to 8 other products
      .lean();

    // Ensure _id fields are strings for proper URL generation
    const formatProducts = (products) => {
      return products.map(product => ({
        ...product,
        _id: String(product._id),
        category: product.category ? {
          ...product.category,
          _id: String(product.category._id)
        } : null
      }));
    };

    return NextResponse.json({
      relatedProducts: formatProducts(relatedProducts),
      otherProducts: formatProducts(otherProducts),
    });
  } catch (error) {
    return NextResponse.json(
      { message: 'Server error. Please try again later.' },
      { status: 500 }
    );
  }
}

