/* The Learnova mascot (DS README "Mascot"): Blender renders per pose and theme with live SVG eyes on the visor.
   CSS (.ln-m*, .ln-eye*) is the DS bundle; this is the canvas Mascot component in React.
   - The theme picks the render: both are in the DOM and the bundle CSS hides the other one.
   - Wave and celebrate are animated WebP loops with a still frame for reduced motion.
   - Moods open with a quick blink: the eyes remount (key) when the mood changes, replaying ln-eye-open.
   - Live: each poke flips --a/--b so the giggle restarts. Dozing is driven by the page (real inactivity),
     not the bundle's 15 s CSS timer, so it always renders as --awake and adds --dozing when told to. */
import { cn } from '@/lib/utils';

export type Pose = 'idle' | 'wave' | 'peek' | 'cheer' | 'celebrate';
export type Mood = 'idle' | 'hello' | 'encourage' | 'fire' | 'celebrate' | 'think' | 'look';

const VISOR = { left: 39.51, top: 25.87, width: 26.66, height: 13.32 };
const POSES: Record<Pose, { mood: Mood; label: string; loop?: boolean; visor?: typeof VISOR }> = {
  idle: { mood: 'idle', label: 'arms folded' },
  wave: { mood: 'hello', label: 'waving hello', loop: true },
  peek: { mood: 'encourage', label: 'peeking over the edge' },
  cheer: { mood: 'fire', label: 'cheering' },
  celebrate: { mood: 'celebrate', label: 'jumping and waving to celebrate', loop: true, visor: { left: 39.45, top: 17.16, width: 26.82, height: 13.57 } },
};

const src = (pose: Pose, theme: string) => `/mascot/${pose}-${theme}.${POSES[pose].loop ? 'webp' : 'png'}`;
const still = (pose: Pose, theme: string) => (POSES[pose].loop ? `/mascot/${pose}-${theme}-still.png` : src(pose, theme));

function Render({ pose, extra }: { pose: Pose; extra?: string }) {
  return (
    <>
      {(['dark', 'light'] as const).map((t) => (
        <picture key={t} className={cn('ln-m__img', `ln-m__img--${t}`, extra)}>
          <source media="(prefers-reduced-motion: reduce)" srcSet={still(pose, t)} />
          <img src={src(pose, t)} alt="" draggable={false} />
        </picture>
      ))}
    </>
  );
}

const VB = '0 0 240 110';
function Eyes({ mood }: { mood: Mood }) {
  switch (mood) {
    case 'hello':
      return (<svg viewBox={VB} aria-hidden="true"><g className="ln-eye-bob"><path className="ln-eye-line" d="M62 62 Q80 38 98 62" /><path className="ln-eye-line" d="M142 62 Q160 38 178 62" /></g></svg>);
    case 'encourage':
      return (<svg viewBox={VB} aria-hidden="true"><g className="ln-eye-nod"><path className="ln-eye-line" d="M64 60 Q80 44 96 58" /><path className="ln-eye-line" d="M144 58 Q160 44 176 60" /></g></svg>);
    case 'fire':
      return (<svg viewBox={VB} aria-hidden="true"><path className="ln-eye ln-eye-flame" d="M80 28 C90 42 97 50 97 62 A17 17 0 0 1 63 62 C63 50 70 42 80 28 Z" /><path className="ln-eye ln-eye-flame" d="M160 28 C170 42 177 50 177 62 A17 17 0 0 1 143 62 C143 50 150 42 160 28 Z" /></svg>);
    case 'celebrate':
      return (<svg viewBox={VB} aria-hidden="true"><path className="ln-eye ln-eye-spin" d="M80 33 Q84 51 102 55 Q84 59 80 77 Q76 59 58 55 Q76 51 80 33 Z" /><path className="ln-eye ln-eye-spin" d="M160 33 Q164 51 182 55 Q164 59 160 77 Q156 59 138 55 Q156 51 160 33 Z" /></svg>);
    case 'think':
      return (<svg viewBox={VB} aria-hidden="true"><g className="ln-eye-drift"><rect className="ln-eye" x="71" y="37" width="18" height="34" rx="9" /><rect className="ln-eye" x="151" y="37" width="18" height="34" rx="9" /></g><circle className="ln-eye ln-eye-dot" cx="198" cy="38" r="4" /><circle className="ln-eye ln-eye-dot ln-eye-dot--2" cx="209" cy="30" r="5" /><circle className="ln-eye ln-eye-dot ln-eye-dot--3" cx="221" cy="22" r="6" /></svg>);
    case 'look':
      return (<svg viewBox={VB} aria-hidden="true"><g className="ln-eye-down"><circle className="ln-eye" cx="80" cy="55" r="12" /><circle className="ln-eye" cx="160" cy="55" r="12" /></g></svg>);
    default:
      return (<svg viewBox={VB} aria-hidden="true"><g className="ln-eye-blink"><rect className="ln-eye" x="70" y="33" width="20" height="44" rx="10" /><rect className="ln-eye" x="150" y="33" width="20" height="44" rx="10" /></g></svg>);
  }
}

export interface MascotProps {
  pose?: Pose;
  mood?: Mood;
  size?: number;
  hop?: boolean;
  /** live spots (dashboard hero, quiz footer): pokes giggle */
  live?: boolean;
  /** dashboard: wave hello until the first poke */
  greet?: boolean;
  poke?: number;
  /** the page decides when it dozes (15 s of real inactivity); quiz screens never pass it */
  dozing?: boolean;
  className?: string;
}

export function Mascot({ pose = 'idle', mood, size = 200, hop, live, greet, poke = 0, dozing, className }: MascotProps) {
  const P = POSES[pose];
  const v = P.visor || VISOR;
  const m = mood || P.mood;
  const greeting = !!(live && greet && poke === 0);
  return (
    <div
      className={cn('ln-m', hop && 'ln-m--hop', live && ['ln-m--live ln-m--awake', poke % 2 ? 'ln-m--b' : 'ln-m--a', poke > 0 && 'ln-m--poked'], dozing && 'ln-m--dozing', className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Learnova's mascot, ${dozing ? 'dozing' : P.label}`}
    >
      <div className={`ln-m__body ln-m__body--${pose}`}>
        {greeting ? <Render pose="wave" extra="ln-m__greet" /> : null}
        <Render pose={pose} extra={greeting ? 'ln-m__after-greet' : undefined} />
        <div className="ln-m__visor" style={{ left: `${v.left}%`, top: `${v.top}%`, width: `${v.width}%`, height: `${v.height}%` }}>
          <div className="ln-m__eyes ln-m__eyes--base" key={m + (dozing ? '-z' : '')}>
            <Eyes mood={m} />
          </div>
          {live ? (
            <div className="ln-m__eyes ln-m__eyes--tickle">
              <svg viewBox={VB} aria-hidden="true"><path className="ln-eye-line" d="M66 40 L92 55 L66 70" /><path className="ln-eye-line" d="M174 40 L148 55 L174 70" /></svg>
            </div>
          ) : null}
          {dozing ? (
            <div className="ln-m__eyes ln-m__eyes--sleep">
              <svg viewBox={VB} aria-hidden="true"><path className="ln-eye-line" d="M64 54 Q80 66 96 54" /><path className="ln-eye-line" d="M144 54 Q160 66 176 54" /></svg>
            </div>
          ) : null}
        </div>
        {dozing ? (
          <span className="ln-m__zzz" aria-hidden="true"><span>z</span><span>z</span><span>z</span></span>
        ) : null}
      </div>
    </div>
  );
}
