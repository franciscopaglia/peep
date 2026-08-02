import type { Status } from '@/lib/lesson-machine';

/**
 * The shared look of an answer element across exercise types. Colors are read
 * from the theme tokens (see index.css) so light/dark needs no branching here;
 * these are inline because they're chosen from live grading state.
 */

/**
 * Border/background/text colors for an answer element by grading status.
 * While the exercise is active, `lit` elements use the accent scheme and
 * unlit ones (an empty blank, the idle input) stay neutral.
 */
export function answerColors(status: Status, lit = true) {
  if (status === 'wrong')
    return { border: 'var(--danger)', bg: 'var(--danger-soft)', color: 'var(--danger)' };
  if (status === 'correct')
    return { border: 'var(--success)', bg: 'var(--success-soft)', color: 'var(--success)' };
  return lit
    ? { border: 'var(--accent-border)', bg: 'var(--accent-soft)', color: 'var(--accent)' }
    : { border: 'var(--border)', bg: 'transparent', color: 'var(--accent)' };
}

/** A tile/word in a tap pool: greyed out once used, a flat card otherwise. */
export function poolTileStyle(used: boolean, status: Status) {
  return {
    border: '2px solid var(--border)',
    background: used ? 'var(--locked-bg)' : 'var(--card)',
    color: used ? 'transparent' : 'var(--foreground)',
    cursor: used || status !== 'active' ? 'default' : 'pointer',
    boxShadow: used ? 'none' : 'var(--shadow-sm)',
  };
}

/** A match cell, on either side of the pairing grid. */
export function matchCellColors(matched: boolean, wrong: boolean, sel: boolean) {
  if (matched)
    return { border: 'var(--success)', bg: 'var(--success-soft)', color: 'var(--success)' };
  if (wrong)
    return { border: 'var(--danger)', bg: 'var(--danger-soft)', color: 'var(--danger)' };
  if (sel) return { border: 'var(--accent)', bg: 'var(--accent-soft)', color: 'var(--accent)' };
  return { border: 'var(--border)', bg: 'var(--card)', color: 'var(--foreground)' };
}

/**
 * A tappable option (a choice button, a word in a `spot` sentence): neutral,
 * accented while picked, then green for the right answer and red for a wrong
 * pick once graded.
 */
export function optionColors(status: Status, isSel: boolean, isAnswer: boolean) {
  if (status === 'active')
    return isSel
      ? { bd: 'var(--accent)', bg: 'var(--accent-soft)', col: 'var(--accent)', anim: 'none' }
      : { bd: 'var(--border)', bg: 'var(--card)', col: 'var(--foreground)', anim: 'none' };
  if (isAnswer)
    return {
      bd: 'var(--success)',
      bg: 'var(--success-soft)',
      col: 'var(--success)',
      anim: 'none',
    };
  if (isSel)
    return {
      bd: 'var(--danger)',
      bg: 'var(--danger-soft)',
      col: 'var(--danger)',
      anim: 'shvShake .3s ease',
    };
  return { bd: 'var(--border)', bg: 'var(--card)', col: 'var(--muted-foreground)', anim: 'none' };
}

/** The slide-up every exercise card enters with. */
export const enterAnimation = { animation: 'shvSlideUp .3s ease' } as const;
