"use client";

import { useEffect, useRef } from "react";
import {
  DEFAULT_BASE,
  formatMinutes,
  SLOT_MINUTES,
  WORK_END,
  WORK_START,
  type TimeBlock,
} from "@/lib/planner";

type Props = {
  block: TimeBlock | null;
  base: number;
  onBaseChange: (value: string) => void;
  onUpdate: (id: string, patch: Partial<TimeBlock>) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
};

export function BlockEditor({
  block,
  base,
  onBaseChange,
  onUpdate,
  onRemove,
  onClose,
}: Props) {
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (block) {
      titleRef.current?.focus();
      titleRef.current?.select();
    }
  }, [block?.id]);

  if (!block) {
    return (
      <div className="sheet p-3">
        <label className="flex flex-col gap-1">
          <span className="kicker">Base</span>
          <input
            type="number"
            min={1}
            step={1}
            value={base}
            onChange={(e) => onBaseChange(e.target.value)}
            className="editor-input px-3 py-2 text-sm font-[family-name:var(--font-source-code)]"
            placeholder={String(DEFAULT_BASE)}
          />
        </label>
        <p className="mt-2 text-[10px] text-[var(--paid-muted)]">
          Quick-add labels = base × 0.5 / 1 / 1.5 / 2
        </p>
      </div>
    );
  }

  const durationOptions = [15, 30, 45, 60, 90, 120];

  return (
    <div className="sheet flex flex-col gap-4 p-3">
      <div className="flex items-center justify-between">
        <h3 className="kicker">Edit block</h3>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-[var(--paid-muted)] hover:text-[var(--paid-fg)]"
        >
          Close
        </button>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-[var(--paid-muted)]">Title</span>
        <input
          ref={titleRef}
          type="text"
          value={block.title}
          onChange={(e) => onUpdate(block.id, { title: e.target.value })}
          className="editor-input px-3 py-2 text-sm"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-[var(--paid-muted)]">Start</span>
          <select
            value={block.startMinutes}
            onChange={(e) => {
              const start = Number(e.target.value);
              const duration = block.endMinutes - block.startMinutes;
              onUpdate(block.id, {
                startMinutes: start,
                endMinutes: Math.min(WORK_END, start + duration),
              });
            }}
            className="editor-input px-2 py-2 text-sm"
          >
            {timeOptions().map((m) => (
              <option key={m} value={m}>
                {formatMinutes(m)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-[var(--paid-muted)]">End</span>
          <select
            value={block.endMinutes}
            onChange={(e) =>
              onUpdate(block.id, { endMinutes: Number(e.target.value) })
            }
            className="editor-input px-2 py-2 text-sm"
          >
            {timeOptions()
              .filter((m) => m > block.startMinutes)
              .map((m) => (
                <option key={m} value={m}>
                  {formatMinutes(m)}
                </option>
              ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-[var(--paid-muted)]">Duration</span>
        <div className="flex flex-wrap gap-1">
          {durationOptions.map((d) => (
            <button
              key={d}
              type="button"
              className="duration-chip px-2 py-1 text-xs"
              onClick={() =>
                onUpdate(block.id, {
                  endMinutes: Math.min(WORK_END, block.startMinutes + d),
                })
              }
            >
              {d}m
            </button>
          ))}
        </div>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-[var(--paid-muted)]">Color</span>
        <div className="flex gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <button
              key={i}
              type="button"
              aria-label={`Color ${i + 1}`}
              className={`h-6 w-6 rounded-full border-2 transition-transform ${
                block.colorIndex === i
                  ? "scale-110 border-[var(--paid-fg)]"
                  : "border-transparent"
              }`}
              style={{ background: `var(--paid-block-${i})` }}
              onClick={() => onUpdate(block.id, { colorIndex: i })}
            />
          ))}
        </div>
      </label>

      <button
        type="button"
        onClick={() => onRemove(block.id)}
        className="remove-block mt-1 px-3 py-2 text-xs"
      >
        Remove block
      </button>
    </div>
  );
}

function timeOptions(): number[] {
  const out: number[] = [];
  for (let m = WORK_START; m <= WORK_END; m += SLOT_MINUTES) {
    out.push(m);
  }
  return out;
}
