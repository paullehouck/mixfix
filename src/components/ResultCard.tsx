import { useEffect, useState } from "react";
import type { Additive, MaterialVariant } from "../types/materials";
import type { AdditiveInput, CalculateResult } from "../utils/calculate";

export interface ResultCardProps {
  result: CalculateResult;
  variant: MaterialVariant;
  onReset: () => void;
  activeAdditives?: AdditiveInput[];
  onAdditivesChange?: (additives: AdditiveInput[]) => void;
}

function getSourceBadgeText(sourceType: string): string {
  switch (sourceType) {
    case "estimate":
      return "≈ Estimate";
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

function formatDoseUnit(additive: Additive): string {
  switch (additive.type) {
    case "percentOfTotal":
    case "percentOfComponent":
    case "reducesWater":
      return "%";
    case "gPerKg":
      return "g/kg";
  }
}

export function ResultCard({
  result,
  variant,
  onReset,
  activeAdditives: controlledAdditives,
  onAdditivesChange,
}: ResultCardProps) {
  const [internalAdditives, setInternalAdditives] = useState<AdditiveInput[]>([]);
  const [copied, setCopied] = useState(false);

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

  function computeFallbackAdditiveGrams(additive: Additive, dose: number): number {
    const calculated = result.additives.find((a) => a.id === additive.id);
    if (calculated && controlledAdditives) {
      return calculated.grams;
    }
    switch (additive.type) {
      case "percentOfTotal":
        return Math.round(result.totalGrams * (dose / 100));
      case "percentOfComponent": {
        const comp = result.components.find((c) => c.id === additive.componentId);
        return Math.round((comp?.grams ?? 0) * (dose / 100));
      }
      case "gPerKg":
        return Math.round((result.totalGrams / 1000) * dose);
      case "reducesWater":
        return 0;
    }
  }

  const potLifeText = formatPotLife(variant.potLifeMin);
  const badgeText = result.exampleName
    ? "By the book"
    : getSourceBadgeText(result.sourceType);

  async function handleCopyRecipe() {
    const headerTitle = result.exampleName
      ? `${variant.name} · ${result.exampleName} (By the book)`
      : `${variant.name} (${badgeText})`;

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

    if (activeAdditives.length > 0) {
      lines.push("");
      lines.push("Additives:");
      for (const active of activeAdditives) {
        const def = variant.additives.find((a) => a.id === active.id);
        if (!def) continue;
        const unit = formatDoseUnit(def);
        const calcAdd = result.additives.find((a) => a.id === active.id);
        const grams =
          calcAdd !== undefined
            ? calcAdd.grams
            : computeFallbackAdditiveGrams(def, active.value);
        if (def.type === "reducesWater") {
          lines.push(`- ${def.name}: ${active.value}${unit} water reduction`);
        } else {
          lines.push(`- ${def.name} (${active.value}${unit}): ${grams} g`);
        }
      }
    }

    if (potLifeText) {
      lines.push(`Pot life: ${potLifeText}`);
    }
    if (variant.demouldTime) {
      lines.push(`Demould time: ${variant.demouldTime}`);
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
      className="flex flex-col gap-4 rounded-2xl border-2 border-[var(--accent)] bg-white p-5 shadow-sm"
    >
      {/* Header & Source Badge */}
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-bold tracking-tight text-stone-900">
          Your mix
        </h3>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)]/25 px-3 py-1 text-xs font-semibold text-stone-900">
          <span>{badgeText}</span>
          {result.exampleName && (
            <span className="border-l border-stone-400/40 pl-1.5 font-medium text-stone-700">
              {result.exampleName}
            </span>
          )}
        </span>
      </div>

      {/* Component Rows */}
      <div className="flex flex-col gap-2.5">
        {result.components.map((comp) => (
          <div
            key={comp.id}
            className="flex items-baseline justify-between gap-4 text-base"
          >
            <span className="font-medium text-stone-700">{comp.name}</span>
            <span className="text-right text-xl font-extrabold tabular-nums text-stone-950">
              {comp.grams} g
            </span>
          </div>
        ))}

        {result.water && (
          <div className="flex items-start justify-between gap-4 text-base">
            <div>
              <span className="font-medium text-stone-700">
                Water
                {result.water.adjusted && (
                  <span className="ml-1.5 rounded-md bg-stone-100 px-1.5 py-0.5 text-xs font-semibold text-stone-600">
                    Adjusted
                  </span>
                )}
              </span>
              <p className="text-xs text-stone-500">
                add gradually to the dry mix
              </p>
            </div>
            <span className="text-right text-xl font-extrabold tabular-nums text-stone-950">
              {result.water.grams} g
            </span>
          </div>
        )}
      </div>

      {/* Divider Line */}
      <hr className="border-stone-200" />

      {/* Total Grams */}
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-base font-bold text-stone-900">Total mix</span>
        <span className="text-right text-2xl font-black tabular-nums text-stone-950">
          {result.totalGrams} g
        </span>
      </div>

      {/* Pot life and Demould time */}
      {(potLifeText || variant.demouldTime) && (
        <div className="flex flex-col gap-1.5 rounded-xl bg-stone-50 p-3 text-xs text-stone-600">
          {potLifeText && (
            <div>
              <span className="font-semibold text-stone-800">Pot life: </span>
              <span>{potLifeText}</span>
            </div>
          )}
          {variant.demouldTime && (
            <div>
              <span className="font-semibold text-stone-800">Demould: </span>
              <span>{variant.demouldTime}</span>
            </div>
          )}
        </div>
      )}

      {/* Additives */}
      {variant.additives.length > 0 && (
        <div className="flex flex-col gap-2.5 pt-1">
          {variant.additives.map((additive) => {
            const activeEntry = activeAdditives.find(
              (a) => a.id === additive.id
            );

            if (!activeEntry) {
              return (
                <button
                  key={additive.id}
                  type="button"
                  onClick={() => handleExpandAdditive(additive)}
                  className="flex h-10 w-full items-center justify-between rounded-xl border border-dashed border-stone-300 px-3.5 text-left text-sm font-semibold text-stone-700 hover:border-stone-400 hover:bg-stone-50"
                >
                  <span>+ Add {additive.name}</span>
                </button>
              );
            }

            const calcAdd = result.additives.find((a) => a.id === additive.id);
            const grams =
              calcAdd !== undefined
                ? calcAdd.grams
                : computeFallbackAdditiveGrams(additive, activeEntry.value);
            const unit = formatDoseUnit(additive);
            const step = additive.max <= 5 ? 0.5 : 1;

            return (
              <div
                key={additive.id}
                className="flex flex-col gap-2 rounded-xl border border-stone-200 bg-stone-50 p-3.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-bold text-stone-900">
                      {additive.name}
                    </span>
                    <span className="text-xs font-semibold text-stone-500">
                      ({activeEntry.value} {unit})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold tabular-nums text-stone-950">
                      {additive.type === "reducesWater"
                        ? `−${activeEntry.value}% water`
                        : `${grams} g`}
                    </span>
                    <button
                      type="button"
                      aria-label={`Remove ${additive.name}`}
                      onClick={() => handleCollapseAdditive(additive.id)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-base font-bold text-stone-500 hover:bg-stone-200 hover:text-stone-900"
                    >
                      ×
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs tabular-nums text-stone-500">
                    {additive.min}
                    {unit}
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
                  <span className="text-xs tabular-nums text-stone-500">
                    {additive.max}
                    {unit}
                  </span>
                </div>

                <p className="text-xs leading-relaxed text-stone-600">
                  {additive.note}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-1 grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={handleCopyRecipe}
          className="h-11 rounded-xl bg-[var(--accent)] px-4 text-sm font-bold text-stone-950 shadow-xs hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-950"
        >
          {copied ? "Copied!" : "Copy recipe"}
        </button>

        <button
          type="button"
          onClick={onReset}
          className="h-11 rounded-xl bg-[var(--accent)] px-4 text-sm font-bold text-stone-950 shadow-xs hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-950"
        >
          Mix again
        </button>
      </div>
    </section>
  );
}

export default ResultCard;

