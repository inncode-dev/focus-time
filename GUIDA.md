# GUIDA — Focus Timer

Guida didattica al progetto. L'obiettivo: saper spiegare ogni scelta a un colloquio. Il tema centrale è **come si gestisce il tempo in React**.

## 1. Cosa fa l'app

Un timer Pomodoro. Lavori a blocchi di concentrazione (**focus**, 25 minuti di default), poi fai una **pausa breve**; ogni 4 sessioni la pausa è **lunga**. Puoi avviare, mettere in pausa, riprendere, azzerare e saltare la fase, e passare a mano a un'altra fase. Alla fine di una fase senti un suono, puoi ricevere una notifica del browser e, se vuoi, la fase successiva parte da sola. Il tempo rimanente compare anche nel titolo della scheda. Ogni sessione di focus completata finisce nello storico di oggi e nelle statistiche (minuti di oggi, sessioni, totale, grafico degli ultimi 7 giorni). Se ricarichi la pagina mentre il timer corre, continua da dove era. Scorciatoie: `Space`, `R`, `S`.

## 2. Come avviarla

```bash
npm install     # scarica le dipendenze elencate in package.json (compreso zustand)
npm run dev     # avvia Vite in sviluppo, con hot reload (http://localhost:5173)
npm run build   # `tsc -b` controlla i tipi, poi `vite build` crea la cartella dist/
npm run preview # serve dist/ in locale per provare la versione di produzione
```

## 3. Dove sono le cose

```
index.html                       Entry HTML: meta description, favicon, script anti-flash del tema
src/
├── main.tsx                     Monta <App/>, importa font e CSS
├── App.tsx                      TimerProvider + <TimerEffects/> + layout
├── index.css                    Import Tailwind, variante dark, design tokens (@theme)
├── types.ts                     TimerState, TimerAction (union), Settings, Session, Stats
├── state/
│   ├── timerContext.ts          Il Context del timer (stato + azioni)
│   └── TimerProvider.tsx        useReducer + persistenza + config derivata dalle impostazioni
├── store/
│   ├── settingsStore.ts         Zustand: durate e opzioni (persist)
│   └── sessionsStore.ts         Zustand: storico delle sessioni (persist)
├── hooks/
│   ├── useTimer.ts              Legge il context, errore se manca il Provider
│   ├── useNow.ts                L'ora corrente (al secondo) con useSyncExternalStore
│   ├── useTimerEffects.ts       Fine fase, titolo scheda, scorciatoie
│   ├── useHotkeys.ts            Scorciatoie da tastiera globali
│   ├── useDocumentTitle.ts      Imposta document.title con cleanup
│   ├── useTheme.ts              Tema salvato e applicato a <html>
│   └── useLocalStorage.ts       useState generico persistito
├── lib/
│   ├── timerReducer.ts          La macchina a stati (funzione pura) + getRemainingMs, isDue
│   ├── clock.ts                 L'orologio condiviso: un solo setInterval per tutta l'app
│   ├── phases.ts                Etichette, durate per fase, regola della pausa lunga
│   ├── stats.ts                 Statistiche dalle sessioni
│   ├── sound.ts                 Il "din-don" con Web Audio
│   ├── notify.ts                Wrapper della Notification API
│   ├── format.ts, dates.ts      Formattazione di tempi e date
│   ├── limits.ts                Intervalli validi delle impostazioni
│   ├── demoSessions.ts          Sessioni demo deterministiche
│   └── storage.ts               read/write localStorage sicuri (try/catch)
└── components/
    ├── Header.tsx, ThemeToggle.tsx
    ├── TimerCard.tsx            Anello, pulsanti, tab delle fasi, campo "working on"
    ├── TimerRing.tsx            Anello di avanzamento in SVG
    ├── PhaseTabs.tsx, CycleDots.tsx, TaskField.tsx
    ├── TimerEffects.tsx         Componente senza UI: monta useTimerEffects
    ├── SettingsPanel.tsx        Durate e opzioni (NumberField, Checkbox)
    ├── StatsPanel.tsx, WeekChart.tsx, HistoryList.tsx
    └── Button.tsx, TextField.tsx, NumberField.tsx, Checkbox.tsx, fieldStyles.ts
```

## 4. Il percorso dei dati: da "Start" alla sessione salvata

1. Clic su **Start**: `start()` (in `TimerProvider`) sblocca l'audio (`prepareSound`) e fa `dispatch({ type: 'started', now, config })`.
2. `timerReducer` (puro) calcola `endsAt = now + durata` e restituisce lo stato `running`. Il `useEffect` del provider lo salva in `localStorage`.
3. L'orologio (`clock.ts`) ha un solo `setInterval` da 250 ms. Quando cambia il secondo, avvisa i suoi ascoltatori: `useNow()` (basato su `useSyncExternalStore`) fa ri-renderizzare i componenti che lo usano, una volta al secondo.
4. `TimerCard` calcola `getRemainingMs(state, now, config)` = `endsAt - now` e mostra `24:58`, aggiorna l'anello e il titolo della scheda.
5. Quando `now >= endsAt`, l'effect in `useTimerEffects` rileva la fine fase: se era un focus salva la sessione (`addSession`), suona, notifica e dispatcha `phase_completed`.
6. Il reducer passa alla fase successiva (`idle`, oppure `running` se è attivo l'avvio automatico) e `focusDone` aumenta di uno.
7. Lo store `sessions` (Zustand) si aggiorna; `StatsPanel` ricalcola le statistiche (`useMemo`) e `HistoryList` mostra la nuova riga. `persist` scrive su `localStorage`.

## 5. La gestione dello stato: cosa sta dove e perché

| Dato | Dove | Perché |
| --- | --- | --- |
| Stato del timer (fase, stato, `endsAt`...) | `useReducer` + Context | È una **macchina a stati**: poche transizioni valide, tutte da esprimere come azioni tipizzate. Il reducer puro è facile da testare. |
| Impostazioni (durate, opzioni) | Store Zustand `settings` | Lette da componenti senza parentela (pannello, provider, effetti), cambiano di rado, vanno persistite. |
| Sessioni completate | Store Zustand `sessions` | Cambiano quando finisce un focus; separate dalle impostazioni, così chi legge le une non si aggiorna per le altre. |
| "Adesso" | Orologio esterno + `useSyncExternalStore` | È una fonte **fuori da React**: il tempo che passa. |
| Tema | `useLocalStorage` | Un solo valore. |
| Bozza dei campi numerici, conferme | `useState` locale | Interessano un solo componente. |

**Perché il timer non è in Zustand?** Potrebbe stare lì, ma il reducer rende esplicito il modello: ogni transizione ha un nome, le transizioni non valide non fanno nulla (il reducer restituisce lo stesso oggetto) e si può testare con una chiamata di funzione. Zustand brilla invece dove i dati sono letti da molti punti con selettori, come qui per impostazioni e sessioni. Due store piccoli invece di uno grande: ciascuno cambia per ragioni diverse.

## 6. Ogni hook, nel punto in cui è usato

### `useReducer` — `TimerProvider.tsx`
Il terzo argomento è un inizializzatore pigro: legge il timer salvato una sola volta (se un timer era in corso quando hai chiuso la pagina, conserva il suo `endsAt` e riparte corretto). Il `value` del Context è in `useMemo` per non cambiare a ogni render del provider. *Errore comune:* mettere `Date.now()` dentro il reducer: non sarebbe più puro, e due chiamate con lo stesso stato darebbero risultati diversi (in StrictMode React chiama i reducer due volte per scoprirlo).

### `useSyncExternalStore` — `useNow.ts` e `clock.ts`
È lo strumento di React per leggere dati che vivono **fuori** da React. Gli dai `subscribe` (come ascoltare i cambiamenti) e `getSnapshot` (come leggere il valore). Qui lo "store" è un modulo con un solo `setInterval` condiviso da tutti: parte quando si iscrive il primo componente e si ferma quando se ne va l'ultimo (nessun timer che gira per niente). Vantaggi rispetto a `useState` + `useEffect`: nessun *tearing* (due componenti che mostrano secondi diversi nello stesso render) e nessun valore vecchio per un frame. `getSnapshot` deve restituire lo stesso valore finché i dati non cambiano: per questo l'orologio tronca ai secondi, e React non ri-renderizza dentro lo stesso secondo.

### `useEffect` con cleanup — `useDocumentTitle.ts`, `useHotkeys.ts`, `useTimerEffects.ts`
- `useDocumentTitle`: imposta `document.title` e nella cleanup ripristina il precedente.
- `useHotkeys`: aggiunge un `keydown` su `window` e lo rimuove nella cleanup. Ignora i tasti mentre scrivi in un campo o quando un pulsante ha il focus (un pulsante focalizzato reagisce già alla barra spaziatrice) e chiama `preventDefault()` per evitare lo scroll.
- `useTimerEffects`: rileva la fine della fase.
*Errore comune:* dimenticare la cleanup, ottenendo listener duplicati a ogni render o dopo ogni hot reload.

### `useRef` — `useHotkeys.ts`, `useTimerEffects.ts`
Due usi diversi, entrambi "dati che non devono causare render":
1. In `useHotkeys` il listener si collega una volta sola ma deve sempre chiamare gli handler **più recenti**: un ref li tiene aggiornati (`latest.current`) senza dover rimuovere e riaggiungere il listener a ogni render.
2. In `useTimerEffects` un ref ricorda quale fase è già stata gestita (identificata dal suo `endsAt`, unico). Senza questa guardia, **StrictMode** (che in sviluppo esegue gli effect due volte) salverebbe la sessione e suonerebbe due volte. Il reducer ha una seconda difesa: `phase_completed` non fa nulla se la fase non è davvero scaduta.

### `useMemo` — `TimerProvider.tsx`, `StatsPanel.tsx`
- `config` (durate in millisecondi) dipende da cinque impostazioni e finisce nelle dipendenze di altro: deve restare stabile.
- Le statistiche scorrono tutte le sessioni: si ricalcolano solo se cambiano le sessioni, non a ogni secondo di timer. (Il `useMemo` serve qui perché `StatsPanel` non dipende da `now`: altrimenti non avrebbe senso.)

### Selettori Zustand — `TimerProvider.tsx`, `SettingsPanel.tsx`
`TimerProvider` seleziona cinque campi singoli: si ri-renderizza solo se uno di quelli cambia (cambiare "sound" non lo tocca). `SettingsPanel` invece legge l'intero store perché mostra tutte le impostazioni: è una scelta consapevole, commentata nel codice.

### `useId` — `TextField.tsx`, `Checkbox.tsx`
Id unici per collegare label, input e messaggi di errore o suggerimenti (`aria-describedby`).

### `useState` — `NumberField.tsx`
Il campo numerico tiene una **bozza** come stringa: durante la digitazione `""` o `"4"` (prima di `"45"`) non sono durate valide ma devono poter esistere. Solo i valori validi vengono "committati" verso lo store; se esci con una bozza non valida, riappare l'ultimo valore buono.

## 7. I concetti TypeScript usati

- **Union discriminata** `TimerAction` (campo `type`): nel `switch` TypeScript sa quali campi esistono in ogni `case`, e il `switch` è esaustivo.
- **Union di stringhe** (`Phase`, `Status`) e `Record<Phase, ...>` per mappe complete.
- **Interfacce** per stato e configurazione; `Omit<...>` per le props dei componenti.
- **Type guard** (`isTimerState`, `isSettings`, `isWithin`): validano dati `unknown` letti da `localStorage`.
- **`as const`** sui limiti (`LIMITS`), con tipi letterali.
- **Spread di oggetti** (`{...LIMITS.focusMin}`) per passare `min` e `max` ai componenti.
- **`strict: true`**, `noUnusedLocals`, `noUnusedParameters`.

## 8. Le parti specifiche del progetto

### Perché non si decrementa un contatore a ogni secondo
L'idea ingenua: `setInterval(() => setSeconds(s => s - 1), 1000)`. Funziona solo se il browser chiama il timer esattamente ogni 1000 ms, e **non lo fa**:
- `setInterval` garantisce *almeno* 1000 ms, mai esattamente 1000: ogni giro porta un po' di ritardo che si accumula (la **deriva**).
- Nelle schede in background i browser rallentano i timer (anche a uno al minuto), quindi un timer da 25 minuti durerebbe molto di più.
- Un portatile in sospensione "congela" tutto.
- Se ricarichi la pagina, il contatore si perde.

La soluzione: memorizzare **quando finisce** (`endsAt`, un timestamp) e calcolare ogni volta `endsAt - Date.now()`. Il tick serve solo a far ridisegnare la UI: se ne salta qualcuno il risultato resta corretto. In pausa si salva `remainingMs`; alla ripresa `endsAt = now + remainingMs`. Gli stessi timestamp, salvati in `localStorage`, rendono il timer sopravvissuto al reload.

### La macchina a stati
```
idle ──started──▶ running ──paused──▶ paused ──started──▶ running
running ──phase_completed──▶ idle  (oppure running, con avvio automatico)
```
Le transizioni non valide (per esempio `paused` quando è già in pausa) restituiscono lo stesso stato: React vede lo stesso oggetto e non ri-renderizza.

### Come si testa un reducer puro
Non serve renderizzare nulla: `timerReducer(stato, azione)` è una funzione. Test tipici (Vitest): da `idle` con `started` ottengo `running` e `endsAt = now + durata`; `paused` a metà salva il tempo rimasto; `phase_completed` troppo presto non cambia lo stato; dopo 4 focus completati la pausa è lunga; `phase_skipped` non conta la sessione.

### Regola della pausa lunga
`breakAfterFocus(focusDone, every)`: dopo il focus numero 4, 8, 12... la pausa è lunga. Saltare un focus non lo conta, quindi non avvicina la pausa lunga.

### Tempo in millisecondi interi e secondi
Tutti i timestamp sono multipli di 1000 (`nowSecond()`): `25:00` è esattamente 1.500.000 ms e non compare mai un fastidioso `25:01` nel primo secondo.

### Limiti noti (da saper dire a un colloquio)
In una scheda in background per molto tempo Chrome può limitare i timer a circa uno al minuto: la fine fase (suono, notifica) può arrivare in ritardo di qualche decina di secondi, pur con il tempo calcolato correttamente. Soluzioni più robuste: un Web Worker per il tick, un Service Worker per le notifiche programmate o lato server.

### Suono e notifiche
Le API del browser richiedono un gesto dell'utente: `AudioContext` si sblocca nel clic su **Start**; il permesso per le notifiche si chiede quando attivi l'opzione. Il suono è un'onda sinusoidale con un breve fade (`GainNode`): niente file audio da scaricare.

### Anello SVG
Due cerchi: una traccia e un arco colorato. `strokeDasharray` = circonferenza, `strokeDashoffset` nasconde la parte non ancora trascorsa; `-rotate-90` fa partire l'arco dalle ore 12.

## 9. Lo stile: come è configurato Tailwind e dove sono i token

In `src/index.css`:

- `@import 'tailwindcss';` carica il framework (il plugin `@tailwindcss/vite` lo elabora).
- `@theme { --color-paper: #ededea; ... }` definisce i **design token** di inncode.dev (utility `bg-paper`, `text-muted`, `border-line`...), più i `--font-*`.
- Token paralleli per il tema scuro (`night`, `night-surface`, `night-line`, `night-muted`) usati con `dark:`.
- `@custom-variant dark (&:where(.dark, .dark *));`: `dark:` si attiva con la classe `.dark` su `<html>`. Lo script in `index.html` la applica prima del primo paint (niente lampo bianco).
- Font di questa app: **Bricolage Grotesque 800** per i titoli (`font-display` + `uppercase`), **Plus Jakarta Sans** per il testo, **Red Hat Mono** per etichette e cifre (`tabular-nums` per evitare che i numeri "ballino"), tutti self-hosted con Fontsource.
- Le uniche regole non esprimibili con classi sono i valori dinamici (altezza delle barre del grafico): stile inline.
- Classi ripetute estratte in componenti (`Button`, `TextField`, `NumberField`, `Checkbox`).
- Tutti i controlli cliccabili hanno `cursor-pointer` e un focus visibile.

## 10. Pubblicazione su GitHub e Vercel

1. Crea un repository **pubblico** su GitHub (senza README, ce n'è già uno).
2. Nella cartella del progetto:
   ```bash
   git init
   git add .
   git commit -m "Focus Timer"
   git branch -M main
   git remote add origin https://github.com/TUO-UTENTE/focus-timer.git
   git push -u origin main
   ```
   `.gitignore` esclude già `node_modules` e `dist`.
3. Su [vercel.com](https://vercel.com) → **Add New… → Project** → importa il repository.
4. Vercel riconosce Vite: *Build Command* `npm run build`, *Output Directory* `dist`. Premi **Deploy**.
5. Copia l'URL nella riga **Live demo** del `README.md`, fai commit e push. Le notifiche funzionano su HTTPS (Vercel lo fornisce).

## 11. Domande da colloquio

1. **Perché non decrementi un contatore con `setInterval`?** Deriva, throttling delle schede in background, sospensione del computer, perdita al reload. Si salva `endsAt` e si calcola la differenza.
2. **A cosa serve `useSyncExternalStore` e perché qui?** Legge una fonte esterna a React (un orologio condiviso) in modo coerente, senza tearing né valori vecchi; un solo `setInterval` per tutta l'app.
3. **Perché il reducer non può chiamare `Date.now()`?** Deve essere puro: lo stesso input dà lo stesso output. Il tempo arriva nelle azioni (`now`), così è anche testabile.
4. **Cosa succede in StrictMode e come hai evitato la doppia sessione?** In sviluppo gli effect girano due volte: un `useRef` ricorda l'`endsAt` già gestito, e il reducer ignora `phase_completed` se la fase non è scaduta.
5. **Perché due store Zustand separati?** Cambiano per ragioni diverse: chi legge le impostazioni non si aggiorna per le sessioni.
6. **Perché il timer sta nel reducer e non in Zustand?** Una macchina a stati con transizioni esplicite si esprime meglio con azioni tipizzate; il reducer è una funzione pura facile da testare.
7. **Come sopravvive il timer a un ricaricamento?** Lo stato (con `endsAt`) è salvato in `localStorage`; all'avvio un inizializzatore pigro lo legge e lo valida.
8. **Perché `useRef` in `useHotkeys`?** Il listener si registra una volta ma deve vedere gli handler più recenti, senza rimuoverlo e riaggiungerlo a ogni render.
9. **Come gestisci i permessi di audio e notifiche?** Solo da gesti dell'utente: `AudioContext` si sblocca col clic su Start, i permessi si chiedono quando si attiva l'opzione.
10. **Quali sono i limiti in una scheda in background?** I timer possono essere rallentati dal browser: il tempo resta corretto ma suono e notifica possono ritardare; soluzioni: Web Worker, Service Worker, server.

## 12. Esercizi (in ordine di difficoltà)

1. **Nuova scorciatoia.** Aggiungi il tasto `1`, `2`, `3` per passare a focus / pausa breve / pausa lunga. Dove aggiungi le funzioni e perché non devi toccare l'hook?
2. **Obiettivo giornaliero.** Aggiungi un'impostazione "obiettivo: N sessioni al giorno" e mostra una barra di avanzamento in `StatsPanel`. Quale store la ospita e come la validi?
3. **Test del reducer.** Installa Vitest e scrivi i test elencati nella sezione 8: nessun componente da renderizzare. Perché `now` come parametro li rende semplici?
4. **Meno render.** Usa il Profiler di React DevTools: quali componenti si ri-renderizzano ogni secondo? Sposta `useNow` in modo che solo il minimo indispensabile si aggiorni.
5. **Tick in un Web Worker.** Sposta il `setInterval` in un Worker per resistere al throttling delle schede in background. Come cambia `clock.ts` e `subscribeClock`?
