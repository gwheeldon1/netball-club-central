import React, { useMemo } from 'react';
import { useVirtualization } from '@/hooks/useVirtualization';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface OptimizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  containerHeight: number;
  className?: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
}

export function OptimizedList<T>({
  items,
  renderItem,
  itemHeight,
  containerHeight,
  className,
  onLoadMore,
  hasMore,
  loading,
}: OptimizedListProps<T>) {
  const { visibleItems, visibleRange, totalHeight, offsetY, handleScroll } =
    useVirtualization(items, { itemHeight, containerHeight });

  const { targetRef: loadMoreRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.5,
  });

  // Trigger load more when intersection is detected
  React.useEffect(() => {
    if (isIntersecting && hasMore && !loading && onLoadMore) {
      onLoadMore();
    }
  }, [isIntersecting, hasMore, loading, onLoadMore]);

  const memoizedItems = useMemo(() => {
    return visibleItems.map((item, index) => (
      <div
        key={visibleRange.startIndex + index}
        style={{
          height: itemHeight,
          transform: `translateY(${(visibleRange.startIndex + index) * itemHeight}px)`,
        }}
        className="absolute top-0 left-0 right-0"
      >
        {renderItem(item, visibleRange.startIndex + index)}
      </div>
    ));
  }, [visibleItems, visibleRange.startIndex, itemHeight, renderItem]);

  return (
    <div
      className={`relative overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {memoizedItems}
        </div>
      </div>
      
      {/* Load more trigger */}
      {hasMore && (
        <div
          ref={loadMoreRef}
          className="h-10 flex items-center justify-center"
        >
          {loading && (
            <div className="animate-pulse text-muted-foreground">
              Loading more...
            </div>
          )}
        </div>
      )}
    </div>
  );
}