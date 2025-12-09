import { NextResponse } from 'next/server';
import Product from '@/lib/models/Product';
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

    let product;
    
    // Check if it's an ObjectId or a slug
    if (isValidObjectId(id)) {
      // It's an ID
      product = await Product.findById(id)
        .populate('category', 'name slug description') // Only populate needed fields
        .lean();
    } else {
      // It's a slug
      product = await Product.findOne({ slug: id })
        .populate('category', 'name slug description') // Only populate needed fields
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
    const { data, files } = await parseFormData(request);

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }

    // Update fields with validation
    if (data.name) {
      const sanitizedName = data.name.trim().substring(0, 200);
      product.name = sanitizedName;
      product.slug = `${sanitizedName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;
    }
    if (data.description) {
      product.description = data.description.trim().substring(0, 5000);
    }
    if (data.price) {
      const parsedPrice = parseFloat(data.price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return NextResponse.json(
          { message: 'Invalid price. Must be a positive number.' },
          { status: 400 }
        );
      }
      product.price = parsedPrice;
    }
    if (data.category) {
      if (!mongoose.Types.ObjectId.isValid(data.category)) {
        return NextResponse.json(
          { message: 'Invalid category ID' },
          { status: 400 }
        );
      }
      // Check if category exists before updating
      const category = await Category.findById(data.category);
      if (!category) {
        return NextResponse.json(
          { message: 'Category not found. Cannot update product with non-existent category.' },
          { status: 400 }
        );
      }
      // Check if category is active
      if (!category.isActive) {
        return NextResponse.json(
          { message: 'Cannot assign product to an inactive category.' },
          { status: 400 }
        );
      }
      product.category = data.category;
    }
    if (data.stock !== undefined) {
      const parsedStock = parseInt(data.stock);
      if (isNaN(parsedStock) || parsedStock < 0) {
        return NextResponse.json(
          { message: 'Invalid stock. Must be a non-negative number.' },
          { status: 400 }
        );
      }
      product.stock = parsedStock;
    }
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
      try {
        const imagesToDelete = JSON.parse(data.deleteImages);
        if (Array.isArray(imagesToDelete) && imagesToDelete.length > 0) {
          await Promise.all(
            imagesToDelete.map((publicId) => {
              if (publicId && typeof publicId === 'string') {
                return deleteFromCloudinary(publicId).catch((err) => {
                  return null;
                });
              }
              return Promise.resolve(null);
            })
          );
          if (Array.isArray(product.images)) {
            product.images = product.images.filter(
              (img) => img && img.publicId && !imagesToDelete.includes(img.publicId)
            );
          }
        }
      } catch (parseError) {
        // Continue without deleting images
      }
    }

    // Upload new images
    if (files.length > 0) {
      const imageFiles = files
        .filter((f) => f.field === 'images')
        .map((f) => f.file);

      if (imageFiles.length > 0) {
        // Validate file size (max 5MB per file)
        const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
        const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        
        for (const file of imageFiles) {
          if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
              { message: `File ${file.name} exceeds maximum size of 5MB` },
              { status: 400 }
            );
          }
          if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
              { message: `File ${file.name} is not a valid image type. Allowed: JPEG, PNG, WebP` },
              { status: 400 }
            );
          }
        }

        const uploadPromises = imageFiles.map(async (file) => {
          const buffer = Buffer.from(await file.arrayBuffer());
          return uploadToCloudinary(buffer, 'tos-products');
        });

        const uploadResults = await Promise.all(uploadPromises);

        const newImages = uploadResults.map((result) => ({
          url: result.secure_url,
          publicId: result.public_id,
        }));

        // Ensure product.images is an array before spreading
        product.images = Array.isArray(product.images) 
          ? [...product.images, ...newImages]
          : newImages;
      }
    }

    await product.save();
    const populatedProduct = await Product.findById(product._id)
      .populate('category')
      .lean();

    // Clear cache for this product and related products
    clearCacheForPattern(`/api/products/${id}`);
    clearCacheForPattern('/api/products');

    return NextResponse.json(populatedProduct);
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

    // Clear cache for products list and related products
    clearCacheForPattern(`/api/products/${id}`);
    clearCacheForPattern('/api/products');

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { message: 'Server error. Please try again later.' },
      { status: 500 }
    );
  }
}

