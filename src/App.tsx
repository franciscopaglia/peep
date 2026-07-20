import { useEffect, useState, useCallback } from 'react';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { Landing } from '@/views/Landing';
import { About } from '@/views/About';
import { Resources } from '@/views/Resources';
import { Dashboard } from '@/views/Dashboard';
import { Lesson } from '@/views/Lesson';
import { Complete } from '@/views/Complete';
import { LESSON_META, SPINE_META, getLessonExercises, shuffleExerciseOptions, type Exercise } from '@/lessons';
import { isCorrect, gradeableCount, lessonPassed, PASS_THRESHOLD } from '@/lib/grading';
import type { View } from '@/types';

type Status = 'active' | 'correct' | 'wrong';

/**
 * One exercise's saved work. Stepping back and forth restores these instead of
 * resetting, so an answer is never lost — and a graded one comes back `correct`
 * or `wrong`, which is what locks its inputs and stops it being scored twice.
 */
type Attempt = {
  selected: string | null;
  typedValue: string;
  status: Status;
  matchedKeys: string[];
  buildSel: number[];
  arrangeSel: number[];
  fillSel: number[];
};

const emptyAttempt: Attempt = {
  selected: null,
  typedValue: '',
  status: 'active',
  matchedKeys: [],
  buildSel: [],
  arrangeSel: [],
  fillSel: [],
};

const PROGRESS_KEY = 'shavian-progress';

function useProgress() {
  const [completedCount, setCompletedCount] = useState(() => {
    const stored = Number(localStorage.getItem(PROGRESS_KEY));
    return Number.isFinite(stored) && stored > 0 ? stored : 0;
  });
  useEffect(() => {
    localStorage.setItem(PROGRESS_KEY, String(completedCount));
  }, [completedCount]);
  return [completedCount, setCompletedCount] as const;
}

const BRANCHES_KEY = 'shavian-branches';

/**
 * Completed optional branch lessons, kept as a set of ids separate from the
 * linear spine progress so a branch never advances the course or gates a lesson.
 */
function useBranchProgress() {
  const [completed, setCompleted] = useState<Set<number>>(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(BRANCHES_KEY) ?? '[]');
      return new Set(Array.isArray(raw) ? raw.filter((n) => typeof n === 'number') : []);
    } catch {
      return new Set();
    }
  });
  useEffect(() => {
    localStorage.setItem(BRANCHES_KEY, JSON.stringify([...completed]));
  }, [completed]);
  const markBranchDone = useCallback((id: number) => {
    setCompleted((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  }, []);
  return [completed, markBranchDone] as const;
}

const THEME_KEY = 'shavian-theme';

function systemPrefersDark() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

function useDarkMode() {
  // `null` means "follow the system"; 'dark'/'light' is an explicit choice.
  const [preference, setPreference] = useState<'dark' | 'light' | null>(() => {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === 'dark' || stored === 'light' ? stored : null;
  });
  const [systemDark, setSystemDark] = useState(systemPrefersDark);

  // Track the OS theme so we can follow it while no explicit choice is set.
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return;
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const dark = preference === null ? systemDark : preference === 'dark';

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const toggle = useCallback(() => {
    setPreference((prev) => {
      const currentlyDark = prev === null ? systemPrefersDark() : prev === 'dark';
      const next = currentlyDark ? 'light' : 'dark';
      localStorage.setItem(THEME_KEY, next);
      return next;
    });
  }, []);

  return [dark, toggle] as const;
}

export default function App() {
  const [view, setViewRaw] = useState<View>('landing');
  const [dark, toggleMode] = useDarkMode();
  const [completedCount, setCompletedCount] = useProgress();
  const [completedBranches, markBranchDone] = useBranchProgress();
  const [activeLessonId, setActiveLessonId] = useState(1);

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exIndex, setExIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [typedValue, setTypedValue] = useState('');
  const [status, setStatus] = useState<Status>('active');
  const [matchSelLeft, setMatchSelLeft] = useState<string | null>(null);
  const [matchSelRight, setMatchSelRight] = useState<string | null>(null);
  const [matchedKeys, setMatchedKeys] = useState<string[]>([]);
  const [matchWrong, setMatchWrong] = useState(false);
  const [buildSel, setBuildSel] = useState<number[]>([]);
  const [arrangeSel, setArrangeSel] = useState<number[]>([]);
  // Shared by 'complete' and 'fill': bank indices chosen for the blanks, in order.
  const [fillSel, setFillSel] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  // Work saved per exercise index, and how far into the lesson we've reached —
  // you can navigate over ground you've seen, but not jump ahead of it.
  const [attempts, setAttempts] = useState<Record<number, Attempt>>({});
  const [furthest, setFurthest] = useState(0);

  const setView = useCallback((v: View) => {
    setViewRaw(v);
    window.scrollTo(0, 0);
  }, []);

  const applyAttempt = useCallback((a: Attempt) => {
    setSelected(a.selected);
    setTypedValue(a.typedValue);
    setStatus(a.status);
    setMatchedKeys(a.matchedKeys);
    setBuildSel(a.buildSel);
    setArrangeSel(a.arrangeSel);
    setFillSel(a.fillSel);
    // A half-finished match tap is mid-gesture state, never worth restoring.
    setMatchSelLeft(null);
    setMatchSelRight(null);
    setMatchWrong(false);
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
      const lessonExercises = getLessonExercises(id);
      if (lessonExercises.length === 0) return;
      setActiveLessonId(id);
      setExercises(lessonExercises);
      setExIndex(0);
      applyAttempt(emptyAttempt);
      setAttempts({});
      setFurthest(0);
      setScore(0);
      setView('lesson');
    },
    [completedCount, setView, applyAttempt]
  );

  const continueCurrent = useCallback(() => {
    const id = Math.min(completedCount + 1, SPINE_META.length);
    startLesson(id);
  }, [completedCount, startLesson]);

  const closeLesson = useCallback(() => setView('dashboard'), [setView]);

  const unlockThrough = useCallback(
    (lessonId: number) => {
      setCompletedCount((c) => Math.max(c, lessonId));
    },
    [setCompletedCount]
  );

  /**
   * Move within the exercises already reached, saving the current work and
   * restoring the target's. Score is never touched: a point is awarded once, by
   * `checkAnswer`, and revisiting a graded exercise can't re-award it because
   * its restored status is no longer 'active'.
   */
  const goTo = useCallback(
    (index: number) => {
      if (index === exIndex || index < 0 || index >= exercises.length) return;
      setAttempts((prev) => ({
        ...prev,
        [exIndex]: { selected, typedValue, status, matchedKeys, buildSel, arrangeSel, fillSel },
      }));
      applyAttempt(attempts[index] ?? emptyAttempt);
      setExIndex(index);
      setFurthest((f) => Math.max(f, index));
    },
    [
      exIndex,
      exercises.length,
      attempts,
      applyAttempt,
      selected,
      typedValue,
      status,
      matchedKeys,
      buildSel,
      arrangeSel,
      fillSel,
    ]
  );

  const goBack = useCallback(() => goTo(exIndex - 1), [goTo, exIndex]);
  const goForward = useCallback(() => goTo(exIndex + 1), [goTo, exIndex]);

  const continueNext = useCallback(() => {
    const nextIndex = exIndex + 1;
    if (nextIndex >= exercises.length) {
      const passed = lessonPassed(score, gradeableCount(exercises));
      setView('complete');
      // Only mark complete when the pass threshold is met. A branch records
      // its own completion and never advances the spine; a spine lesson unlocks
      // the next one.
      if (passed) {
        const meta = LESSON_META.find((l) => l.id === activeLessonId);
        if (meta?.optional) markBranchDone(activeLessonId);
        else setCompletedCount((c) => Math.max(c, activeLessonId));
      }
      return;
    }
    goTo(nextIndex);
  }, [exIndex, exercises, score, activeLessonId, setView, setCompletedCount, markBranchDone, goTo]);

  const checkAnswer = useCallback(() => {
    const ex = exercises[exIndex];
    if (!ex) return;
    const correct = isCorrect(ex, {
      selected,
      typedValue,
      buildSel,
      arrangeSel,
      fillSel,
    });

    setStatus(correct ? 'correct' : 'wrong');
    if (correct && !ex.retry) setScore((s) => s + 1);
    if (!correct && !ex.retry) {
      setExercises((list) => [
        ...list,
        { ...shuffleExerciseOptions(ex), retry: true },
      ]);
    }
  }, [exercises, exIndex, selected, typedValue, buildSel, arrangeSel, fillSel]);

  const selectOption = useCallback(
    (opt: string) => {
      if (status !== 'active') return;
      setSelected(opt);
    },
    [status]
  );

  const onTypeChange = useCallback(
    (v: string) => {
      if (status !== 'active') return;
      setTypedValue(v);
    },
    [status]
  );

  const buildAdd = useCallback(
    (i: number) => {
      if (status !== 'active' || buildSel.includes(i)) return;
      setBuildSel((s) => [...s, i]);
    },
    [status, buildSel]
  );

  const buildRemove = useCallback(
    (pos: number) => {
      if (status !== 'active') return;
      setBuildSel((s) => s.filter((_, p) => p !== pos));
    },
    [status]
  );

  const arrangeAdd = useCallback(
    (i: number) => {
      if (status !== 'active' || arrangeSel.includes(i)) return;
      setArrangeSel((s) => [...s, i]);
    },
    [status, arrangeSel]
  );

  const arrangeRemove = useCallback(
    (pos: number) => {
      if (status !== 'active') return;
      setArrangeSel((s) => s.filter((_, p) => p !== pos));
    },
    [status]
  );

  const fillAdd = useCallback(
    (i: number) => {
      if (status !== 'active') return;
      const ex = exercises[exIndex];
      if (
        !ex ||
        (ex.type !== 'complete' && ex.type !== 'fill' && ex.type !== 'cloze')
      )
        return;
      setFillSel((s) =>
        s.includes(i) || s.length >= ex.blanks.length ? s : [...s, i]
      );
    },
    [status, exercises, exIndex]
  );

  const fillRemove = useCallback(
    (pos: number) => {
      if (status !== 'active') return;
      setFillSel((s) => s.filter((_, p) => p !== pos));
    },
    [status]
  );

  const matchClick = useCallback(
    (side: 'left' | 'right', value: string) => {
      const ex = exercises[exIndex];
      if (!ex || ex.type !== 'match') return;
      if (matchWrong) return;
      if (side === 'left') {
        if (matchedKeys.includes(value)) return;
        setMatchSelLeft((prev) => (prev === value ? null : value));
      } else {
        const key = Object.keys(ex.pairs).find((k) => ex.pairs[k] === value);
        if (key && matchedKeys.includes(key)) return;
        setMatchSelRight((prev) => (prev === value ? null : value));
      }
    },
    [exercises, exIndex, matchWrong, matchedKeys]
  );

  useEffect(() => {
    if (!matchSelLeft || !matchSelRight) return;
    const ex = exercises[exIndex];
    if (!ex || ex.type !== 'match') return;
    const isPair = ex.pairs[matchSelLeft] === matchSelRight;
    if (isPair) {
      const next = [...matchedKeys, matchSelLeft];
      setMatchedKeys(next);
      setMatchSelLeft(null);
      setMatchSelRight(null);
      if (next.length === Object.keys(ex.pairs).length) {
        setStatus('correct');
        setScore((s) => s + 1);
      }
    } else {
      setMatchWrong(true);
      const t = window.setTimeout(() => {
        setMatchWrong(false);
        setMatchSelLeft(null);
        setMatchSelRight(null);
      }, 500);
      return () => window.clearTimeout(t);
    }
  }, [matchSelLeft, matchSelRight, exercises, exIndex, matchedKeys]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Enter' || view !== 'lesson') return;
      const ex = exercises[exIndex];
      if (!ex) return;
      // Stop a focused button from also firing its click on this same Enter,
      // which would advance twice and silently skip an exercise.
      if (status !== 'active') {
        e.preventDefault();
        continueNext();
        return;
      }
      if (ex.type === 'teach') {
        e.preventDefault();
        continueNext();
        return;
      }
      const canCheck =
        ex.type === 'type' || ex.type === 'transcribe' || ex.type === 'write'
          ? typedValue.trim().length > 0
          : ex.type === 'choice' || ex.type === 'spot'
            ? selected != null
            : ex.type === 'build'
              ? buildSel.length > 0
              : ex.type === 'arrange'
                ? arrangeSel.length > 0
                : ex.type === 'complete' || ex.type === 'fill' || ex.type === 'cloze'
                  ? fillSel.length === ex.blanks.length
                  : false;
      if (canCheck) {
        e.preventDefault();
        checkAnswer();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [view, exercises, exIndex, status, typedValue, selected, buildSel, arrangeSel, fillSel, continueNext, checkAnswer]);

  const currentExercise = exercises[exIndex];
  const activeLessonTitle =
    LESSON_META.find((l) => l.id === activeLessonId)?.title ?? '';
  const gradeableTotal = gradeableCount(exercises);
  const passed = lessonPassed(score, gradeableTotal);

  // The lesson counter / progress bar count only graded exercises (skip teach
  // cards) so the "X / Y" during the lesson matches the "score / Y" at the end.
  const gradedBefore = exercises
    .slice(0, exIndex)
    .filter((e) => e.type !== 'teach' && !e.retry).length;
  const currentIsGraded = currentExercise ? currentExercise.type !== 'teach' : false;
  const gradedStep =
    Math.min(gradedBefore + (currentIsGraded ? 1 : 0), gradeableTotal) ||
    (gradeableTotal ? 1 : 0);
  const gradedProgressPct = gradeableTotal
    ? Math.round(
        ((gradedBefore + (currentIsGraded && status !== 'active' ? 1 : 0)) /
          gradeableTotal) *
          100
      )
    : 0;

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
          exIndex={exIndex}
          exTotal={exercises.length}
          gradedStep={gradedStep}
          gradedTotal={gradeableTotal}
          progressPct={gradedProgressPct}
          lessonId={activeLessonId}
          lessonTitle={activeLessonTitle}
          status={status}
          canGoBack={exIndex > 0}
          canGoForward={exIndex < furthest}
          onGoBack={goBack}
          onGoForward={goForward}
          selected={selected}
          typedValue={typedValue}
          buildSel={buildSel}
          arrangeSel={arrangeSel}
          fillSel={fillSel}
          matchSelLeft={matchSelLeft}
          matchSelRight={matchSelRight}
          matchedKeys={matchedKeys}
          matchWrong={matchWrong}
          onClose={closeLesson}
          onSelectOption={selectOption}
          onTypeChange={onTypeChange}
          onCheckAnswer={checkAnswer}
          onSkip={continueNext}
          onContinueNext={continueNext}
          onBuildAdd={buildAdd}
          onBuildRemove={buildRemove}
          onArrangeAdd={arrangeAdd}
          onArrangeRemove={arrangeRemove}
          onFillAdd={fillAdd}
          onFillRemove={fillRemove}
          onMatchClick={matchClick}
        />
      )}

      {view === 'complete' && (
        <Complete
          score={score}
          total={gradeableTotal}
          passed={passed}
          passThresholdPct={Math.round(PASS_THRESHOLD * 100)}
          onBack={closeLesson}
          onRetry={() => startLesson(activeLessonId)}
        />
      )}

      {view !== 'lesson' && (
        <Footer onSetView={setView} />
      )}
    </div>
  );
}
