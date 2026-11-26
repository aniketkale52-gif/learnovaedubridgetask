/* 4g · Streak +1 (canvas Streak): the flame ignites, the number rolls over, today's dot pops. Continue → module. */
import { ArrowRight, Check } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useProgress } from '@/data/progress';

const CONFETTI: [number, number, number][] = [[-90, -150, 650], [80, -170, 650], [-130, -60, 700], [120, -80, 700], [-40, -200, 750], [30, -210, 750]];
const DAYS: [string, string][] = [['M', 'Monday'], ['T', 'Tuesday'], ['W', 'Wednesday'], ['T', 'Thursday'], ['F', 'Friday'], ['S', 'Saturday'], ['S', 'Sunday']];

export function Streak() {
  const { streak } = useProgress();
  const n = Math.max(streak, 13); // opened directly: the board's 12 → 13
  const cont = useRef<HTMLAnchorElement>(null);
  useEffect(() => { const t = window.setTimeout(() => cont.current?.focus({ preventScroll: true }), 1400); return () => window.clearTimeout(t); }, []);
  return (
    <div className="focus-page">
      <main className="complete">
        <div className="ln-celebrate streak">
          <span className="ln-confetti" aria-hidden="true">
            {CONFETTI.map(([x, y, d], i) => <i key={i} style={{ ['--x' as string]: `${x}px`, ['--y' as string]: `${y}px`, animationDelay: `${d}ms` }} />)}
          </span>
          <svg className="ln-flame" width="112" height="132" viewBox="0 0 112 132" aria-hidden="true">
            <defs><linearGradient id="ln-flame-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffb27a" /><stop offset="0.55" stopColor="#ff7a3d" /><stop offset="1" stopColor="#d9481a" /></linearGradient></defs>
            <path d="M56 6c7 23 36 38 36 74a36 36 0 0 1-72 0c0-18 9-31 18-39 1 11 6 18 14 21-7-18 0-39 4-56z" fill="url(#ln-flame-g)" />
            <path d="M56 66c3 10 17 17 17 32a17 17 0 0 1-34 0c0-9 5-16 9-20 1 6 4 10 8 11-3-9-1-17 0-23z" fill="#ffd27a" />
          </svg>
          <h1 className="streak__n"><span className="ln-roll" aria-hidden="true"><span><span>{n - 1}</span><span>{n}</span></span></span><span className="ln-sr">{n} day streak</span></h1>
          <div className="ln-step-in streak__label" style={{ animationDelay: '900ms' }} aria-hidden="true">day streak</div>
          <div className="ln-card ln-step-in streak__card" style={{ animationDelay: '1100ms' }}>
            <div className="ln-week" role="list" aria-label="This week">
              {DAYS.map(([d, name], i) => (
                <div key={name} className={i === 0 ? 'ln-week__day is-done' : i === 1 ? 'ln-week__day is-done is-today' : 'ln-week__day'} role="listitem" aria-label={`${name}${i === 1 ? ', today' : ''}${i < 2 ? ', studied' : ''}`}>
                  {d}<span className="ln-week__dot">{i < 2 ? <Check className="ln-icon" style={{ width: 14, height: 14, strokeWidth: 3 }} /> : null}</span>
                </div>
              ))}
            </div>
            <p>One lesson tomorrow makes it {n + 1}. Even five minutes of review counts.</p>
          </div>
        </div>
      </main>
      <footer className="focus-foot" style={{ justifyContent: 'flex-end' }}>
        <Link ref={cont} className="ln-btn" to="/module">Continue <ArrowRight className="ln-icon" /></Link>
      </footer>
    </div>
  );
}
