import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * 
 * Automatically scrolls the page to the top with a smooth animation
 * whenever the route changes. This ensures that when users navigate
 * between workflow nodes or pages, they always start at the top of
 * the new content rather than at their previous scroll position.
 */
export const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  
  return null;
};
