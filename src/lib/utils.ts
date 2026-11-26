import { clsx, type ClassValue } from 'clsx';
import { toast } from 'sonner';

export const cn = (...inputs: ClassValue[]) => clsx(inputs);

/** localStorage that never throws (private windows, blocked storage). */
export const store = {
  get(key: string): string | null {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      /* ignore */
    }
  },
};

/** For links the canvas points at a screen the brief doesn't include: say so instead of a dead click. */
export const notInPrototype = (what: string) => toast(`${what} isn't part of this prototype.`);

export const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
export const toSec = (t: string) => {
  const [m, s] = t.split(':');
  return +m * 60 + +s;
};

export function greeting(d = new Date()) {
  const h = d.getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}
