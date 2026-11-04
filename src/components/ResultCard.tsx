import { useEffect, useState } from "react";
import type { Additive, MaterialVariant } from "../types/materials";
import type { AdditiveInput, CalculateResult } from "../utils/calculate";

export interface ResultCardProps {
  result: CalculateResult;
  variant: MaterialVariant;
  materialId?: string;
  onReset: () => void;
  activeAdditives?: AdditiveInput[];
  onAdditivesChange?: (additives: AdditiveInput[]) => void;
}

function getSourceBadgeText(sourceType: string): string {
  switch (sourceType) {
    case "estimate":
      return "Estimate";
    case "official":
      return "By the book";
    case "maker-tested":
      return "Tested at my bench";
    case "user":
      return "From your datasheet";
    default:
      return sourceType;
  }
}

function formatPotLife(potLifeMin: [number, number] | number | null): string | null {
  if (potLifeMin === null || potLifeMin === undefined) return null;
  if (Array.isArray(potLifeMin)) {
    return `${potLifeMin[0]}–${potLifeMin[1]} min`;
  }
  return `${potLifeMin} min`;
}

function calculateAdditiveRange(
  additive: Additive,
  result: CalculateResult
): { minG: number; maxG: number } {
  const totalMass = result.totalGrams;
  let minG = 0;
  let maxG = 0;

  switch (additive.type) {
    case "percentOfTotal":
      minG = (totalMass * additive.min) / 100;
      maxG = (totalMass * additive.max) / 100;
      break;
    case "percentOfComponent": {
      const comp = result.components.find((c) => c.id === additive.componentId);
      const componentMass = comp?.grams ?? 0;
      minG = (componentMass * additive.min) / 100;
      maxG = (componentMass * additive.max) / 100;
      break;
    }
    case "gPerKgOfComponent": {
      const comp = result.components.find((c) => c.id === additive.componentId);
      const componentMass = comp?.grams ?? 0;
      minG = (componentMass / 1000) * additive.min;
      maxG = (componentMass / 1000) * additive.max;
      break;
    }
    case "gPerKg":
      minG = (totalMass / 1000) * additive.min;
      maxG = (totalMass / 1000) * additive.max;
      break;
    default:
      break;
  }

  return { minG, maxG };
}

function formatGramValue(val: number): string {
  if (val < 10) {
    const rounded = Math.round(val * 10) / 10;
    return `${rounded} g`;
  }
  return `${Math.round(val)} g`;
}

function formatGramRange(minG: number, maxG: number, rawMin: number): string {
  if (rawMin === 0 || minG === 0) {
    return `up to ${formatGramValue(maxG)}`;
  }
  const minVal = minG < 10 ? Math.round(minG * 10) / 10 : Math.round(minG);
  const maxVal = maxG < 10 ? Math.round(maxG * 10) / 10 : Math.round(maxG);
  if (minVal === maxVal) {
    return `${minVal} g`;
  }
  return `${minVal}–${maxVal} g`;
}

export function ResultCard({
  result,
  variant,
  materialId,
  onReset,
  activeAdditives: controlledAdditives,
  onAdditivesChange,
}: ResultCardProps) {
  const [internalAdditives, setInternalAdditives] = useState<AdditiveInput[]>([]);
  const [copied, setCopied] = useState(false);

  const isJesmonite =
    materialId === "jesmonite" ||
    variant.id.toLowerCase().startsWith("ac") ||
    variant.name.toLowerCase().includes("jesmonite") ||
    variant.components.some(
      (c) =>
        c.name.toLowerCase().includes("ac100") ||
        c.name.toLowerCase().includes("ac730") ||
        c.name.toLowerCase().includes("ac300")
    );

  useEffect(() => {
    if (!controlledAdditives) {
      const defaults = variant.additives
        .filter((a) => a.enabledByDefault && a.default > 0)
        .map((a) => ({ id: a.id, value: a.default }));
      setInternalAdditives(defaults);
    }
  }, [variant.id, controlledAdditives, variant.additives]);

  const activeAdditives = controlledAdditives ?? internalAdditives;

  function updateAdditives(next: AdditiveInput[]) {
    if (!controlledAdditives) {
      setInternalAdditives(next);
    }
    onAdditivesChange?.(next);
  }

  function handleExpandAdditive(additive: Additive) {
    const initialDose =
      additive.default > 0
        ? additive.default
        : additive.min > 0
          ? additive.min
          : Math.min(1, additive.max);
    const next = [
      ...activeAdditives.filter((a) => a.id !== additive.id),
      { id: additive.id, value: initialDose },
    ];
    updateAdditives(next);
  }

  function handleCollapseAdditive(additiveId: string) {
    const next = activeAdditives.filter((a) => a.id !== additiveId);
    updateAdditives(next);
  }

  function handleChangeAdditiveDose(additiveId: string, value: number) {
    const next = activeAdditives.map((a) =>
      a.id === additiveId ? { ...a, value } : a
    );
    updateAdditives(next);
  }

  const potLifeText = formatPotLife(variant.potLifeMin);
  const badgeText = result.exampleName
    ? "By the book"
    : getSourceBadgeText(result.sourceType);

  async function handleCopyRecipe() {
    const headerTitle = `${variant.name} (${badgeText})`;

    const lines: string[] = [
      headerTitle,
      "------------------------------",
      ...result.components.map((c) => `${c.name}: ${c.grams} g`),
    ];

    if (result.water) {
      lines.push(
        `Water${result.water.adjusted ? " (adjusted)" : ""}: ${result.water.grams} g (add gradually to the dry mix)`
      );
    }

    lines.push("------------------------------");
    lines.push(`Total: ${result.totalGrams} g`);

    const staticAdditives = variant.additives.filter(
      (a) => a.type !== "reducesWater"
    );
    const activePlasticisers = activeAdditives.filter((active) => {
      const def = variant.additives.find((a) => a.id === active.id);
      return def?.type === "reducesWater";
    });

    if (staticAdditives.length > 0 || activePlasticisers.length > 0) {
      lines.push("");
      lines.push("Additives:");
      for (const additive of staticAdditives) {
        const { minG, maxG } = calculateAdditiveRange(additive, result);
        const rangeText = formatGramRange(minG, maxG, additive.min);
        lines.push(`- ${additive.name}: ${rangeText}`);
      }
      for (const active of activePlasticisers) {
        const def = variant.additives.find((a) => a.id === active.id);
        if (def) {
          lines.push(`- ${def.name}: −${active.value}% water`);
        }
      }
    }

    if (potLifeText) {
      lines.push(`⏱ Pot life: ${potLifeText}`);
    }
    if (variant.demouldTime) {
      lines.push(`⏳ Demould: ${variant.demouldTime}`);
    }

    const text = lines.join("\n");
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <section
      aria-label="Mix result"
      className="bg-[var(--accent-surface)] brutal-border brutal-shadow-lg rounded-2xl p-5 animate-fade-up border-l-4 border-l-[var(--accent)] flex flex-col gap-4"
    >
      {/* Header & Source Badge */}
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display text-lg text-[#1E1E24]">
          Your mix
        </h3>
        <span className="brutal-border rounded-full px-3 py-1 text-xs font-display bg-white text-[#1E1E24]">
          {badgeText}
        </span>
      </div>

      {/* Component Rows */}
      <div className="flex flex-col gap-3">
        {result.components.map((comp) => (
          <div
            key={comp.id}
            className="flex items-baseline justify-between gap-4"
          >
            <span className="font-body text-sm text-gray-700">{comp.name}</span>
            <span className="font-display text-right text-2xl text-[#1E1E24] tabular-nums">
              {comp.grams} g
            </span>
          </div>
        ))}

        {result.water && (
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="font-body text-sm text-gray-700">
                Water
                {result.water.adjusted && (
                  <span className="ml-1.5 brutal-border rounded-md bg-white px-1.5 py-0.5 text-xs font-body font-semibold text-gray-700">
                    Adjusted
                  </span>
                )}
              </span>
              <p className="font-body text-xs text-gray-500">
                add gradually to the dry mix
              </p>
            </div>
            <span className="font-display text-right text-2xl text-[#1E1E24] tabular-nums">
              {result.water.grams} g
            </span>
          </div>
        )}
      </div>

      {/* Divider Line */}
      <hr className="border-t-2 border-[#1E1E24] my-3" />

      {/* Total Row */}
      <div className="flex items-baseline justify-between gap-4">
        <span className="font-display text-base text-[#1E1E24]">Total mix</span>
        <span className="font-display text-right text-3xl text-[#1E1E24] tabular-nums">
          {result.totalGrams} g
        </span>
      </div>

      {/* Pot life and Demould time */}
      {(potLifeText || variant.demouldTime) && (
        <div className="flex flex-col gap-2 rounded-xl bg-white brutal-border p-3 font-body text-sm text-gray-700">
          {potLifeText && (
            <div className="flex items-center gap-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 shrink-0 text-[#1E1E24]"
                aria-hidden="true"
              >
                <circle cx="8" cy="9.2" r="5.2" stroke="#1E1E24" strokeWidth="1.8" />
                <path
                  d="M8 6.5V9.2H10.5"
                  stroke="#1E1E24"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <line
                  x1="8"
                  y1="1.5"
                  x2="8"
                  y2="4"
                  stroke="#1E1E24"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <line
                  x1="6"
                  y1="1.5"
                  x2="10"
                  y2="1.5"
                  stroke="#1E1E24"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
              <span>
                <strong className="font-semibold text-gray-700">Pot life: </strong>
                <span>{potLifeText}</span>
              </span>
            </div>
          )}
          {variant.demouldTime && (
            <div className="flex items-center gap-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 shrink-0 text-[#1E1E24]"
                aria-hidden="true"
              >
                <line
                  x1="3.5"
                  y1="2"
                  x2="12.5"
                  y2="2"
                  stroke="#1E1E24"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <line
                  x1="3.5"
                  y1="14"
                  x2="12.5"
                  y2="14"
                  stroke="#1E1E24"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M5 2V4.8L7.4 7.6C7.6 7.8 7.6 8.2 7.4 8.4L5 11.2V14"
                  stroke="#1E1E24"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M11 2V4.8L8.6 7.6C8.4 7.8 8.4 8.2 8.6 8.4L11 11.2V14"
                  stroke="#1E1E24"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <line
                  x1="6.5"
                  y1="11.5"
                  x2="9.5"
                  y2="11.5"
                  stroke="#1E1E24"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <span>
                <strong className="font-semibold text-gray-700">Demould: </strong>
                <span>{variant.demouldTime}</span>
              </span>
            </div>
          )}
        </div>
      )}

      {/* Additives */}
      {variant.additives.length > 0 && (
        <div className="flex flex-col gap-1 pt-1">
          {variant.additives.map((additive) => {
            if (additive.type === "reducesWater") {
              const activeEntry = activeAdditives.find(
                (a) => a.id === additive.id
              );

              if (!activeEntry) {
                return (
                  <button
                    key={additive.id}
                    type="button"
                    onClick={() => handleExpandAdditive(additive)}
                    className="brutal-border rounded-xl p-3 mb-2 bg-white flex items-center gap-2 font-display text-sm text-[#1E1E24] hover:bg-gray-50 w-full text-left transition-colors cursor-pointer"
                  >
                    <span className="font-display text-base leading-none">＋</span>
                    <span>{additive.name}</span>
                  </button>
                );
              }

              const step = additive.max <= 5 ? 0.5 : 1;

              return (
                <div
                  key={additive.id}
                  className="brutal-border rounded-xl p-3 mb-2 bg-white flex flex-col gap-2 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-sm text-[#1E1E24]">
                        {additive.name}
                      </span>
                      <span className="font-body text-xs text-gray-600">
                        ({activeEntry.value}%)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-display text-base text-[#1E1E24]">
                        −{activeEntry.value}% water
                      </span>
                      <button
                        type="button"
                        aria-label={`Remove ${additive.name}`}
                        onClick={() => handleCollapseAdditive(additive.id)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg font-display text-lg text-[#1E1E24] hover:bg-black/5"
                      >
                        ×
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-body text-xs text-gray-600 tabular-nums">
                      {additive.min}%
                    </span>
                    <input
                      type="range"
                      aria-label={`${additive.name} dose`}
                      min={additive.min}
                      max={additive.max}
                      step={step}
                      value={activeEntry.value}
                      onChange={(e) =>
                        handleChangeAdditiveDose(
                          additive.id,
                          parseFloat(e.target.value)
                        )
                      }
                      className="h-2 flex-1 cursor-pointer accent-[var(--accent)]"
                    />
                    <span className="font-body text-xs text-gray-600 tabular-nums">
                      {additive.max}%
                    </span>
                  </div>

                  {additive.note && (
                    <p className="font-body text-xs text-gray-600">
                      {additive.note}
                    </p>
                  )}
                </div>
              );
            }

            // Static gram range additive
            const { minG, maxG } = calculateAdditiveRange(additive, result);
            const rangeText = formatGramRange(minG, maxG, additive.min);

            const isJesmonitePigment = isJesmonite && additive.id === "pigment";
            const showDropsGuide = isJesmonitePigment && result.totalGrams < 300;
            const lowerDrops = Math.max(1, Math.round(result.totalGrams / 10));
            const upperDrops = Math.max(lowerDrops, Math.round(result.totalGrams / 5));

            return (
              <div
                key={additive.id}
                className="brutal-border rounded-xl p-3 mb-2 bg-white flex flex-col gap-1.5 transition-colors"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <span className="font-display text-sm text-[#1E1E24]">
                    {additive.name}
                  </span>
                  <span className="font-display text-base text-[#1E1E24] text-right shrink-0 tabular-nums">
                    {rangeText}
                  </span>
                </div>

                {additive.note && (
                  <p className="font-body text-sm text-gray-500 leading-relaxed">
                    {additive.note}
                  </p>
                )}

                {showDropsGuide && (
                  <p className="font-body text-xs text-gray-400 italic leading-relaxed">
                    {`Roughly ${lowerDrops}–${upperDrops} drops — add gradually and check colour before adding more. Drop size varies by bottle type.`}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-1 flex flex-col">
        <button
          type="button"
          onClick={handleCopyRecipe}
          className="bg-[#1E1E24] text-white font-display brutal-shadow rounded-xl px-6 py-3 w-full mt-4 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
        >
          {copied ? "Copied!" : "Copy recipe"}
        </button>

        <button
          type="button"
          onClick={onReset}
          className="bg-white brutal-border text-[#1E1E24] font-display brutal-shadow rounded-xl px-6 py-3 w-full mt-2 active:translate-x-0.5 active:translate-y-0.5 transition-all hover:bg-gray-50 cursor-pointer"
        >
          Mix again
        </button>
      </div>
    </section>
  );
}

export default ResultCard;
