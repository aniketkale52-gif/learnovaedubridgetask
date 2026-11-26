/* 1 · Dashboard (canvas Main). Phone (<768px) is the DashboardMobile board: compact header, no sidebar, no mascot. */
import { ArrowRight, Bell, ChevronLeft, ChevronRight, Search, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mascot } from '@/components/Mascot';
import { Avatar, LogoMark, MainNav, MenuSheet, ThemeToggle } from '@/components/shell';
import { useProgress } from '@/data/progress';
import { SUBJECTS } from '@/data/subjects';
import { useIdle, useMediaQuery } from '@/lib/hooks';
import { toast } from 'sonner';
import { greeting, notInPrototype } from '@/lib/utils';

const TUTOR_LINE = 'Happy to help. I can explain Binary search trees another way, quiz you for 5 minutes, or plan your week.';
const NUDGES = [
  'Hey, that tickles! You have 18 minutes left in Binary search trees.',
  "Stuck on something? Ask me and I'll explain it another way.",
  'Trees quiz on Thursday. Want a 5-minute warm-up first?',
  "Two more lessons and Trees is done. You've got this.",
];

export function TreeThumb() {
  return (
    <svg viewBox="0 0 120 80" aria-hidden="true">
      <path d="M60 18 32 52M60 18l28 34" style={{ stroke: '#ffe2c2', strokeWidth: 2, fill: 'none' }} />
      <circle cx="60" cy="18" r="11" style={{ fill: '#1b1311', stroke: '#ffe2c2', strokeWidth: 2 }} />
      <circle cx="32" cy="56" r="11" style={{ fill: '#ffd27a', stroke: '#ffe2c2', strokeWidth: 2 }} />
      <circle cx="88" cy="56" r="11" style={{ fill: '#1b1311', stroke: '#ffe2c2', strokeWidth: 2 }} />
    </svg>
  );
}

function HeroMascot({ ask }: { ask: number }) {
  const [poke, setPoke] = useState(0);
  const [woke, setWoke] = useState(false);
  const [asked, setAsked] = useState(false);
  // "Ask the tutor": the mascot is the tutor, so its bubble answers
  useEffect(() => {
    if (!ask) return;
    setAsked(true);
    setPoke((n) => n + 1);
  }, [ask]);
  const { idle, wokeAt } = useIdle(15000);
  const said = asked ? TUTOR_LINE : poke === 0 ? 'Hi Riya! Ready to pick up Binary search trees?' : woke ? 'Oh, I dozed off! Shall we keep going with trees?' : NUDGES[(poke - 1) % NUDGES.length];
  return (
    <>
      {/* Sits behind the lesson bar and peeks over its top edge: 182px = the render's ledge 0.479 × 380 */}
      <div className="ln-m-rise hero__mascot">
        <span aria-hidden="true" className="hero__mascot-glow" />
        <Mascot pose="peek" mood="hello" size={380} live greet poke={poke} dozing={idle} />
      </div>
      <p key={poke} className={`ln-m-say ln-m-say--${poke ? 'b' : 'a'} hero__say`} role="status">{said}</p>
      <button
        type="button"
        className="hero__poke"
        aria-label="Poke the mascot"
        onClick={() => {
          // any activity wakes it; a poke within a few seconds of waking gets "Oh, I dozed off!"
          setWoke(wokeAt.current > 0 && Date.now() - wokeAt.current < 8000);
          wokeAt.current = 0;
          setAsked(false);
          setPoke((n) => n + 1);
        }}
      />
    </>
  );
}

const WEEK = { label: 'last 7 days · up 18%', total: '7h 57m', axis: ['3h', '2h', '1h', '0h'], max: 3, bars: [['Wed', 1.5], ['Thu', 0.7], ['Fri', 2.2], ['Sat', 0], ['Sun', 1], ['Mon', 1.8], ['Today', 0.75]] as [string, number][] };
const MONTH = { label: 'last 4 weeks · up 6%', total: '31h 40m', axis: ['9h', '6h', '3h', '0h'], max: 9, bars: [['Oct 27', 6.5], ['Nov 3', 8.2], ['Nov 10', 5.1], ['Nov 17', 7.95], ['This wk', 3.9]] as [string, number][] };

/* Segmented control: the selected pill slides to the new option (motion layoutId). */
function Seg<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: [T, string][]; onChange: (v: T) => void }) {
  const id = useId();
  return (
    <span className="seg" role="group" aria-label={label}>
      {options.map(([v, text]) => (
        <button key={v} type="button" aria-pressed={value === v} onClick={() => onChange(v)}>
          {value === v ? <motion.span layoutId={id} className="seg__pill" transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }} /> : null}
          <span className="seg__text">{text}</span>
        </button>
      ))}
    </span>
  );
}

function StudyTime() {
  const [range, setRange] = useState<'week' | 'month'>('week');
  const d = range === 'week' ? WEEK : MONTH;
  const last = d.bars.length - 1;
  const fmt = (h: number) => (h < 1 ? `${Math.round(h * 60)}m` : `${Math.floor(h)}h ${Math.round((h % 1) * 60)}m`);
  return (
    <section aria-label="Study time" className="ln-glass study">
      <div className="row-between">
        <h2 className="h-card">Study time</h2>
        <Seg label="Range" value={range} onChange={setRange} options={[['week', 'Week'], ['month', 'Month']]} />
      </div>
      <span className="study__sum"><b>{d.total}</b> &nbsp;{d.label}</span>
      <div className="study__chart">
        <div className="study__axis" aria-hidden="true">{d.axis.map((a) => <span key={a}>{a}</span>)}</div>
        <div className="study__bars" role="img" aria-label={'Hours studied: ' + d.bars.map(([l, h]) => `${l} ${h}`).join(', ')} style={{ gridTemplateColumns: `repeat(${d.bars.length}, 1fr)` }}>
          {d.bars.map(([l, h], i) =>
            h === 0 ? <span key={l} className="study__bar study__bar--zero" /> : (
              <span key={l} className={i === last ? 'study__bar study__bar--now' : 'study__bar'} style={{ height: `${Math.max(2, (h / d.max) * 100)}%`, animationDelay: `${i * 45}ms` }}>
                {i === last ? <span className="study__tip">{fmt(h)}</span> : <i />}
              </span>
            ),
          )}
        </div>
        <span />
        <div className="study__x" style={{ gridTemplateColumns: `repeat(${d.bars.length}, 1fr)` }}>
          {d.bars.map(([l], i) => <span key={l} className={i === last ? 'is-now' : undefined}>{l}</span>)}
        </div>
      </div>
    </section>
  );
}

/* The canvas week runs Mon 24 – Sun 30 November, today Tue 25. */
function WeekCalendar() {
  const [off, setOff] = useState(0);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((name, i) => {
    let n = 24 + off * 7 + i;
    let month = 'November';
    if (n > 30) { n -= 30; month = 'December'; }
    if (n < 1) { n += 31; month = 'October'; }
    return { name, n, month, today: off === 0 && i === 1, dot: off === 0 ? (i === 3 ? 'quiz' : i === 5 ? 'webinar' : null) : null };
  });
  const months = [...new Set(days.map((d) => d.month))];
  return (
    <section aria-label="Calendar" className="cal">
      <div className="cal__head">
        <button type="button" className="ln-iconbtn" aria-label="Previous week" onClick={() => setOff(off - 1)}><ChevronLeft className="ln-icon" /></button>
        <b aria-live="polite">{months.join(' – ')}</b>
        <button type="button" className="ln-iconbtn" aria-label="Next week" onClick={() => setOff(off + 1)}><ChevronRight className="ln-icon" /></button>
      </div>
      <div className="cal__days">
        {days.map((d) => (
          <span key={d.name} className={d.today ? 'cal__day is-today' : 'cal__day'}>
            <span aria-hidden="true">{d.name}<b>{d.n}</b>{d.dot ? <i className={`cal__dot cal__dot--${d.dot}`} /> : null}</span>
            <span className="ln-sr">{`${d.name} ${d.n} ${d.month}${d.today ? ', today' : ''}${d.dot ? `, ${d.dot}` : ''}`}</span>
          </span>
        ))}
      </div>
    </section>
  );
}

const RECOMMENDED = [
  { title: 'Algorithms: sorting and searching', icon: 'chart', level: 'Intermediate', chip: 'ln-chip--xp', rating: '4.8' },
  { title: 'SQL for beginners', icon: 'book', level: 'Beginner', chip: 'chip--beginner', rating: '4.8' },
  { title: 'Machine learning foundations', icon: 'tutor', level: 'Advanced', chip: 'ln-chip--combo', rating: '4.9', gold: true },
  { title: 'Operating systems basics', icon: 'gradcap', level: 'Intermediate', chip: 'ln-chip--xp', rating: '4.7' },
  { title: 'Git and GitHub essentials', icon: 'code', level: 'Beginner', chip: 'chip--beginner', rating: '4.9' },
];

export function Dashboard() {
  const p = useProgress();
  const phone = useMediaQuery('(max-width: 767.98px)');
  const topBar = useMediaQuery('(max-width: 1199.98px)'); // tablet and phone: menu in a top bar
  const [ask, setAsk] = useState(0);
  const [filter, setFilter] = useState<'all' | 'progress' | 'saved'>('all');
  const courses = filter === 'saved' ? [] : SUBJECTS;

  return (
    <div className="dash">
      {topBar ? (
        <header className="ln-glass ln-glass--strong dash__mhead">
          <span className="dash__mlogo"><LogoMark size={28} />Learnova</span>
          <span className="dash__mtools"><ThemeToggle /><MenuSheet /></span>
        </header>
      ) : (
        <MainNav />
      )}

      <div className="dash__body">
        <span className="ln-ambient" aria-hidden="true" style={{ top: 20, left: '34%', width: 520, height: 380, opacity: 0.8 }} />

        <main className="dash__main">
          <div className="dash__top">
            <span className="crumbs"><b>Home</b> / Overview</span>
            <span className="dash__tools">
              <span className="ln-chip ln-chip--xp dash__xp"><Zap className="ln-icon" style={{ width: 14, height: 14 }} />{p.xp} XP</span>
              {topBar ? null : <ThemeToggle />}
              <button type="button" className="ln-iconbtn" aria-label="Search" onClick={() => notInPrototype('Search')}><Search className="ln-icon" /></button>
              <button type="button" className="ln-iconbtn dash__bell" aria-label="Notifications, 2 new" onClick={() => notInPrototype('Notifications')}><Bell className="ln-icon" /><i /></button>
            </span>
          </div>

          <section aria-label="Up next" className="ln-glass hero">
            <span className="ln-chip hero__chip"><i />{greeting()}, Riya</span>
            <h1 className="hero__title">What will you learn today?</h1>
            {phone ? null : <HeroMascot ask={ask} />}
            <div className="ln-glass hero__bar">
              <span className="hero__thumb"><TreeThumb /></span>
              <span className="hero__text">
                <span className="hero__kicker">Up next · Data Structures in Python</span>
                <span className="hero__lesson">Binary search trees</span>
                <span className="hero__prog">
                  <span className="ln-progress" role="progressbar" aria-label="Lesson progress" aria-valuenow={3} aria-valuemin={0} aria-valuemax={6}>
                    <span className="ln-progress__fill" style={{ display: 'block', width: '50%' }} />
                  </span>
                  <span>Lesson 4 of 6 · 18 min left</span>
                </span>
              </span>
              <Link className="ln-btn hero__cta" to="/lesson">Continue learning <ArrowRight className="ln-icon" /></Link>
            </div>
          </section>

          <section aria-label="Quick actions" className="quick">
            <Link className="ln-glass ln-tile ln-pop ln-card--hover" to="/lesson"><span className="ln-icon3d"><img src="/icons3d/play.png" alt="" /></span><span><b>Resume lesson</b><span>Pick up at step 4</span></span></Link>
            <Link className="ln-glass ln-tile ln-pop ln-card--hover" to="/quiz"><span className="ln-icon3d"><img src="/icons3d/quiz.png" alt="" /></span><span><b>Practice quiz</b><span>5 questions, 4 min</span></span></Link>
            <Link className="ln-glass ln-tile ln-pop ln-card--hover" to="/course/dsa"><span className="ln-icon3d"><img src="/icons3d/notes.png" alt="" /></span><span><b>My notes</b><span>12 highlights</span></span></Link>
            <button type="button" className="ln-glass ln-tile ln-pop ln-card--hover quick__btn" onClick={() => (phone ? toast(TUTOR_LINE) : setAsk((n) => n + 1))}><span className="ln-icon3d ln-icon3d--gold"><img src="/icons3d/tutor.png" alt="" /></span><span><b>Ask the tutor</b><span>Explain, quiz, plan</span></span></button>
          </section>

          <section aria-label="My courses" className="ln-glass courses">
            <div className="courses__head">
              <span className="courses__title">
                <h2 className="h-card" style={{ fontSize: 20 }}>My courses</h2>
                <Seg label="Show" value={filter} onChange={setFilter} options={[['all', 'All'], ['progress', 'In progress'], ['saved', 'Saved']]} />
              </span>
              <Link to="/module" className="link-muted">View all</Link>
            </div>
            {courses.length ? (
              <div className="courses__grid">
                {courses.map((s) => {
                  const done = s.id === 'dsa' && p.lessonDone ? s.card.done + 1 : s.card.done;
                  const pct = Math.round((done / s.card.total) * 100);
                  return (
                    <Link key={s.id} className="ln-pcard courses__card" to={`/course/${s.id}`}>
                      <span className="ln-pcard__art"><img src={s.teacherImg} alt="" /></span>
                      <span className="ln-pcard__status"><i />{s.card.status}</span>
                      {s.card.time ? <span className="ln-pcard__time">{s.card.time}</span> : null}
                      <span className="ln-pcard__title">{s.course}</span>
                      <span className="courses__count"><span><b>{done}</b>/{s.card.total} lessons</span><span>{pct}%</span></span>
                      <span className="ln-progress" style={{ marginTop: 6 }}><span className="ln-progress__fill" style={{ display: 'block', width: `${pct}%` }} /></span>
                      <span className="ln-btn ln-btn--ink courses__go">Continue</span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="courses__empty">No saved courses yet. Save one from its page to find it here.</p>
            )}
          </section>

          <div className="dash__pair">
            <StudyTime />
            <section aria-label="Reminders" className="ln-glass remind">
              <div className="row-between" style={{ alignItems: 'baseline' }}><h2 className="h-card">Reminders</h2><span className="muted-12">3 this week</span></div>
              <div className="remind__row remind__row--ember"><span><b>Problem set 2: probability</b><span>Homework · due Mon 1, 23:59</span></span><span className="ln-chip" style={{ flex: 'none' }}>ps2.pdf</span></div>
              <div className="remind__row remind__row--gold"><span><b>Trees quiz prep</b><span>Quiz · Thu 27, 10:00</span></span><Link to="/quiz" className="ln-btn ln-btn--secondary remind__btn">Practice</Link></div>
              <div className="remind__row"><span><b>Review 2 essays</b><span>Peer review · 25 min</span></span><Link to="/lesson" className="ln-btn ln-btn--secondary remind__btn">Start</Link></div>
            </section>
          </div>
        </main>

        <div className="dash__aside">
          <aside aria-label="Your profile and schedule" className="ln-glass profile">
            <div className="profile__me">
              <Avatar />
              <span><b>Riya Sharma</b><span>B.Tech CSE · Year 2</span></span>
            </div>
            <div className="profile__stats">
              <span><b>3</b><span>Courses done</span></span>
              <span><b>26h</b><span>Time spent</span></span>
              <span className="is-xp"><b>{p.streak}</b><span>Day streak</span></span>
            </div>
            <WeekCalendar />
            <section aria-label="Upcoming events" className="upcoming">
              <div className="row-between" style={{ alignItems: 'baseline' }}><h2 className="h-card" style={{ margin: '2px 0' }}>Upcoming</h2><a href="#" className="link-muted" style={{ fontSize: 12 }} onClick={(e) => { e.preventDefault(); notInPrototype('The full calendar'); }}>View all</a></div>
              <div className="upcoming__item"><span><span className="ln-chip ln-chip--combo">Quiz</span><span><b>Thu 27</b>, 10:00</span></span><b>Trees quiz: Data Structures</b></div>
              <div className="upcoming__item"><span><span className="ln-chip ln-chip--xp">Webinar</span><span><b>Sat 29</b>, 18:00</span></span><b>How interviewers test data structures</b></div>
              <div className="upcoming__item"><span><span className="ln-chip">Workshop</span><span><b>Wed 3</b>, 16:30</span></span><b>Git branching for team projects</b></div>
            </section>
          </aside>

          <section aria-label="Recommended courses" className="ln-glass recs">
            <div className="row-between" style={{ alignItems: 'baseline', marginBottom: 2 }}><h2 className="h-card">Recommended</h2><Link to="/module" className="link-muted" style={{ fontSize: 12 }}>View all</Link></div>
            {RECOMMENDED.map((r) => (
              <Link key={r.title} className="ln-pop recs__item" to="/module">
                <span className={r.gold ? 'ln-icon3d ln-icon3d--gold' : 'ln-icon3d'} style={{ width: 46, height: 46 }}><img src={`/icons3d/${r.icon}.png`} alt="" /></span>
                <span className="recs__text"><b>{r.title}</b><span><span className={`ln-chip ${r.chip}`}>{r.level}</span><span className="recs__rating"><span aria-hidden="true">★</span> {r.rating}<span className="ln-sr"> stars</span></span></span></span>
              </Link>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
