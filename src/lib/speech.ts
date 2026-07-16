// Chrome exposes this voice under exactly this voiceURI. Other browsers don't
// have it and fall back to their own voice for `SPEECH_LANG`.
export const SPEECH_VOICE = 'Google US English';
export const SPEECH_LANG = 'en-US';

export const NORMAL_RATE = 1;
export const SLOW_RATE = 0.5;

/**
 * The rate a repeat tap should use: the first listen is at normal speed, and
 * tapping again alternates into a slow reading and back.
 */
export function nextRate(rate: number): number {
  return rate === NORMAL_RATE ? SLOW_RATE : NORMAL_RATE;
}
