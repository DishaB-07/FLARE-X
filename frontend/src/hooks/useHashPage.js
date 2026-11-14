import { useCallback, useEffect, useRef, useState } from 'react';
import { PAGES } from '../config/constants.js';

function currentPage() {
  const page = window.location.hash.replace(/^#\/?/, '');
  return PAGES.has(page) ? page : 'overview';
}

export function useHashPage(onPageChange) {
  const [activePage, setActivePage] = useState(currentPage);
  const onChange = useRef(onPageChange);
  onChange.current = onPageChange;
  useEffect(() => {
    const update = () => { setActivePage(currentPage()); onChange.current?.(); };
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);
  const navigate = useCallback((page) => {
    if (!PAGES.has(page)) return;
    if (window.location.hash !== `#/${page}`) window.location.hash = `/${page}`;
    setActivePage(page);
    onChange.current?.();
  }, []);
  return { activePage, navigate };
}
