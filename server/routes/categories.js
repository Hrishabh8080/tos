const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { upload, cloudinary } = require('../config/cloudinary');
const authMiddleware = require('../middleware/auth');

// Get all categories (public)
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all categories including inactive (admin)
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single category
router.get('/:slug', async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create category (admin)
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { name, description } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, '-');

    const categoryData = {
      name,
      slug,
      description,
    };

    if (req.file) {
      categoryData.image = {
        url: req.file.path,
        publicId: req.file.filename,
      };
    }

    const category = new Category(categoryData);
    await category.save();

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update category (admin)
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { name, description, isActive } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (name) {
      category.name = name;
      category.slug = name.toLowerCase().replace(/\s+/g, '-');
    }
    if (description !== undefined) category.description = description;
    if (isActive !== undefined) category.isActive = isActive;

    if (req.file) {
      // Delete old image if exists
      if (category.image?.publicId) {
        await cloudinary.uploader.destroy(category.image.publicId);
      }
      category.image = {
        url: req.file.path,
        publicId: req.file.filename,
      };
    }

    await category.save();
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete category (admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Delete image from Cloudinary
    if (category.image?.publicId) {
      await cloudinary.uploader.destroy(category.image.publicId);
    }

    await category.deleteOne();
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
