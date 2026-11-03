import { useEffect, useState } from "react";
import type { Material } from "../types/materials";

export interface MaterialPickerProps {
  materials: Material[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

const ACCENT_BG_MAP: Record<string, string> = {
  "#E9967A": "bg-[#E9967A]",
  "#1FB5A6": "bg-[#1FB5A6]",
  "#A8B5A2": "bg-[#A8B5A2]",
};

function getAccentBgClass(accentHex: string): string {
  return ACCENT_BG_MAP[accentHex] ?? "bg-[var(--accent)]";
}

function getMaterialAnimation(id: string): string {
  switch (id) {
    case "silicone":
      return "animate-drip";
    case "jesmonite":
      return "animate-puff";
    case "concrete":
      return "animate-thud";
    default:
      return "";
  }
}

export function MaterialPicker({
  materials,
  selectedId,
  onSelect,
}: MaterialPickerProps) {
  const hasSelection = selectedId !== null;
  const [activeAnimation, setActiveAnimation] = useState<string>("");

  useEffect(() => {
    if (selectedId) {
      setActiveAnimation(getMaterialAnimation(selectedId));
    } else {
      setActiveAnimation("");
    }
  }, [selectedId]);

  return (
    <section aria-label="Material picker" className="w-full">
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          hasSelection ? "mb-0 max-h-0 opacity-0" : "mb-4 max-h-16 opacity-100"
        }`}
      >
        <h2 className="font-display text-2xl font-black tracking-tight text-stone-900">
          What are we mixing?
        </h2>
      </div>

      <div className="flex flex-col">
        {materials.map((material) => {
          const isSelected = material.id === selectedId;
          const isHidden = hasSelection && !isSelected;
          const accentBgClass = getAccentBgClass(material.theme.accent);

          if (isSelected) {
            return (
              <div
                key={material.id}
                className="flex min-h-[88px] items-center justify-between rounded-2xl border-l-4 border-l-[var(--accent)] bg-[var(--accent)]/15 px-4 text-stone-950 shadow-sm transition-all duration-300 ease-in-out"
              >
                <div className="flex items-center gap-4">
                  <div
                    aria-hidden="true"
                    onAnimationEnd={() => setActiveAnimation("")}
                    className={`h-16 w-16 shrink-0 rounded-[12px] shadow-xs ${accentBgClass} ${activeAnimation}`}
                  />
                  <span className="font-display text-xl font-bold tracking-tight text-stone-950">
                    {material.name}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onSelect(null)}
                  className="rounded-lg bg-black/20 bg-white/30 px-3 py-1 text-sm font-semibold text-white shadow-xs [text-shadow:_0_1px_2px_rgba(0,0,0,0.5)] hover:bg-black/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-950 transition-colors"
                >
                  Change
                </button>
              </div>
            );
          }

          return (
            <div
              key={material.id}
              aria-hidden={isHidden}
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isHidden
                  ? "pointer-events-none mb-0 max-h-0 opacity-0"
                  : "mb-3 max-h-28 opacity-100 last:mb-0"
              }`}
            >
              <button
                type="button"
                tabIndex={isHidden ? -1 : 0}
                onClick={() => onSelect(material.id)}
                className="flex min-h-[88px] w-full items-center justify-between rounded-2xl border border-stone-200 bg-white px-4 text-left shadow-sm hover:border-stone-300 hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
              >
                <div className="flex items-center gap-4">
                  <div
                    aria-hidden="true"
                    className={`h-14 w-14 shrink-0 rounded-[12px] shadow-xs ${accentBgClass}`}
                  />
                  <span className="font-display text-xl font-bold tracking-tight text-stone-900">
                    {material.name}
                  </span>
                </div>

                <span
                  aria-hidden="true"
                  className="px-2 text-2xl font-bold text-stone-400"
                >
                  &gt;
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default MaterialPicker;
