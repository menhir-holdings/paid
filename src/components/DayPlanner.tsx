"use client";

import { useCallback, useEffect, useState } from "react";
import { DayStrip } from "@/components/DayStrip";
import { Ledger, type Composer } from "@/components/Ledger";
import { useBase } from "@/hooks/useBase";
import { usePlanner } from "@/hooks/usePlanner";
import {
  billedAmount,
  billedMinutes,
  dateKey,
  DEFAULT_HOURS,
  dropLegacyTheme,
  formatHoursPhrase,
  formatMoney,
  leftoverAmount,
  leftoverMinutes,
  formatMinutes,
  minutesFromMidnight,
  minutesToHoursCell,
  parseHoursInput,
  snapDuration,
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
  const [composer, setComposer] = useState<Composer>({
    who: "",
    hours: minutesToHoursCell(DEFAULT_HOURS * 60),
    startMinutes: null,
  });
  const [placeError, setPlaceError] = useState<string | null>(null);

  const { base, updateBase } = useBase();
  const { plan, updateBlock, removeBlock, addNamedBlock } =
    usePlanner(selectedDate);

  useEffect(() => {
    dropLegacyTheme();
  }, []);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setNowMinutes(minutesFromMidnight(now));
      setClock(
        now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      );
    };
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, []);

  const isToday = selectedDate === dateKey();
  const billedMins = billedMinutes(plan.blocks);
  const leftMins = leftoverMinutes(plan.blocks);
  const billed$ = billedAmount(plan.blocks, base);
  const left$ = leftoverAmount(plan.blocks, base);
  const openMins = billedMins + Math.max(leftMins, 0);
  const fillPct = openMins === 0 ? 0 : Math.min(100, (billedMins / openMins) * 100);

  const handleComposerChange = useCallback((patch: Partial<Composer>) => {
    setPlaceError(null);
    setComposer((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleAdd = useCallback(() => {
    const parsed = parseHoursInput(composer.hours);
    if (!parsed) {
      setPlaceError("Enter hours as 1, 1.5, or 1:30.");
      return;
    }
    const duration = snapDuration(parsed);
    const id = addNamedBlock(
      composer.who,
      duration,
      composer.startMinutes ?? undefined,
    );
    if (!id) {
      setPlaceError(
        composer.who.trim()
          ? "No open time left on the day."
          : "Name who this block is for.",
      );
      return;
    }
    setComposer({
      who: "",
      hours: minutesToHoursCell(DEFAULT_HOURS * 60),
      startMinutes: null,
    });
    setPlaceError(null);
    setSelectedBlockId(null);
  }, [addNamedBlock, composer]);

  const handlePickHour = useCallback((minutes: number) => {
    setSelectedBlockId(null);
    setPlaceError(null);
    setComposer((prev) => ({ ...prev, startMinutes: minutes }));
  }, []);

  const startHint =
    composer.startMinutes === null
      ? null
      : `Starts ${formatMinutes(composer.startMinutes)}`;

  return (
    <div className="desk">
      <article className="sheet">
        <header className="sheet-head">
          <div>
            <p className="kicker">Today’s billed work</p>
            <h1 className="wordmark">Paid</h1>
          </div>
          <div className="sheet-meta">
            <label className="date-field">
              <span className="sr-only">Date</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedBlockId(null);
                }}
                className="editor-input"
              />
            </label>
            {isToday && <span className="clock">{clock}</span>}
          </div>
        </header>

        <p className="day-title">{dayHeading(selectedDate, isToday)}</p>

        <section className="tally" aria-live="polite">
          <div>
            <p className="kicker">Billed</p>
            <p className="tally-figure money">{formatMoney(billed$)}</p>
            <p className="tally-sub">{formatHoursPhrase(billedMins)}</p>
          </div>
          <div>
            <p className="kicker">Leftover</p>
            <p className="tally-figure">
              {formatHoursPhrase(leftMins)}
              {leftMins > 0 ? (
                <span className="tally-sub-inline">
                  {" "}
                  · {formatMoney(left$)}
                </span>
              ) : null}
            </p>
            <p className="tally-sub">
              {leftMins < 0
                ? "Past the paper day"
                : `${formatMoney(Math.max(0, left$))} still open`}
            </p>
          </div>
        </section>

        <div
          className="tally-rule"
          role="presentation"
          title={`${Math.round(fillPct)}% billed`}
        >
          <span style={{ width: `${fillPct}%` }} />
        </div>

        <label className="rate-field">
          <span>Rate</span>
          <span className="rate-prefix">$</span>
          <input
            type="number"
            min={1}
            step={1}
            value={base}
            onChange={(e) => updateBase(e.target.value)}
            className="editor-input hours-input"
            aria-label="Hourly rate"
          />
          <span className="rate-suffix">/ h</span>
        </label>

        <DayStrip
          blocks={plan.blocks}
          nowMinutes={isToday ? nowMinutes : -1}
          selectedBlockId={selectedBlockId}
          onSelectBlock={setSelectedBlockId}
          onPickHour={handlePickHour}
        />

        {startHint && <p className="start-hint">{startHint}</p>}

        <Ledger
          blocks={plan.blocks}
          rate={base}
          selectedBlockId={selectedBlockId}
          composer={composer}
          onSelectBlock={setSelectedBlockId}
          onComposerChange={handleComposerChange}
          onAdd={handleAdd}
          onUpdate={updateBlock}
          onRemove={(id) => {
            removeBlock(id);
            setSelectedBlockId(null);
          }}
        />

        {placeError && <p className="place-error">{placeError}</p>}
      </article>
    </div>
  );
}
