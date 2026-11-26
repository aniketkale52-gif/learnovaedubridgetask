/* 1b · Subject view (canvas SubjectView + SubjectStats/Web/Writing): one course player per dashboard card.
   Outline collapses to a rail; the video "plays" (time ticks, chapter and transcript line follow);
   the tool rail opens one panel at a time; notes can be added, edited and deleted (with undo). */
import {
  ArrowRight, Check, ChevronLeft, Download, FileText, Flag, Flame, Lock, Maximize, Menu, Pause, Pencil, Play,
  RotateCcw, Settings, ThumbsDown, ThumbsUp, Trash2, X, AlignLeft, PencilLine,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { LogoMark, ThemeToggle } from '@/components/shell';
import { subjectById, type ItemState, type Subject as S } from '@/data/subjects';
import { cn, mmss, notInPrototype, toSec } from '@/lib/utils';

type Tab = 'transcript' | 'notes' | 'files' | null;
interface Note { id: number; time: string; text: string }

const lastAtOrBefore = (rows: [string, string][], now: number) => rows.reduce((hit, r, i) => (toSec(r[0]) <= now ? i : hit), 0);
const spoken = (s: number) => `${Math.floor(s / 60)} minutes ${Math.floor(s % 60)} seconds`;

function BigTree() {
  const node = { fill: '#3a1a0e', stroke: '#ffe2c2', strokeWidth: 2 };
  const t = (x: number, y: number, v: string, dark?: boolean, size = 13) => (
    <text x={x} y={y} textAnchor="middle" style={{ font: `600 ${size}px Inter, sans-serif`, fill: dark ? '#1a0c05' : '#ffe2c2' }}>{v}</text>
  );
  return (
    <svg viewBox="0 0 320 180" className="player__tree" aria-hidden="true">
      <path d="M160 30 90 90M160 30l70 60M90 90l-40 55M90 90l40 55M230 90l40 55" style={{ fill: 'none', stroke: '#ffe2c2', strokeWidth: 2 }} />
      <circle cx="160" cy="30" r="17" style={node} /><circle cx="90" cy="90" r="17" style={node} /><circle cx="230" cy="90" r="17" style={node} />
      <circle cx="50" cy="145" r="15" style={node} /><circle cx="130" cy="145" r="15" style={{ ...node, fill: '#ffd27a' }} /><circle cx="270" cy="145" r="15" style={node} />
      {t(160, 35, '50')}{t(90, 95, '30')}{t(230, 95, '70')}{t(50, 150, '20', false, 12)}{t(130, 150, '42', true, 12)}{t(270, 150, '85', false, 12)}
    </svg>
  );
}

function Outline({ s, onCollapse }: { s: S; onCollapse: () => void }) {
  const nav = useNavigate();
  const done = s.items.filter((it) => it[0] === 'done').length;
  const href: Record<ItemState, string | undefined> = { done: s.courseHref, current: undefined, next: s.nextHref, locked: s.lockedHref };
  const go = (state: ItemState, title: string) => () => {
    const to = href[state];
    if (state === 'current') return;
    if (to) nav(to);
    else notInPrototype(`"${title}"`);
  };
  return (
    <aside aria-label="Course outline" className="ln-glass ln-glass--strong outline">
      <div className="outline__head">
        <span><span className="ln-eyebrow">Course</span><b>{s.course}</b></span>
        <button type="button" className="ln-iconbtn" aria-label="Collapse course outline" onClick={onCollapse} data-outline-toggle><ChevronLeft className="ln-icon" /></button>
      </div>
      <div className="outline__goal">
        <div className="row-between"><b>Today's goal: {s.goal}/3 items</b><span className="muted-12">12-day streak</span></div>
        <div className="ln-progress" role="progressbar" aria-label="Today's goal" aria-valuenow={s.goal} aria-valuemin={0} aria-valuemax={3}><div className="ln-progress__fill ln-progress__fill--gold" style={{ width: `${Math.round((s.goal / 3) * 100)}%` }} /></div>
        <span className="muted-12" style={{ display: 'block', marginTop: 6 }}>{s.goalHint}</span>
      </div>
      <div className="outline__list">
        <div className="outline__mod outline__mod--done"><span><b>{s.doneLabel}</b> · {s.doneTopics}</span><Check className="ln-icon" aria-label="Completed" /></div>
        <div className="outline__mod"><span><span>{s.moduleLabel}</span><b>{s.moduleName}</b></span><span className="muted-12">{done} of {s.items.length}</span></div>
        <ol className="outline__items">
          {s.items.map(([state, title, meta], i) => (
            <li key={title}>
              <button type="button" className={cn('outline__item', `is-${state}`)} aria-current={state === 'current' ? 'step' : undefined} aria-disabled={state === 'locked' || undefined} onClick={go(state, title)}>
                <span className="outline__dot">
                  {state === 'done' ? <Check className="ln-icon" /> : state === 'current' ? <Play className="ln-icon" /> : state === 'locked' ? <Lock className="ln-icon" /> : i + 1}
                </span>
                <span><span className="outline__title">{title}</span><span className="outline__meta">{meta}{state === 'current' ? ' · playing' : ''}{state === 'locked' ? <span className="ln-sr"> (locked)</span> : null}</span></span>
              </button>
            </li>
          ))}
        </ol>
        {s.later.map(([label, name]) => (
          <div key={label} className="outline__later"><span><span>{label}</span>{name}</span><Lock className="ln-icon" aria-label="Locked" /></div>
        ))}
      </div>
    </aside>
  );
}

function NotesPanel({ s, now, notes, setNotes, onClose, onCompose, draftRef }: {
  s: S; now: number; notes: Note[]; setNotes: (fn: (n: Note[]) => Note[]) => void; onClose: () => void; onCompose: () => void; draftRef: React.RefObject<HTMLTextAreaElement>;
}) {
  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const save = () => {
    if (!draft.trim()) return; // an empty note is never saved; the button is disabled too
    setNotes((n) => [{ id: Date.now(), time: mmss(now), text: draft.trim() }, ...n]);
    setDraft('');
    toast('Note saved');
  };
  const remove = (note: Note) => {
    let at = 0;
    setNotes((n) => { at = n.findIndex((x) => x.id === note.id); return n.filter((x) => x.id !== note.id); });
    toast('Note deleted', { action: { label: 'Undo', onClick: () => setNotes((n) => [...n.slice(0, at), note, ...n.slice(at)]) } });
  };
  return (
    <>
      <div className="panel__head">
        <h2 className="h-card">Notes <span className="panel__count">{notes.length}</span></h2>
        <Link to={s.courseHref ?? '#'} className="link-muted" style={{ fontSize: 12 }} onClick={(e) => { if (!s.courseHref) { e.preventDefault(); notInPrototype('All notes'); } }}>View all notes</Link>
        <button type="button" className="ln-iconbtn panel__x" aria-label="Close notes" onClick={onClose}><X className="ln-icon" /></button>
      </div>
      <div className="composer">
        <span className="ln-chip ln-chip--combo composer__chip">Note at {mmss(now)}</span>
        <label htmlFor="note-draft" className="ln-sr">Write a note</label>
        <textarea id="note-draft" ref={draftRef} rows={3} placeholder="Write what you want to remember..." value={draft} onChange={(e) => setDraft(e.target.value)} onFocus={onCompose}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) save(); }} />
        <div className="composer__actions">
          <button type="button" className="ln-btn ln-btn--ghost" onClick={() => setDraft('')}>Cancel</button>
          <button type="button" className="ln-btn ln-btn--ink" onClick={save} disabled={!draft.trim()}>Save note</button>
        </div>
      </div>
      <div className="notes">
        {notes.map((n) => (
          <article key={n.id} className="note">
            <div className="note__head">
              <span className="note__thumb" aria-hidden="true" />
              <span className="note__time">{n.time}</span>
              <button type="button" className="ln-iconbtn" aria-label="Edit note" onClick={() => { setEditing(n.id); setEditText(n.text); }}><Pencil className="ln-icon" /></button>
              <button type="button" className="ln-iconbtn" aria-label="Delete note" onClick={() => remove(n)}><Trash2 className="ln-icon" /></button>
            </div>
            {editing === n.id ? (
              <div className="note__edit">
                <label htmlFor={`edit-${n.id}`} className="ln-sr">Edit note at {n.time}</label>
                <textarea id={`edit-${n.id}`} rows={3} value={editText} autoFocus onChange={(e) => setEditText(e.target.value)} />
                <div className="composer__actions">
                  <button type="button" className="ln-btn ln-btn--ghost" onClick={() => setEditing(null)}>Cancel</button>
                  <button type="button" className="ln-btn ln-btn--ink" disabled={!editText.trim()} onClick={() => { setNotes((list) => list.map((x) => (x.id === n.id ? { ...x, text: editText.trim() } : x))); setEditing(null); }}>Save</button>
                </div>
              </div>
            ) : (
              <p>{n.text}</p>
            )}
          </article>
        ))}
        {notes.length ? null : <p className="muted-12" style={{ textAlign: 'center', padding: 16 }}>No notes yet. Pause on an idea and write it down.</p>}
      </div>
    </>
  );
}

export function Subject() {
  const { id } = useParams();
  const s = subjectById(id);
  if (!s) return <Navigate to="/" replace />;
  return <Player key={s.id} s={s} />;
}

function Player({ s }: { s: S }) {
  const dur = toSec(s.dur);
  const [now, setNow] = useState(toSec(s.now));
  const [playing, setPlaying] = useState(true);
  const [outline, setOutline] = useState(true);
  const [tab, setTab] = useState<Tab>('notes');
  const [notes, setNotes] = useState<Note[]>(() => s.notes.map(([time, text], i) => ({ id: i, time, text })));
  const [rating, setRating] = useState<'up' | 'down' | null>(null);
  const draftRef = useRef<HTMLTextAreaElement>(null);
  const focusDraft = useRef(false);

  useEffect(() => {
    if (!playing) return;
    const t = window.setInterval(() => setNow((n) => (n + 1 >= dur ? (setPlaying(false), dur) : n + 1)), 1000);
    return () => window.clearInterval(t);
  }, [playing, dur]);
  useEffect(() => {
    if (focusDraft.current && tab === 'notes') { draftRef.current?.focus(); focusDraft.current = false; }
  }, [tab]);
  // keep focus on the toggle when the outline opens or collapses (not on first load)
  const lastOutline = useRef(outline);
  useEffect(() => {
    if (lastOutline.current !== outline) document.querySelector<HTMLElement>('[data-outline-toggle]')?.focus({ preventScroll: true });
    lastOutline.current = outline;
  }, [outline]);

  const chapterNow = lastAtOrBefore(s.chapters, now);
  const lineNow = lastAtOrBefore(s.transcript, now);
  const current = s.items.findIndex((it) => it[0] === 'current');
  const next = s.items.find((it) => it[0] === 'next');
  const pct = (sec: number) => `${((sec / dur) * 100).toFixed(1)}%`;
  const seek = (sec: number) => setNow(Math.max(0, Math.min(dur - 1, sec)));
  const pick = (name: Exclude<Tab, null>) => () => setTab(tab === name ? null : name);
  const nav = useNavigate();
  useEffect(() => { document.title = `${s.course} · Learnova`; }, [s.course]);

  return (
    <div className="subject">
      <header className="ln-glass ln-glass--strong subject__bar">
        <Link to="/" className="ln-iconbtn" aria-label="Back to dashboard"><ChevronLeft className="ln-icon" /></Link>
        <LogoMark size={30} />
        <nav aria-label="Breadcrumb" className="subject__crumbs">
          {s.courseHref ? <Link to={s.courseHref}>{s.course}</Link> : <span>{s.course}</span>} <span aria-hidden="true">/</span> {s.moduleLabel} · {s.moduleName} <span aria-hidden="true">/</span> <b>{s.items[current][1]}</b>
        </nav>
        <span style={{ flex: 1 }} />
        <span className="ln-chip ln-chip--xp subject__xp">+20 XP for this lesson</span>
        <span className="ln-chip ln-chip--xp"><Flame className="ln-icon" style={{ width: 14, height: 14 }} /><span className="ln-sr">Streak: </span>12</span>
        <ThemeToggle />
        <span className="avatar subject__avatar" role="img" aria-label="Riya Sharma">RS</span>
      </header>

      <div className="subject__body">
        <span className="ln-ambient" aria-hidden="true" style={{ top: 20, left: '32%', width: 520, height: 360, opacity: 0.7 }} />
        {outline ? (
          <Outline s={s} onCollapse={() => setOutline(false)} />
        ) : (
          <aside aria-label="Course outline, collapsed" className="ln-glass ln-glass--strong outline-rail">
            <button type="button" className="ln-iconbtn" aria-label="Open course outline" onClick={() => setOutline(true)} data-outline-toggle><Menu className="ln-icon" /></button>
            <span className="outline-rail__goal" aria-label={`Today's goal ${s.goal} of 3`}>{s.goal}/3</span>
            <span className="outline-rail__dot" aria-hidden="true" />
          </aside>
        )}

        <main className="subject__main">
          <section aria-label="Lesson video" className="ln-glass player">
            <div className="player__stage">
              {s.tree ? <BigTree /> : (<><img src={s.teacherImg} alt="" className="player__photo" /><span className="player__shade" /></>)}
              <span className="player__chip">{s.chapters[chapterNow][1]} · chapter {chapterNow + 1} of {s.chapters.length}</span>
              <div className="player__controls">
                <div className="player__track" role="slider" tabIndex={0} aria-label="Video position" aria-valuemin={0} aria-valuemax={dur} aria-valuenow={now} aria-valuetext={`${spoken(now)} of ${spoken(dur)}`}
                  onKeyDown={(e) => {
                    const step = { ArrowLeft: -5, ArrowRight: 5, ArrowDown: -5, ArrowUp: 5, PageDown: -30, PageUp: 30 }[e.key];
                    if (step) { e.preventDefault(); seek(now + step); }
                    if (e.key === 'Home') { e.preventDefault(); seek(0); }
                    if (e.key === 'End') { e.preventDefault(); seek(dur - 1); }
                  }}
                  onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); seek(((e.clientX - r.left) / r.width) * dur); }}>
                  <span className="player__played" style={{ width: pct(now) }} />
                  {s.chapters.slice(1).map((c) => <span key={c[0]} className="player__tick" style={{ left: pct(toSec(c[0])) }} />)}
                  <span className="player__thumb" style={{ left: pct(now) }} />
                </div>
                <div className="player__row">
                  <button type="button" aria-label={playing ? 'Pause' : 'Play'} onClick={() => setPlaying(!playing)}>{playing ? <Pause className="ln-icon" /> : <Play className="ln-icon" />}</button>
                  <button type="button" aria-label="Back 10 seconds" onClick={() => seek(now - 10)}><RotateCcw className="ln-icon" /></button>
                  <span className="player__time">{mmss(now)} / {s.dur}</span>
                  <span style={{ flex: 1 }} />
                  <span className="player__cc">CC</span>
                  <span>1×</span>
                  <button type="button" aria-label="Settings" onClick={() => notInPrototype('Video settings')}><Settings className="ln-icon" /></button>
                  <button type="button" aria-label="Full screen" onClick={() => notInPrototype('Full screen')}><Maximize className="ln-icon" /></button>
                </div>
              </div>
            </div>
          </section>

          <div className="lessonhead">
            <div style={{ minWidth: 0 }}>
              <div className="ln-eyebrow">Lesson {current + 1} of {s.items.length} · Video</div>
              <h1 className="lessonhead__title">{s.items[current][1]}</h1>
              <div className="lessonhead__by"><img src={s.teacherImg} alt="" /><span><b>{s.teacher}</b> · {s.items[current][2].replace('Video · ', '')} · {s.learners} learners</span></div>
            </div>
            <div className="lessonhead__actions">
              <button type="button" className="ln-iconbtn" aria-label="Helpful" aria-pressed={rating === 'up'} onClick={() => { setRating(rating === 'up' ? null : 'up'); if (rating !== 'up') toast('Thanks, that helps the teacher.'); }}><ThumbsUp className="ln-icon" /></button>
              <button type="button" className="ln-iconbtn" aria-label="Not helpful" aria-pressed={rating === 'down'} onClick={() => { setRating(rating === 'down' ? null : 'down'); if (rating !== 'down') toast('Thanks. Tell us what was unclear in the notes.'); }}><ThumbsDown className="ln-icon" /></button>
              <button type="button" className="ln-iconbtn" aria-label="Report an issue" onClick={() => notInPrototype('Reporting')}><Flag className="ln-icon" /></button>
              <button type="button" className="ln-btn ln-btn--secondary" onClick={() => { focusDraft.current = true; setPlaying(false); setTab('notes'); if (tab === 'notes') draftRef.current?.focus(); }}><PencilLine className="ln-icon" />Save note at {mmss(now)}</button>
              <button type="button" className="ln-btn" onClick={() => (s.nextHref ? nav(s.nextHref) : notInPrototype(`"${next?.[1]}"`))}>Next: {next ? next[1].split(':')[0] : 'Continue'} <ArrowRight className="ln-icon" /></button>
            </div>
          </div>

          <section aria-label="Chapters" className="ln-glass chapters">
            <h2 className="h-card" style={{ fontSize: 17, margin: '0 0 6px' }}>In this video</h2>
            <div className="chapters__grid">
              {s.chapters.map(([time, title], i) => (
                <button key={time} type="button" className={cn('chapters__item', i === chapterNow && 'is-now')} aria-current={i === chapterNow ? 'true' : undefined} onClick={() => seek(toSec(time))}>
                  <span>{time}{i === chapterNow ? ' · now' : ''}</span>{title}
                </button>
              ))}
            </div>
          </section>
        </main>

        {tab ? (
          <aside key={tab} aria-label={tab === 'notes' ? 'Notes' : tab === 'transcript' ? 'Transcript' : 'Files'} className="ln-glass ln-glass--strong panel">
            {tab === 'notes' ? <NotesPanel s={s} now={now} notes={notes} setNotes={setNotes} onClose={() => setTab(null)} onCompose={() => setPlaying(false)} draftRef={draftRef} /> : null}
            {tab === 'transcript' ? (
              <>
                <div className="panel__head"><h2 className="h-card">Transcript</h2><button type="button" className="ln-iconbtn panel__x" aria-label="Close transcript" onClick={() => setTab(null)}><X className="ln-icon" /></button></div>
                <label className="panel__lang">Language<select defaultValue="English"><option>English</option><option>Hindi</option></select></label>
                <div className="transcript">
                  {s.transcript.map(([time, text], i) => (
                    <p key={time} className={i === lineNow ? 'is-now' : undefined}><button type="button" onClick={() => seek(toSec(time))} aria-label={`Jump to ${time}`}>{time}{i === lineNow ? ' · now' : ''}</button>{text}</p>
                  ))}
                </div>
              </>
            ) : null}
            {tab === 'files' ? (
              <>
                <div className="panel__head"><h2 className="h-card">Files</h2><button type="button" className="ln-iconbtn panel__x" aria-label="Close files" onClick={() => setTab(null)}><X className="ln-icon" /></button></div>
                {s.files.map(([kind, name]) => (
                  <div key={name} className="file"><span><span>{kind}</span>{name}</span><button type="button" className="ln-iconbtn" aria-label={`Download ${name}`} onClick={() => notInPrototype('Downloading')}><Download className="ln-icon" /></button></div>
                ))}
              </>
            ) : null}
          </aside>
        ) : null}

        <nav aria-label="Lesson tools" className="ln-glass ln-glass--strong toolrail">
          <button type="button" aria-pressed={tab === 'transcript'} onClick={pick('transcript')}><AlignLeft className="ln-icon" /><span>Transcript</span></button>
          <button type="button" aria-pressed={tab === 'notes'} onClick={pick('notes')}><Pencil className="ln-icon" /><span>Notes</span></button>
          <button type="button" aria-pressed={tab === 'files'} onClick={pick('files')}><FileText className="ln-icon" /><span>Files</span></button>
        </nav>
      </div>
    </div>
  );
}

