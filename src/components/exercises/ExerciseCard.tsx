import type { ExerciseProps } from './props';
import { TeachCard } from './TeachCard';
import { ChoiceCard } from './ChoiceCard';
import { TypeCard } from './TypeCard';
import { BuildCard } from './BuildCard';
import { ArrangeCard } from './ArrangeCard';
import { CompleteCard } from './CompleteCard';
import { FillCard } from './FillCard';
import { ClozeCard } from './ClozeCard';
import { SpotCard } from './SpotCard';
import { TranscribeCard } from './TranscribeCard';
import { WriteCard } from './WriteCard';
import { MatchCard } from './MatchCard';
import { ListenCard } from './ListenCard';
import { SortCard } from './SortCard';
import { ScanCard } from './ScanCard';

/**
 * Renders whichever card the exercise calls for — the one place that knows the
 * mapping from `Exercise['type']` to a component.
 *
 * The switch is exhaustive: `exercise satisfies never` at the end means adding
 * a member to the `Exercise` union fails to compile until it is rendered here.
 * That, plus a branch in `isCorrect`, is what a new exercise type needs.
 */
export function ExerciseCard(props: ExerciseProps) {
  const { exercise } = props;
  switch (exercise.type) {
    case 'teach':
      return <TeachCard {...props} exercise={exercise} />;
    case 'choice':
      return <ChoiceCard {...props} exercise={exercise} />;
    case 'type':
      return <TypeCard {...props} exercise={exercise} />;
    case 'build':
      return <BuildCard {...props} exercise={exercise} />;
    case 'arrange':
      return <ArrangeCard {...props} exercise={exercise} />;
    case 'complete':
      return <CompleteCard {...props} exercise={exercise} />;
    case 'fill':
      return <FillCard {...props} exercise={exercise} />;
    case 'cloze':
      return <ClozeCard {...props} exercise={exercise} />;
    case 'spot':
      return <SpotCard {...props} exercise={exercise} />;
    case 'transcribe':
      return <TranscribeCard {...props} exercise={exercise} />;
    case 'write':
      return <WriteCard {...props} exercise={exercise} />;
    case 'match':
      return <MatchCard {...props} exercise={exercise} />;
    case 'listen':
      return <ListenCard {...props} exercise={exercise} />;
    case 'sort':
      return <SortCard {...props} exercise={exercise} />;
    case 'scan':
      return <ScanCard {...props} exercise={exercise} />;
    default:
      exercise satisfies never;
      return null;
  }
}
