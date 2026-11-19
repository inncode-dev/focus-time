# Brief 04 — Focus Timer

**Stack:** React + Vite + TypeScript + Tailwind + Zustand

Sei un senior frontend developer e un mentor. Crea questo progetto portfolio per un frontend developer che lo presenterà ai colloqui: deve saperne spiegare ogni scelta, quindi il codice e la guida devono essere chiari prima che sofisticati.

## Il progetto

**Campo d'uso:** Timer Pomodoro per lavorare a blocchi di concentrazione, con storico delle sessioni e statistiche.

**Dati:** Impostazioni e sessioni salvate in localStorage (middleware `persist` di Zustand); anche il timer in corso viene salvato, così sopravvive a un ricaricamento. Al primo avvio alcune sessioni demo negli ultimi giorni.

### Funzionalità
- Ciclo Pomodoro: sessione di focus → pausa breve; ogni N sessioni (default 4) una pausa lunga. Si può anche passare a mano a una fase.
- Avvia, pausa, riprendi, azzera, salta la fase.
- Durate configurabili (focus, pausa breve, pausa lunga, ogni quante sessioni la pausa lunga) con validazione.
- Etichetta opzionale "su cosa stai lavorando" salvata con la sessione.
- Anello di avanzamento in SVG con il tempo rimanente, indicatore delle sessioni del ciclo.
- Alla fine di una fase: suono (Web Audio, senza file audio), notifica del browser (opzionale, chiesta con un clic) e avvio automatico della fase successiva (opzionale).
- Titolo della scheda con il conto alla rovescia, anche quando la scheda è in background.
- Scorciatoie da tastiera: Spazio avvia/mette in pausa, R azzera, S salta (quando non si sta scrivendo in un campo).
- Storico delle sessioni di oggi (con eliminazione) e statistiche: minuti di focus oggi, sessioni oggi, ore totali e grafico a barre degli ultimi 7 giorni, fatto con Tailwind senza librerie.

### Gestione dello stato
- **useReducer + useContext** per il timer: è una macchina a stati (fase: focus / pausa breve / pausa lunga; stato: fermo / in corso / in pausa) con azioni tipizzate come discriminated union. Il reducer deve restare puro: il tempo (`now`) arriva nelle azioni.
- **Zustand** per impostazioni e storico delle sessioni (due store piccoli e separati, con `persist` e selettori). La guida spiega perché il timer è nel reducer e non in Zustand, e perché impostazioni e sessioni sì.
- `useState` per lo stato locale (campi del form delle impostazioni, conferme).

### Hook e concetti da usare
- Il tempo si calcola da un timestamp di fine (`endsAt`), non decrementando un contatore a ogni tick: così il timer resta preciso in una scheda in background e dopo un ricaricamento. La guida deve spiegare il problema della deriva (drift) di `setInterval`.
- `useSyncExternalStore` per l'orologio condiviso (un solo `setInterval` per tutta l'app, attivo solo finché qualcuno lo ascolta)
- `useEffect` con cleanup (scorciatoie da tastiera, titolo della scheda, rilevamento della fine fase) e `useRef` per evitare doppie esecuzioni (anche in StrictMode)
- `useMemo` per le statistiche
- `useId` per i form
- custom hook: `useNow`, `useHotkeys`, `useDocumentTitle`
- Web API: Notification, Web Audio, Page Visibility

### Nota
La guida deve spiegare bene **perché** un timer "decrementato a ogni secondo" è sbagliato e come si testa un reducer puro.

## Regole comuni

### Codice
- TypeScript in modalità strict. Codice, nomi e commenti nel codice in **inglese**.
- Livello: né banale né complesso. Codice pulito, leggibile, da professionista.
- Gestione dello stato: **useContext, useReducer e Zustand**, ciascuno dove ha senso (vedi la sezione "Gestione dello stato" del progetto). Niente Redux, niente UI kit, niente librerie di drag and drop: devono emergere React e gli hook.
- Commenti utili: spiegano il *perché* di una scelta, non ripetono il codice.
- Struttura cartelle chiara: `components/`, `hooks/`, `store/` o `state/`, `lib/`, `types.ts`.
- Accessibilità: label collegate agli input, attributi aria dove servono, focus visibile, controlli usabili da tastiera.
- Responsive fino a 375px di larghezza.

### Stile
- **Tailwind CSS (v4)**, niente file CSS custom se non per i design tokens.
- La grafica non è il focus, ma deve essere curata e **discreta**: pulita, ordinata, coerente, con buona spaziatura e gerarchia tipografica. Niente effetti vistosi, gradienti o animazioni superflue.
- Design tokens di inncode.dev definiti come tema Tailwind (`@theme`):

  | Token | Colore |
  | --- | --- |
  | paper | `#ededea` |
  | surface | `#f7f7f5` |
  | ink | `#111111` |
  | muted | `#62625e` |
  | line | `#d2d2cc` |
  | accent | `#4f6b78` |
  | mint | `#dcf2d2` |

- Font (identità propria di questa app): **Bricolage Grotesque 800** per i titoli (maiuscolo), **Plus Jakarta Sans** per il testo, **Red Hat Mono** per etichette e dettagli. Self-hosted con Fontsource.
- Tema chiaro e scuro con la variante `dark:` di Tailwind.
- **Cursore:** ogni link, bottone o icona che esegue un'azione deve avere `cursor-pointer` (Tailwind v4 non lo applica ai bottoni di default). I controlli disabilitati usano `cursor-not-allowed`. Centralizzalo nei componenti condivisi (`Button`, `IconButton`) invece di ripeterlo.
- **Select:** l'icona (chevron) della select deve avere uno spazio a destra dal bordo (es. `appearance-none` + icona posizionata con `right-3` e `pr-9` sul campo), non incollata al bordo come nel rendering nativo. Fai un componente `Select` condiviso.
- Classi leggibili: se un elemento ne accumula troppe, estrailo in un componente invece di ripetere le stesse classi.
- Header con l'etichetta **"InnCode Lab · Project 04"**.

### Pubblicazione
- Pronto per GitHub pubblico e Vercel: `.gitignore`, favicon, meta description.

## Documentazione da produrre

1. **README.md in inglese**: descrizione, funzionalità, tabella "concetto → file", stack, comandi, struttura delle cartelle, riga "Live demo" da compilare.
2. **GUIDA.md in italiano**, dettagliata e didattica, con queste sezioni:
   1. Cosa fa l'app
   2. Come avviarla (comandi spiegati)
   3. Dove sono le cose (albero dei file con una riga per file)
   4. Il percorso dei dati: un'azione seguita passo passo dal click al risultato
   5. La gestione dello stato: cosa sta dove e perché (Context, Reducer, Zustand o stato locale)
   6. Ogni hook spiegato nel punto esatto in cui è usato: a cosa serve, perché qui e non un'alternativa, errori comuni
   7. I concetti TypeScript usati
   8. Le parti specifiche del progetto
   9. Lo stile: come è configurato Tailwind e dove sono i token
   10. Pubblicazione su GitHub e Vercel passo passo
   11. 8–10 domande da colloquio su questo progetto
   12. 5 esercizi in ordine di difficoltà per verificare di aver capito

## Verifica obbligatoria prima di consegnare
- `npm run build` senza errori TypeScript.
- Prova nel browser di tutte le funzionalità, anche su mobile e in tema scuro.
- Nessun errore in console.

Alla fine riassumi cosa hai fatto e aspetta la mia conferma.
