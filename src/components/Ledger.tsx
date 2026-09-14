"use client";

import { useEffect, useRef } from "react";
import {
  blockAmount,
  blockMinutes,
  billedAmount,
  billedMinutes,
  canPlace,
  formatMinutes,
  formatMoney,
  HOUR_PRESETS,
  minutesToHoursCell,
  parseHoursInput,
  snapDuration,
  OVERTIME_END,
  WORK_START,
  type TimeBlock,
} from "@/lib/planner";

export type Composer = {
  who: string;
  hours: string;
  startMinutes: number | null;
};

type Props = {
  blocks: TimeBlock[];
  rate: number;
  selectedBlockId: string | null;
  composer: Composer;
  onSelectBlock: (id: string | null) => void;
  onComposerChange: (patch: Partial<Composer>) => void;
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<TimeBlock>) => void;
  onRemove: (id: string) => void;
};

export function Ledger({
  blocks,
  rate,
  selectedBlockId,
  composer,
  onSelectBlock,
  onComposerChange,
  onAdd,
  onUpdate,
  onRemove,
}: Props) {
  const whoRef = useRef<HTMLInputElement>(null);
  const selected = blocks.find((b) => b.id === selectedBlockId) ?? null;

  useEffect(() => {
    if (!selected) whoRef.current?.focus();
  }, [composer.startMinutes, selected]);

  const totalMins = billedMinutes(blocks);
  const totalAmt = billedAmount(blocks, rate);

  return (
    <div className="ledger-table">
      <div className="ledger-head" aria-hidden="true">
        <span>Who</span>
        <span className="ledger-mark">$</span>
        <span>Hours</span>
        <span>Amount</span>
        <span />
      </div>

      {blocks.length === 0 && (
        <p className="ledger-empty">
          Name who you are billing, and for how long.
        </p>
      )}

      <ul className="ledger-list">
        {blocks.map((block) => {
          const mins = blockMinutes(block);
          const active = block.id === selectedBlockId;
          return (
            <li key={block.id}>
              <button
                type="button"
                className={`ledger-row${active ? " is-selected" : ""}`}
                onClick={() =>
                  onSelectBlock(active ? null : block.id)
                }
              >
                <span className="ledger-who">
                  {block.title.trim() || "Untitled"}
                </span>
                <span className="ledger-mark" title="Billable">
                  $
                </span>
                <span className="ledger-hours">{minutesToHoursCell(mins)}</span>
                <span className="ledger-amount">
                  {formatMoney(blockAmount(block, rate))}
                </span>
                <span className="ledger-range">
                  {formatMinutes(block.startMinutes)}
                </span>
              </button>
              {active && selected && (
                <div className="ledger-edit">
                  <label>
                    <span>Who</span>
                    <input
                      type="text"
                      value={selected.title}
                      onChange={(e) =>
                        onUpdate(selected.id, { title: e.target.value })
                      }
                      className="editor-input"
                    />
                  </label>
                  <label>
                    <span>Hours</span>
                    <input
                      key={`${selected.id}-${selected.endMinutes}`}
                      type="text"
                      inputMode="decimal"
                      defaultValue={minutesToHoursCell(blockMinutes(selected))}
                      onBlur={(e) => {
                        const parsed = parseHoursInput(e.target.value);
                        if (!parsed) return;
                        const duration = snapDuration(parsed);
                        const endMinutes = selected.startMinutes + duration;
                        if (
                          canPlace(
                            blocks,
                            {
                              startMinutes: selected.startMinutes,
                              endMinutes,
                            },
                            selected.id,
                          )
                        ) {
                          onUpdate(selected.id, { endMinutes });
                        }
                      }}
                      className="editor-input hours-input"
                    />
                  </label>
                  <label>
                    <span>Start</span>
                    <select
                      value={selected.startMinutes}
                      onChange={(e) => {
                        const startMinutes = Number(e.target.value);
                        const duration = blockMinutes(selected);
                        onUpdate(selected.id, {
                          startMinutes,
                          endMinutes: startMinutes + duration,
                        });
                      }}
                      className="editor-input"
                    >
                      {startOptions().map((m) => (
                        <option key={m} value={m}>
                          {formatMinutes(m)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    className="remove-block"
                    onClick={() => onRemove(selected.id)}
                  >
                    Remove
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <form
        className="composer"
        onSubmit={(e) => {
          e.preventDefault();
          onAdd();
        }}
      >
        <input
          ref={whoRef}
          type="text"
          value={composer.who}
          onChange={(e) => onComposerChange({ who: e.target.value })}
          placeholder="Who"
          aria-label="Who"
          className="editor-input composer-who"
        />
        <input
          type="text"
          inputMode="decimal"
          value={composer.hours}
          onChange={(e) => onComposerChange({ hours: e.target.value })}
          placeholder="1:00"
          aria-label="Hours"
          className="editor-input hours-input"
        />
        <button type="submit" className="add-btn">
          Add
        </button>
        <div className="hour-presets">
          {HOUR_PRESETS.map((h) => (
            <button
              key={h}
              type="button"
              className="duration-chip"
              onClick={() =>
                onComposerChange({ hours: minutesToHoursCell(h * 60) })
              }
            >
              {h}h
            </button>
          ))}
        </div>
      </form>

      <div className="ledger-total">
        <span>Total</span>
        <span className="ledger-mark">$</span>
        <span className="ledger-hours">{minutesToHoursCell(totalMins)}</span>
        <span className="ledger-amount">{formatMoney(totalAmt)}</span>
        <span />
      </div>
    </div>
  );
}

function startOptions(): number[] {
  const out: number[] = [];
  for (let m = WORK_START; m < OVERTIME_END; m += 30) out.push(m);
  return out;
}
