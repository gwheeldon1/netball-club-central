import { useState, useEffect } from 'react';

export function useLayoutHeader() {
  const [headerHeight, setHeaderHeight] = useState(73); // Default fallback

  // Measure header height dynamically
  useEffect(() => {
    const measureHeaderHeight = () => {
      const header = document.getElementById('mobile-header');
      if (header) {
        const height = header.offsetHeight;
        setHeaderHeight(height);
      }
    };

    // Measure on mount
    measureHeaderHeight();

    // Measure on resize
    window.addEventListener('resize', measureHeaderHeight);
    return () => {
      window.removeEventListener('resize', measureHeaderHeight);
    };
  }, []);

  return headerHeight;
}