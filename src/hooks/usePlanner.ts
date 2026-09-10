"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  canPlace,
  loadDayPlan,
  newBlockId,
  nextFreeSlot,
  saveDayPlan,
  sortBlocks,
  suggestedMorningStart,
  type DayPlan,
  type TimeBlock,
} from "@/lib/planner";

function appendBlock(prev: DayPlan, block: TimeBlock): DayPlan | null {
  if (!canPlace(prev.blocks, block)) return null;
  return {
    ...prev,
    blocks: sortBlocks([...prev.blocks, block]),
  };
}

export function usePlanner(selectedDate: string) {
  const [plan, setPlan] = useState<DayPlan>({
    date: selectedDate,
    blocks: [],
    morningNote: "",
  });
  const [ready, setReady] = useState(false);
  const planRef = useRef(plan);
  planRef.current = plan;

  useEffect(() => {
    setReady(false);
    const loaded = loadDayPlan(selectedDate);
    planRef.current = loaded;
    setPlan(loaded);
    setReady(true);
  }, [selectedDate]);

  useEffect(() => {
    if (!ready) return;
    saveDayPlan(plan);
  }, [plan, ready]);

  const updateBlock = useCallback((id: string, patch: Partial<TimeBlock>) => {
    setPlan((prev) => {
      const current = prev.blocks.find((b) => b.id === id);
      if (!current) return prev;
      const nextBlock = { ...current, ...patch };
      if (!canPlace(prev.blocks, nextBlock, id)) return prev;
      const next = {
        ...prev,
        blocks: sortBlocks(
          prev.blocks.map((b) => (b.id === id ? nextBlock : b)),
        ),
      };
      planRef.current = next;
      return next;
    });
  }, []);

  const removeBlock = useCallback((id: string) => {
    setPlan((prev) => {
      const next = {
        ...prev,
        blocks: prev.blocks.filter((b) => b.id !== id),
      };
      planRef.current = next;
      return next;
    });
  }, []);

  const addNamedBlock = useCallback(
    (who: string, duration: number, preferredStart?: number): string | null => {
      const title = who.trim();
      if (!title || duration <= 0) return null;

      const prev = planRef.current;
      const preferred =
        preferredStart ??
        (prev.blocks.length > 0
          ? Math.max(...prev.blocks.map((b) => b.endMinutes))
          : suggestedMorningStart());
      const start = nextFreeSlot(prev.blocks, duration, preferred);
      if (start === null) return null;

      const id = newBlockId();
      const next = appendBlock(prev, {
        id,
        title,
        startMinutes: start,
        endMinutes: start + duration,
        colorIndex: 0,
      });
      if (!next) return null;
      planRef.current = next;
      setPlan(next);
      return id;
    },
    [],
  );

  return {
    plan,
    updateBlock,
    removeBlock,
    addNamedBlock,
    ready,
  };
}
