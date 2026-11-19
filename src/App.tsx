import { TimerProvider } from './state/TimerProvider'
import { Header } from './components/Header'
import { TimerCard } from './components/TimerCard'
import { TimerEffects } from './components/TimerEffects'
import { SettingsPanel } from './components/SettingsPanel'
import { StatsPanel } from './components/StatsPanel'
import { HistoryList } from './components/HistoryList'

export default function App() {
  return (
    <TimerProvider>
      <TimerEffects />
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10">
        <Header />
        <main className="grid gap-6 lg:grid-cols-[2fr_3fr] lg:items-start">
          <div className="flex flex-col gap-6">
            <TimerCard />
            <SettingsPanel />
          </div>
          <div className="flex flex-col gap-6">
            <StatsPanel />
            <HistoryList />
          </div>
        </main>
      </div>
    </TimerProvider>
  )
}
