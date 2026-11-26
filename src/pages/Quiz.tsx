/* 4 · Quiz, run as one flow (canvas Quiz, QuizCorrect, QuizWrong, QuizPeek, QuizReview; QuizDark / QuizMobile by theme and width).
   Pick with a click or 1/2/3, Enter checks. Check is disabled until a pick and locks after one press.
   Correct: option springs + sparkles, green panel, bar grows, "N in a row" rides the head (5+ runs gold).
   Not quite: option shakes, the answer is outlined, red panel says why; the miss comes back at the end tagged
   "Previous mistake". The mascot peeks in as its own beat after a miss, at 5 in a row, and before the review.
   A second miss on the same question leads to "Try a different way" (/retry).
   Deep links that match the boards: ?at=4 (question 4, 3 in a row), ?at=review. */
import { ArrowRight, Check, ChevronsRight, Lightbulb, RotateCcw, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mascot, type Mood } from '@/components/Mascot';
import { useProgress } from '@/data/progress';
import { QUESTIONS, TOPIC, XP_PER_CORRECT, type Question } from '@/data/quiz';
import { useReducedMotion } from '@/lib/hooks';
import { cn } from '@/lib/utils';

interface Item { qi: number; review: boolean; hint?: boolean } // hint: it was skipped, so it returns with its hint
interface Result { qi: number; ok: boolean; review: boolean }
type Phase = 'ask' | 'checked' | 'peek';
type PeekReason = 'miss' | 'skip' | 'combo' | 'review';

const TOTAL = QUESTIONS.length;
const PEEK_LINES: Record<PeekReason, string> = {
  miss: 'Mistakes are how this sticks. That one comes back before you finish.',
  skip: 'No problem. That one comes back before you finish, with a hint.',
  combo: 'Five in a row. Trees are clicking for you.',
  review: "One to fix, then you're done. You've seen this one before.",
};
const WORDS = ['', 'One', 'Two', 'Three', 'Four', 'Five'];

function initial(at: string | null) {
  const queue: Item[] = QUESTIONS.map((_, qi) => ({ qi, review: false }));
  if (at === 'review') {
    // the board state: question 4 was missed and comes back after the other four
    queue.push({ qi: 3, review: true });
    const results: Result[] = [0, 1, 2, 3, 4].map((qi) => ({ qi, ok: qi !== 3, review: false }));
    return { queue, pos: TOTAL, results, combo: 1, xp: 40 };
  }
  const n = at ? Math.min(TOTAL, Math.max(1, parseInt(at, 10) || 1)) - 1 : 0;
  return { queue, pos: n, results: Array.from({ length: n }, (_, qi) => ({ qi, ok: true, review: false })), combo: n, xp: n * XP_PER_CORRECT };
}

/* The footer mascot: peeks over the footer edge, eyes follow the moment; a poke gives a giggle and a line. Never dozes. */
function FooterMascot({ mood, lines, moment }: { mood: Mood; lines: string[]; moment: string }) {
  const [poke, setPoke] = useState(0);
  useEffect(() => setPoke(0), [moment]); // a new question or a check starts the lines over
  return (
    <div className="quiz-mascot">
      <div className="ln-m-rise quiz-mascot__clip" aria-hidden="true"><Mascot pose="peek" mood={mood} size={200} live poke={poke} /></div>
      <button type="button" className="quiz-mascot__poke" aria-label="Poke the mascot for a hint" onClick={() => setPoke((n) => n + 1)} />
      {poke > 0 ? <p key={poke} className={`ln-m-say ln-m-say--left ln-m-say--b quiz-mascot__say`} role="status">{lines[(poke - 1) % lines.length]}</p> : null}
    </div>
  );
}

function OptionCard({ q, i, pick, phase, onPick }: { q: Question; i: number; pick: number | null; phase: Phase; onPick: (i: number) => void }) {
  const o = q.options[i];
  const checked = phase === 'checked';
  const isAnswer = i === q.answer;
  const isPick = i === pick;
  const state = !checked ? null : isAnswer && isPick ? 'correct' : isPick ? 'wrong' : isAnswer ? 'answer' : 'other';
  return (
    <button
      type="button"
      className={cn('ln-option quiz-opt', state === 'correct' && 'is-correct', state === 'wrong' && 'is-wrong', state === 'answer' && 'is-answer')}
      role="radio"
      aria-checked={isPick}
      disabled={checked}
      onClick={() => onPick(i)}
    >
      {state === 'correct' ? <span className="ln-sparkle" aria-hidden="true"><i /><i /><i /><i /></span> : null}
      <span className="ln-option__code">{o.code}</span>
      <span className="ln-option__row">
        <span>{state === 'wrong' ? 'Your pick: ' : ''}{o.label}{state === 'answer' ? <span className="ln-sr"> (correct answer)</span> : null}</span>
        <span className="ln-option__key" aria-hidden="true">
          {state === 'correct' || state === 'answer' ? <Check className="ln-icon" /> : state === 'wrong' ? <X className="ln-icon" /> : i + 1}
        </span>
      </span>
    </button>
  );
}

export function Quiz() {
  const nav = useNavigate();
  const p = useProgress();
  const reduced = useReducedMotion();
  const [params] = useSearchParams();
  const [init] = useState(() => initial(params.get('at')));
  const [queue, setQueue] = useState<Item[]>(init.queue);
  const [pos, setPos] = useState(init.pos);
  const [results, setResults] = useState<Result[]>(init.results);
  const [combo, setCombo] = useState(init.combo);
  const [xp, setXp] = useState(init.xp);
  const [pick, setPick] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>('ask');
  const [peek, setPeek] = useState<PeekReason | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [said, setSaid] = useState('');
  const primary = useRef<HTMLButtonElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  const item = queue[Math.min(pos, queue.length - 1)];
  const q = QUESTIONS[item.qi];
  const last = results[results.length - 1];
  const ok = phase === 'checked' && !!last?.ok;
  const secondMiss = phase === 'checked' && !ok && item.review;
  const skipped = phase === 'checked' && !ok && pick === null; // skipping isn't a mistake: neutral panel, no "Your pick"
  // misses still to fix hold the bar at 92%; it fills once the last one is answered
  const pendingReview = queue.slice(pos + (phase === 'checked' && ok ? 1 : 0)).some((it) => it.review) || (phase === 'checked' && !ok && !item.review);
  const answered = Math.min(TOTAL, results.filter((r) => !r.review).length);
  const fill = Math.min(answered / TOTAL, pendingReview ? 0.92 : 1) * 100;
  const prevFill = useRef(fill);
  const from = prevFill.current;
  useEffect(() => { prevFill.current = fill; }, [fill]);

  const check = useCallback((skipped = false) => {
    if (phase !== 'ask' || (!skipped && pick === null)) return; // one submit only
    const right = !skipped && pick === q.answer;
    setResults((r) => [...r, { qi: item.qi, ok: right, review: item.review }]);
    if (right) {
      setCombo((c) => c + 1);
      setXp((x) => x + XP_PER_CORRECT);
    } else {
      setCombo(0);
      if (!item.review) setQueue((qu) => [...qu, { qi: item.qi, review: true, hint: skipped }]);
    }
    if (skipped) setPick(null);
    setPhase('checked');
    const answer = q.options[q.answer].label;
    setSaid(right ? `Correct, plus ${XP_PER_CORRECT} XP. ${q.why}` : skipped ? `Skipped. The answer is ${answer}. ${q.why}` : `Not quite. The answer is ${answer}. ${q.whyWrong}`);
  }, [phase, pick, q, item]);

  const finish = useCallback(() => {
    const all = [...results];
    p.finishQuiz({
      xp: all.filter((r) => r.ok).length * XP_PER_CORRECT,
      firstTry: all.filter((r) => !r.review && r.ok).length,
      total: TOTAL,
      fixed: all.filter((r) => r.review && r.ok).length,
    });
    nav('/complete');
  }, [results, p, nav]);

  const goTo = useCallback((next: number, fromPeek: boolean) => {
    if (next >= queue.length) return finish();
    setPos(next);
    setPick(null);
    // the review round opens with its own mascot beat (unless the mascot just spoke after the miss)
    if (queue[next].review && !queue[next - 1]?.review && !fromPeek) {
      setPeek('review');
      setPhase('peek');
    } else {
      setPhase('ask');
    }
  }, [queue, finish]);

  const proceed = () => {
    if (secondMiss) return nav('/retry');
    if (!ok) { setPeek(skipped ? 'skip' : 'miss'); setPhase('peek'); return; }
    if (combo === 5 && !item.review) { setPeek('combo'); setPhase('peek'); return; }
    goTo(pos + 1, false);
  };

  const leavePeek = () => {
    const done = () => {
      setLeaving(false);
      setPeek(null);
      if (peek === 'review') setPhase('ask');
      else goTo(pos + 1, true);
    };
    if (reduced) return done();
    setLeaving(true); // slides back down behind the footer edge
    window.setTimeout(done, 280);
  };

  // 1/2/3 pick, Enter checks
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase !== 'ask' || e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const n = ['1', '2', '3'].indexOf(e.key);
      if (n >= 0) { e.preventDefault(); setPick(n); }
      if (e.key === 'Enter' && pick !== null) { e.preventDefault(); check(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, pick, check]);

  // focus follows the moment: the panel's main button after a check, the new question when it slides in
  useEffect(() => {
    if (phase === 'checked' || phase === 'peek') primary.current?.focus({ preventScroll: true });
    else if (pos !== init.pos || results.length !== init.results.length) heading.current?.focus({ preventScroll: true });
  }, [phase, pos]);

  const answer = q.options[q.answer].label;
  const mood: Mood = phase === 'checked' ? (ok ? 'fire' : skipped ? 'think' : 'encourage') : pick === null ? 'think' : 'look';
  const nextName = pos + 1 < queue.length ? (queue[pos + 1].review ? 'the review' : `question ${pos + 2}`) : 'the finish';
  const lines = phase === 'checked'
    ? ok
      ? [combo >= 2 ? `${WORDS[Math.min(combo, 5)]} in a row!${combo === 4 ? ' One more and the bar turns gold.' : ''}` : q.tip, q.tip, `Hey, that tickles! Ready for ${nextName}?`].filter((l, i, a) => a.indexOf(l) === i)
      : skipped ? ['No problem. It comes back at the end, with a hint.', 'Want the 2-minute recap first? It is step 4 of the lesson.']
      : [`Close one. ${q.clue}`, item.review ? "Let's look at it from another side next." : 'Mistakes are how this sticks. This one comes back at the end.', 'Want the 2-minute recap? It is step 4 of the lesson.']
    : [q.hint, 'Take your time. No hearts here: a miss costs you nothing.', 'Press 1, 2 or 3 to pick, then Enter to check.'];

  return (
    <div className="focus-page quiz">
      <header className="quiz-bar">
        <Link to="/lesson" aria-label="Leave quiz" className="focus-close"><X className="ln-icon" /></Link>
        <div className={cn('ln-qbar', combo >= 5 && 'ln-qbar--hot')} role="progressbar" aria-label="Quiz progress" aria-valuenow={answered} aria-valuemin={0} aria-valuemax={TOTAL} aria-valuetext={`${answered} of ${TOTAL} answered${combo >= 3 ? `, ${combo} in a row` : ''}`}>
          <div key={fill} className="ln-qbar__fill" style={{ width: `${fill}%`, ['--from' as string]: `${from}%` }}>
            {combo >= 3 && phase !== 'peek' ? <span key={combo} className="ln-qbar__combo" aria-hidden="true">{combo} in a row</span> : null}
          </div>
        </div>
        <span className="ln-chip ln-chip--xp">{xp} XP</span>
      </header>

      {phase === 'peek' ? (
        <main className="quiz-main" aria-hidden="true" />
      ) : (
        <main className="quiz-main">
          <div key={`${pos}`} className="ln-step-in quiz-q">
            <div className="ln-eyebrow quiz-q__eyebrow">
              {item.review ? <span className="ln-chip ln-chip--xp"><RotateCcw className="ln-icon" style={{ width: 13, height: 13 }} />{item.hint ? 'Skipped earlier' : 'Previous mistake'}</span> : null}
              {item.review ? `Review · ${TOPIC}` : `Question ${pos + 1} of ${TOTAL} · ${TOPIC}`}
            </div>
            <h1 ref={heading} tabIndex={-1} className="quiz-q__title" id="quiz-q">{q.q}</h1>
            <div role="radiogroup" aria-labelledby="quiz-q" className="quiz-q__opts">
              {q.options.map((_, i) => <OptionCard key={i} q={q} i={i} pick={pick} phase={phase} onPick={setPick} />)}
            </div>
            {phase === 'ask' && item.hint ? <p className="quiz-q__hint"><Lightbulb className="ln-icon" />{q.hint}</p> : null}
            {phase === 'ask' ? <p className="quiz-q__keys">Press 1, 2 or 3 to choose, Enter to check.</p> : null}
          </div>
        </main>
      )}

      <p className="ln-sr" aria-live="polite">{said}</p>

      <footer className={cn('quiz-foot', phase === 'checked' && (ok ? 'quiz-foot--ok' : skipped ? 'quiz-foot--skip' : 'quiz-foot--bad'))}>
        {phase === 'peek' && peek ? (
          <>
            <div className={cn('ln-peek quiz-peek', leaving && 'is-leaving')}>
              <div className="ln-peek__clip" style={{ height: 134 }}><Mascot pose="peek" size={280} /></div>
              <p className="ln-peek__bubble" role="status">{PEEK_LINES[peek]}</p>
            </div>
            <span />
            <button ref={primary} type="button" className="ln-btn" onClick={leavePeek}>Continue <ArrowRight className="ln-icon" /></button>
          </>
        ) : (
          <>
            <FooterMascot mood={mood} lines={lines} moment={`${pos}-${phase}`} />
            {phase === 'ask' ? (
              <>
                <button type="button" className="ln-btn ln-btn--ghost" onClick={() => check(true)}>Skip</button>
                <button type="button" className="ln-btn" disabled={pick === null} onClick={() => check()}>Check answer</button>
              </>
            ) : (
              <div key={results.length} className="ln-slide-up quiz-fb">
                <div className="quiz-fb__head">
                  <span className={cn('ln-pop-in quiz-fb__icon', ok ? 'is-ok' : skipped ? 'is-skip' : 'is-bad')} aria-hidden="true">{ok ? <Check className="ln-icon" /> : skipped ? <ChevronsRight className="ln-icon" /> : <X className="ln-icon" />}</span>
                  <span>
                    <b className="quiz-fb__title">{ok ? `Correct · +${XP_PER_CORRECT} XP` : skipped ? `Skipped. The answer is ${answer}.` : `Not quite${secondMiss ? ' again' : ''}. The answer is ${answer}.`}</b>
                    <span className="quiz-fb__body">{ok ? q.why : `${skipped ? q.why : q.whyWrong}${secondMiss ? " Let's try this a different way." : item.review ? '' : skipped ? ' This one comes back at the end, with a hint.' : ' This one comes back at the end.'}`}</span>
                  </span>
                </div>
                {ok ? (
                  <button ref={primary} type="button" className="ln-btn ln-btn--success" onClick={proceed}>Continue <ArrowRight className="ln-icon" /></button>
                ) : (
                  <div className="quiz-fb__actions">
                    <Link className="ln-btn ln-btn--secondary" to="/lesson">Review step 4</Link>
                    <button ref={primary} type="button" className="ln-btn" onClick={proceed}>Got it</button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </footer>
    </div>
  );
}
