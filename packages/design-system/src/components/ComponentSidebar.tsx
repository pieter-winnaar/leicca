'use client';

import { cn } from '../lib/utils';

export interface Category {
  id: string;
  label: string;
  count: number;
}

export interface ComponentSidebarProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export function ComponentSidebar({
  categories,
  activeCategory,
  onCategoryChange,
}: ComponentSidebarProps) {
  return (
    <aside className="w-64 flex-shrink-0">
      <div className="sticky top-4">
        <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">
          Categories
        </h2>
        <nav className="space-y-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors",
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <span>{cat.label}</span>
              <span className="text-xs">{cat.count}</span>
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}
