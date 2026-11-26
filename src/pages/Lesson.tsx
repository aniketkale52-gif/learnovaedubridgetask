/* 3 · Interactive lesson (canvas Lesson), with its states:
   - LessonLoading: the tree visualiser takes 3–5 s on first open; a plain-language status line shows after 2 s.
     ?state=loading holds the skeleton.
   - LessonError: ?state=error, or the browser is offline when loading ends. Try again goes back through loading. */
import { ArrowLeft, ArrowRight, Check, WifiOff, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useProgress } from '@/data/progress';
import { cn } from '@/lib/utils';

type Phase = 'loading' | 'error' | 'ready';

function LessonHeader({ bar, xp = true }: { bar: string; xp?: boolean }) {
  return (
    <header className="focus-bar">
      <Link to="/module" aria-label="Close lesson" className="focus-close"><X className="ln-icon" /></Link>
      <span className="focus-bar__name">Binary search trees</span>
      <div className="ln-progress focus-bar__prog" role="progressbar" aria-label="Lesson progress" aria-valuenow={Math.round(parseFloat(bar) / (100 / 6))} aria-valuemin={0} aria-valuemax={6}>
        <div className="ln-progress__fill" style={{ width: bar }} />
      </div>
      <span className="focus-bar__step">Step 4 of 6</span>
      {xp ? <span className="ln-chip ln-chip--xp">+20 XP</span> : null}
    </header>
  );
}

function Loading() {
  const [slow, setSlow] = useState(false);
  useEffect(() => { const t = window.setTimeout(() => setSlow(true), 2000); return () => window.clearTimeout(t); }, []);
  return (
    <div className="focus-page" aria-busy="true">
      <LessonHeader bar="50%" xp={false} />
      <main className="lesson__body">
        <div className="skel skel--article" aria-hidden="true">
          <span style={{ width: 160, height: 12, borderRadius: 6 }} />
          <span style={{ width: '70%', height: 36, borderRadius: 10 }} />
          <span style={{ width: '100%', height: 16, borderRadius: 8 }} />
          <span style={{ width: '94%', height: 16, borderRadius: 8 }} />
          <span style={{ width: '60%', height: 16, borderRadius: 8 }} />
          <span style={{ width: '100%', height: 300, borderRadius: 'var(--radius-xl)', marginTop: 8 }} />
        </div>
        <div className="skel skel--side" aria-hidden="true" />
      </main>
      <div role="status" className={cn('loading-pill', slow && 'is-shown')}>
        {slow ? (<><span className="spinner" aria-hidden="true" />Loading the tree visualiser… this one takes a few seconds</>) : <span className="ln-sr">Loading the lesson</span>}
      </div>
      <footer className="focus-foot">
        <Link className="ln-btn ln-btn--secondary" to="/module">Previous</Link>
        <button type="button" className="ln-btn" disabled>Next</button>
      </footer>
    </div>
  );
}

function LoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="focus-page">
      <LessonHeader bar="50%" xp={false} />
      <main className="state-center">
        <div role="alert" className="ln-card state-card">
          <span className="state-card__icon"><WifiOff className="ln-icon" /></span>
          <h1>This step didn't load</h1>
          <p>Your connection dropped while loading the tree visualiser. Your progress up to step 3 is saved, so nothing is lost.</p>
          <div className="state-card__actions">
            <button type="button" className="ln-btn" onClick={onRetry}>Try again</button>
            <Link className="ln-btn ln-btn--secondary" to="/module">Back to module</Link>
          </div>
          <p className="state-card__foot">Still stuck? The text version of this step works offline.</p>
        </div>
      </main>
    </div>
  );
}

const NODES: [string, number, number][] = [['50', 276, 16], ['30', 146, 96], ['70', 406, 96], ['20', 76, 176], ['85', 476, 176]];

export function Lesson() {
  const p = useProgress();
  const [q, setQ] = useSearchParams();
  const forced = q.get('state');
  const [phase, setPhase] = useState<Phase>(forced === 'error' ? 'error' : forced === 'loading' || !p.lessonSeen ? 'loading' : 'ready');
  const [placed, setPlaced] = useState<'left' | 'right' | null>(null);

  useEffect(() => {
    if (phase !== 'loading' || forced === 'loading') return;
    const t = window.setTimeout(() => {
      if (!navigator.onLine) return setPhase('error');
      p.markLessonSeen();
      setPhase('ready');
    }, 3000 + Math.random() * 2000);
    return () => window.clearTimeout(t);
  }, [phase, forced, p]);

  if (phase === 'loading') return <Loading />;
  if (phase === 'error') return <LoadError onRetry={() => { if (forced) setQ({}, { replace: true }); setPhase('loading'); }} />;

  const right = placed === 'left';
  const slot = (side: 'left' | 'right') => {
    const on = placed === side;
    return (
      <button type="button" onClick={() => setPlaced(side)}
        aria-label={side === 'left' ? 'Place 42 as the right child of 30' : 'Place 42 as the left child of 70'}
        aria-pressed={on}
        className={cn('bst__slot', on && (side === 'left' ? 'is-good' : 'is-bad'))}
        style={{ left: side === 'left' ? 218 : 338, top: 178 }}>
        {on ? '42' : '?'}
      </button>
    );
  };

  return (
    <div className="focus-page">
      <LessonHeader bar={right ? '67%' : '58%'} />
      <main className="lesson__body">
        <article className="lesson__article">
          <div className="ln-eyebrow">Step 4 · Inserting a key</div>
          <h1 className="lesson__title">Where does a new key go?</h1>
          <p className="lesson__lead">Start at the root. If the new key is smaller, go left; if it's larger, go right. Repeat until you reach an empty spot. That spot is where the key belongs.</p>
          <p className="lesson__p">In code it's one comparison inside a loop: <code>node = node.left if key &lt; node.key else node.right</code></p>

          <section aria-label="Try it" className="ln-card tryit">
            <div className="row-between" style={{ gap: 12, marginBottom: 8 }}><b className="tryit__title">Try it: insert 42</b><span className="ln-chip">Tap an empty spot</span></div>
            <div className="bst">
              <div className="bst__canvas">
                <svg viewBox="0 0 600 250" aria-hidden="true">
                  <path d="M300 40 170 120M300 40l130 80M170 120l-70 80M430 120l70 80" style={{ fill: 'none', stroke: 'var(--foreground)', strokeWidth: 1.5 }} />
                  <path d="M170 120l70 80M430 120l-70 80" style={{ fill: 'none', stroke: 'var(--primary-strong)', strokeWidth: 1.5, strokeDasharray: '5 4' }} />
                </svg>
                {NODES.map(([v, x, y]) => <span key={v} className="bst__node" style={{ left: x, top: y }} aria-hidden="true">{v}</span>)}
                {slot('left')}
                {slot('right')}
              </div>
            </div>
            {placed === 'left' ? (
              <div role="status" className="tryit__fb tryit__fb--good"><Check className="ln-icon" /><span><b>Right spot.</b> 42 &lt; 50 goes left, then 42 &gt; 30 goes right.</span></div>
            ) : placed === 'right' ? (
              <div role="status" className="tryit__fb tryit__fb--bad"><X className="ln-icon" /><span><b>Not there.</b> Compare with the root first: 42 is smaller than 50, so it goes left.</span></div>
            ) : null}
          </section>
        </article>

        <nav aria-label="In this lesson" className="ln-card steps">
          <span className="ln-eyebrow steps__label">In this lesson</span>
          <ol>
            {['The search rule', 'Finding a key', 'Video: search in action'].map((t) => <li key={t}><span className="steps__n is-done"><Check className="ln-icon" /></span>{t}<span className="ln-sr"> (done)</span></li>)}
            <li className="is-current" aria-current="step"><span className="steps__n is-current">4</span>Inserting a key</li>
            <li><span className="steps__n">5</span>Deleting a key</li>
            <li><span className="steps__n">6</span>Quick check · 5 questions</li>
          </ol>
        </nav>
      </main>

      <footer className="focus-foot">
        <Link className="ln-btn ln-btn--secondary" to="/module"><ArrowLeft className="ln-icon" />Previous</Link>
        <span className="focus-foot__saved"><Check className="ln-icon" />Progress saved</span>
        <Link className="ln-btn" to="/quiz">Next: quick check <ArrowRight className="ln-icon" /></Link>
      </footer>
    </div>
  );
}
