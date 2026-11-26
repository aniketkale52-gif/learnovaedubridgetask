/* 4f · Lesson complete (canvas Complete). ~1.8 s sequence: band sweeps, confetti, mascot hops in, headline,
   stat cards land one by one and count up. A click or Enter skips to the end. Low scores get encouraging copy
   and "Review mistakes". Values come from the quiz run (the board's values when opened directly). */
import { ArrowRight, Target, Timer, Zap } from 'lucide-react';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { Mascot } from '@/components/Mascot';
import { useProgress } from '@/data/progress';
import { cn } from '@/lib/utils';

const CONFETTI: [number, number, number?][] = [[-260, -150], [-190, -230, -260], [-120, -280], [-40, -300, 300], [50, -290], [130, -260, -200], [200, -220], [270, -140, 260], [-300, -40], [300, -50, -240], [-230, 60], [240, 70]];
const SEQUENCE_MS = 1900;

export function Complete() {
  const p = useProgress();
  const r = p.result ?? { xp: 50, firstTry: 4, total: 5, fixed: 1, minutes: 14 };
  const accuracy = Math.round((r.firstTry / r.total) * 100);
  const low = accuracy < 60;
  const [skipped, setSkipped] = useState(false);
  const [done, setDone] = useState(false);
  const cont = useRef<HTMLAnchorElement>(null);

  useEffect(() => { const t = window.setTimeout(() => setDone(true), SEQUENCE_MS); return () => window.clearTimeout(t); }, []);
  useEffect(() => { if (done || skipped) cont.current?.focus({ preventScroll: true }); }, [done, skipped]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !done && !skipped) { e.preventDefault(); setSkipped(true); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [done, skipped]);

  const sub = low
    ? `Binary search trees · ${r.firstTry} of ${r.total} on the first try. The misses show what to review.`
    : r.fixed
      ? `Binary search trees · you fixed the ${r.fixed === 1 ? 'one' : r.fixed} you missed`
      : `Binary search trees · ${r.firstTry} of ${r.total} on the first try`;
  const count = (to: number, extra: CSSProperties) => ({ ['--to' as string]: to, ...extra }) as CSSProperties;

  return (
    <div className="focus-page">
      <main className={cn('complete', skipped && 'is-skipped')} onClick={() => !done && setSkipped(true)}>
        <div className="ln-celebrate complete__stage">
          <span className="ln-sweep" aria-hidden="true" />
          <span className="ln-confetti" aria-hidden="true">
            {CONFETTI.map(([x, y, rot], i) => <i key={i} style={{ ['--x' as string]: `${x}px`, ['--y' as string]: `${y}px`, ...(rot ? { ['--r' as string]: `${rot}deg` } : {}) }} />)}
          </span>
          <Mascot pose="celebrate" size={230} hop />
          <h1 className="ln-step-in complete__title" style={{ animationDelay: '450ms' }}>{low ? 'Lesson finished' : 'Lesson complete'}</h1>
          <p className="ln-step-in complete__sub" style={{ animationDelay: '600ms' }}>{sub}</p>
          <div className="complete__stats">
            <div className="ln-stat" style={{ animationDelay: '1000ms' }}><span className="ln-stat__label">Total XP</span><span className="ln-stat__value"><Zap className="ln-icon complete__icon complete__icon--fill" /><span className="ln-count" style={count(r.xp, { ['--prefix' as string]: "'+'", animationDelay: '1100ms' })} aria-hidden="true" /><span className="ln-sr">{r.xp} XP earned</span></span></div>
            <div className="ln-stat ln-stat--accuracy" style={{ animationDelay: '1200ms' }}><span className="ln-stat__label">Accuracy</span><span className="ln-stat__value"><Target className="ln-icon complete__icon" /><span className="ln-count" style={count(accuracy, { ['--suffix' as string]: "'%'", animationDelay: '1300ms' })} aria-hidden="true" /><span className="ln-sr">{accuracy} percent accuracy</span></span></div>
            <div className="ln-stat ln-stat--time" style={{ animationDelay: '1400ms' }}><span className="ln-stat__label">Time</span><span className="ln-stat__value"><Timer className="ln-icon complete__icon" /><span className="ln-count" style={count(r.minutes, { ['--suffix' as string]: "' min'", animationDelay: '1500ms' })} aria-hidden="true" /><span className="ln-sr">{r.minutes} minutes</span></span></div>
          </div>
          <p className="ln-step-in complete__foot" style={{ animationDelay: '1800ms' }}>{p.goal >= 20 ? 'Daily goal reached' : `${20 - p.goal} XP to today's goal`} · progress saved</p>
        </div>
      </main>
      <footer className="focus-foot">
        <Link className="ln-btn ln-btn--secondary" to="/lesson">{low ? 'Review mistakes' : 'Review lesson'}</Link>
        <Link ref={cont} className="ln-btn" to="/streak">Continue <ArrowRight className="ln-icon" /></Link>
      </footer>
    </div>
  );
}
