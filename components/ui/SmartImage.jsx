"use client";
import { useState } from "react";
import Image from "next/image";
import css from "./SmartImage.module.css";

/**
 * Optimized image wrapper around next/image with:
 *  - blur-up placeholder + animated shimmer skeleton until loaded
 *  - smooth fade-in on load, no layout shift (fill or width/height)
 *  - lazy by default, `priority` for above-the-fold LCP images
 *  - graceful `fallback` render on error
 *
 * Use `fill` inside a positioned, sized parent, or pass width/height.
 */
const BLUR = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='8' height='6'><rect width='100%' height='100%' fill='#e9eef6'/></svg>"
)}`;

export default function SmartImage({
  src,
  alt = "",
  fill = false,
  width,
  height,
  sizes,
  priority = false,
  quality = 75,
  objectFit = "cover",
  className = "",
  wrapClassName = "",
  wrapStyle,
  imgStyle,
  fallback = null,
  onError,
}) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  if (!src || (errored && fallback)) {
    return (
      <span className={`${css.wrap} ${fill ? css.fill : ""} ${wrapClassName}`} style={{ ...(fill ? null : { width, height }), ...wrapStyle }}>
        {fallback}
      </span>
    );
  }

  return (
    <span
      className={`${css.wrap} ${fill ? css.fill : ""} ${!loaded ? css.shimmer : ""} ${wrapClassName}`}
      style={{ ...(fill ? null : { width, height }), ...wrapStyle }}
    >
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        sizes={sizes}
        quality={quality}
        priority={priority}
        placeholder="blur"
        blurDataURL={BLUR}
        className={`${css.img} ${loaded ? css.loaded : ""} ${className}`}
        style={{ objectFit, ...imgStyle }}
        onLoad={() => setLoaded(true)}
        onError={(e) => { setErrored(true); onError && onError(e); }}
      />
    </span>
  );
}
