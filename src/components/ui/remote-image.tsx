"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface RemoteImageProps {
  src: string;
  alt?: string;
  width: number;
  height: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export function RemoteImage({
  src,
  alt = "",
  width,
  height,
  className,
  sizes,
  priority = false,
}: RemoteImageProps) {
  if (!src?.trim()) {
    return (
      <span
        className={cn("inline-block shrink-0 rounded bg-muted", className)}
        style={{ width, height }}
        aria-hidden
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={cn("object-contain shrink-0", className)}
      sizes={sizes ?? `${width}px`}
      loading={priority ? undefined : "lazy"}
      priority={priority}
    />
  );
}
