"use client";

import Image from "next/image";
import { useState } from "react";
import { withClasses } from "./form-controls";

type AvatarProps = {
  src?: string;
  name: string;
  className?: string;
};

const initialsFor = (name: string): string => {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
  return initials.length > 0 ? initials : "?";
};

/**
 * Circular avatar that renders the user's real DummyJSON image and falls back
 * to initials when the image is missing or fails to load. The failure is
 * tracked per URL: when the src changes (e.g. after an edit) the avatar
 * retries the new URL instead of staying stuck on the fallback forever.
 */
const Avatar = ({ src, name, className }: AvatarProps) => {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  if (!src || failedUrl === src) {
    return (
      <span
        aria-hidden="true"
        className={withClasses(
          "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300",
          className,
        )}
      >
        {initialsFor(name)}
      </span>
    );
  }

  return (
    <span
      className={withClasses(
        "relative inline-block h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800",
        className,
      )}
    >
      <Image
        src={src}
        alt=""
        fill
        sizes="40px"
        className="object-cover"
        onError={() => setFailedUrl(src)}
      />
    </span>
  );
};

export default Avatar;
