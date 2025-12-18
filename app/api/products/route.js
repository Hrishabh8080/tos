import { NextResponse } from 'next/server';
import Product from '@/lib/models/Product';
import connectDB from '@/lib/db';
import { authMiddleware } from '@/lib/middleware/auth';
import { uploadToCloudinary } from '@/lib/cloudinary';

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
    if (category) query.category = category;
    if (featured === 'true') query.featured = true;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const products = await Product.find(query)
      .populate('category', 'name slug')
      .select('-specifications') // Exclude heavy fields for list view
      .sort({ createdAt: -1 })
      .lean(); // Use lean() for better performance

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { message: 'Server error', error: error.message },
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

    const slug = `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

    const productData = {
      name,
      slug,
      description,
      price: parseFloat(price),
      category,
      stock: stock ? parseInt(stock) : 0,
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
        const uploadPromises = imageFiles.map(async (file) => {
          const buffer = Buffer.from(await file.arrayBuffer());
          return uploadToCloudinary(buffer, 'tos-products');
        });

        productData.images = uploadPromises.map((result) => ({
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

    return NextResponse.json(populatedProduct, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}
