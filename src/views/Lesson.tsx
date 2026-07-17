import { ChevronLeft, ChevronRight, Delete, X } from 'lucide-react';
import type { Exercise } from '@/lessons';
import { IconButton } from '@/components/IconButton';
import { renderWithGlyphChips } from '@/lib/shavian-text';
import { keyboardRows, NAMING_DOT } from '@/lib/shavian-keyboard';
import { useIsMobile } from '@/hooks/useIsMobile';
import { ReportProblem } from '@/components/ReportProblem';
import { TeachMedia } from '@/components/TeachMedia';
import { lessonIssueUrl } from '@/lib/constants';

type Status = 'active' | 'correct' | 'wrong';

// Border/background/text colors for an answer element by grading status.
// While the exercise is active, `lit` elements use the accent scheme and
// unlit ones (an empty blank, the idle input) stay neutral.
function answerColors(status: Status, lit = true) {
  if (status === 'wrong')
    return { border: 'var(--danger)', bg: 'var(--danger-soft)', color: 'var(--danger)' };
  if (status === 'correct')
    return { border: 'var(--success)', bg: 'var(--success-soft)', color: 'var(--success)' };
  return lit
    ? { border: 'var(--accent-border)', bg: 'var(--accent-soft)', color: 'var(--accent)' }
    : { border: 'var(--border)', bg: 'transparent', color: 'var(--accent)' };
}

// A tile/word in a tap pool: greyed out once used, a flat card otherwise.
function poolTileStyle(used: boolean, status: Status) {
  return {
    border: '2px solid var(--border)',
    background: used ? 'var(--locked-bg)' : 'var(--card)',
    color: used ? 'transparent' : 'var(--foreground)',
    cursor: used || status !== 'active' ? 'default' : 'pointer',
    boxShadow: used ? 'none' : 'var(--shadow-sm)',
  };
}

// A match cell, on either side of the pairing grid.
function matchCellColors(matched: boolean, wrong: boolean, sel: boolean) {
  if (matched)
    return { border: 'var(--success)', bg: 'var(--success-soft)', color: 'var(--success)' };
  if (wrong)
    return { border: 'var(--danger)', bg: 'var(--danger-soft)', color: 'var(--danger)' };
  if (sel)
    return { border: 'var(--accent)', bg: 'var(--accent-soft)', color: 'var(--accent)' };
  return { border: 'var(--border)', bg: 'var(--card)', color: 'var(--foreground)' };
}

export function Lesson({
  exercise,
  exIndex,
  exTotal,
  gradedStep,
  gradedTotal,
  progressPct,
  lessonId,
  lessonTitle,
  status,
  canGoBack,
  canGoForward,
  onGoBack,
  onGoForward,
  selected,
  typedValue,
  buildSel,
  arrangeSel,
  fillSel,
  matchSelLeft,
  matchSelRight,
  matchedKeys,
  matchWrong,
  onClose,
  onSelectOption,
  onTypeChange,
  onCheckAnswer,
  onSkip,
  onContinueNext,
  onBuildAdd,
  onBuildRemove,
  onArrangeAdd,
  onArrangeRemove,
  onFillAdd,
  onFillRemove,
  onMatchClick,
}: {
  exercise: Exercise;
  exIndex: number;
  exTotal: number;
  gradedStep: number;
  gradedTotal: number;
  progressPct: number;
  lessonId: number;
  lessonTitle: string;
  status: Status;
  canGoBack: boolean;
  canGoForward: boolean;
  onGoBack: () => void;
  onGoForward: () => void;
  selected: string | null;
  typedValue: string;
  buildSel: number[];
  arrangeSel: number[];
  fillSel: number[];
  matchSelLeft: string | null;
  matchSelRight: string | null;
  matchedKeys: string[];
  matchWrong: boolean;
  onClose: () => void;
  onSelectOption: (opt: string) => void;
  onTypeChange: (v: string) => void;
  onCheckAnswer: () => void;
  onSkip: () => void;
  onContinueNext: () => void;
  onBuildAdd: (i: number) => void;
  onBuildRemove: (pos: number) => void;
  onArrangeAdd: (i: number) => void;
  onArrangeRemove: (pos: number) => void;
  onFillAdd: (i: number) => void;
  onFillRemove: (pos: number) => void;
  onMatchClick: (side: 'left' | 'right', value: string) => void;
}) {
  // On narrow screens the write keyboard splits its 12-key rows into
  // interleaved half-rows of 6 (pairing preserved) so keys stay tappable.
  const isMobile = useIsMobile();
  const isTeach = exercise.type === 'teach';
  const isChoice = exercise.type === 'choice';
  const isType = exercise.type === 'type';
  const isBuild = exercise.type === 'build';
  const isArrange = exercise.type === 'arrange';
  const isComplete = exercise.type === 'complete';
  const isFill = exercise.type === 'fill';
  const isCloze = exercise.type === 'cloze';
  const isSpot = exercise.type === 'spot';
  const isTranscribe = exercise.type === 'transcribe';
  const isWrite = exercise.type === 'write';
  const isMatch = exercise.type === 'match';
  const isWrong = status === 'wrong';
  const lit = answerColors(status);
  const dim = answerColors(status, false);

  const blanksNeeded =
    exercise.type === 'complete' ||
    exercise.type === 'fill' ||
    exercise.type === 'cloze'
      ? exercise.blanks.length
      : 0;

  const checkDisabled = isType || isTranscribe || isWrite
    ? typedValue.trim().length === 0
    : isChoice
      ? selected == null
      : isBuild
        ? buildSel.length === 0
        : isArrange
          ? arrangeSel.length === 0
          : isComplete || isFill || isCloze
            ? fillSel.length !== blanksNeeded
            : isSpot
              ? selected == null
              : true;

  const showCheckButton = status === 'active' && !isMatch && !isTeach;
  const showSkip = status === 'active' && !isTeach;
  const showResultBar = status !== 'active';

  return (
    <div className="max-w-[640px] mx-auto px-5 sm:px-6 pt-6 sm:pt-7 pb-10 flex flex-col box-border" style={{ minHeight: '100dvh' }}>
      <div className="flex items-center gap-3 sm:gap-4 mb-9 sm:mb-11">
        <IconButton onClick={onClose} aria-label="Close lesson">
          <X size={18} />
        </IconButton>
        <div className="flex-1 h-3 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-[width] duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex-none text-[13px] font-semibold text-muted-foreground min-w-[44px] text-right">
          {gradedStep} / {gradedTotal}
        </div>
        {/* Step over ground already seen — answers and results come back with
            you. Forward stops at the furthest exercise reached, so this can
            never jump past one without answering it. */}
        <div className="flex-none flex items-center gap-1.5">
          <IconButton onClick={onGoBack} disabled={!canGoBack} aria-label="Previous exercise">
            <ChevronLeft size={18} />
          </IconButton>
          <IconButton onClick={onGoForward} disabled={!canGoForward} aria-label="Next exercise">
            <ChevronRight size={18} />
          </IconButton>
        </div>
        <ReportProblem
          issueUrl={lessonIssueUrl(lessonId, lessonTitle, Math.min(exIndex + 1, exTotal))}
          tooltip="Report a problem with this exercise"
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-9">
        {isTeach && exercise.type === 'teach' && (
          <div className="w-full max-w-[420px] flex flex-col gap-5 items-center text-center">
            <div className="text-[22px] font-bold text-foreground">{exercise.title}</div>
            {exercise.media && (
              <div className="w-full my-2">
                <TeachMedia media={exercise.media} />
              </div>
            )}
            <div className="text-[15px] leading-relaxed text-muted-foreground text-left">
              {renderWithGlyphChips(exercise.body)}
            </div>
            <button
              className="px-7 py-3 rounded-btn border-none bg-accent text-card font-semibold text-sm cursor-pointer mt-2"
              onClick={onContinueNext}
            >
              Continue
            </button>
          </div>
        )}

        {isChoice && exercise.type === 'choice' && (
          <div className="w-full flex flex-col items-center gap-9" style={{ animation: 'shvSlideUp .3s ease' }}>
            <div className="text-center">
              {exercise.promptIsGlyph ? (
                <div className="text-[56px] sm:text-[72px] font-bold text-foreground mb-3.5">
                  {exercise.prompt}
                </div>
              ) : (
                <div className="text-[26px] font-semibold text-foreground max-w-[440px] leading-tight">
                  {exercise.prompt}
                </div>
              )}
              {exercise.caption && (
                <div className="text-sm text-muted-foreground mt-2">{exercise.caption}</div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3.5 w-full max-w-[420px]">
              {exercise.options.map((opt) => {
                let bg = 'var(--card)';
                let bd = 'var(--border)';
                let col = 'var(--foreground)';
                let anim = 'none';
                const isSel = selected === opt;
                if (status === 'active') {
                  if (isSel) {
                    bg = 'var(--accent-soft)';
                    bd = 'var(--accent)';
                    col = 'var(--accent)';
                  }
                } else {
                  if (opt === exercise.correct) {
                    bg = 'var(--success-soft)';
                    bd = 'var(--success)';
                    col = 'var(--success)';
                  } else if (isSel) {
                    bg = 'var(--danger-soft)';
                    bd = 'var(--danger)';
                    col = 'var(--danger)';
                    anim = 'shvShake .3s ease';
                  } else {
                    col = 'oklch(65% 0.005 90)';
                  }
                }
                return (
                  <button
                    key={opt}
                    onClick={() => onSelectOption(opt)}
                    className="px-3.5 py-[18px] rounded-btn font-semibold transition-all duration-100"
                    style={{
                      border: `2px solid ${bd}`,
                      background: bg,
                      color: col,
                      fontSize: exercise.optionIsGlyph ? 30 : 15,
                      cursor: status === 'active' ? 'pointer' : 'default',
                      animation: anim,
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {isType && exercise.type === 'type' && (
          <div className="w-full flex flex-col items-center gap-7" style={{ animation: 'shvSlideUp .3s ease' }}>
            <div className="text-center">
              <div className="text-[56px] sm:text-[76px] font-bold text-foreground mb-3.5">
                {exercise.prompt}
              </div>
              <div className="text-sm text-muted-foreground">{exercise.caption}</div>
            </div>
            <input
              className="w-[260px] text-center text-[22px] font-semibold p-4 rounded-btn outline-none"
              style={{
                border: `2px solid ${dim.border}`,
                background: status === 'active' ? 'var(--card)' : dim.bg,
                color: 'var(--foreground)',
              }}
              value={typedValue}
              onChange={(e) => onTypeChange(e.target.value)}
              placeholder="type here"
              autoFocus
            />
          </div>
        )}

        {isBuild && exercise.type === 'build' && (
          <div className="w-full flex flex-col items-center gap-8" style={{ animation: 'shvSlideUp .3s ease' }}>
            <div className="text-center">
              <div className="text-[26px] font-semibold text-foreground">
                “{exercise.prompt}”
              </div>
              <div className="text-sm text-muted-foreground mt-2">{exercise.caption}</div>
            </div>
            <div
              className="flex gap-2.5 items-center justify-center"
              style={{
                minHeight: 66,
                minWidth: 240,
                borderBottom: '2px dashed var(--border)',
                padding: '0 20px 12px',
              }}
            >
              {buildSel.map((tileIdx, pos) => (
                <button
                  key={pos}
                  onClick={() => onBuildRemove(pos)}
                  className="w-[54px] h-[54px] rounded-btn font-bold text-2xl flex items-center justify-center"
                  style={{
                    border: `2px solid ${lit.border}`,
                    background: lit.bg,
                    color: lit.color,
                    cursor: status === 'active' ? 'pointer' : 'default',
                  }}
                >
                  {exercise.tiles[tileIdx]}
                </button>
              ))}
            </div>
            <div className="flex gap-3 flex-wrap justify-center">
              {exercise.tiles.map((ch, i) => {
                const used = buildSel.includes(i);
                return (
                  <button
                    key={i}
                    onClick={() => onBuildAdd(i)}
                    disabled={used || status !== 'active'}
                    className="w-[58px] h-[58px] rounded-btn font-bold text-2xl flex items-center justify-center"
                    style={poolTileStyle(used, status)}
                  >
                    {ch}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {isArrange && exercise.type === 'arrange' && (
          <div className="w-full flex flex-col items-center gap-8" style={{ animation: 'shvSlideUp .3s ease' }}>
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-2">Arrange the words to say:</div>
              <div className="text-2xl font-semibold text-foreground max-w-[480px]">
                “{exercise.promptEn}”
              </div>
            </div>
            <div
              className="flex flex-wrap gap-2.5 items-center justify-center w-full max-w-[500px]"
              style={{
                minHeight: 60,
                borderBottom: '2px dashed var(--border)',
                padding: '0 16px 12px',
              }}
            >
              {arrangeSel.map((tileIdx, pos) => (
                <button
                  key={pos}
                  onClick={() => onArrangeRemove(pos)}
                  className="px-4 py-2.5 rounded-btn font-bold text-xl"
                  style={{
                    border: `2px solid ${lit.border}`,
                    background: lit.bg,
                    color: lit.color,
                    cursor: status === 'active' ? 'pointer' : 'default',
                  }}
                >
                  {exercise.tiles[tileIdx]}
                </button>
              ))}
            </div>
            <div className="flex gap-2.5 flex-wrap justify-center max-w-[500px]">
              {exercise.tiles.map((word, i) => {
                const used = arrangeSel.includes(i);
                return (
                  <button
                    key={i}
                    onClick={() => onArrangeAdd(i)}
                    disabled={used || status !== 'active'}
                    className="px-4 py-2.5 rounded-btn font-bold text-xl"
                    style={poolTileStyle(used, status)}
                  >
                    {word}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {isComplete && exercise.type === 'complete' && (
          <div className="w-full flex flex-col items-center gap-8" style={{ animation: 'shvSlideUp .3s ease' }}>
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-2">Complete the word:</div>
              <div className="text-[26px] font-semibold text-foreground">
                “{exercise.prompt}”
              </div>
              {exercise.caption && (
                <div className="text-sm text-muted-foreground mt-2">{exercise.caption}</div>
              )}
            </div>
            <div className="flex gap-2.5 items-center justify-center flex-wrap">
              {exercise.word.map((ch, wi) => {
                const blankPos = exercise.blanks.indexOf(wi);
                if (blankPos === -1) {
                  return (
                    <div
                      key={wi}
                      className="w-[54px] h-[54px] rounded-btn border-2 border-border bg-card flex items-center justify-center font-bold text-2xl text-foreground"
                    >
                      {ch}
                    </div>
                  );
                }
                const filled = blankPos < fillSel.length;
                return (
                  <button
                    key={wi}
                    onClick={() => filled && onFillRemove(blankPos)}
                    className="w-[54px] h-[54px] rounded-btn font-bold text-2xl flex items-center justify-center"
                    style={{
                      border: `2px dashed ${filled ? lit.border : dim.border}`,
                      background: filled ? lit.bg : 'transparent',
                      color: lit.color,
                      cursor: filled && status === 'active' ? 'pointer' : 'default',
                    }}
                  >
                    {filled ? exercise.bank[fillSel[blankPos]] : ''}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-3 flex-wrap justify-center">
              {exercise.bank.map((ch, i) => {
                const used = fillSel.includes(i);
                return (
                  <button
                    key={i}
                    onClick={() => onFillAdd(i)}
                    disabled={used || status !== 'active'}
                    className="w-[58px] h-[58px] rounded-btn font-bold text-2xl flex items-center justify-center"
                    style={poolTileStyle(used, status)}
                  >
                    {ch}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {isFill && exercise.type === 'fill' && (
          <div className="w-full flex flex-col items-center gap-8" style={{ animation: 'shvSlideUp .3s ease' }}>
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-2">Fill in the sentence:</div>
              <div className="text-2xl font-semibold text-foreground max-w-[480px]">
                “{exercise.promptEn}”
              </div>
            </div>
            <div className="flex gap-2.5 items-center justify-center flex-wrap max-w-[520px]">
              {exercise.words.map((word, wi) => {
                const blankPos = exercise.blanks.indexOf(wi);
                if (blankPos === -1) {
                  return (
                    <div
                      key={wi}
                      className="px-4 py-2.5 rounded-btn border-2 border-border bg-card font-bold text-xl text-foreground"
                    >
                      {word}
                    </div>
                  );
                }
                const filled = blankPos < fillSel.length;
                return (
                  <button
                    key={wi}
                    onClick={() => filled && onFillRemove(blankPos)}
                    className="min-w-[64px] px-4 py-2.5 rounded-btn font-bold text-xl flex items-center justify-center"
                    style={{
                      border: `2px dashed ${filled ? lit.border : dim.border}`,
                      background: filled ? lit.bg : 'transparent',
                      color: lit.color,
                      cursor: filled && status === 'active' ? 'pointer' : 'default',
                    }}
                  >
                    {filled ? exercise.bank[fillSel[blankPos]] : ' '}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2.5 flex-wrap justify-center max-w-[520px]">
              {exercise.bank.map((word, i) => {
                const used = fillSel.includes(i);
                return (
                  <button
                    key={i}
                    onClick={() => onFillAdd(i)}
                    disabled={used || status !== 'active'}
                    className="px-4 py-2.5 rounded-btn font-bold text-xl"
                    style={poolTileStyle(used, status)}
                  >
                    {word}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {isCloze && exercise.type === 'cloze' && (
          <div className="w-full flex flex-col items-center gap-7" style={{ animation: 'shvSlideUp .3s ease' }}>
            <div className="text-sm text-muted-foreground">
              {exercise.caption ?? 'Read the passage and fill the gaps'}
            </div>
            <div className="text-[26px] leading-[1.7] font-semibold text-foreground text-center max-w-[560px] flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1">
              {exercise.words.map((word, wi) => {
                const isStop = exercise.stops?.includes(wi);
                const blankPos = exercise.blanks.indexOf(wi);
                const content =
                  blankPos === -1 ? (
                    <span>{word}</span>
                  ) : (
                    (() => {
                      const filled = blankPos < fillSel.length;
                      return (
                        <button
                          onClick={() => filled && onFillRemove(blankPos)}
                          className="inline-flex items-center justify-center h-[42px] min-w-[64px] px-2 rounded-btn align-middle"
                          style={{
                            border: `2px dashed ${filled ? lit.border : dim.border}`,
                            background: filled ? lit.bg : 'transparent',
                            color: lit.color,
                            cursor: filled && status === 'active' ? 'pointer' : 'default',
                          }}
                        >
                          {filled ? exercise.bank[fillSel[blankPos]] : ' '}
                        </button>
                      );
                    })()
                  );
                return (
                  <span key={wi} className="inline-flex items-center">
                    {content}
                    {isStop && <span>.</span>}
                  </span>
                );
              })}
            </div>
            {exercise.translation && (
              <div className="text-sm italic text-muted-foreground max-w-[440px]">
                “{exercise.translation}”
              </div>
            )}
            <div className="flex gap-2.5 flex-wrap justify-center max-w-[520px]">
              {exercise.bank.map((word, i) => {
                const used = fillSel.includes(i);
                return (
                  <button
                    key={i}
                    onClick={() => onFillAdd(i)}
                    disabled={used || status !== 'active'}
                    className="px-4 py-2.5 rounded-btn font-bold text-xl"
                    style={poolTileStyle(used, status)}
                  >
                    {word}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {isTranscribe && exercise.type === 'transcribe' && (
          <div className="w-full flex flex-col gap-4" style={{ animation: 'shvSlideUp .3s ease' }}>
            <div className="text-sm text-muted-foreground">{exercise.caption}</div>
            {/* One child per column, so the passage and the answer box are the
                same height: any label stacked beside a box would eat into it. */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-stretch">
              <figure className="m-0 flex flex-col p-5 rounded-card border border-border bg-card">
                <div className="flex-1 text-[24px] leading-[1.75] font-semibold text-foreground">
                  {exercise.passage}
                </div>
                {exercise.source && (
                  <figcaption className="mt-3 text-xs italic text-muted-foreground">
                    — {exercise.source}
                  </figcaption>
                )}
              </figure>
              <textarea
                className="w-full min-h-[140px] p-4 rounded-btn outline-none text-base font-medium leading-relaxed resize-none box-border"
                style={{
                  border: `2px solid ${dim.border}`,
                  background: status === 'active' ? 'var(--card)' : dim.bg,
                  color: 'var(--foreground)',
                }}
                value={typedValue}
                onChange={(e) => onTypeChange(e.target.value)}
                placeholder="write the English here"
                autoFocus
              />
            </div>
            <div className="text-xs italic text-muted-foreground">
              Spelling doesn't have to be perfect — a slip of a letter or two still counts.
              I'm still working on this one!
            </div>
          </div>
        )}

        {isWrite && exercise.type === 'write' && (
          <div className="w-full flex flex-col items-center gap-6" style={{ animation: 'shvSlideUp .3s ease' }}>
            <div className="text-center">
              <div className="text-[26px] font-semibold text-foreground">
                “{exercise.prompt}”
              </div>
              <div className="text-sm text-muted-foreground mt-2">{exercise.caption}</div>
            </div>
            <div
              className="flex items-center justify-center text-[32px] font-bold tracking-wide"
              style={{
                minHeight: 58,
                minWidth: 220,
                borderBottom: `2px dashed ${typedValue ? lit.border : dim.border}`,
                color: typedValue ? lit.color : 'var(--muted-foreground)',
                padding: '0 20px 8px',
              }}
            >
              {typedValue || ' '}
            </div>
            <div className="w-full max-w-[520px] flex flex-col gap-1.5">
              {keyboardRows(isMobile).map((row, ri) => (
                <div
                  key={ri}
                  className={`grid gap-1.5 ${isMobile ? 'grid-cols-6' : 'grid-cols-12'}`}
                >
                  {row.map((key) => (
                    <button
                      key={key.glyph}
                      onClick={() => onTypeChange(typedValue + key.glyph)}
                      disabled={status !== 'active'}
                      aria-label={key.name}
                      title={key.name}
                      className="h-10 sm:h-11 rounded-md font-bold text-xl flex items-center justify-center"
                      style={poolTileStyle(false, status)}
                    >
                      {key.glyph}
                    </button>
                  ))}
                </div>
              ))}
              <div className="flex justify-center gap-1.5">
                <button
                  onClick={() => onTypeChange(typedValue + NAMING_DOT.glyph)}
                  disabled={status !== 'active'}
                  aria-label={NAMING_DOT.name}
                  title={NAMING_DOT.name}
                  className="h-10 sm:h-11 w-[30%] rounded-md font-bold text-xl flex items-center justify-center"
                  style={poolTileStyle(false, status)}
                >
                  {NAMING_DOT.glyph}
                </button>
                <button
                  onClick={() => onTypeChange([...typedValue].slice(0, -1).join(''))}
                  disabled={status !== 'active' || typedValue.length === 0}
                  aria-label="delete last letter"
                  title="delete last letter"
                  className="h-10 sm:h-11 w-[30%] rounded-md flex items-center justify-center"
                  style={poolTileStyle(false, status)}
                >
                  <Delete size={20} />
                </button>
              </div>
            </div>
          </div>
        )}

        {isSpot && exercise.type === 'spot' && (
          <div className="w-full flex flex-col items-center gap-8" style={{ animation: 'shvSlideUp .3s ease' }}>
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-2">
                {exercise.caption ?? 'Tap the word that says:'}
              </div>
              <div className="text-[26px] font-semibold text-foreground max-w-[440px]">
                “{exercise.prompt}”
              </div>
            </div>
            <div className="text-[26px] leading-[1.7] font-semibold text-center max-w-[560px] flex flex-wrap items-center justify-center gap-x-2.5 gap-y-2">
              {exercise.words.map((word, wi) => {
                const isStop = exercise.stops?.includes(wi);
                const isSel = selected === String(wi);
                let bg = 'var(--card)';
                let bd = 'var(--border)';
                let col = 'var(--foreground)';
                let anim = 'none';
                if (status === 'active') {
                  if (isSel) {
                    bg = 'var(--accent-soft)';
                    bd = 'var(--accent)';
                    col = 'var(--accent)';
                  }
                } else {
                  if (wi === exercise.correct) {
                    bg = 'var(--success-soft)';
                    bd = 'var(--success)';
                    col = 'var(--success)';
                  } else if (isSel) {
                    bg = 'var(--danger-soft)';
                    bd = 'var(--danger)';
                    col = 'var(--danger)';
                    anim = 'shvShake .3s ease';
                  } else {
                    col = 'var(--muted-foreground)';
                  }
                }
                return (
                  <span key={wi} className="inline-flex items-center gap-x-2.5">
                    <button
                      onClick={() => onSelectOption(String(wi))}
                      className="px-3.5 py-2 rounded-btn font-bold transition-all duration-100"
                      style={{
                        border: `2px solid ${bd}`,
                        background: bg,
                        color: col,
                        cursor: status === 'active' ? 'pointer' : 'default',
                        animation: anim,
                      }}
                    >
                      {word}
                    </button>
                    {isStop && <span className="text-foreground">.</span>}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {isMatch && exercise.type === 'match' && (
          <div className="w-full flex flex-col items-center gap-6" style={{ animation: 'shvSlideUp .3s ease' }}>
            <div className="text-[15px] text-muted-foreground font-medium">
              Match each symbol to its word
            </div>
            <div className="flex gap-5 sm:gap-9 w-full max-w-[420px] justify-center">
              <div className="flex flex-col gap-3">
                {exercise.leftOrder.map((v) => {
                  const matched = matchedKeys.includes(v);
                  const sel = matchSelLeft === v;
                  const wrong = matchWrong && sel;
                  const c = matchCellColors(matched, wrong, sel);
                  return (
                    <button
                      key={v}
                      onClick={() => onMatchClick('left', v)}
                      className="w-[120px] h-[62px] box-border flex items-center justify-center rounded-btn font-bold text-2xl"
                      style={{
                        border: `2px solid ${c.border}`,
                        background: c.bg,
                        color: c.color,
                        cursor: matched ? 'default' : 'pointer',
                        animation: wrong ? 'shvShake .3s ease' : 'none',
                      }}
                    >
                      {v}
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-col gap-3">
                {exercise.rightOrder.map((v) => {
                  const key = Object.keys(exercise.pairs).find(
                    (k) => exercise.pairs[k] === v
                  );
                  const matched = key != null && matchedKeys.includes(key);
                  const sel = matchSelRight === v;
                  const wrong = matchWrong && sel;
                  const c = matchCellColors(matched, wrong, sel);
                  return (
                    <button
                      key={v}
                      onClick={() => onMatchClick('right', v)}
                      className="w-[120px] h-[62px] box-border flex items-center justify-center rounded-btn font-semibold text-base"
                      style={{
                        border: `2px solid ${c.border}`,
                        background: c.bg,
                        color: c.color,
                        cursor: matched ? 'default' : 'pointer',
                        animation: wrong ? 'shvShake .3s ease' : 'none',
                      }}
                    >
                      {v}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6">
        {showCheckButton && (
          <button
            className="w-full py-[13px] rounded-btn border-none font-semibold text-sm"
            style={{
              background: checkDisabled ? 'var(--border)' : 'var(--accent)',
              color: checkDisabled ? 'var(--muted-foreground)' : 'var(--card)',
              cursor: checkDisabled ? 'default' : 'pointer',
            }}
            onClick={onCheckAnswer}
            disabled={checkDisabled}
          >
            Check
          </button>
        )}
        {showSkip && (
          <button
            className="block mx-auto mt-3.5 bg-transparent border-none text-muted-foreground text-[13px] font-medium cursor-pointer underline underline-offset-4"
            onClick={onSkip}
          >
            Skip this one
          </button>
        )}
        {showResultBar && (
          <div
            className="flex items-center justify-between gap-5 px-5 py-[18px] rounded-card"
            style={{
              background: isWrong ? 'var(--danger-soft)' : 'var(--success-soft)',
              animation: 'shvSlideUp .25s ease',
            }}
          >
            <div className="flex flex-col gap-0.5">
              <div
                className="font-bold text-base"
                style={{ color: isWrong ? 'var(--danger)' : 'var(--success)' }}
              >
                {isWrong ? 'Not quite' : 'Correct!'}
              </div>
              {isWrong && 'correctLabel' in exercise && (
                <div className="text-[13px]" style={{ color: 'var(--danger)' }}>
                  Correct answer: {exercise.correctLabel}
                </div>
              )}
            </div>
            <button
              className="flex-none px-[22px] py-[11px] rounded-btn border-none text-card font-semibold text-sm cursor-pointer"
              style={{ background: isWrong ? 'var(--danger)' : 'var(--success)' }}
              onClick={onContinueNext}
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
