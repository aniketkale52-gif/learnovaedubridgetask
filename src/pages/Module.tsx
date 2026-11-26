/* 2 · Learning module (canvas Module; ModuleLocked = ?locked=1, the hint open).
   After the quiz the Binary search trees row flips to completed and the course ring fills. */
import * as Popover from '@radix-ui/react-popover';
import { ArrowLeft, ArrowRight, Check, ListChecks, Lock, Play } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Sidebar } from '@/components/shell';
import { useProgress } from '@/data/progress';
import { notInPrototype } from '@/lib/utils';

function LockedRow({ title, meta, tail, icon, hint, defaultOpen }: { title: string; meta: string; tail: string; icon?: ReactNode; hint: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button type="button" className="ln-lesson is-locked lesson-btn" aria-disabled="true">
          <span className="ln-lesson__node">{icon ?? <Lock className="ln-icon" />}</span>
          <span className="ln-lesson__body"><span className="ln-lesson__title" style={{ display: 'block' }}>{title}</span><span className="ln-lesson__meta">{meta}</span></span>
          <span className="ln-lesson__tail">{tail}</span>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="lock-tip" side="bottom" align="end" sideOffset={8} collisionPadding={12} onOpenAutoFocus={(e) => e.preventDefault()}>
          <Lock className="ln-icon" aria-hidden="true" />
          <span>{hint}</span>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export function Module() {
  const p = useProgress();
  const [q] = useSearchParams();
  const done = p.lessonDone;
  const pct = done ? 67 : 64;
  const C = 2 * Math.PI * 30;
  const [ring, setRing] = useState(done ? 64 : pct); // fills from 64% to 67% when you come back from the quiz
  useEffect(() => { const t = window.setTimeout(() => setRing(pct), 350); return () => window.clearTimeout(t); }, [pct]);

  return (
    <div className="side-layout">
      <div className="side-layout__nav"><Sidebar active="courses" /></div>
      <main className="side-layout__main">
        <nav aria-label="Breadcrumb" className="mod-crumbs">
          <Link to="/"><ArrowLeft className="ln-icon" />Home</Link><span aria-hidden="true">/</span>Courses<span aria-hidden="true">/</span><b aria-current="page">Data Structures in Python</b>
        </nav>

        <section className="ln-card mod-head">
          <div className="mod-head__art">
            <svg viewBox="0 0 120 80" aria-hidden="true"><path d="M60 18 32 52M60 18l28 34" style={{ stroke: 'var(--foreground)' }} strokeWidth="2" fill="none" /><circle cx="60" cy="18" r="11" style={{ fill: 'var(--card)', stroke: 'var(--foreground)', strokeWidth: 2 }} /><circle cx="32" cy="56" r="11" style={{ fill: 'var(--primary)', stroke: 'var(--foreground)', strokeWidth: 2 }} /><circle cx="88" cy="56" r="11" style={{ fill: 'var(--card)', stroke: 'var(--foreground)', strokeWidth: 2 }} /></svg>
          </div>
          <div className="mod-head__text">
            <div className="ln-eyebrow">Computer science · Prof. Mehta</div>
            <h1>Data Structures in Python</h1>
            <p>5 modules · 18 lessons · 82% quiz accuracy so far</p>
          </div>
          <div className="mod-head__ring">
            <svg viewBox="0 0 72 72" role="img" aria-label={`Course ${pct}% complete`}>
              <circle cx="36" cy="36" r="30" style={{ fill: 'none', stroke: 'var(--secondary)', strokeWidth: 7 }} />
              <circle cx="36" cy="36" r="30" strokeDasharray={C.toFixed(1)} strokeDashoffset={(C * (1 - ring / 100)).toFixed(1)} style={{ fill: 'none', stroke: 'var(--primary)', strokeWidth: 7, strokeLinecap: 'round', transition: 'stroke-dashoffset var(--dur-page) var(--ease-out)' }} />
            </svg>
            <b aria-hidden="true">{pct}%</b>
          </div>
          {done ? (
            <button type="button" className="ln-btn" onClick={() => notInPrototype('Lesson 5, Balancing: AVL trees,')}>Continue lesson 5 <ArrowRight className="ln-icon" /></button>
          ) : (
            <Link className="ln-btn" to="/lesson">Continue lesson 4 <ArrowRight className="ln-icon" /></Link>
          )}
        </section>

        <div className="mod-body">
          <nav aria-label="Modules" className="ln-card mod-list">
            <div className="mod-list__item"><span className="mod-list__node is-done"><Check className="ln-icon" /></span><span><b>Arrays and lists</b><span>4 lessons · 94%</span></span></div>
            <div className="mod-list__item"><span className="mod-list__node is-done"><Check className="ln-icon" /></span><span><b>Linked lists</b><span>3 lessons · 88%</span></span></div>
            <div className="mod-list__item is-current" aria-current="true"><span className="mod-list__node is-current">3</span><span><b>Trees</b><span>{done ? 4 : 3} of 6 done</span></span></div>
            <div className="mod-list__item is-locked"><span className="mod-list__node"><Lock className="ln-icon" /></span><span><b>Graphs</b><span>Unlocks after Trees</span></span></div>
            <div className="mod-list__item is-locked"><span className="mod-list__node"><Lock className="ln-icon" /></span><span><b>Hashing</b><span>Unlocks after Graphs</span></span></div>
          </nav>

          <section aria-label="Module 3 lessons" className="mod-lessons">
            <div className="row-between" style={{ marginBottom: 4 }}><h2 className="mod-lessons__title">Module 3 · Trees</h2><span className="link-muted">About 1 h 40 min</span></div>
            <ol className="mod-lessons__list">
              <li className="ln-lesson is-done"><span className="ln-lesson__node"><Check className="ln-icon" /></span><span className="ln-lesson__body"><span className="ln-lesson__title" style={{ display: 'block' }}>What is a tree?</span><span className="ln-lesson__meta">Completed · video and notes</span></span><span className="ln-lesson__tail">12 min</span></li>
              <li className="ln-lesson is-done"><span className="ln-lesson__node"><Check className="ln-icon" /></span><span className="ln-lesson__body"><span className="ln-lesson__title" style={{ display: 'block' }}>Binary trees and traversal</span><span className="ln-lesson__meta">Completed · 5 of 5 correct</span></span><span className="ln-lesson__tail">16 min</span></li>
              <li className="ln-lesson is-done"><span className="ln-lesson__node"><Check className="ln-icon" /></span><span className="ln-lesson__body"><span className="ln-lesson__title" style={{ display: 'block' }}>Recursion on trees</span><span className="ln-lesson__meta">Completed · 4 of 5 correct</span></span><span className="ln-lesson__tail">14 min</span></li>
              <li>
                {done ? (
                  <Link className="ln-lesson is-done mod-lessons__flip" to="/lesson"><span className="ln-lesson__node"><Check className="ln-icon" /></span><span className="ln-lesson__body"><span className="ln-lesson__title" style={{ display: 'block' }}>Binary search trees</span><span className="ln-lesson__meta">Completed · {p.result?.firstTry ?? 4} of 5 correct</span></span><span className="ln-lesson__tail">18 min</span></Link>
                ) : (
                  <Link className="ln-lesson is-current" to="/lesson" aria-current="step"><span className="ln-lesson__node"><Play className="ln-icon" style={{ fill: 'currentColor' }} /></span><span className="ln-lesson__body"><span className="ln-lesson__title" style={{ display: 'block' }}>Binary search trees</span><span className="ln-lesson__meta">In progress · 3 of 6 steps</span></span><span className="ln-lesson__tail">18 min left</span></Link>
                )}
              </li>
              <li>
                {done ? (
                  <button type="button" className="ln-lesson is-current lesson-btn" onClick={() => notInPrototype('Balancing: AVL trees')}><span className="ln-lesson__node">5</span><span className="ln-lesson__body"><span className="ln-lesson__title" style={{ display: 'block' }}>Balancing: AVL trees</span><span className="ln-lesson__meta">Unlocked · up next</span></span><span className="ln-lesson__tail">20 min</span></button>
                ) : (
                  <LockedRow title="Balancing: AVL trees" meta="Finish Binary search trees to unlock" tail="20 min" defaultOpen={q.get('locked') === '1'}
                    hint={<><b className="lock-tip__title">Not unlocked yet</b>Finish <Link to="/lesson">Binary search trees</Link> first. It takes about 18 minutes.</>} />
                )}
              </li>
              <li>
                <LockedRow title="Module quiz: Trees" meta="10 questions · unlocks after AVL trees" tail="15 min" icon={<ListChecks className="ln-icon" />}
                  hint={<><b className="lock-tip__title">Not unlocked yet</b>Finish Balancing: AVL trees first. The module quiz opens right after it.</>} />
              </li>
            </ol>
          </section>
        </div>
      </main>
    </div>
  );
}
