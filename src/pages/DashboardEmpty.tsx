/* New student, no courses (canvas DashboardEmpty). */
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Sidebar } from '@/components/shell';

export function DashboardEmpty() {
  return (
    <div className="side-layout">
      <div className="side-layout__nav"><Sidebar active="home" streak="Start a streak today" /></div>
      <main className="side-layout__main">
        <header>
          <div className="ln-eyebrow">Fall semester · Week 1</div>
          <h1 className="page-title">Welcome to Learnova, Riya</h1>
          <p className="page-sub">Pick your first course. Your progress, streak and quiz scores will show up here.</p>
        </header>
        <section className="ln-card empty">
          <div className="empty__art">
            <svg viewBox="0 0 120 80" aria-hidden="true"><path d="M60 16c-14-6-28-6-40 0v50c12-6 26-6 40 0 12-6 26-6 40 0V16c-12-6-26-6-40 0z" style={{ fill: 'var(--card)', stroke: 'var(--foreground)', strokeWidth: 2 }} /><path d="M60 16v50M28 30h22M28 40h18M70 30h22M70 40h14" style={{ stroke: 'var(--foreground)', strokeWidth: 2, strokeLinecap: 'round' }} /><circle cx="84" cy="52" r="5" style={{ fill: 'var(--primary)' }} /></svg>
          </div>
          <h2>Start your first course</h2>
          <p>Your department enrolled you in 3 courses this semester. Start with any of them; each lesson takes 10 to 20 minutes.</p>
          <div className="empty__actions">
            <Link className="ln-btn" to="/module">Start Data Structures <ArrowRight className="ln-icon" /></Link>
            <Link className="ln-btn ln-btn--secondary" to="/">Browse all courses</Link>
          </div>
        </section>
        <section aria-label="How it works" className="how">
          <div className="ln-card"><h3>Short lessons</h3><p>Read, watch and try each idea in under 20 minutes.</p></div>
          <div className="ln-card"><h3>Quick checks</h3><p>Five questions at the end show what stuck.</p></div>
          <div className="ln-card"><h3>Daily goal</h3><p>20 XP a day builds a streak. Change it any time.</p></div>
        </section>
      </main>
    </div>
  );
}
