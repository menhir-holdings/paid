export const WORK_START = 8 * 60;
export const WORK_END = 18 * 60;
export const OVERTIME_END = 21 * 60;
export const SLOT_MINUTES = 30;
export const DAY_CAPACITY_MINUTES = WORK_END - WORK_START;

export type TimeBlock = {
  id: string;
  title: string;
  startMinutes: number;
  endMinutes: number;
  colorIndex: number;
};

export type DayPlan = {
  date: string;
  blocks: TimeBlock[];
  morningNote: string;
};

export const HOUR_PRESETS = [0.5, 1, 1.5, 2] as const;

export const DEFAULT_BASE = 260;
export const DEFAULT_HOURS = 1;

const STORAGE_KEY = "paid-planner-v1";
const THEME_KEY = "paid-theme-v1";
const BASE_KEY = "paid-base-v1";

export function parseBase(value: string): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : DEFAULT_BASE;
}

export function dateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatMinutes(m: number): string {
  const h = Math.floor(m / 60);
  const min = m % 60;
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(min).padStart(2, "0")} ${period}`;
}

export function hourLabel(m: number): string {
  const h = Math.floor(m / 60);
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}${h >= 12 ? "pm" : "am"}`;
}

export function nowChip(m: number): string {
  const h = Math.floor(m / 60);
  const min = m % 60;
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  if (min === 0) return `${hour12}`;
  return `${hour12}:${String(min).padStart(2, "0")}`;
}

export function blockMinutes(block: TimeBlock): number {
  return Math.max(0, block.endMinutes - block.startMinutes);
}

export function minutesToHoursCell(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}:${String(m).padStart(2, "0")}`;
}

export function formatHoursPhrase(mins: number): string {
  const abs = Math.abs(Math.round(mins));
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  const core = m ? (h ? `${h}h ${m}m` : `${m}m`) : `${h}h`;
  return mins < 0 ? `over ${core}` : core;
}

export function parseHoursInput(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.includes(":")) {
    const [hRaw, mRaw = "0"] = trimmed.split(":");
    const hours = Number(hRaw);
    const mins = Number(mRaw);
    if (!Number.isFinite(hours) || !Number.isFinite(mins) || hours < 0 || mins < 0) {
      return null;
    }
    const total = Math.round(hours * 60 + mins);
    return total > 0 ? total : null;
  }
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * 60);
}

export function snapDuration(mins: number): number {
  const snapped = Math.round(mins / 15) * 15;
  return Math.max(15, snapped);
}

export function formatMoney(n: number): string {
  const rounded = Math.round(n * 100) / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: Number.isInteger(rounded) ? 0 : 2,
  }).format(rounded);
}

export function blockAmount(block: TimeBlock, rate: number): number {
  return (blockMinutes(block) / 60) * rate;
}

export function billedMinutes(blocks: TimeBlock[]): number {
  return blocks.reduce((sum, b) => sum + blockMinutes(b), 0);
}

export function leftoverMinutes(blocks: TimeBlock[]): number {
  return DAY_CAPACITY_MINUTES - billedMinutes(blocks);
}

export function billedAmount(blocks: TimeBlock[], rate: number): number {
  return (billedMinutes(blocks) / 60) * rate;
}

export function leftoverAmount(blocks: TimeBlock[], rate: number): number {
  return (leftoverMinutes(blocks) / 60) * rate;
}

export function snapToSlot(m: number): number {
  return Math.round(m / SLOT_MINUTES) * SLOT_MINUTES;
}

export function newBlockId(): string {
  return `blk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function loadDayPlan(date: string): DayPlan {
  if (typeof window === "undefined") {
    return { date, blocks: [], morningNote: "" };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { date, blocks: [], morningNote: "" };
    const all = JSON.parse(raw) as Record<string, DayPlan>;
    const stored = all[date];
    if (!stored) return { date, blocks: [], morningNote: "" };
    return {
      date,
      morningNote: stored.morningNote ?? "",
      blocks: Array.isArray(stored.blocks) ? stored.blocks : [],
    };
  } catch {
    return { date, blocks: [], morningNote: "" };
  }
}

export function saveDayPlan(plan: DayPlan) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all = raw ? (JSON.parse(raw) as Record<string, DayPlan>) : {};
    all[plan.date] = plan;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    /* ignore quota errors */
  }
}

export function dropLegacyTheme() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(THEME_KEY);
  } catch {
    /* ignore */
  }
}

export function loadBase(): number {
  if (typeof window === "undefined") return DEFAULT_BASE;
  try {
    const raw = localStorage.getItem(BASE_KEY);
    if (!raw) return DEFAULT_BASE;
    return parseBase(raw);
  } catch {
    return DEFAULT_BASE;
  }
}

export function saveBase(base: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(BASE_KEY, String(Math.round(base)));
}

export function blocksOverlap(a: TimeBlock, b: TimeBlock): boolean {
  return a.startMinutes < b.endMinutes && b.startMinutes < a.endMinutes;
}

export function sortBlocks(blocks: TimeBlock[]): TimeBlock[] {
  return [...blocks].sort((a, b) => a.startMinutes - b.startMinutes);
}

export function minutesFromMidnight(d: Date = new Date()): number {
  return d.getHours() * 60 + d.getMinutes();
}

export function suggestedMorningStart(): number {
  const now = minutesFromMidnight();
  const snapped = snapToSlot(now);
  return Math.max(WORK_START, Math.min(snapped, WORK_END - SLOT_MINUTES));
}

export function nextFreeSlot(
  blocks: TimeBlock[],
  duration: number,
  preferred: number,
): number | null {
  const scan = (seed: number): number | null => {
    const sorted = sortBlocks(blocks);
    let start = snapToSlot(
      Math.max(WORK_START, Math.min(seed, OVERTIME_END - duration)),
    );
    for (let guard = 0; guard < 64; guard++) {
      const end = start + duration;
      if (end > OVERTIME_END) return null;
      const hit = sorted.find(
        (b) => start < b.endMinutes && b.startMinutes < end,
      );
      if (!hit) return start;
      start = snapToSlot(Math.max(start + SLOT_MINUTES, hit.endMinutes));
    }
    return null;
  };

  return scan(preferred) ?? scan(WORK_START);
}

export function canPlace(
  blocks: TimeBlock[],
  candidate: Pick<TimeBlock, "startMinutes" | "endMinutes">,
  ignoreId?: string,
): boolean {
  if (candidate.endMinutes <= candidate.startMinutes) return false;
  return !blocks.some(
    (b) =>
      b.id !== ignoreId &&
      candidate.startMinutes < b.endMinutes &&
      b.startMinutes < candidate.endMinutes,
  );
}
