'use client';

import Link from 'next/link';
import { Badge } from './badge';
import { cn } from '../lib/utils';

export interface ComponentCardProps {
  id: string;
  name: string;
  description: string;
  category: string;
  variants?: number;
  preview: React.ReactNode;
  href: string;
}

export function ComponentCard({
  name,
  description,
  category,
  variants,
  preview,
  href,
}: ComponentCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group block rounded-lg border border-border bg-card p-6",
        "hover:shadow-lg hover:border-primary/30",
        "transition-all duration-200 ease-out",
        "hover:-translate-y-1",
        "cursor-pointer"
      )}
    >
      {/* Header with name + category badge */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
          {name}
        </h3>
        <Badge variant="outline" className="text-xs">
          {category}
        </Badge>
      </div>

      {/* Preview area - prevent ALL clicks from navigating */}
      <div
        className="p-4 border border-border rounded-lg bg-background mb-4"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {preview}
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-3">
        {description}
      </p>

      {/* Stats */}
      {variants && (
        <p className="text-xs text-muted-foreground">
          {variants} variant{variants !== 1 ? 's' : ''}
        </p>
      )}
    </Link>
  );
}
