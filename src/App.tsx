import { useEffect, useState, useCallback } from 'react';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { Landing } from '@/views/Landing';
import { About } from '@/views/About';
import { Resources } from '@/views/Resources';
import { Dashboard } from '@/views/Dashboard';
import { Lesson } from '@/views/Lesson';
import { Complete } from '@/views/Complete';
import { LESSON_META, getLessonExercises, shuffleExerciseOptions, type Exercise } from '@/lessons';
import type { View } from '@/types';

type Status = 'active' | 'correct' | 'wrong';

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
  const [score, setScore] = useState(0);

  const setView = useCallback((v: View) => {
    setViewRaw(v);
    window.scrollTo(0, 0);
  }, []);

  const resetExerciseState = useCallback(() => {
    setSelected(null);
    setTypedValue('');
    setStatus('active');
    setMatchSelLeft(null);
    setMatchSelRight(null);
    setMatchedKeys([]);
    setMatchWrong(false);
    setBuildSel([]);
    setArrangeSel([]);
  }, []);

  const startLesson = useCallback(
    (id: number) => {
      if (id > completedCount + 1) return;
      const lessonExercises = getLessonExercises(id);
      if (lessonExercises.length === 0) return;
      setActiveLessonId(id);
      setExercises(lessonExercises);
      setExIndex(0);
      resetExerciseState();
      setScore(0);
      setView('lesson');
    },
    [completedCount, setView, resetExerciseState]
  );

  const continueCurrent = useCallback(() => {
    const id = Math.min(completedCount + 1, LESSON_META.length);
    startLesson(id);
  }, [completedCount, startLesson]);

  const closeLesson = useCallback(() => setView('dashboard'), [setView]);

  const continueNext = useCallback(() => {
    setExIndex((i) => {
      const nextIndex = i + 1;
      if (nextIndex >= exercises.length) {
        setView('complete');
        setCompletedCount((c) => Math.max(c, activeLessonId));
        return i;
      }
      resetExerciseState();
      return nextIndex;
    });
  }, [exercises.length, activeLessonId, setView, setCompletedCount, resetExerciseState]);

  const checkAnswer = useCallback(() => {
    const ex = exercises[exIndex];
    if (!ex) return;
    let correct = false;
    if (ex.type === 'choice') correct = selected === ex.correct;
    if (ex.type === 'type')
      correct = typedValue.trim().toLowerCase() === ex.correct.toLowerCase();
    if (ex.type === 'build')
      correct = buildSel.map((i) => ex.tiles[i]).join('') === ex.answer.join('');
    if (ex.type === 'arrange')
      correct = arrangeSel.map((i) => ex.tiles[i]).join(' ') === ex.answer.join(' ');

    setStatus(correct ? 'correct' : 'wrong');
    if (correct && !ex.retry) setScore((s) => s + 1);
    if (!correct && !ex.retry) {
      setExercises((list) => [
        ...list,
        { ...shuffleExerciseOptions(ex), retry: true },
      ]);
    }
  }, [exercises, exIndex, selected, typedValue, buildSel, arrangeSel]);

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

  const matchClick = useCallback(
    (side: 'left' | 'right', value: string) => {
      const ex = exercises[exIndex];
      if (!ex || ex.type !== 'match') return;
      if (matchWrong) return;
      if (side === 'left') {
        if (matchedKeys.includes(value)) return;
        setMatchSelLeft((prev) => (prev === value ? null : value));
      } else {
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
      setMatchedKeys((prev) => {
        const next = [...prev, matchSelLeft];
        const done = next.length === Object.keys(ex.pairs).length;
        if (done) {
          setStatus('correct');
          setScore((s) => s + 1);
        }
        return next;
      });
      setMatchSelLeft(null);
      setMatchSelRight(null);
    } else {
      setMatchWrong(true);
      const t = window.setTimeout(() => {
        setMatchWrong(false);
        setMatchSelLeft(null);
        setMatchSelRight(null);
      }, 500);
      return () => window.clearTimeout(t);
    }
  }, [matchSelLeft, matchSelRight, exercises, exIndex]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Enter' || view !== 'lesson') return;
      const ex = exercises[exIndex];
      if (!ex) return;
      if (status !== 'active') {
        continueNext();
        return;
      }
      if (ex.type === 'teach') {
        continueNext();
        return;
      }
      const canCheck =
        ex.type === 'type'
          ? typedValue.trim().length > 0
          : ex.type === 'choice'
            ? selected != null
            : ex.type === 'build'
              ? buildSel.length > 0
              : ex.type === 'arrange'
                ? arrangeSel.length > 0
                : false;
      if (canCheck) checkAnswer();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [view, exercises, exIndex, status, typedValue, selected, buildSel, arrangeSel, continueNext, checkAnswer]);

  const currentExercise = exercises[exIndex];
  const activeLessonTitle =
    LESSON_META.find((l) => l.id === activeLessonId)?.title ?? '';

  return (
    <div className="min-h-screen bg-background font-sans">
      {view !== 'lesson' && (
        <Nav
          view={view}
          dark={dark}
          completedCount={completedCount}
          totalLessons={LESSON_META.length}
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
          onStartLesson={startLesson}
          onContinueCurrent={continueCurrent}
        />
      )}

      {view === 'lesson' && currentExercise && (
        <Lesson
          exercise={currentExercise}
          exIndex={exIndex}
          exTotal={exercises.length}
          lessonId={activeLessonId}
          lessonTitle={activeLessonTitle}
          status={status}
          selected={selected}
          typedValue={typedValue}
          buildSel={buildSel}
          arrangeSel={arrangeSel}
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
          onMatchClick={matchClick}
        />
      )}

      {view === 'complete' && (
        <Complete
          score={score}
          total={exercises.filter((e) => e.type !== 'teach' && !e.retry).length}
          onBack={closeLesson}
        />
      )}

      {view !== 'lesson' && (
        <Footer onSetView={setView} onContinueCurrent={continueCurrent} />
      )}
    </div>
  );
}
