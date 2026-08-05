import type { WriteExercise } from '@/lessons/types';
import type { ExerciseProps } from './props';
import { ShavianKeyboard } from './ShavianKeyboard';
import { enterAnimation } from '@/lib/exercise-style';

/** Spell the English prompt in Shavian on the on-screen keyboard. */
export function WriteCard({
  exercise,
  status,
  typedValue,
  onTypeChange,
}: ExerciseProps<WriteExercise>) {
  return (
    <div className="w-full flex flex-col items-center gap-6" style={enterAnimation}>
      <div className="text-center">
        <div className="text-[26px] font-semibold text-foreground">“{exercise.prompt}”</div>
        <div className="text-sm text-muted-foreground mt-2">{exercise.caption}</div>
      </div>
      <ShavianKeyboard
        answers={[exercise.correct, ...(exercise.accept ?? [])]}
        typedValue={typedValue}
        status={status}
        onTypeChange={onTypeChange}
      />
    </div>
  );
}
