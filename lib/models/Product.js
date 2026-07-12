import mongoose from 'mongoose';

/**
 * Dynamic attribute definition (e.g. { name: "Size", values: ["1 sq mm", ...] }).
 * Attribute names are NOT hardcoded — any attribute (Size, Color, Packing,
 * Voltage, Material, …) is supported without a schema change.
 */
const attributeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    values: { type: [String], default: [] },
  },
  { _id: true }
);

/**
 * Product Variant subdocument — a single purchasable combination of option
 * values. `options` is an array of { name, value } pairs (JSON-safe, unlike a
 * Map) so it works for unlimited attributes without changing the schema.
 *
 * OPTIONAL by design — products with an empty `variants` array behave exactly
 * as before (base price/stock/sku/minOrderQuantity are used). The legacy
 * `size` field is retained (optional) so any pre-existing data still reads.
 */
const variantOptionSchema = new mongoose.Schema(
  { name: { type: String, trim: true }, value: { type: String, trim: true } },
  { _id: false }
);

const variantSchema = new mongoose.Schema(
  {
    options: { type: [variantOptionSchema], default: [] }, // [{name:"Size", value:"1.5 sq mm"}]
    size: { type: String, trim: true }, // legacy fallback (optional)
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    sku: { type: String, trim: true },
    minOrderQuantity: { type: Number, default: 1, min: 1 },
    image: { url: String, publicId: String },
    status: { type: String, enum: ['available', 'out_of_stock'], default: 'available' },
  },
  { _id: true }
);

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
    // Optional selling unit label (e.g. "Meter", "Piece", "Coil", "Litre").
    // Drives display like "₹145 / Meter" and "Min. order 100 Meter".
    unit: {
      type: String,
      trim: true,
      default: '',
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
    // Dynamic attribute definitions (drives the variant selectors on the storefront)
    attributes: {
      type: [attributeSchema],
      default: [],
    },
    // Optional variant list — empty means "single fixed price" (legacy behavior)
    variants: {
      type: [variantSchema],
      default: [],
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

