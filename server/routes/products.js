const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { upload, cloudinary } = require('../config/cloudinary');
const authMiddleware = require('../middleware/auth');

// Get all products (public)
router.get('/', async (req, res) => {
  try {
    const { category, featured, search } = req.query;
    let query = { isActive: true };

    if (category) query.category = category;
    if (featured) query.featured = featured === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const products = await Product.find(query)
      .populate('category')
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all products including inactive (admin)
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const products = await Product.find()
      .populate('category')
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single product
router.get('/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).populate('category');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create product (admin)
router.post('/', authMiddleware, upload.array('images', 5), async (req, res) => {
  try {
    const { name, description, price, category, specifications, stock, featured } = req.body;
    
    // Validate required fields
    if (!name || !description || !price || !category) {
      return res.status(400).json({ 
        message: 'Validation error', 
        error: 'Name, description, price, and category are required' 
      });
    }

    const slug = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();

    const productData = {
      name,
      slug,
      description,
      price: parseFloat(price),
      category,
      stock: stock ? parseInt(stock) : 0,
      featured: featured === 'true',
    };

    if (req.files && req.files.length > 0) {
      productData.images = req.files.map((file) => ({
        url: file.path,
        publicId: file.filename,
      }));
    }

    if (specifications) {
      try {
        productData.specifications = JSON.parse(specifications);
      } catch (e) {
        productData.specifications = specifications;
      }
    }

    const product = new Product(productData);
    await product.save();

    const populatedProduct = await Product.findById(product._id).populate('category');
    res.status(201).json(populatedProduct);
  } catch (error) {
    console.error('Product creation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update product (admin)
router.put('/:id', authMiddleware, upload.array('images', 5), async (req, res) => {
  try {
    const { name, description, price, category, specifications, stock, featured, isActive, deleteImages } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (name) {
      product.name = name;
      product.slug = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    }
    if (description) product.description = description;
    if (price) product.price = parseFloat(price);
    if (category) product.category = category;
    if (stock !== undefined) product.stock = parseInt(stock);
    if (featured !== undefined) product.featured = featured === 'true';
    if (isActive !== undefined) product.isActive = isActive === 'true';

    // Handle specifications
    if (specifications) {
      try {
        product.specifications = JSON.parse(specifications);
      } catch (e) {
        product.specifications = specifications;
      }
    }

    // Delete specified images
    if (deleteImages) {
      const imagesToDelete = JSON.parse(deleteImages);
      for (const publicId of imagesToDelete) {
        await cloudinary.uploader.destroy(publicId);
        product.images = product.images.filter((img) => img.publicId !== publicId);
      }
    }

    // Add new images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => ({
        url: file.path,
        publicId: file.filename,
      }));
      product.images = [...product.images, ...newImages];
    }

    await product.save();
    const populatedProduct = await Product.findById(product._id).populate('category');
    res.json(populatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete product (admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete all images from Cloudinary
    for (const image of product.images) {
      if (image.publicId) {
        await cloudinary.uploader.destroy(image.publicId);
      }
    }

    await product.deleteOne();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
