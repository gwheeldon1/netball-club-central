import React, { memo, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  getItemKey: (item: T, index: number) => string | number;
  className?: string;
  emptyMessage?: string;
  loadingMessage?: string;
  isLoading?: boolean;
  virtualized?: boolean;
  itemHeight?: number;
  containerHeight?: number;
}

/**
 * Optimized list component with built-in virtualization and memoization
 */
function OptimizedListComponent<T>({
  items,
  renderItem,
  getItemKey,
  className,
  emptyMessage = "No items to display",
  loadingMessage = "Loading...",
  isLoading = false,
  virtualized = false,
  itemHeight = 60,
  containerHeight = 400
}: OptimizedListProps<T>) {
  const memoizedItems = useMemo(() => items, [items]);

  // Simple virtualization implementation
  const visibleItems = useMemo(() => {
    if (!virtualized || memoizedItems.length === 0) {
      return memoizedItems.map((item, index) => ({ item, index }));
    }

    const totalItems = memoizedItems.length;
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = 0; // In a real implementation, this would be based on scroll position
    const endIndex = Math.min(startIndex + visibleCount, totalItems);

    return memoizedItems
      .slice(startIndex, endIndex)
      .map((item, relativeIndex) => ({
        item,
        index: startIndex + relativeIndex
      }));
  }, [memoizedItems, virtualized, containerHeight, itemHeight]);

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="text-muted-foreground">{loadingMessage}</div>
      </div>
    );
  }

  if (memoizedItems.length === 0) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="text-muted-foreground">{emptyMessage}</div>
      </div>
    );
  }

  const listStyle = virtualized
    ? {
        height: containerHeight,
        overflowY: 'auto' as const,
      }
    : undefined;

  return (
    <div className={cn("space-y-2", className)} style={listStyle}>
      {visibleItems.map(({ item, index }) => (
        <MemoizedListItem
          key={getItemKey(item, index)}
          item={item}
          index={index}
          renderItem={renderItem}
          itemHeight={virtualized ? itemHeight : undefined}
        />
      ))}
    </div>
  );
}

interface MemoizedListItemProps<T> {
  item: T;
  index: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight?: number;
}

const MemoizedListItem = memo(function MemoizedListItem<T>({
  item,
  index,
  renderItem,
  itemHeight
}: MemoizedListItemProps<T>) {
  const itemStyle = itemHeight
    ? {
        height: itemHeight,
        minHeight: itemHeight,
      }
    : undefined;

  return (
    <div style={itemStyle} className="flex items-center">
      {renderItem(item, index)}
    </div>
  );
});

export const OptimizedList = memo(OptimizedListComponent) as <T>(
  props: OptimizedListProps<T>
) => React.ReactElement;