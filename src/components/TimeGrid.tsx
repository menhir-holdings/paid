"use client";

import { useEffect, useRef } from "react";
import {
  formatMinutes,
  SLOT_MINUTES,
  WORK_END,
  WORK_START,
  type TimeBlock,
} from "@/lib/planner";

type Props = {
  blocks: TimeBlock[];
  nowMinutes: number;
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
  onAddAtSlot: (minutes: number) => void;
};

const TOTAL = WORK_END - WORK_START;
const PX_PER_MIN = 1.2;
const LABEL_WIDTH = 64;

function slotTop(minutes: number): number {
  return (minutes - WORK_START) * PX_PER_MIN;
}

function blockHeight(start: number, end: number): number {
  return (end - start) * PX_PER_MIN;
}

function visibleSpan(block: TimeBlock): { top: number; height: number } | null {
  const start = Math.max(block.startMinutes, WORK_START);
  const end = Math.min(block.endMinutes, WORK_END);
  if (end <= start) return null;
  return { top: slotTop(start), height: blockHeight(start, end) };
}

function hourLabel(m: number): string {
  const h = Math.floor(m / 60);
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}${h >= 12 ? "pm" : "am"}`;
}

function nowChip(m: number): string {
  const h = Math.floor(m / 60);
  const min = m % 60;
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const period = h >= 12 ? "pm" : "am";
  if (min === 0) return `${hour12} ${period}`;
  return `${hour12}:${String(min).padStart(2, "0")}`;
}

export function TimeGrid({
  blocks,
  nowMinutes,
  selectedBlockId,
  onSelectBlock,
  onAddAtSlot,
}: Props) {
  const nowRef = useRef<HTMLDivElement>(null);
  const slots: number[] = [];
  for (let m = WORK_START; m < WORK_END; m += SLOT_MINUTES) {
    slots.push(m);
  }

  const showNow = nowMinutes >= WORK_START && nowMinutes <= WORK_END;
  const gridHeight = TOTAL * PX_PER_MIN;

  useEffect(() => {
    nowRef.current?.scrollIntoView({ block: "center", inline: "nearest" });
  }, [showNow]);

  return (
    <div className="time-grid min-h-[22rem] flex-1 overflow-y-auto lg:min-h-0">
      <div className="relative" style={{ height: gridHeight }}>
        <div
          className="time-gutter pointer-events-none absolute bottom-0 left-0 top-0 z-10"
          style={{ width: LABEL_WIDTH }}
        >
          {slots.map((m) =>
            m % 60 === 0 ? (
              <span
                key={m}
                className="hour-label absolute left-0 right-0 px-2 leading-none"
                style={{ top: slotTop(m) + 4 }}
              >
                {hourLabel(m)}
              </span>
            ) : null,
          )}
        </div>

        {slots.map((m) => (
          <button
            key={m}
            type="button"
            className={`slot-row group absolute right-0 text-left ${
              m % 60 === 0 ? "slot-hour" : "slot-half"
            }`}
            style={{
              top: slotTop(m),
              left: LABEL_WIDTH,
              height: SLOT_MINUTES * PX_PER_MIN,
            }}
            onClick={() => onAddAtSlot(m)}
          >
            <span className="slot-hint px-2 pt-1 text-[var(--paid-muted)] opacity-0 transition-opacity group-hover:opacity-100">
              + add
            </span>
          </button>
        ))}

        {blocks.map((block) => {
          const span = visibleSpan(block);
          if (!span) return null;
          const selected = block.id === selectedBlockId;
          const tall = span.height > SLOT_MINUTES * PX_PER_MIN;

          return (
            <button
              key={block.id}
              type="button"
              className={`time-block absolute right-2 z-20 flex overflow-hidden border text-left transition-shadow ${
                selected
                  ? "ring-2 ring-[var(--paid-focus)]"
                  : "hover:brightness-[1.03]"
              }`}
              style={{
                top: span.top,
                left: LABEL_WIDTH + 4,
                height: Math.max(span.height, 20),
                background: `color-mix(in srgb, var(--paid-block-${block.colorIndex % 5}) 18%, var(--paid-surface))`,
                borderColor: `color-mix(in srgb, var(--paid-block-${block.colorIndex % 5}) 55%, var(--paid-border))`,
              }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectBlock(block.id);
              }}
            >
              <div
                className="block-accent self-stretch"
                style={{
                  background: `var(--paid-block-${block.colorIndex % 5})`,
                }}
              />
              <div
                className={`min-h-0 min-w-0 flex-1 px-2 py-1 ${tall ? "overflow-hidden" : ""}`}
              >
                <p className="truncate text-xs font-semibold text-[var(--paid-fg)]">
                  {block.title}
                </p>
                <p className="font-[family-name:var(--font-source-code)] text-[10px] text-[var(--paid-muted)]">
                  {formatMinutes(block.startMinutes)} –{" "}
                  {formatMinutes(block.endMinutes)}
                </p>
              </div>
            </button>
          );
        })}

        {showNow && (
          <div
            ref={nowRef}
            className="now-line pointer-events-none absolute right-0 z-30 flex items-start"
            style={{ top: slotTop(nowMinutes), left: 4, right: 0 }}
          >
            <span className="now-chip">{nowChip(nowMinutes)}</span>
            <span className="now-dot ml-1 shrink-0" />
            <span className="now-rule ml-0.5" />
          </div>
        )}
      </div>
    </div>
  );
}
