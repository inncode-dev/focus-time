# Focus Timer — InnCode Lab · Project 04

A Pomodoro timer built to show how to handle **time** in React: a pure reducer as a state machine, timestamps instead of a decrementing counter, an external clock read with `useSyncExternalStore`, and a few browser APIs (Notification, Web Audio, Page Visibility). Zustand holds settings and session history.

**Live demo:** _add your Vercel URL here_

## Features

- Pomodoro cycle: focus → short break, with a long break every N sessions (you can also jump to any phase)
- Start, pause, resume, reset, skip
- Configurable durations, validated
- Optional "working on" label saved with each session
- SVG progress ring and cycle indicator
- Sound (Web Audio, no audio files), optional browser notification and optional auto-start when a phase ends
- Countdown in the tab title, accurate even in a background tab
- Keyboard shortcuts: `Space` start / pause, `R` reset, `S` skip
- The running timer survives a page reload
- Today's sessions (deletable) and statistics: minutes today, sessions, all-time total, last 7 days bar chart (plain Tailwind)
- Light / dark theme, everything saved in `localStorage`

## Concept → file

| Concept | File |
| --- | --- |
| Pure reducer as a state machine | `src/lib/timerReducer.ts`, `src/types.ts` |
| Timestamps instead of a counter (no drift) | `src/lib/timerReducer.ts` (`getRemainingMs`) |
| `useReducer` + `useContext` | `src/state/TimerProvider.tsx`, `src/state/timerContext.ts`, `src/hooks/useTimer.ts` |
| `useSyncExternalStore` + shared clock | `src/lib/clock.ts`, `src/hooks/useNow.ts` |
| `useEffect` with cleanup | `src/hooks/useDocumentTitle.ts`, `src/hooks/useHotkeys.ts` |
| `useRef` (latest handlers, "already handled" guard) | `src/hooks/useHotkeys.ts`, `src/hooks/useTimerEffects.ts` |
| Two small Zustand stores with `persist` | `src/store/settingsStore.ts`, `src/store/sessionsStore.ts` |
| `useMemo` for config and statistics | `src/state/TimerProvider.tsx`, `src/components/StatsPanel.tsx` |
| `useId` for form fields | `src/components/TextField.tsx`, `src/components/Checkbox.tsx` |
| Web Audio / Notification APIs | `src/lib/sound.ts`, `src/lib/notify.ts` |
| SVG progress ring | `src/components/TimerRing.tsx` |
| Bar chart without libraries | `src/components/WeekChart.tsx` |
| Tailwind v4 design tokens | `src/index.css` |

## Stack

React 19 · Vite · TypeScript (strict) · Tailwind CSS v4 · Zustand · self-hosted fonts via Fontsource (Bricolage Grotesque, Plus Jakarta Sans, Red Hat Mono)

## Commands

```bash
npm install      # install dependencies
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # type-check and build for production into dist/
npm run preview  # serve the production build locally
```

## Project structure

```
src/
├── components/   UI: TimerCard, TimerRing, PhaseTabs, SettingsPanel, StatsPanel, HistoryList, ...
├── hooks/        useTimer, useNow, useTimerEffects, useHotkeys, useDocumentTitle, useTheme
├── state/        timer context + provider (useReducer)
├── store/        Zustand stores: settings, sessions
├── lib/          reducer, clock, phases, stats, sound, notifications, formatting, demo data
├── types.ts      shared types and the action union
├── index.css     Tailwind import + design tokens
├── App.tsx
└── main.tsx
```
