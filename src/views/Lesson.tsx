import { X } from 'lucide-react';
import type { Exercise } from '@/lessons';
import { renderWithGlyphChips } from '@/lib/shavian-text';
import { ReportProblem } from '@/components/ReportProblem';
import { lessonIssueUrl } from '@/lib/constants';

type Status = 'active' | 'correct' | 'wrong';

export function Lesson({
  exercise,
  exIndex,
  exTotal,
  lessonId,
  lessonTitle,
  status,
  selected,
  typedValue,
  buildSel,
  arrangeSel,
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
  onMatchClick,
}: {
  exercise: Exercise;
  exIndex: number;
  exTotal: number;
  lessonId: number;
  lessonTitle: string;
  status: Status;
  selected: string | null;
  typedValue: string;
  buildSel: number[];
  arrangeSel: number[];
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
  onMatchClick: (side: 'left' | 'right', value: string) => void;
}) {
  const isTeach = exercise.type === 'teach';
  const isChoice = exercise.type === 'choice';
  const isType = exercise.type === 'type';
  const isBuild = exercise.type === 'build';
  const isArrange = exercise.type === 'arrange';
  const isMatch = exercise.type === 'match';
  const isWrong = status === 'wrong';

  const progressPct = exTotal
    ? Math.round(((exIndex + (status !== 'active' ? 1 : 0)) / exTotal) * 100)
    : 0;

  const checkDisabled = isType
    ? typedValue.trim().length === 0
    : isChoice
      ? selected == null
      : isBuild
        ? buildSel.length === 0
        : isArrange
          ? arrangeSel.length === 0
          : true;

  const showCheckButton = status === 'active' && !isMatch && !isTeach;
  const showSkip = status === 'active' && !isTeach;
  const showResultBar = status !== 'active';

  return (
    <div className="max-w-[640px] mx-auto px-6 pt-7 pb-10 flex flex-col box-border" style={{ minHeight: 'calc(100vh - 74px)' }}>
      <div className="flex items-center gap-4 mb-11">
        <button
          className="w-9 h-9 border-none bg-transparent text-muted-foreground cursor-pointer flex-none flex items-center justify-center"
          onClick={onClose}
        >
          <X size={20} />
        </button>
        <div className="flex-1 h-3 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-[width] duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex-none text-[13px] font-semibold text-muted-foreground min-w-[44px] text-right">
          {Math.min(exIndex + 1, exTotal)} / {exTotal}
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
              <div
                className="w-full aspect-video rounded-card border border-border flex items-center justify-center"
                style={{
                  background:
                    'repeating-linear-gradient(135deg, var(--border), var(--border) 10px, transparent 10px, transparent 20px)',
                }}
              >
                <div className="font-mono text-xs text-muted-foreground bg-card px-2.5 py-1 rounded-md border border-border">
                  {exercise.media} placeholder
                </div>
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
                <div className="text-[72px] font-bold text-foreground mb-3.5">
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
              <div className="text-[76px] font-bold text-foreground mb-3.5">
                {exercise.prompt}
              </div>
              <div className="text-sm text-muted-foreground">{exercise.caption}</div>
            </div>
            <input
              className="w-[260px] text-center text-[22px] font-semibold p-4 rounded-btn outline-none"
              style={{
                border: `2px solid ${status === 'active' ? 'var(--border)' : isWrong ? 'var(--danger)' : 'var(--success)'}`,
                background: status === 'active' ? 'var(--card)' : isWrong ? 'var(--danger-soft)' : 'var(--success-soft)',
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
                    border: `2px solid ${status === 'active' ? 'var(--accent-border)' : isWrong ? 'var(--danger)' : 'var(--success)'}`,
                    background: status === 'active' ? 'var(--accent-soft)' : isWrong ? 'var(--danger-soft)' : 'var(--success-soft)',
                    color: status === 'active' ? 'var(--accent)' : isWrong ? 'var(--danger)' : 'var(--success)',
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
                    className="w-[58px] h-[58px] rounded-btn font-bold text-2xl flex items-center justify-center"
                    style={{
                      border: '2px solid var(--border)',
                      background: used ? 'var(--locked-bg)' : 'var(--card)',
                      color: used ? 'transparent' : 'var(--foreground)',
                      cursor: used || status !== 'active' ? 'default' : 'pointer',
                      boxShadow: used ? 'none' : 'var(--shadow-sm)',
                    }}
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
                    border: `2px solid ${status === 'active' ? 'var(--accent-border)' : isWrong ? 'var(--danger)' : 'var(--success)'}`,
                    background: status === 'active' ? 'var(--accent-soft)' : isWrong ? 'var(--danger-soft)' : 'var(--success-soft)',
                    color: status === 'active' ? 'var(--accent)' : isWrong ? 'var(--danger)' : 'var(--success)',
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
                    className="px-4 py-2.5 rounded-btn font-bold text-xl"
                    style={{
                      border: '2px solid var(--border)',
                      background: used ? 'var(--locked-bg)' : 'var(--card)',
                      color: used ? 'transparent' : 'var(--foreground)',
                      cursor: used || status !== 'active' ? 'default' : 'pointer',
                      boxShadow: used ? 'none' : 'var(--shadow-sm)',
                    }}
                  >
                    {word}
                  </button>
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
            <div className="flex gap-9 w-full max-w-[420px] justify-center">
              <div className="flex flex-col gap-3">
                {exercise.leftOrder.map((v) => {
                  const matched = matchedKeys.includes(v);
                  const sel = matchSelLeft === v;
                  const wrong = matchWrong && sel;
                  let bg = 'var(--card)';
                  let bd = 'var(--border)';
                  let col = 'var(--foreground)';
                  if (matched) {
                    bg = 'var(--success-soft)';
                    bd = 'var(--success)';
                    col = 'var(--success)';
                  } else if (wrong) {
                    bg = 'var(--danger-soft)';
                    bd = 'var(--danger)';
                    col = 'var(--danger)';
                  } else if (sel) {
                    bg = 'var(--accent-soft)';
                    bd = 'var(--accent)';
                    col = 'var(--accent)';
                  }
                  return (
                    <button
                      key={v}
                      onClick={() => onMatchClick('left', v)}
                      className="w-[120px] h-[62px] box-border flex items-center justify-center rounded-btn font-bold text-2xl"
                      style={{
                        border: `2px solid ${bd}`,
                        background: bg,
                        color: col,
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
                  let bg = 'var(--card)';
                  let bd = 'var(--border)';
                  let col = 'var(--foreground)';
                  if (matched) {
                    bg = 'var(--success-soft)';
                    bd = 'var(--success)';
                    col = 'var(--success)';
                  } else if (wrong) {
                    bg = 'var(--danger-soft)';
                    bd = 'var(--danger)';
                    col = 'var(--danger)';
                  } else if (sel) {
                    bg = 'var(--accent-soft)';
                    bd = 'var(--accent)';
                    col = 'var(--accent)';
                  }
                  return (
                    <button
                      key={v}
                      onClick={() => onMatchClick('right', v)}
                      className="w-[120px] h-[62px] box-border flex items-center justify-center rounded-btn font-semibold text-base"
                      style={{
                        border: `2px solid ${bd}`,
                        background: bg,
                        color: col,
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
