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

export function MaterialPicker({
  materials,
  selectedId,
  onSelect,
}: MaterialPickerProps) {
  const hasSelection = selectedId !== null;

  return (
    <section aria-label="Material picker" className="w-full">
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          hasSelection ? "mb-0 max-h-0 opacity-0" : "mb-4 max-h-16 opacity-100"
        }`}
      >
        <h2 className="text-2xl font-bold tracking-tight text-stone-900">
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
                className="flex h-22 items-center justify-between rounded-2xl bg-[var(--accent)] px-4 text-stone-950 shadow-sm transition-all duration-300 ease-in-out"
              >
                <div className="flex items-center gap-4">
                  <div
                    aria-hidden="true"
                    className={`h-12 w-12 shrink-0 rounded-xl border border-black/15 bg-white/30 ${accentBgClass}`}
                  />
                  <span className="text-xl font-extrabold tracking-tight text-stone-950">
                    {material.name}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onSelect(null)}
                  className="rounded-xl bg-black/15 px-3.5 py-2 text-sm font-semibold text-stone-950 hover:bg-black/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-950"
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
                  : "mb-3 max-h-24 opacity-100 last:mb-0"
              }`}
            >
              <button
                type="button"
                tabIndex={isHidden ? -1 : 0}
                onClick={() => onSelect(material.id)}
                className="flex h-22 w-full items-center justify-between rounded-2xl border border-stone-200 bg-white px-4 text-left shadow-xs hover:border-stone-300 hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
              >
                <div className="flex items-center gap-4">
                  <div
                    aria-hidden="true"
                    className={`h-14 w-14 shrink-0 rounded-xl ${accentBgClass}`}
                  />
                  <span className="text-xl font-extrabold tracking-tight text-stone-900">
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

