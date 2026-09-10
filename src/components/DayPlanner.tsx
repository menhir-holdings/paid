"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BlockEditor } from "@/components/BlockEditor";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TimeGrid } from "@/components/TimeGrid";
import { useBase } from "@/hooks/useBase";
import { usePlanner } from "@/hooks/usePlanner";
import { useTheme } from "@/hooks/useTheme";
import {
  dateKey,
  formatMinutes,
  minutesFromMidnight,
  QUICK_MULTIPLIERS,
  quickAddLabel,
  totalPlannedMinutes,
} from "@/lib/planner";

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function dayHeading(iso: string, isToday: boolean): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const label = `${WEEKDAYS[dt.getDay()]}, ${MONTHS[m - 1]} ${d}`;
  return isToday ? `Today · ${label}` : label;
}

export function DayPlanner() {
  const [selectedDate, setSelectedDate] = useState(() => dateKey());
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [nowMinutes, setNowMinutes] = useState(0);
  const [clock, setClock] = useState("");

  const { themeId, cycleTheme, selectTheme } = useTheme();
  const { base, updateBase } = useBase();
  const {
    plan,
    updatePlan,
    updateBlock,
    removeBlock,
    addQuickBlock,
    addBlockAtSlot,
  } = usePlanner(selectedDate);

  const selectNewBlock = useCallback((id: string | null) => {
    if (id) setSelectedBlockId(id);
  }, []);

  const handleAddAtSlot = useCallback(
    (slotMinutes: number) => {
      const id = addBlockAtSlot(slotMinutes, base);
      selectNewBlock(id);
    },
    [addBlockAtSlot, base, selectNewBlock],
  );

  const handleQuickAdd = useCallback(
    (multiplier: number, duration: number) => {
      const id = addQuickBlock(base, multiplier, duration);
      selectNewBlock(id);
    },
    [addQuickBlock, base, selectNewBlock],
  );

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setNowMinutes(minutesFromMidnight(now));
      setClock(
        now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      );
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  const selectedBlock = useMemo(
    () => plan.blocks.find((b) => b.id === selectedBlockId) ?? null,
    [plan.blocks, selectedBlockId],
  );

  const isToday = selectedDate === dateKey();
  const plannedMins = totalPlannedMinutes(plan.blocks);
  const showMorningBanner =
    isToday && plan.blocks.length === 0 && nowMinutes < 10 * 60;

  return (
    <div className="desk flex h-dvh flex-col overflow-hidden text-[var(--paid-fg)]">
      <header className="masthead z-40 flex shrink-0 flex-wrap items-center justify-between gap-3 px-4 py-2.5">
        <div className="flex items-baseline gap-3">
          <h1 className="wordmark">Paid</h1>
          <p className="kicker hidden sm:block">Morning work planner</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setSelectedBlockId(null);
            }}
            className="editor-input px-2 py-1.5 text-sm"
          />
          {isToday && <span className="clock">{clock}</span>}
          <ThemeToggle
            themeId={themeId}
            onSelect={selectTheme}
            onCycle={cycleTheme}
          />
        </div>
      </header>

      {showMorningBanner && (
        <div className="morning-slip mx-4 mt-3 px-4 py-3">
          <p className="text-sm font-semibold">Plan your starting blocks</p>
          <p className="mt-1 text-xs text-[var(--paid-muted)]">
            Set your base, then quick-add blocks — or click the timeline.
          </p>
        </div>
      )}

      <main className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-4 lg:flex-row">
        <section className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden lg:min-h-0">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-[family-name:var(--font-newsreader)] text-lg font-semibold tracking-tight">
              {dayHeading(selectedDate, isToday)}
            </h2>
            <span className="text-xs text-[var(--paid-muted)]">
              {plan.blocks.length} block{plan.blocks.length === 1 ? "" : "s"} ·{" "}
              {plannedMins >= 60
                ? `${Math.floor(plannedMins / 60)}h${plannedMins % 60 ? ` ${plannedMins % 60}m` : ""}`
                : `${plannedMins}m`}{" "}
              planned
            </span>
          </div>
          <TimeGrid
            blocks={plan.blocks}
            nowMinutes={isToday ? nowMinutes : -1}
            selectedBlockId={selectedBlockId}
            onSelectBlock={setSelectedBlockId}
            onAddAtSlot={handleAddAtSlot}
          />
        </section>

        <aside className="flex w-full shrink-0 flex-col gap-3 overflow-y-auto lg:w-72 lg:max-h-full">
          <BlockEditor
            block={selectedBlock}
            base={base}
            onBaseChange={updateBase}
            onUpdate={updateBlock}
            onRemove={(id) => {
              removeBlock(id);
              setSelectedBlockId(null);
            }}
            onClose={() => setSelectedBlockId(null)}
          />

          <div className="sheet p-3">
            <h3 className="kicker mb-2">Quick add</h3>
            <div className="flex flex-wrap gap-2">
              {QUICK_MULTIPLIERS.map(({ multiplier, duration }) => (
                <button
                  key={multiplier}
                  type="button"
                  className="quick-add-btn px-3 py-1.5 text-xs font-medium"
                  onClick={() => handleQuickAdd(multiplier, duration)}
                  title={`${multiplier}x base · ${duration}m`}
                >
                  {quickAddLabel(base, multiplier)}
                </button>
              ))}
            </div>
          </div>

          <label className="sheet flex flex-col gap-2 p-3">
            <span className="kicker">Morning note</span>
            <textarea
              value={plan.morningNote}
              onChange={(e) => updatePlan({ morningNote: e.target.value })}
              placeholder="Intentions, priorities, first task…"
              rows={4}
              className="editor-input morning-note resize-none px-3 py-2 text-sm"
            />
          </label>

          {plan.blocks.length > 0 && (
            <div className="sheet p-3">
              <h3 className="kicker mb-2">Agenda</h3>
              <ul className="space-y-2">
                {plan.blocks.map((b) => (
                  <li key={b.id}>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 text-left text-xs hover:text-[var(--paid-accent-hover)]"
                      onClick={() => setSelectedBlockId(b.id)}
                    >
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{
                          background: `var(--paid-block-${b.colorIndex % 5})`,
                        }}
                      />
                      <span className="font-[family-name:var(--font-source-code)] text-[var(--paid-muted)]">
                        {formatMinutes(b.startMinutes)}
                      </span>
                      <span className="truncate">{b.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}
