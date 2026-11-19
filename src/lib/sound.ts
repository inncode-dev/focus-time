// A short two-note chime made with the Web Audio API: no audio file to download or license.

let context: AudioContext | null = null

/** Browsers only allow audio after a user gesture, so call this from a click handler (the Start button). */
export function prepareSound(): void {
  if (typeof AudioContext === 'undefined') return
  context ??= new AudioContext()
  void context.resume()
}

export function playChime(): void {
  if (!context) return
  const start = context.currentTime
  ;[660, 880].forEach((frequency, i) => {
    const oscillator = context!.createOscillator()
    const gain = context!.createGain()
    oscillator.frequency.value = frequency
    oscillator.connect(gain).connect(context!.destination)
    const noteStart = start + i * 0.25
    // A quick fade in/out avoids the "click" of a note that starts and stops abruptly.
    gain.gain.setValueAtTime(0, noteStart)
    gain.gain.linearRampToValueAtTime(0.2, noteStart + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.4)
    oscillator.start(noteStart)
    oscillator.stop(noteStart + 0.45)
  })
}
