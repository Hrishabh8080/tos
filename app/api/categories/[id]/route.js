import { NextResponse } from 'next/server';
import Category from '@/lib/models/Category';
import connectDB from '@/lib/db';
import { authMiddleware } from '@/lib/middleware/auth';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';
import { clearCacheForPattern } from '@/lib/utils/fetchCache';
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
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching category:', error);
    }
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
    const { data, files } = await parseFormData(request);

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

    // Handle image upload
    if (files.length > 0 && files[0].field === 'image') {
      // Delete old image if exists
      if (category.image?.publicId) {
        await deleteFromCloudinary(category.image.publicId);
      }

      const file = files[0].file;
      
      // Validate file size (max 5MB)
      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
      const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { message: `File exceeds maximum size of 5MB` },
          { status: 400 }
        );
      }
      
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { message: `Invalid image type. Allowed: JPEG, PNG, WebP` },
          { status: 400 }
        );
      }
      
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await uploadToCloudinary(buffer, 'tos-categories');
      category.image = {
        url: result.secure_url,
        publicId: result.public_id,
      };
    }

    await category.save();

    // Clear cache for categories list
    clearCacheForPattern(`/api/categories/${id}`);
    clearCacheForPattern('/api/categories');

    return NextResponse.json(category);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error updating category:', error);
    }
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

    // Delete image from Cloudinary
    if (category.image?.publicId) {
      await deleteFromCloudinary(category.image.publicId);
    }

    await category.deleteOne();

    // Clear cache for categories list
    clearCacheForPattern(`/api/categories/${id}`);
    clearCacheForPattern('/api/categories');

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error deleting category:', error);
    }
    return NextResponse.json(
      { message: 'Server error. Please try again later.' },
      { status: 500 }
    );
  }
}

