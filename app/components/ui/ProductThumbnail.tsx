"use client";

import Image from "next/image";
import { Package } from "lucide-react";
import { useState } from "react";

type ProductThumbnailProps = {
  src?: string;
  /** Extra classes for the image wrapper (e.g. a border). */
  className?: string;
};

/**
 * 40px product thumbnail used by the dashboard tables/widgets.
 *
 * - `unoptimized`: thumbnails can come from user-entered hosts that are not
 *   whitelisted in next.config images.remotePatterns; routing them through
 *   /_next/image would 400-crash the <Image>. Tiny 40px thumbs gain nothing
 *   from the optimizer anyway.
 * - Failure is tracked per URL (not per component) so editing a product to a
 *   new image URL retries the new URL instead of staying on the fallback.
 */
const ProductThumbnail = ({ src, className }: ProductThumbnailProps) => {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const trimmedSrc = src?.trim() ?? "";

  if (!trimmedSrc || failedUrl === trimmedSrc) {
    return (
      <div
        aria-hidden="true"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800"
      >
        <Package className="h-4 w-4 text-gray-400" aria-hidden="true" />
      </div>
    );
  }

  return (
    <span
      className={`relative block h-10 w-10 shrink-0 overflow-hidden rounded-lg ${className ?? ""}`}
    >
      <Image
        src={trimmedSrc}
        alt=""
        fill
        sizes="40px"
        unoptimized
        className="object-cover"
        onError={() => setFailedUrl(trimmedSrc)}
      />
    </span>
  );
};

export default ProductThumbnail;
