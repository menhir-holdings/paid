"use client";

import { useEffect, useRef } from "react";
import {
  formatMinutes,
  hourLabel,
  minutesToHoursCell,
  nowChip,
  WORK_END,
  WORK_START,
  type TimeBlock,
} from "@/lib/planner";

type Props = {
  blocks: TimeBlock[];
  nowMinutes: number;
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
  onPickHour: (minutes: number) => void;
};

const HOUR_PX = 40;
const LABEL_WIDTH = 56;
const PX_PER_MIN = HOUR_PX / 60;
const TOTAL = WORK_END - WORK_START;

function slotTop(minutes: number): number {
  return (minutes - WORK_START) * PX_PER_MIN;
}

function visibleSpan(block: TimeBlock): { top: number; height: number } | null {
  const start = Math.max(block.startMinutes, WORK_START);
  const end = Math.min(block.endMinutes, WORK_END);
  if (end <= start) return null;
  return {
    top: slotTop(start),
    height: (end - start) * PX_PER_MIN,
  };
}

export function DayStrip({
  blocks,
  nowMinutes,
  selectedBlockId,
  onSelectBlock,
  onPickHour,
}: Props) {
  const nowRef = useRef<HTMLDivElement>(null);
  const hours: number[] = [];
  for (let m = WORK_START; m < WORK_END; m += 60) hours.push(m);

  const showNow = nowMinutes >= WORK_START && nowMinutes <= WORK_END;
  const gridHeight = TOTAL * PX_PER_MIN;

  useEffect(() => {
    nowRef.current?.scrollIntoView({ block: "center", inline: "nearest" });
  }, [showNow]);

  return (
    <div className="day-strip">
      <div className="day-strip-inner" style={{ height: gridHeight }}>
        <div
          className="day-gutter"
          style={{ width: LABEL_WIDTH }}
        >
          {hours.map((m) => (
            <span
              key={m}
              className="hour-label"
              style={{ top: slotTop(m) + 4 }}
            >
              {hourLabel(m)}
            </span>
          ))}
        </div>

        {hours.map((m) => (
          <button
            key={m}
            type="button"
            className="hour-row"
            style={{
              top: slotTop(m),
              left: LABEL_WIDTH,
              height: HOUR_PX,
            }}
            onClick={() => onPickHour(m)}
          >
            <span className="hour-hint">Name a block</span>
          </button>
        ))}

        {blocks.map((block) => {
          const span = visibleSpan(block);
          if (!span) return null;
          const selected = block.id === selectedBlockId;
          const who = block.title.trim() || "Untitled";

          return (
            <button
              key={block.id}
              type="button"
              className={`day-block${selected ? " is-selected" : ""}`}
              style={{
                top: span.top,
                left: LABEL_WIDTH + 8,
                height: Math.max(span.height, 22),
              }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectBlock(block.id);
              }}
            >
              <span className="day-block-who">{who}</span>
              <span className="day-block-meta">
                {formatMinutes(block.startMinutes)} ·{" "}
                {minutesToHoursCell(block.endMinutes - block.startMinutes)}
              </span>
            </button>
          );
        })}

        {showNow && (
          <div
            ref={nowRef}
            className="now-line"
            style={{ top: slotTop(nowMinutes) }}
          >
            <span className="sr-only">Now {nowChip(nowMinutes)}</span>
            <span className="now-chip" aria-hidden="true">
              {nowChip(nowMinutes)}
            </span>
            <span className="now-dot" />
            <span className="now-rule" />
          </div>
        )}
      </div>
    </div>
  );
}
