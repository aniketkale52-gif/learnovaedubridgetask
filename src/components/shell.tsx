/* Shell pieces shared by the pages: logo, theme toggle, the dashboard's nav (Main board),
   the Sidebar component (Module, DashboardEmpty boards) and the phone menu sheet. */
import * as Dialog from '@radix-ui/react-dialog';
import {
  BookOpen, Calendar, ChartNoAxesColumn, CircleHelp, Flame, GraduationCap, House, LayoutDashboard, ListChecks,
  LogOut, Menu, Moon, Settings, SquareCheckBig, Sun, TrendingUp, X,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { GOAL, useProgress } from '@/data/progress';
import { useTheme } from '@/lib/hooks';
import { cn, notInPrototype } from '@/lib/utils';

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <span className="logo-mark" style={{ width: size, height: size, borderRadius: size * 0.31, fontSize: size / 2 }} aria-hidden="true">
      L
    </span>
  );
}

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const light = theme === 'light';
  return (
    <button type="button" className={cn('ln-iconbtn', className)} onClick={(e) => toggle(e.currentTarget)} aria-label={light ? 'Switch to dark theme' : 'Switch to light theme'}>
      {light ? <Moon className="ln-icon" /> : <Sun className="ln-icon" />}
    </button>
  );
}

export function Avatar({ size = 56, className }: { size?: number; className?: string }) {
  return (
    <span className={cn('avatar', className)} style={{ width: size, height: size, fontSize: size * 0.34 }} aria-hidden="true">
      RS
    </span>
  );
}

const soon = (what: string) => (e: React.MouseEvent) => {
  e.preventDefault();
  notInPrototype(what);
};

/* Main board's nav: richer than the Sidebar component (streak card, separators). */
export function MainNav({ onNavigate }: { onNavigate?: () => void }) {
  const p = useProgress();
  const left = Math.max(0, GOAL - p.goal);
  return (
    <nav aria-label="Main" className="ln-glass ln-glass--strong mainnav">
      <Link to="/" className="mainnav__logo" onClick={onNavigate}>
        <LogoMark />
        Learnova
      </Link>
      <NavLink to="/" end className="mainnav__link" onClick={onNavigate}><LayoutDashboard className="ln-icon" />Dashboard</NavLink>
      <NavLink to="/module" className="mainnav__link" onClick={onNavigate}><BookOpen className="ln-icon" />My learning</NavLink>
      <a href="#" className="mainnav__link" onClick={soon('Calendar')}><Calendar className="ln-icon" />Calendar</a>
      <a href="#" className="mainnav__link" onClick={soon('Analytics')}><TrendingUp className="ln-icon" />Analytics</a>
      <span className="mainnav__sep" />
      <Link to="/module" className="mainnav__link" onClick={onNavigate}><GraduationCap className="ln-icon" />All courses</Link>
      <Link to="/quiz" className="mainnav__link" onClick={onNavigate}><SquareCheckBig className="ln-icon" />Quizzes</Link>
      <span className="mainnav__sep" />
      <a href="#" className="mainnav__link" onClick={soon('Settings')}><Settings className="ln-icon" />Settings</a>
      <a href="#" className="mainnav__link" onClick={soon('Support')}><CircleHelp className="ln-icon" />Support</a>
      <span className="mainnav__fill" />
      <div className="ln-glass mainnav__streak">
        <span aria-hidden="true" className="mainnav__streak-glow" />
        <b>{p.streak}-day streak</b>
        <span>{left ? `${left} XP to today's goal` : "Today's goal reached"}</span>
        <div className="ln-progress" role="progressbar" aria-label="Daily goal" aria-valuenow={Math.min(p.goal, GOAL)} aria-valuemin={0} aria-valuemax={GOAL}>
          <div className="ln-progress__fill ln-progress__fill--gold" style={{ width: `${Math.min(100, (p.goal / GOAL) * 100)}%` }} />
        </div>
      </div>
      <a href="#" className="mainnav__link" onClick={soon('Log out')}><LogOut className="ln-icon" />Log out</a>
    </nav>
  );
}

/* The Sidebar component board: used by the Learning module and the new-student dashboard. */
export function Sidebar({ active, streak }: { active: 'home' | 'courses' | 'quizzes' | 'progress'; streak?: string }) {
  const p = useProgress();
  const item = (key: typeof active, to: string, icon: ReactNode, label: string) =>
    to === '#' ? (
      <a href="#" className="sidebar__link" aria-current={active === key ? 'page' : undefined} onClick={soon(label)}>{icon}{label}</a>
    ) : (
      <Link to={to} className="sidebar__link" aria-current={active === key ? 'page' : undefined}>{icon}{label}</Link>
    );
  return (
    <nav aria-label="Main" className="ln-glass ln-glass--strong sidebar">
      <Link to="/" className="sidebar__logo"><LogoMark size={30} />Learnova</Link>
      {item('home', '/', <House className="ln-icon" />, 'Dashboard')}
      {item('courses', '/module', <BookOpen className="ln-icon" />, 'My learning')}
      {item('quizzes', '/quiz', <ListChecks className="ln-icon" />, 'Quizzes')}
      {item('progress', '#', <ChartNoAxesColumn className="ln-icon" />, 'Analytics')}
      <span className="sidebar__fill" />
      <span className="sidebar__foot-row">
        <span className="ln-chip ln-chip--xp"><Flame className="ln-icon" style={{ width: 14, height: 14 }} />{streak ?? `${p.streak}-day streak`}</span>
        <ThemeToggle className="sidebar__theme" />
      </span>
      <div className="sidebar__me">
        <span className="sidebar__avatar" aria-hidden="true">RS</span>
        <span><b>Riya Sharma</b><span>B.Tech CSE · Year 2</span></span>
      </div>
    </nav>
  );
}

/* Phone: the compact header's menu opens the dashboard nav in a sheet (Radix Dialog). */
export function MenuSheet() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button type="button" className="ln-iconbtn" aria-label="Open menu"><Menu className="ln-icon" /></button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="sheet-overlay" />
        <Dialog.Content className="sheet" aria-describedby={undefined}>
          <Dialog.Title className="ln-sr">Menu</Dialog.Title>
          <Dialog.Close asChild>
            <button type="button" className="ln-iconbtn sheet__close" aria-label="Close menu"><X className="ln-icon" /></button>
          </Dialog.Close>
          <MainNav onNavigate={() => setOpen(false)} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
