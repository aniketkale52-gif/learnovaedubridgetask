/* User flow (canvas FlowMap). Every box opens its screen; the row below links each state. */
import { Link } from 'react-router-dom';

type Box = { x: number; y: number; title: string; sub: string; to: string; tone?: 'ok' | 'bad' | 'side' | 'strong' };
const BOXES: Box[] = [
  { x: 64, y: 156, title: 'Dashboard', sub: 'Continue learning', to: '/' },
  { x: 328, y: 156, title: 'Learning module', sub: 'Pick the current lesson', to: '/module' },
  { x: 592, y: 156, title: 'Interactive lesson', sub: 'Read, try, next', to: '/lesson' },
  { x: 856, y: 156, title: 'Quiz', sub: 'Pick, then Check answer', to: '/quiz' },
  { x: 1112, y: 316, title: 'Correct · +10 XP', sub: 'Reason, mascot on a streak', to: '/quiz?at=4', tone: 'ok' },
  { x: 604, y: 316, title: 'Not quite / Skipped', sub: 'Answer and why, mascot cheers you on, the miss returns for review', to: '/quiz?at=4', tone: 'bad' },
  { x: 328, y: 316, title: 'Locked lesson', sub: 'Hint names what to finish', to: '/module?locked=1', tone: 'side' },
  { x: 64, y: 316, title: 'Subject view', sub: 'Video, notes and outline for one course', to: '/course/dsa', tone: 'side' },
  { x: 1112, y: 500, title: 'Lesson complete', sub: 'Celebration, stats count up, then streak +1', to: '/complete', tone: 'strong' },
  { x: 604, y: 500, title: 'Try a different way', sub: 'Recap, warm-up or retake', to: '/retry', tone: 'side' },
];
// [x, y, w, h, vertical, dashed, label]
const ARROWS: [number, number, number, number, boolean, boolean, string][] = [
  [264, 196, 63, 8, false, false, 'From Dashboard to Learning module, on Continue learning'],
  [528, 196, 63, 8, false, false, 'From Learning module to Interactive lesson'],
  [792, 196, 63, 8, false, false, 'From Interactive lesson to Quiz'],
  [952, 244, 8, 55, true, false, 'From Quiz to Correct, on Check answer'],
  [1044, 356, 67, 8, false, false, 'From Correct to Correct feedback, if yes'],
  [1208, 404, 8, 95, true, false, 'From Correct feedback to Lesson complete, after the last question'],
  [700, 404, 8, 95, true, true, 'From Not quite feedback to Try a different way, after a second miss'],
  [424, 244, 8, 71, true, true, 'From Learning module to Locked lesson hint, when a locked lesson is tapped'],
  [160, 244, 8, 71, true, true, 'From Dashboard to Subject view, when a course card is clicked'],
];
const STATES: [string, string][] = [
  ['Lesson loading (3–5 s)', '/lesson?state=loading'], ['Locked lesson clicked', '/module?locked=1'], ['New student, no courses', '/welcome'],
  ['Lesson failed to load', '/lesson?state=error'], ['Failed twice: try again', '/retry'], ['Review the miss', '/quiz?at=review'], ['Streak +1', '/streak'],
  ['Subject view · Probability', '/course/stats'], ['Subject view · React', '/course/web'], ['Subject view · Writing', '/course/writing'],
];

export function FlowMap() {
  return (
    <main className="flow">
      <div className="flow__board">
        {ARROWS.map(([x, y, w, h, v, dashed, label]) => (
          <svg key={label} role="img" aria-label={label} width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={dashed ? 'flow__arrow is-dashed' : 'flow__arrow'} style={{ left: x, top: y }}>
            <path d={v ? `M 4 0 L 4 ${h - 4}` : `M 0 4 L ${w - 4} 4`} markerEnd="url(#flow-head)" />
          </svg>
        ))}
        <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}><defs><marker id="flow-head" orient="auto" markerWidth="5" markerHeight="5" refX="2" refY="2" overflow="visible"><path d="M0 0 L4 2 L0 4 Z" fill="#8a8378" /></marker></defs></svg>
        {/* Correct → Not quite runs right to left */}
        <svg role="img" aria-label="From Correct to Not quite feedback, if no" width="63" height="8" viewBox="0 0 63 8" preserveAspectRatio="none" className="flow__arrow" style={{ left: 805, top: 356 }}><path d="M 63 4 L 4 4" markerEnd="url(#flow-head)" /></svg>
        <svg role="img" aria-label="From Subject view to Learning module, from the course outline" width="76" height="86" viewBox="0 0 76 86" preserveAspectRatio="none" className="flow__arrow is-dashed" style={{ left: 264, top: 244 }}><path d="M 0 86 L 70 6" markerEnd="url(#flow-head)" /></svg>

        <h1 className="flow__title">Learning journey</h1>
        <p className="flow__sub">Dashboard to course, lesson, quiz and result. Dashed lines are side paths. Every box opens its screen.</p>
        {BOXES.map((b) => (
          <Link key={b.title} to={b.to} className={`flow__box${b.tone ? ` is-${b.tone}` : ''}`} style={{ left: b.x, top: b.y }}><span><b>{b.title}</b><br />{b.sub}</span></Link>
        ))}
        <div className="flow__diamond" style={{ left: 868, top: 300 }}>Correct?</div>
        <span className="flow__lbl" style={{ left: 1062, top: 332, width: 32, textAlign: 'center' }}>yes</span>
        <span className="flow__lbl" style={{ left: 820, top: 332, width: 32, textAlign: 'center' }}>no</span>
        <span className="flow__lbl" style={{ left: 716, top: 444, width: 64 }}>2nd miss</span>
        <span className="flow__lbl" style={{ left: 440, top: 272, width: 76 }}>tap locked</span>
        <span className="flow__lbl" style={{ left: 64, top: 272, width: 88, textAlign: 'right' }}>course card</span>
        <span className="flow__lbl" style={{ left: 238, top: 268, width: 52 }}>outline</span>

        <div className="flow__notes">
          <div><b>Saved on every step</b><br />"Progress saved" in the lesson footer; nothing to lose on a drop.</div>
          <div><b>Slow lesson (3–5 s)</b><br />Skeleton plus a plain-language status line after 2 s.</div>
          <div><b>One submit only</b><br />Check answer is disabled until a pick and locks on click.</div>
          <div><b>Never a dead end</b><br />Errors offer Try again and keep earlier steps.</div>
        </div>
      </div>
      <nav aria-label="States and edge cases" className="flow__states">
        <b>States and edge cases</b>
        {STATES.map(([label, to]) => <Link key={to} to={to} className="ln-chip">{label}</Link>)}
      </nav>
    </main>
  );
}
