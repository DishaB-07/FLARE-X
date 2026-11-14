import { useEffect, useState } from 'react';

export function usePersistentBoolean(key) {
  const [enabled, setEnabled] = useState(() => {
    try { return window.localStorage.getItem(key) === 'on'; }
    catch { return false; }
  });
  useEffect(() => {
    try { window.localStorage.setItem(key, enabled ? 'on' : 'off'); }
    catch { /* Local storage can be blocked by browser policy. */ }
  }, [key, enabled]);
  return [enabled, setEnabled];
}
