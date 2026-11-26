# Learnova: clickable prototype

The student flow from the Learnova UI/UX brief, built from the design canvas (`../design/canvas/project/*.dc.html`) and the Glass design system (`../design/ds/project`). Dashboard → course → lesson → quiz → result, with every state on the canvas. Mock data only; progress lives in memory, so a reload starts the demo over (the theme is remembered).

## Run it

This repository holds the app only; the design canvas and design system it is built from (`../design`, referenced below) live in the project it came from. Deployed on Vercel (`vercel.json` serves `index.html` for every route).

```bash
npm install
npm run dev        # http://localhost:5190
npm run build      # typecheck (tsc) + production build into dist/
npm run assets     # re-copy renders and icons from ../design into public/ (only in the full project; the assets are already committed)
```

## Screens and routes

| Board | Route |
|---|---|
| 1 · Dashboard (Main) · light (DashboardDark) · tablet (DashboardTablet) · mobile (DashboardMobile) | `/` (theme: sun/moon button, or `?theme=light` / `?theme=dark`; tablet layout at 768–1199 px, phone below 768 px) |
| New student, no courses (DashboardEmpty) | `/welcome` |
| 1b · Subject view (SubjectView, SubjectStats, SubjectWeb, SubjectWriting) | `/course/dsa`, `/course/stats`, `/course/web`, `/course/writing` |
| 2 · Learning module (Module) · locked lesson clicked (ModuleLocked) | `/module` · `/module?locked=1` |
| 3 · Interactive lesson (Lesson) · loading (LessonLoading) · error (LessonError) | `/lesson` (loads 3–5 s the first time) · `/lesson?state=loading` (holds) · `/lesson?state=error` |
| 4 · Quiz → 4b Correct / 4c Not quite / Skipped a question (QuizSkipped) → 4d Mascot peek → 4e Review | `/quiz` (one flow from question 1) · `/quiz?at=4` (the board state: question 4, 3 in a row) · `/quiz?at=review` |
| 4f · Lesson complete (Complete) | `/complete` |
| 4g · Streak +1 (Streak) | `/streak` |
| Failed twice (RetryTwice) | `/retry` (or miss the same question twice in the quiz) |
| User flow (FlowMap) | `/flow`: every box opens its screen; the chips under it open each state |

## Every interaction

- **Dashboard:** the mascot rises behind the lesson bar, waves and says hi. Poke it (it's a button) for a squish, > < giggle eyes and a learning nudge. Leave the page alone for 15 s (no pointer, key, wheel or scroll) and it dozes with closed eyes and zzz; any activity wakes it, and a poke right after says "Oh, I dozed off!". Course cards open their subject view; Continue learning and Resume open the lesson; Practice opens the quiz; My notes opens the Data Structures subject view on Notes; Ask the tutor opens the mascot's bubble with an offer to explain, quiz or plan (a toast on phones, where the mascot sits out). My courses filters (All / In progress / Saved), Study time Week / Month, and the calendar's week arrows all work. XP, streak, daily goal and the Data Structures card update after you finish the quiz.
- **Subject view:** the video "plays" (time ticks, the chapter chip, chapter list and transcript line follow). Pause/play, back 10 s, click or arrow-key the scrubber, click a chapter or a transcript time to jump. The outline collapses to a rail and back. The tool rail opens Transcript, Notes or Files (one at a time, click again to close). Notes: Save is disabled until there is text (Ctrl/⌘+Enter saves), starting a note pauses the video, notes can be edited inline and deleted with Undo. Helpful / not helpful toggle.
- **Module:** locked lessons open a hint popover (Esc or click outside closes it). After the quiz, Binary search trees flips to completed, AVL trees unlocks and the course ring fills 64% → 67%.
- **Lesson:** skeleton for 3–5 s with a plain-language status line after 2 s (first open per session; offline at the end shows the error state). Try it: tap a slot to place 42; the wrong slot shakes and explains, the right one fills the step bar.
- **Quiz:** pick with a click or 1 / 2 / 3, Enter checks; Check is disabled until a pick and locks after one press. Correct: the card springs with gold sparkles, the green panel slides up, the bar grows and "N in a row" rides its head (gold from 5). Not quite: the card shakes, the answer is outlined, the red panel says why, and the question returns at the end tagged "Previous mistake". Skip: a neutral panel (a skip isn't a mistake) with the answer and why; the question returns at the end tagged "Skipped earlier", with its hint shown. The mascot peeks over the footer (thinking → watching your pick → flame eyes / encouraging eyes; poke for a hint) and gets its own beat after a miss, at 5 in a row and before the review. A second miss on the same question goes to "Try a different way". Focus moves to the panel's button, so Enter keeps you moving.
- **Complete:** band sweep, confetti, mascot hop, stat cards count up (XP, first-try accuracy, minutes since the lesson opened). Click or Enter skips to the end. Under 60% the copy turns encouraging and offers "Review mistakes". Continue → Streak (12 → 13 rolls, today's dot pops) → Module.
- **Keyboard and screen readers:** every control is a real button or link with a name; focus rings use the ring token; page titles change per route; quiz results are announced through a live region; axe-core reports no violations on `/`, `/course/*`, `/module`, `/lesson`, `/quiz` (question and feedback states), `/complete`, `/streak`, `/welcome`, `/retry`, in dark and light.
- **Motion polish** (`src/styles/motion.css`, Magic UI patterns on the DS tokens): panels rise in one after another on each page, side panels slide in from their edge, chart bars grow, the ember button gets a light sweep on hover, small controls press in, lesson rows nudge on hover, segmented tabs slide their pill (motion `layoutId`), and the theme switch grows out of the button in a circle (View Transitions; instant where unsupported). Skipped on purpose: cursor spotlights and border beams, because the DS keeps glow for what matters now.
- **Reduced motion / transparency:** the bundle's media queries turn animations off (end states shown) and swap glass for solid surfaces; the mascot loops show their still frames.

## How it's built

- Vite + React 18 + TypeScript, React Router, Tailwind v4 with the Learnova tokens as theme keys (no preflight, like the Laya app), Radix Dialog (phone menu) and Popover (locked hint), sonner toasts, lucide-react icons, motion's `MotionConfig` for reduced motion. Fonts from @fontsource (Outfit, Inter, JetBrains Mono).
- `src/styles/tokens.css` and `src/styles/bundle.css` are copies of `../design/tokens.css` and the DS `components/bundle.css`; the only change is dropping their Google Fonts `@import`. Page layout lives in `app.css`, `subject.css`, `learn.css`, `quiz.css`, ported from the boards' inline styles.
- `src/components/Mascot.tsx` is the canvas Mascot component in React (poses, moods, live poke). `src/pages/Quiz.tsx` runs the whole quiz as one state machine; `src/data/quiz.ts` holds the questions.
- Assets are copied (not moved) into `public/` by `scripts/copy-assets.mjs`; teacher photos are scaled to 960 px.

## Design gaps (found while building; the canvas is unchanged)

1. **Quiz content:** only question 4 is designed. Questions 1–3 and 5 mix theory (where does 30 go?), applied (insert 42, as in the lesson), maths (comparisons for 1,000 keys ≈ log₂ n = 10) and theory + maths (height after sorted inserts). Each card's top panel shows the worked step behind its answer (an example, a path or the arithmetic) instead of code. The text is in `src/data/quiz.ts`; `design/DESIGN-NOTES.md` ("Quiz question set") records it.
2. **Links to screens outside the brief** (Calendar, Analytics, Settings, Support, Log out, Search, Notifications, lesson 5, the other subjects' Next / outline items, downloads, report) show a short toast instead of reloading the same board.
3. **Not designed, added:** Study time's Month view and the calendar's other weeks; inline note editing (the board has the Edit button only); the hint popover on the locked "Module quiz" row; the after-quiz module state (AVL unlocked as "up next"); a skipped question returns tagged "Skipped earlier" (not "Previous mistake") with its hint shown, as the Skipped panel promises; on phones Ask the tutor answers in a toast, since the mascot sits out there.
4. **Dozing** follows real inactivity on the page, as the README asks, instead of the bundle's CSS timer (which restarts only on a poke); the mascot adds `ln-m--dozing` and two rules in `quiz.css` drive it.
5. **Complete's Time** is minutes since the lesson opened this session (the board's 14 min when the page is opened directly). The accuracy card keeps the board's "Accuracy" label (DESIGN-NOTES mentioned "GREAT!").
