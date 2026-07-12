import { cache } from "react";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import Category from "@/lib/models/Category"; // ensure Category model is registered for populate

/**
 * Server-side product fetch for SEO (generateMetadata + JSON-LD). Reads the DB
 * directly (no HTTP round-trip). Wrapped in React `cache()` so a single request
 * that calls it from both generateMetadata and the layout only hits the DB once.
 * Returns a plain JSON-safe object (or null) and never throws.
 */
export const getProductForSeo = cache(async (idOrSlug) => {
  try {
    await connectDB();
    void Category; // keep the import (model registration side-effect)
    const isId = mongoose.Types.ObjectId.isValid(idOrSlug) && String(idOrSlug).length === 24;
    const query = isId ? { _id: idOrSlug } : { slug: idOrSlug };
    const product = await Product.findOne(query).populate("category", "name slug").lean();
    return product ? JSON.parse(JSON.stringify(product)) : null;
  } catch {
    return null;
  }
});
