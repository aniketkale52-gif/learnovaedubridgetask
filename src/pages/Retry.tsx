/* Failed twice: try again (canvas RetryTwice). Reached after a second miss on the same question. */
import { ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Mascot } from '@/components/Mascot';

export function Retry() {
  return (
    <main className="retry">
      <div className="retry__col">
        <div className="retry__say">
          <div className="retry__m"><Mascot pose="idle" mood="encourage" size={120} /></div>
          <div className="retry__bubble">Trees trip up most people at first. Let's come at it from another side.</div>
        </div>
        <div>
          <div className="ln-eyebrow">Module quiz: Trees · attempt 2</div>
          <h1 className="retry__title">Let's try this a different way</h1>
          <p className="page-sub" style={{ margin: 0 }}>You got 6 of 10 this time, up from 5. Most misses came from one idea, so let's fix that one first.</p>
        </div>
        <section className="ln-card retry__rec">
          <div className="retry__art">
            <svg viewBox="0 0 120 80" aria-hidden="true"><path d="M60 18 32 52M60 18l28 34" style={{ stroke: 'var(--foreground)', strokeWidth: 2, fill: 'none' }} /><circle cx="60" cy="18" r="11" style={{ fill: 'var(--card)', stroke: 'var(--foreground)', strokeWidth: 2 }} /><circle cx="32" cy="56" r="11" style={{ fill: 'var(--primary)', stroke: 'var(--foreground)', strokeWidth: 2 }} /><circle cx="88" cy="56" r="11" style={{ fill: 'var(--card)', stroke: 'var(--foreground)', strokeWidth: 2 }} /></svg>
          </div>
          <div style={{ flex: '999 1 260px' }}>
            <span className="ln-chip ln-chip--combo">Recommended</span>
            <h2 className="retry__h2">2-minute recap: which side does a key go?</h2>
            <p className="retry__p">4 of your 4 misses were about left versus right on insert. One short visual walk-through.</p>
          </div>
          <Link className="ln-btn" to="/lesson">Start recap <ArrowRight className="ln-icon" /></Link>
        </section>
        <div className="retry__opts">
          <Link className="ln-card ln-card--hover" to="/quiz"><b>Practice 3 warm-up questions</b><p>Easier, with a hint on every one. No score.</p></Link>
          <Link className="ln-card ln-card--hover" to="/quiz"><b>Retake the quiz</b><p>New questions on the same ideas. Your best score is the one that counts.</p></Link>
        </div>
        <p className="retry__safe"><Check className="ln-icon" />Your streak is safe: studying the recap counts for today.</p>
      </div>
    </main>
  );
}
