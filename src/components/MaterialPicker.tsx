import { useEffect, useState } from "react";
import type { Material } from "../types/materials";

export interface MaterialPickerProps {
  materials: Material[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
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

const MATERIAL_SUBTITLES: Record<string, string> = {
  silicone: "Flexible moulds and masters",
  jesmonite: "Intricate, decorative castings",
  concrete: "Durable, large-scale pieces",
};

function getMaterialSubtitle(material: Material): string {
  return material.subtitle || MATERIAL_SUBTITLES[material.id] || "";
}

function renderMaterialSvg(id: string) {
  switch (id) {
    case "silicone":
      return (
        <svg
          width="64"
          height="64"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <rect width="64" height="64" rx="12" fill="#E8F8F7" />
          <path
            d="M32 8C32 8 18 24 18 36C18 44.837 24.268 51 32 51C39.732 51 46 44.837 46 36C46 24 32 8 32 8Z"
            fill="#1FB5A6"
            stroke="#1E1E24"
            strokeWidth="2.5"
          />
          <circle cx="27" cy="34" r="3" fill="white" opacity="0.6" />
        </svg>
      );
    case "jesmonite":
      return (
        <svg
          width="64"
          height="64"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <rect width="64" height="64" rx="12" fill="#EFE3C8" />
          <rect
            x="12"
            y="16"
            width="40"
            height="32"
            rx="4"
            fill="#E9967A"
            stroke="#1E1E24"
            strokeWidth="2.5"
          />
          <circle cx="22" cy="26" r="2.5" fill="#1E1E24" opacity="0.4" />
          <circle cx="34" cy="22" r="2" fill="#1E1E24" opacity="0.3" />
          <circle cx="42" cy="30" r="3" fill="#1E1E24" opacity="0.25" />
          <circle cx="26" cy="36" r="2" fill="#1E1E24" opacity="0.35" />
          <circle cx="38" cy="38" r="2.5" fill="#1E1E24" opacity="0.3" />
          <circle cx="20" cy="40" r="1.5" fill="#1E1E24" opacity="0.2" />
          <circle cx="46" cy="22" r="1.5" fill="#1E1E24" opacity="0.25" />
        </svg>
      );
    case "concrete":
      return (
        <svg
          width="64"
          height="64"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <rect width="64" height="64" rx="12" fill="#E8E8E6" />
          <rect
            x="10"
            y="20"
            width="44"
            height="28"
            rx="3"
            fill="#708090"
            stroke="#1E1E24"
            strokeWidth="2.5"
          />
          <line
            x1="10"
            y1="34"
            x2="54"
            y2="34"
            stroke="#1E1E24"
            strokeWidth="1.5"
            opacity="0.4"
          />
          <line
            x1="32"
            y1="20"
            x2="32"
            y2="48"
            stroke="#1E1E24"
            strokeWidth="1.5"
            opacity="0.4"
          />
          <rect
            x="14"
            y="24"
            width="8"
            height="4"
            rx="1"
            fill="#1E1E24"
            opacity="0.15"
          />
          <rect
            x="36"
            y="38"
            width="10"
            height="4"
            rx="1"
            fill="#1E1E24"
            opacity="0.15"
          />
        </svg>
      );
    default:
      return null;
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
        className={`grid transition-[grid-template-rows,opacity,margin-bottom] duration-300 ease-in-out ${
          hasSelection
            ? "grid-rows-[0fr] opacity-0 mb-0 pointer-events-none"
            : "grid-rows-[1fr] opacity-100 mb-4"
        }`}
        style={{
          transitionDuration: "280ms",
          transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
          transitionDelay: hasSelection ? "0ms" : "90ms",
        }}
      >
        <div className="overflow-hidden min-h-0">
          <h2 className="font-display text-2xl text-[#1E1E24]">
            What are we mixing?
          </h2>
        </div>
      </div>

      <div className="flex flex-col">
        {materials.map((material) => {
          const isSelected = material.id === selectedId;
          const isHidden = hasSelection && !isSelected;
          const subtitle = getMaterialSubtitle(material);

          return (
            <div
              key={material.id}
              aria-hidden={isHidden}
              className={`grid transition-[grid-template-rows,opacity,margin-bottom] duration-300 ease-in-out ${
                isHidden
                  ? "grid-rows-[0fr] opacity-0 mb-0 pointer-events-none"
                  : isSelected
                    ? "grid-rows-[1fr] opacity-100 mb-4"
                    : "grid-rows-[1fr] opacity-100 mb-3"
              }`}
              style={{
                transitionDuration: "280ms",
                transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                transitionDelay: isHidden ? "0ms" : isSelected ? "0ms" : "90ms",
              }}
            >
              <div className="min-h-0 overflow-hidden pt-1 pl-1 pr-1.5 pb-1.5 -mt-1 -ml-1 -mr-1.5 -mb-1.5">
                {isSelected ? (
                  <div
                    key={`selected-${material.id}`}
                    style={{ boxShadow: "4px 4px 0px var(--accent)" }}
                    className="w-full bg-[var(--accent-surface)] brutal-border border-l-4 border-l-[var(--accent)] rounded-2xl p-4 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div
                        className={`w-16 h-16 rounded-xl brutal-border bg-white flex items-center justify-center shrink-0 overflow-hidden ${activeAnimation}`}
                        onAnimationEnd={() => setActiveAnimation("")}
                      >
                        {renderMaterialSvg(material.id)}
                      </div>
                      <div className="min-w-0">
                        <span className="font-display text-xl text-[#1E1E24] block truncate">
                          {material.name}
                        </span>
                        {subtitle && (
                          <span className="text-sm font-body text-gray-500 block truncate">
                            {subtitle}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelect(null)}
                      className="bg-white brutal-border text-[#1E1E24] font-display text-sm px-3 py-1 rounded-xl brutal-shadow shrink-0 active:translate-x-0.5 active:translate-y-0.5 transition-transform cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <button
                    key={`unselected-${material.id}`}
                    type="button"
                    tabIndex={isHidden ? -1 : 0}
                    onClick={() => onSelect(material.id)}
                    className={`w-full bg-white rounded-2xl p-4 flex items-center justify-between gap-4 cursor-pointer text-left hover:bg-gray-50 active:translate-x-0.5 active:translate-y-0.5 transition-all duration-150 ${
                      isHidden
                        ? "border-2 border-transparent shadow-none"
                        : "brutal-border brutal-shadow"
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-16 h-16 rounded-xl brutal-border bg-white flex items-center justify-center shrink-0 overflow-hidden">
                        {renderMaterialSvg(material.id)}
                      </div>
                      <div className="min-w-0">
                        <span className="font-display text-xl text-[#1E1E24] block truncate">
                          {material.name}
                        </span>
                        {subtitle && (
                          <span className="text-sm font-body text-gray-500 block truncate">
                            {subtitle}
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      aria-hidden="true"
                      className="w-9 h-9 rounded-full brutal-border flex items-center justify-center shrink-0 text-[#1E1E24] bg-white"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4"
                      >
                        <path
                          d="M3 8H13M13 8L8.5 3.5M13 8L8.5 12.5"
                          stroke="#1E1E24"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default MaterialPicker;
