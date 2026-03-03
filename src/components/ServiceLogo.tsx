'use client';
import { useState } from 'react';

interface Props {
  iconSlug?: string;
  fallbackEmoji: string;
  name: string;
  size?: number;
}

export default function ServiceLogo({ iconSlug, fallbackEmoji, name, size = 32 }: Props) {
  const [failed, setFailed] = useState(false);

  if (!iconSlug || failed) {
    return (
      <span
        className="flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 text-base flex-shrink-0"
        style={{ width: size, height: size, fontSize: size * 0.55 }}
        role="img"
        aria-label={name}
      >
        {fallbackEmoji}
      </span>
    );
  }

  return (
    <span
      className="flex items-center justify-center rounded-lg bg-white dark:bg-gray-100 flex-shrink-0 p-1"
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://cdn.simpleicons.org/${iconSlug}`}
        alt={name}
        width={size - 8}
        height={size - 8}
        onError={() => setFailed(true)}
        style={{ objectFit: 'contain' }}
      />
    </span>
  );
}
