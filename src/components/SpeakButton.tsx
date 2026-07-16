import { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { useSpeech } from 'react-text-to-speech';
import { NORMAL_RATE, SPEECH_LANG, SPEECH_VOICE, nextRate } from '@/lib/speech';
import { cn } from '@/lib/utils';

/**
 * Speaks `text` aloud. The first tap reads at normal speed; tapping again
 * alternates between a slow reading and normal speed, so a learner can hear a
 * name drawn out without leaving the card.
 */
export function SpeakButton({
  text,
  label,
  className,
}: {
  text: string;
  label: string;
  className?: string;
}) {
  const [rate, setRate] = useState(NORMAL_RATE);
  // The text is fixed per button, so it's given at mount: `useSpeech` defers
  // text changes through a timeout, and text handed over at click time isn't
  // ready yet when `start` fires — the first tap would speak an empty string.
  //
  // The rate flips only once a reading finishes: changing it mid-speech makes
  // the library stop and restart the utterance at the new rate, so one tap
  // would be heard twice.
  const { start } = useSpeech({
    text,
    rate,
    voiceURI: SPEECH_VOICE,
    lang: SPEECH_LANG,
    stableText: true,
    onStop: () => setRate(nextRate),
  });

  return (
    <button
      type="button"
      onClick={start}
      aria-label={label}
      className={cn(
        'flex-none w-8 h-8 rounded-btn border-none bg-transparent text-muted-foreground cursor-pointer flex items-center justify-center hover:text-accent',
        className
      )}
    >
      <Volume2 size={16} />
    </button>
  );
}
