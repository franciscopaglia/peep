import { useEffect, useRef, useReducer, useCallback, useState } from 'react';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { Landing } from '@/views/Landing';
import { About } from '@/views/About';
import { Resources } from '@/views/Resources';
import { Dashboard } from '@/views/Dashboard';
import { Lesson } from '@/views/Lesson';
import { Complete } from '@/views/Complete';
import { LESSON_META, SPINE_META, getLessonExercises, prefetchLesson } from '@/lessons';
import { gradeableCount, lessonPassed, PASS_THRESHOLD } from '@/lib/grading';
import {
  lessonReducer,
  initialLessonState,
  lessonProgress,
  canCheck,
  isLastExercise,
} from '@/lib/lesson-machine';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useProgress, useBranchProgress } from '@/hooks/useProgress';
import type { View } from '@/types';

export default function App() {
  const [view, setViewRaw] = useState<View>('landing');
  const [dark, toggleMode] = useDarkMode();
  const [completedCount, setCompletedCount] = useProgress();
  const [completedBranches, markBranchDone] = useBranchProgress();
  const opening = useRef<number | null>(null);

  // All lesson playback — exercises, the current answer, score, navigation —
  // lives in one pure reducer (lib/lesson-machine.ts). This component only
  // owns what isn't a function of that state: the view, and saved progress.
  const [lesson, dispatch] = useReducer(lessonReducer, initialLessonState);

  const setView = useCallback((v: View) => {
    // Navigating anywhere else abandons a lesson chunk still in flight, so it
    // can't drop the learner into a lesson they've already walked away from.
    if (v !== 'lesson') opening.current = null;
    setViewRaw(v);
    window.scrollTo(0, 0);
  }, []);

  const startLesson = useCallback(
    (id: number) => {
      const meta = LESSON_META.find((l) => l.id === id);
      // A branch is available once its anchor spine lesson is done; a spine
      // lesson follows the usual "one at a time" rule.
      if (meta?.optional) {
        if ((meta.anchor ?? Infinity) > completedCount) return;
      } else if (id > completedCount + 1) {
        return;
      }
      // A lesson's exercises live in their own chunk, so opening one is async.
      // `opening` records what was asked for last: a slow chunk that resolves
      // after the learner has tapped something else is dropped rather than
      // yanking them into the wrong lesson.
      opening.current = id;
      void getLessonExercises(id).then((exercises) => {
        if (opening.current !== id || exercises.length === 0) return;
        dispatch({ type: 'start', lessonId: id, exercises });
        setView('lesson');
      });
    },
    [completedCount, setView]
  );

  // Warm the chunk the Continue card would open, so the common path into a
  // lesson costs nothing once the dashboard is on screen.
  useEffect(() => {
    if (view === 'dashboard') prefetchLesson(Math.min(completedCount + 1, SPINE_META.length));
  }, [view, completedCount]);

  const continueCurrent = useCallback(() => {
    startLesson(Math.min(completedCount + 1, SPINE_META.length));
  }, [completedCount, startLesson]);

  const closeLesson = useCallback(() => setView('dashboard'), [setView]);

  const unlockThrough = useCallback(
    (lessonId: number) => setCompletedCount((c) => Math.max(c, lessonId)),
    [setCompletedCount]
  );

  const goTo = useCallback((index: number) => dispatch({ type: 'goTo', index }), []);
  const goBack = useCallback(() => goTo(lesson.exIndex - 1), [goTo, lesson.exIndex]);
  const goForward = useCallback(() => goTo(lesson.exIndex + 1), [goTo, lesson.exIndex]);
  const checkAnswer = useCallback(() => dispatch({ type: 'check' }), []);

  /**
   * Continue past the current exercise — or, at the end, finish the lesson.
   * Only a passing score records completion: a branch records its own and never
   * advances the spine, a spine lesson unlocks the next one.
   */
  const continueNext = useCallback(() => {
    if (!isLastExercise(lesson)) {
      goTo(lesson.exIndex + 1);
      return;
    }
    setView('complete');
    if (lessonPassed(lesson.score, gradeableCount(lesson.exercises))) {
      const meta = LESSON_META.find((l) => l.id === lesson.lessonId);
      if (meta?.optional) markBranchDone(lesson.lessonId);
      else setCompletedCount((c) => Math.max(c, lesson.lessonId));
    }
  }, [lesson, goTo, setView, setCompletedCount, markBranchDone]);

  const selectOption = useCallback((option: string) => dispatch({ type: 'select', option }), []);
  const onTypeChange = useCallback((value: string) => dispatch({ type: 'typed', value }), []);
  const tileAdd = useCallback((index: number) => dispatch({ type: 'tileAdd', index }), []);
  const tileRemove = useCallback(
    (position: number) => dispatch({ type: 'tileRemove', position }),
    []
  );
  const fillAdd = useCallback((index: number) => dispatch({ type: 'fillAdd', index }), []);
  const fillRemove = useCallback(
    (position: number) => dispatch({ type: 'fillRemove', position }),
    []
  );
  const assign = useCallback(
    (item: number, bucket: number) => dispatch({ type: 'assign', item, bucket }),
    []
  );
  const matchClick = useCallback(
    (side: 'left' | 'right', value: string) => dispatch({ type: 'matchClick', side, value }),
    []
  );

  // A wrong match shakes, then clears itself — the only piece of lesson state
  // that moves on a timer rather than on input.
  useEffect(() => {
    if (!lesson.matchWrong) return;
    const t = window.setTimeout(() => dispatch({ type: 'matchReset' }), 500);
    return () => window.clearTimeout(t);
  }, [lesson.matchWrong]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Enter' || view !== 'lesson') return;
      const ex = lesson.exercises[lesson.exIndex];
      if (!ex) return;
      // Stop a focused button from also firing its click on this same Enter,
      // which would advance twice and silently skip an exercise.
      if (lesson.current.status !== 'active' || ex.type === 'teach') {
        e.preventDefault();
        continueNext();
        return;
      }
      if (canCheck(lesson)) {
        e.preventDefault();
        checkAnswer();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [view, lesson, continueNext, checkAnswer]);

  const currentExercise = lesson.exercises[lesson.exIndex];
  const activeLessonTitle = LESSON_META.find((l) => l.id === lesson.lessonId)?.title ?? '';
  const progress = lessonProgress(lesson);
  const passed = lessonPassed(lesson.score, progress.total);

  return (
    <div className="min-h-screen bg-background font-sans">
      {view !== 'lesson' && (
        <Nav
          view={view}
          dark={dark}
          completedCount={completedCount}
          totalLessons={SPINE_META.length}
          onSetView={setView}
          onToggleDark={toggleMode}
        />
      )}

      {view === 'landing' && (
        <Landing
          dark={dark}
          onOpenApp={() => setView('dashboard')}
          onOpenAbout={() => setView('about')}
        />
      )}

      {view === 'about' && <About onOpenApp={() => setView('dashboard')} />}

      {view === 'resources' && <Resources />}

      {view === 'dashboard' && (
        <Dashboard
          completedCount={completedCount}
          completedBranches={completedBranches}
          onStartLesson={startLesson}
          onContinueCurrent={continueCurrent}
          onUnlockThrough={unlockThrough}
        />
      )}

      {view === 'lesson' && currentExercise && (
        <Lesson
          exercise={currentExercise}
          exIndex={lesson.exIndex}
          exTotal={lesson.exercises.length}
          gradedStep={progress.step}
          gradedTotal={progress.total}
          progressPct={progress.percent}
          lessonId={lesson.lessonId}
          lessonTitle={activeLessonTitle}
          status={lesson.current.status}
          canCheck={canCheck(lesson)}
          canGoBack={lesson.exIndex > 0}
          canGoForward={lesson.exIndex < lesson.furthest}
          onGoBack={goBack}
          onGoForward={goForward}
          selected={lesson.current.selected}
          typedValue={lesson.current.typedValue}
          tileSel={lesson.current.tileSel}
          fillSel={lesson.current.fillSel}
          matchSelLeft={lesson.matchSelLeft}
          matchSelRight={lesson.matchSelRight}
          matchedKeys={lesson.current.matchedKeys}
          matchWrong={lesson.matchWrong}
          onClose={closeLesson}
          onSelectOption={selectOption}
          onTypeChange={onTypeChange}
          onCheckAnswer={checkAnswer}
          onSkip={continueNext}
          onContinueNext={continueNext}
          onTileAdd={tileAdd}
          onTileRemove={tileRemove}
          onFillAdd={fillAdd}
          onFillRemove={fillRemove}
          onMatchClick={matchClick}
          onAssign={assign}
        />
      )}

      {view === 'complete' && (
        <Complete
          score={lesson.score}
          total={progress.total}
          passed={passed}
          passThresholdPct={Math.round(PASS_THRESHOLD * 100)}
          onBack={closeLesson}
          onRetry={() => startLesson(lesson.lessonId)}
        />
      )}

      {view !== 'lesson' && <Footer onSetView={setView} />}
    </div>
  );
}
