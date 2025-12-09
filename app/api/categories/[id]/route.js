import { NextResponse } from 'next/server';
import Category from '@/lib/models/Category';
import Product from '@/lib/models/Product';
import connectDB from '@/lib/db';
import { authMiddleware } from '@/lib/middleware/auth';
import { clearCacheForPattern } from '@/lib/utils/fetchCache';
import { deleteFromCloudinary } from '@/lib/cloudinary';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Revalidate every 5 minutes for GET requests

// Helper to check if string is a valid MongoDB ObjectId
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id) && id.length === 24;
}

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

// GET - Handle both ID and slug lookups
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    let category;
    
    // Check if it's an ObjectId or a slug
    if (isValidObjectId(id)) {
      // It's an ID
      category = await Category.findById(id).lean();
    } else {
      // It's a slug
      category = await Category.findOne({ slug: id }).lean();
    }

    if (!category) {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json(
      { message: 'Server error. Please try again later.' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const auth = await authMiddleware(request);
    if (auth.error) {
      return NextResponse.json(
        { message: auth.error.message },
        { status: auth.error.status }
      );
    }

    await connectDB();
    const { id } = await params;
    
    // PUT only works with ObjectId, not slug
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { message: 'Invalid category ID' },
        { status: 400 }
      );
    }
    const { data } = await parseFormData(request);

    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 404 }
      );
    }

    if (data.name) {
      category.name = data.name;
      category.slug = data.name.toLowerCase().replace(/\s+/g, '-');
    }
    if (data.description !== undefined) category.description = data.description;
    if (data.isActive !== undefined) category.isActive = data.isActive === 'true';

    await category.save();

    // Clear cache for categories list
    clearCacheForPattern(`/api/categories/${id}`);
    clearCacheForPattern('/api/categories');

    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json(
      { message: 'Server error. Please try again later.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await authMiddleware(request);
    if (auth.error) {
      return NextResponse.json(
        { message: auth.error.message },
        { status: auth.error.status }
      );
    }

    await connectDB();
    const { id } = await params;
    
    // DELETE only works with ObjectId, not slug
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { message: 'Invalid category ID' },
        { status: 400 }
      );
    }

    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 404 }
      );
    }

    // Find all products in this category
    const products = await Product.find({ category: id });
    
    // Delete images from Cloudinary for all products
    for (const product of products) {
      if (product.images && Array.isArray(product.images)) {
        for (const image of product.images) {
          if (image.publicId) {
            try {
              await deleteFromCloudinary(image.publicId);
            } catch (error) {
              // Log but don't fail if image deletion fails
            }
          }
        }
      }
    }

    // Delete all products in this category
    const deleteResult = await Product.deleteMany({ category: id });

    // Delete the category
    await category.deleteOne();

    // Clear cache for categories and products
    clearCacheForPattern(`/api/categories/${id}`);
    clearCacheForPattern('/api/categories');
    clearCacheForPattern('/api/products');

    return NextResponse.json({ 
      message: 'Category deleted successfully',
      deletedProducts: deleteResult.deletedCount || 0
    });
  } catch (error) {
    return NextResponse.json(
      { message: 'Server error. Please try again later.' },
      { status: 500 }
    );
  }
}

