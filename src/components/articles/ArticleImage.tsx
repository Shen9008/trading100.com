"use client";

import Image from "next/image";
import { useState } from "react";
import {
  getCategoryImage,
  isOptimizedImageHost,
  resolveImageUrl,
} from "@/lib/constants/images";
import type { ArticleCategory } from "@/lib/data/articles";

type ArticleImageProps = {
  src: string;
  alt?: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
  category?: ArticleCategory | string;
};

export function ArticleImage({
  src,
  alt = "",
  fill,
  className,
  sizes,
  priority,
  category,
}: ArticleImageProps) {
  const fallback = getCategoryImage(category);
  const [currentSrc, setCurrentSrc] = useState(() =>
    resolveImageUrl(src, category)
  );

  const handleError = () => {
    if (currentSrc !== fallback) setCurrentSrc(fallback);
  };

  if (!isOptimizedImageHost(currentSrc)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={currentSrc}
        alt={alt}
        className={className}
        sizes={sizes}
        onError={handleError}
        {...(fill
          ? {
              style: {
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              },
            }
          : {})}
      />
    );
  }

  return (
    <Image
      src={currentSrc}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes}
      priority={priority}
      onError={handleError}
    />
  );
}
