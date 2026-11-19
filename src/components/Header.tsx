import { ThemeToggle } from './ThemeToggle'

export function Header() {
  return (
    <header className="flex items-end justify-between gap-4 border-b border-line pb-6 dark:border-night-line">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-muted dark:text-night-muted">
          InnCode Lab · Project 04
        </p>
        <h1 className="mt-2 font-display text-4xl font-extrabold uppercase leading-none sm:text-5xl">Focus Timer</h1>
      </div>
      <ThemeToggle />
    </header>
  )
}
