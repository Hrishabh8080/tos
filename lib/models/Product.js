import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true, // Add index for faster searches
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true, // Add index for faster lookups
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      index: true, // Add index for sorting
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true, // Add index for faster filtering
    },
    images: [
      {
        url: String,
        publicId: String,
      },
    ],
    specifications: {
      type: Map,
      of: String,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    minOrderQuantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true, // Add index for filtering
    },
    featured: {
      type: Boolean,
      default: false,
      index: true, // Add index for filtering
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common queries
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ featured: 1, isActive: 1 });
productSchema.index({ createdAt: -1 });

// Text index for search
productSchema.index({ name: 'text', description: 'text' });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;

