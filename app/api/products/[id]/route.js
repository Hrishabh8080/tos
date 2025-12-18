import { NextResponse } from 'next/server';
import Product from '@/lib/models/Product';
import connectDB from '@/lib/db';
import { authMiddleware } from '@/lib/middleware/auth';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';
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
    const { id } = params;

    let product;
    
    // Check if it's an ObjectId or a slug
    if (isValidObjectId(id)) {
      // It's an ID
      product = await Product.findById(id)
        .populate('category')
        .lean();
    } else {
      // It's a slug
      product = await Product.findOne({ slug: id })
        .populate('category')
        .lean();
    }

    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { message: 'Server error', error: error.message },
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
    const { id } = params;
    const { data, files } = await parseFormData(request);

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }

    // Update fields
    if (data.name) {
      product.name = data.name;
      product.slug = `${data.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    }
    if (data.description) product.description = data.description;
    if (data.price) product.price = parseFloat(data.price);
    if (data.category) product.category = data.category;
    if (data.stock !== undefined) product.stock = parseInt(data.stock);
    if (data.featured !== undefined) product.featured = data.featured === 'true';
    if (data.isActive !== undefined) product.isActive = data.isActive === 'true';

    // Handle specifications
    if (data.specifications) {
      try {
        product.specifications = typeof data.specifications === 'string' 
          ? JSON.parse(data.specifications) 
          : data.specifications;
      } catch (e) {
        product.specifications = data.specifications;
      }
    }

    // Delete specified images
    if (data.deleteImages) {
      const imagesToDelete = JSON.parse(data.deleteImages);
      await Promise.all(
        imagesToDelete.map((publicId) => deleteFromCloudinary(publicId))
      );
      product.images = product.images.filter(
        (img) => !imagesToDelete.includes(img.publicId)
      );
    }

    // Upload new images
    if (files.length > 0) {
      const imageFiles = await Promise.all(
        files
          .filter((f) => f.field === 'images')
          .map(async (f) => {
            const buffer = Buffer.from(await f.file.arrayBuffer());
            return buffer;
          })
      );

      if (imageFiles.length > 0) {
        const uploadResults = await Promise.all(
          imageFiles.map((buffer) =>
            uploadToCloudinary(buffer, 'tos-products')
          )
        );

        const newImages = uploadResults.map((result) => ({
          url: result.secure_url,
          publicId: result.public_id,
        }));

        product.images = [...product.images, ...newImages];
      }
    }

    await product.save();
    const populatedProduct = await Product.findById(product._id)
      .populate('category')
      .lean();

    return NextResponse.json(populatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { message: 'Server error', error: error.message },
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
    const { id } = params;
    
    // DELETE only works with ObjectId, not slug
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { message: 'Invalid product ID' },
        { status: 400 }
      );
    }

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }

    // Delete all images from Cloudinary
    if (product.images && product.images.length > 0) {
      await Promise.all(
        product.images
          .filter((img) => img.publicId)
          .map((img) => deleteFromCloudinary(img.publicId))
      );
    }

    await product.deleteOne();

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

