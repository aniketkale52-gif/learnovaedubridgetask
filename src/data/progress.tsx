/* The student's progress for this session (in memory: a reload starts the demo over).
   Starts where the canvas starts: 340 XP, 12-day streak, lesson 4 of Trees in progress. */
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export interface QuizResult {
  xp: number;
  firstTry: number;
  total: number;
  fixed: number; // misses answered right in the review round
  minutes: number;
}

interface Progress {
  xp: number;
  streak: number;
  goal: number; // XP today, out of GOAL
  lessonDone: boolean;
  result: QuizResult | null;
  lessonSeen: boolean; // the slow visualiser only loads once per session
  lessonStartedAt: number | null;
}

export const GOAL = 20;
const START: Progress = { xp: 340, streak: 12, goal: 15, lessonDone: false, result: null, lessonSeen: false, lessonStartedAt: null };

interface Ctx extends Progress {
  finishQuiz: (r: Omit<QuizResult, 'minutes'>) => void;
  markLessonSeen: () => void;
}

const ProgressCtx = createContext<Ctx | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [p, setP] = useState<Progress>(START);
  const value = useMemo<Ctx>(
    () => ({
      ...p,
      markLessonSeen: () => setP((s) => (s.lessonSeen ? s : { ...s, lessonSeen: true, lessonStartedAt: Date.now() })),
      finishQuiz: (r) =>
        setP((s) => ({
          ...s,
          xp: s.xp + r.xp,
          goal: s.goal + r.xp,
          // the first lesson of the day keeps the streak going
          streak: s.lessonDone ? s.streak : s.streak + 1,
          lessonDone: true,
          result: { ...r, minutes: s.lessonStartedAt ? Math.max(1, Math.round((Date.now() - s.lessonStartedAt) / 60000)) : 14 },
        })),
    }),
    [p],
  );
  return <ProgressCtx.Provider value={value}>{children}</ProgressCtx.Provider>;
}

export function useProgress() {
  const c = useContext(ProgressCtx);
  if (!c) throw new Error('useProgress outside ProgressProvider');
  return c;
}
