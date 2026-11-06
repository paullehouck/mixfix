import { useEffect, useState } from "react";
import type { Material } from "../types/materials";

export interface MaterialPickerProps {
  materials: Material[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

function getMaterialAnimation(_id: string): string {
  return "animate-drip";
}

const MATERIAL_SUBTITLES: Record<string, string> = {
  silicone: "Flexible moulds and masters",
  jesmonite: "Intricate, decorative castings",
  concrete: "Durable, large-scale pieces",
};

const MATERIAL_CARD_BG: Record<string, string> = {
  silicone: "#FE91E8",
  jesmonite: "#FFC901",
  concrete: "#BCC7D4",
};

const MATERIAL_ICON_BG: Record<string, string> = {
  silicone: "#FFFFFF",
  jesmonite: "#FFFFFF",
  concrete: "#FFFFFF",
};

function getMaterialSubtitle(material: Material): string {
  return material.subtitle || MATERIAL_SUBTITLES[material.id] || "";
}

function renderMaterialSvg(id: string) {
  switch (id) {
    case "silicone":
      return (
        <svg
          width="62"
          height="62"
          viewBox="0 0 62 62"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full block"
        >
          <path
            d="M31 11C31 11 17.5 27.5 17.5 37.5C17.5 44.9558 23.5442 51 31 51C38.4558 51 44.5 44.9558 44.5 37.5C44.5 27.5 31 11 31 11Z"
            fill="#FE91E8"
            stroke="#222328"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <ellipse
            cx="25"
            cy="38.5"
            rx="2.6"
            ry="4.5"
            transform="rotate(-18 25 38.5)"
            fill="#FFE2F9"
          />
        </svg>
      );
    case "jesmonite":
      return (
        <svg
          width="62"
          height="62"
          viewBox="0 0 62 62"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full block"
        >
          <rect
            x="12.5"
            y="16.5"
            width="37"
            height="29"
            rx="3"
            fill="#FFC901"
            stroke="#222328"
            strokeWidth="2.2"
          />
          {/* Darker square speckles */}
          <rect x="17" y="20.5" width="3.5" height="3.5" rx="0.5" fill="#D8AE11" />
          <rect x="28" y="20" width="4" height="3.5" rx="0.5" fill="#D8AE11" />
          <rect x="40" y="21.5" width="3.5" height="3.5" rx="0.5" fill="#D8AE11" />
          <rect x="22" y="27" width="4" height="4" rx="0.5" fill="#D8AE11" />
          <rect x="33" y="27" width="4.5" height="4.5" rx="0.5" fill="#D8AE11" />
          <rect x="42" y="30" width="3.5" height="3.5" rx="0.5" fill="#D8AE11" />
          <rect x="17" y="34.5" width="4" height="4" rx="0.5" fill="#D8AE11" />
          <rect x="27" y="36" width="4" height="3.5" rx="0.5" fill="#D8AE11" />
          <rect x="38" y="37" width="3.5" height="3.5" rx="0.5" fill="#D8AE11" />
        </svg>
      );
    case "concrete":
      return (
        <svg
          width="62"
          height="62"
          viewBox="0 0 62 62"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full block"
        >
          <rect
            x="11"
            y="18"
            width="40"
            height="26"
            rx="2"
            fill="#BCC7D4"
          />
          {/* Darker grain and joints */}
          <line
            x1="11"
            y1="31"
            x2="51"
            y2="31"
            stroke="#A1ACB9"
            strokeWidth="1.8"
          />
          <line
            x1="31"
            y1="18"
            x2="31"
            y2="31"
            stroke="#A1ACB9"
            strokeWidth="1.8"
          />
          <line
            x1="25"
            y1="31"
            x2="25"
            y2="44"
            stroke="#A1ACB9"
            strokeWidth="1.8"
          />
          <rect
            x="15"
            y="22"
            width="7"
            height="3"
            rx="0.5"
            fill="#A1ACB9"
          />
          <rect
            x="35"
            y="35"
            width="8"
            height="3"
            rx="0.5"
            fill="#A1ACB9"
          />
          <rect
            x="11"
            y="18"
            width="40"
            height="26"
            rx="2"
            stroke="#222328"
            strokeWidth="2.5"
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
            : "grid-rows-[1fr] opacity-100 mb-[16px]"
        }`}
        style={{
          transitionDuration: "280ms",
          transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
          transitionDelay: hasSelection ? "0ms" : "90ms",
        }}
      >
        <div className="overflow-hidden min-h-0 px-[16px]">
          <h2 className="font-bayon font-normal text-[24px] leading-[29px] tracking-[0px] text-[#222328]">
            LETS MIX SOME...
          </h2>
        </div>
      </div>

      <div className="flex flex-col">
        {materials.map((material, index) => {
          const isSelected = material.id === selectedId;
          const isHidden = hasSelection && !isSelected;
          const isLast = index === materials.length - 1;
          const subtitle = getMaterialSubtitle(material);
          const cardBg = MATERIAL_CARD_BG[material.id] ?? "#FFFFFF";
          const iconBg = MATERIAL_ICON_BG[material.id] ?? "#FFFFFF";

          return (
            <div
              key={material.id}
              aria-hidden={isHidden}
              className={`grid transition-[grid-template-rows,opacity,margin-bottom] duration-300 ease-in-out ${
                isHidden
                  ? "grid-rows-[0fr] opacity-0 mb-0 pointer-events-none"
                  : isSelected
                    ? "grid-rows-[1fr] opacity-100 mb-4"
                    : isLast
                      ? "grid-rows-[1fr] opacity-100 mb-0"
                      : "grid-rows-[1fr] opacity-100 mb-[16px]"
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
                    style={{
                      backgroundColor: cardBg,
                      boxShadow: "4px 5px 0px 0px #222328",
                    }}
                    className="w-full min-h-[99px] border-[2px] border-[#222328] rounded-[16px] p-[14px] flex items-center justify-between gap-[16px]"
                  >
                    <div className="flex items-center gap-[16px] min-w-0 flex-1">
                      <div
                        style={{ backgroundColor: iconBg }}
                        className={`w-[62px] h-[62px] rounded-[11px] border-[2.5px] border-[#222328] flex items-center justify-center shrink-0 overflow-hidden ${activeAnimation}`}
                        onAnimationEnd={() => setActiveAnimation("")}
                      >
                        {renderMaterialSvg(material.id)}
                      </div>
                      <div className="min-w-0 flex flex-col gap-[4px] flex-1">
                        <span className="font-bayon font-normal text-[24px] leading-[25px] tracking-[0px] text-[#222328] block truncate">
                          {material.name}
                        </span>
                        {subtitle && (
                          <span className="font-body font-normal text-[14px] leading-[20px] tracking-[0px] text-[#343434] block truncate">
                            {subtitle}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelect(null)}
                      className="bg-[#FFFFFF] border-[2px] border-[#222328] text-[#222328] font-display text-sm px-3 py-1 rounded-xl shadow-[4px_5px_0px_0px_#222328] shrink-0 active:translate-x-0.5 active:translate-y-0.5 transition-transform cursor-pointer"
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
                    style={{ backgroundColor: cardBg }}
                    className={`w-full min-h-[99px] rounded-[16px] p-[14px] flex items-center justify-between gap-[16px] cursor-pointer text-left active:translate-x-0.5 active:translate-y-0.5 transition-all duration-150 ${
                      isHidden
                        ? "border-[2px] border-transparent shadow-none"
                        : "border-[2px] border-[#222328] shadow-[4px_5px_0px_0px_#222328]"
                    }`}
                  >
                    <div className="flex items-center gap-[16px] min-w-0 flex-1">
                      <div
                        style={{ backgroundColor: iconBg }}
                        className="w-[62px] h-[62px] rounded-[11px] border-[2.5px] border-[#222328] flex items-center justify-center shrink-0 overflow-hidden"
                      >
                        {renderMaterialSvg(material.id)}
                      </div>
                      <div className="min-w-0 flex flex-col gap-[4px] flex-1">
                        <span className="font-bayon font-normal text-[24px] leading-[25px] tracking-[0px] text-[#222328] block truncate">
                          {material.name}
                        </span>
                        {subtitle && (
                          <span className="font-body font-normal text-[14px] leading-[20px] tracking-[0px] text-[#343434] block truncate">
                            {subtitle}
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      aria-hidden="true"
                      className="w-[34px] h-[34px] rounded-full border-[2.5px] border-[#222328] flex items-center justify-center shrink-0 text-[#222328] bg-[#FFFFFF]"
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-[15px] h-[15px]"
                      >
                        <path
                          d="M1 7.5H14M14 7.5L8.5 2M14 7.5L8.5 13"
                          stroke="#222328"
                          strokeWidth="2"
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
