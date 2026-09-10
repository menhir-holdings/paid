"use client";

import { THEMES, type ThemeId } from "@/lib/themes";

type Props = {
  themeId: ThemeId;
  onSelect: (id: ThemeId) => void;
  onCycle: () => void;
};

export function ThemeToggle({ themeId, onSelect, onCycle }: Props) {
  const current = THEMES.find((t) => t.id === themeId);

  return (
    <div className="theme-toggle">
      <button
        type="button"
        onClick={onCycle}
        className="theme-cycle-btn"
        title="Cycle Rob Ross IDE theme"
        aria-label={`Theme ${current?.label ?? ""}`}
      >
        <span
          className="theme-swatch"
          style={{ background: current?.accent }}
        />
      </button>
      <select
        value={themeId}
        onChange={(e) => onSelect(e.target.value as ThemeId)}
        className="theme-select px-2 py-1.5 text-xs sm:text-sm"
        aria-label="Select theme"
      >
        {THEMES.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label}
          </option>
        ))}
      </select>
    </div>
  );
}
