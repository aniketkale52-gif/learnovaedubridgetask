import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { store } from './utils';

export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query);
      m.addEventListener('change', cb);
      return () => m.removeEventListener('change', cb);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export const useReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');

/** Theme lives on <html data-theme>; dark is the default, light the alternate. */
export function useTheme() {
  const read = () => (document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
  const [theme, setTheme] = useState<'dark' | 'light'>(read);
  useEffect(() => {
    const obs = new MutationObserver(() => setTheme(read()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);
  /** Switches theme; given the button, the new theme grows out of it in a circle (View Transitions, else instant). */
  const toggle = useCallback((from?: HTMLElement) => {
    const next = read() === 'dark' ? 'light' : 'dark';
    const apply = () => {
      document.documentElement.setAttribute('data-theme', next);
      store.set('learnova.theme', next);
    };
    if (!from || !document.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return apply();
    const b = from.getBoundingClientRect();
    const x = b.left + b.width / 2;
    const y = b.top + b.height / 2;
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    document.startViewTransition(apply).ready.then(() =>
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 550, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', pseudoElement: '::view-transition-new(root)' },
      ),
    );
  }, []);
  return { theme, toggle };
}

/** True after `ms` without pointer, key, wheel, touch or scroll activity anywhere on the page.
 *  `wokeAt` is when it last went from idle back to active (any activity wakes it). */
export function useIdle(ms: number, enabled = true) {
  const [idle, setIdle] = useState(false);
  const idleRef = useRef(false);
  const wokeAt = useRef(0);
  useEffect(() => {
    if (!enabled) return;
    let t = 0;
    const arm = () => {
      if (idleRef.current) wokeAt.current = Date.now();
      idleRef.current = false;
      setIdle(false);
      window.clearTimeout(t);
      t = window.setTimeout(() => {
        idleRef.current = true;
        setIdle(true);
      }, ms);
    };
    const events = ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'] as const;
    events.forEach((e) => window.addEventListener(e, arm, { passive: true }));
    arm();
    return () => {
      window.clearTimeout(t);
      events.forEach((e) => window.removeEventListener(e, arm));
    };
  }, [ms, enabled]);
  return { idle, wokeAt };
}
