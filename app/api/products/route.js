import { NextResponse } from 'next/server';
import Product from '@/lib/models/Product';
import Category from '@/lib/models/Category';
import connectDB from '@/lib/db';
import { authMiddleware } from '@/lib/middleware/auth';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { clearCacheForPattern } from '@/lib/utils/fetchCache';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

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
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');

    const query = { isActive: true };
    if (category && mongoose.Types.ObjectId.isValid(category)) {
      query.category = category;
    }
    if (featured === 'true') query.featured = true;
    if (search && typeof search === 'string' && search.trim().length > 0) {
      // Sanitize search input to prevent regex injection
      const sanitizedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: sanitizedSearch, $options: 'i' } },
        { description: { $regex: sanitizedSearch, $options: 'i' } },
      ];
    }

    const products = await Product.find(query)
      .populate('category', 'name slug')
      .select('_id name slug price images category featured stock isActive minOrderQuantity createdAt') // Only select needed fields
      .sort({ createdAt: -1 })
      .limit(1000) // Limit results to prevent huge payloads
      .lean(); // Use lean() for better performance

    return NextResponse.json(products);
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
    const { data, files } = await parseFormData(request);

    const {
      name,
      description,
      price,
      category,
      specifications,
      stock,
      featured,
    } = data;

    if (!name || !description || !price || !category) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Input validation and sanitization
    const sanitizedName = name.trim().substring(0, 200);
    const sanitizedDescription = description.trim().substring(0, 5000);
    const parsedPrice = parseFloat(price);
    const parsedStock = stock ? parseInt(stock) : 0;

    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return NextResponse.json(
        { message: 'Invalid price. Must be a positive number.' },
        { status: 400 }
      );
    }

    if (isNaN(parsedStock) || parsedStock < 0) {
      return NextResponse.json(
        { message: 'Invalid stock. Must be a non-negative number.' },
        { status: 400 }
      );
    }

    // Validate category is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(category)) {
      return NextResponse.json(
        { message: 'Invalid category ID' },
        { status: 400 }
      );
    }

    // Check if category exists and is active
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return NextResponse.json(
        { message: 'Category not found. Cannot create product with non-existent category.' },
        { status: 400 }
      );
    }
    if (!categoryDoc.isActive) {
      return NextResponse.json(
        { message: 'Cannot create product for an inactive category.' },
        { status: 400 }
      );
    }

    const slug = `${sanitizedName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;

    const productData = {
      name: sanitizedName,
      slug,
      description: sanitizedDescription,
      price: parsedPrice,
      category,
      stock: parsedStock,
      featured: featured === 'true',
    };

    // Handle specifications
    if (specifications) {
      try {
        productData.specifications =
          typeof specifications === 'string'
            ? JSON.parse(specifications)
            : specifications;
      } catch (e) {
        productData.specifications = specifications;
      }
    }

    // Upload images
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

        // CRITICAL FIX: Await all uploads before using results
        const uploadResults = await Promise.all(uploadPromises);
        
        productData.images = uploadResults.map((result) => ({
          url: result.secure_url,
          publicId: result.public_id,
        }));
      }
    }

    const product = new Product(productData);
    await product.save();

    const populatedProduct = await Product.findById(product._id)
      .populate('category')
      .lean();

    // Clear cache for products list and related products
    clearCacheForPattern('/api/products');

    return NextResponse.json(populatedProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: 'Server error. Please try again later.' },
      { status: 500 }
    );
  }
}
