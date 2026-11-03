import { useEffect, useState } from "react";
import type { Material, WcRatioKey } from "../types/materials";
import type { VolumeUnit } from "../utils/calculate";
import { InfoPopover } from "./InfoPopover";

export type DisplayVolumeUnit = "ml" | "L" | "cm³" | "mm³";

export interface CalculatorFormState {
  selectedVariantId: string;
  selectedExampleId: string | null;
  wcRatioKey: WcRatioKey;
  volumeInput: string;
  volumeUnit: VolumeUnit;
  wastePct: number;
  userDensityGPerMl?: number;
  userRatioPartA?: number;
  userRatioPartB?: number;
}

export interface CalculatorFormProps {
  material: Material;
  value?: CalculatorFormState;
  onFormChange: (state: CalculatorFormState) => void;
}

const DEFAULT_VOLUME_HINT =
  "Fill your mould with water and weigh it on digital scales. 1 gram of water equals 1 ml of volume.";

const WASTE_EXPLANATIONS: Record<string, string> = {
  simple: "Basic open-face mould with minimal detail or waste.",
  standard: "Typical hobby mould with everyday spillage and cup cling.",
  fiddly: "Complex shapes, deep undercuts, or large moulds.",
};

const VOLUME_UNITS: { value: DisplayVolumeUnit; label: string }[] = [
  { value: "ml", label: "ml / g of water" },
  { value: "L", label: "L" },
  { value: "cm³", label: "cm³" },
  { value: "mm³", label: "mm³" },
];

const WC_OPTIONS: { key: WcRatioKey; label: string }[] = [
  { key: "pourable", label: "Pourable" },
  { key: "balanced", label: "Balanced" },
  { key: "stiff", label: "Stiff" },
];

export function createInitialFormState(material: Material): CalculatorFormState {
  const liveVariants = material.variants.filter((v) => v.status === "live");
  const defaultVariant = liveVariants[0] ?? material.variants[0];
  const isSilicone = material.id === "silicone";
  const defaultStandardWaste = defaultVariant?.wastePresets?.[1]?.pct ?? 10;

  return {
    selectedVariantId: defaultVariant?.id ?? "",
    selectedExampleId: null,
    wcRatioKey: defaultVariant?.wcRatioDefault ?? "balanced",
    volumeInput: "",
    volumeUnit: "ml",
    wastePct: isSilicone ? 15 : (defaultVariant?.wastePctDefault ?? defaultStandardWaste),
    userDensityGPerMl: undefined,
    userRatioPartA: 100,
    userRatioPartB: 10,
  };
}

export function CalculatorForm({
  material,
  value,
  onFormChange,
}: CalculatorFormProps) {
  const [internalState, setInternalState] = useState<CalculatorFormState>(() =>
    createInitialFormState(material)
  );

  // Reset internal state when material changes if uncontrolled
  useEffect(() => {
    if (!value) {
      const next = createInitialFormState(material);
      setInternalState(next);
      onFormChange(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [material.id]);

  const formState = value ?? internalState;

  function updateState(patch: Partial<CalculatorFormState>) {
    const next: CalculatorFormState = { ...formState, ...patch };
    if (!value) {
      setInternalState(next);
    }
    onFormChange(next);
  }

  const liveVariants = material.variants.filter((v) => v.status === "live");
  const selectedVariant =
    liveVariants.find((v) => v.id === formState.selectedVariantId) ??
    liveVariants[0];

  const isSilicone = material.id === "silicone";
  const isConcrete = material.id === "concrete";
  const isCustomDatasheet = selectedVariant?.sourceType === "user";

  const availableExamples = (selectedVariant?.examples ?? []).filter(
    (ex) => ex.densityGPerMl !== null
  );

  const simplePct = selectedVariant?.wastePresets?.[0]?.pct ?? 5;
  const standardPct = selectedVariant?.wastePresets?.[1]?.pct ?? 10;
  const fiddlyPct = selectedVariant?.wastePresets?.[2]?.pct ?? 15;

  const wasteButtons = [
    { id: "simple", label: "Simple", pct: simplePct },
    { id: "standard", label: "Standard", pct: standardPct },
    { id: "fiddly", label: "Fiddly", pct: fiddlyPct },
  ];

  function handleVariantChange(newVariantId: string) {
    const nextVariant = liveVariants.find((v) => v.id === newVariantId);
    const nextStandardPct = nextVariant?.wastePresets?.[1]?.pct ?? 10;
    updateState({
      selectedVariantId: newVariantId,
      selectedExampleId: null,
      wcRatioKey: nextVariant?.wcRatioDefault ?? "balanced",
      wastePct: isSilicone ? 15 : (nextVariant?.wastePctDefault ?? nextStandardPct),
    });
  }

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      aria-label="Calculator inputs"
      className="flex flex-col gap-5 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs"
    >
      {/* Field 1: Type / use */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="variant-select"
          className="text-sm font-semibold text-stone-800"
        >
          Type / use
        </label>
        <select
          id="variant-select"
          value={selectedVariant?.id ?? ""}
          onChange={(e) => handleVariantChange(e.target.value)}
          className="h-12 w-full rounded-xl border border-stone-300 bg-stone-50 px-3.5 text-base font-medium text-stone-900 focus:border-stone-900 focus:bg-white focus:outline-none"
        >
          {liveVariants.map((variant) => (
            <option key={variant.id} value={variant.id}>
              {variant.name}
            </option>
          ))}
        </select>
        {selectedVariant?.useCase && (
          <p className="text-xs text-stone-500">{selectedVariant.useCase}</p>
        )}
      </div>

      {/* Silicone only: Your product (optional) */}
      {selectedVariant && isSilicone && availableExamples.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="example-select"
            className="text-sm font-semibold text-stone-800"
          >
            Your product (optional)
          </label>
          <select
            id="example-select"
            value={formState.selectedExampleId ?? ""}
            onChange={(e) =>
              updateState({
                selectedExampleId: e.target.value ? e.target.value : null,
              })
            }
            className="h-12 w-full rounded-xl border border-stone-300 bg-stone-50 px-3.5 text-base font-medium text-stone-900 focus:border-stone-900 focus:bg-white focus:outline-none"
          >
            <option value="">
              Generic ({selectedVariant.densityGPerMl} g/ml)
            </option>
            {availableExamples.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name} ({ex.densityGPerMl} g/ml)
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Custom datasheet inputs when sourceType === "user" */}
      {selectedVariant && isCustomDatasheet && (
        <div className="grid grid-cols-3 gap-3 rounded-xl border border-stone-200 bg-stone-50 p-3.5">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="user-part-a"
              className="text-xs font-semibold text-stone-700"
            >
              Part A weight
            </label>
            <input
              id="user-part-a"
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={formState.userRatioPartA ?? 100}
              onChange={(e) =>
                updateState({
                  userRatioPartA: parseFloat(e.target.value) || 0,
                })
              }
              className="h-10 rounded-lg border border-stone-300 bg-white px-2.5 text-base text-stone-900"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="user-part-b"
              className="text-xs font-semibold text-stone-700"
            >
              Part B weight
            </label>
            <input
              id="user-part-b"
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={formState.userRatioPartB ?? 10}
              onChange={(e) =>
                updateState({
                  userRatioPartB: parseFloat(e.target.value) || 0,
                })
              }
              className="h-10 rounded-lg border border-stone-300 bg-white px-2.5 text-base text-stone-900"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="user-density"
              className="text-xs font-semibold text-stone-700"
            >
              Density (g/ml)
            </label>
            <input
              id="user-density"
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              placeholder="1.15"
              value={formState.userDensityGPerMl ?? ""}
              onChange={(e) =>
                updateState({
                  userDensityGPerMl: e.target.value
                    ? parseFloat(e.target.value)
                    : undefined,
                })
              }
              className="h-10 rounded-lg border border-stone-300 bg-white px-2.5 text-base text-stone-900"
            />
          </div>
        </div>
      )}

      {/* Concrete only: W/C ratio segmented control */}
      {selectedVariant && isConcrete && (
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-stone-800">
            Mix consistency (water-to-cement)
          </span>
          <div
            role="group"
            aria-label="Mix consistency"
            className="grid grid-cols-3 gap-1.5 rounded-xl bg-stone-100 p-1"
          >
            {WC_OPTIONS.map((opt) => {
              const active = formState.wcRatioKey === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => updateState({ wcRatioKey: opt.key })}
                  className={`h-10 rounded-lg text-sm font-semibold transition-colors ${
                    active
                      ? "bg-[var(--accent)] text-stone-950 shadow-xs"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          {selectedVariant.wcRatioOptions?.[formState.wcRatioKey]?.note && (
            <p className="text-xs text-stone-500">
              {selectedVariant.wcRatioOptions[formState.wcRatioKey]?.note}
            </p>
          )}
        </div>
      )}

      {/* Field 2: Volume */}
      {selectedVariant && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="volume-input"
              className="text-sm font-semibold text-stone-800"
            >
              Mould volume
            </label>
            <InfoPopover
              label="How to measure mould volume"
              text={material.volumeHint ?? DEFAULT_VOLUME_HINT}
            />
          </div>

          <div className="flex gap-2">
            <input
              id="volume-input"
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              placeholder="e.g. 500"
              value={formState.volumeInput}
              onChange={(e) => updateState({ volumeInput: e.target.value })}
              className="h-12 min-w-0 flex-1 rounded-xl border border-stone-300 bg-stone-50 px-3.5 text-base font-medium text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:bg-white focus:outline-none"
            />

            <select
              aria-label="Volume unit"
              value={formState.volumeUnit}
              onChange={(e) =>
                updateState({ volumeUnit: e.target.value as VolumeUnit })
              }
              className="h-12 w-auto max-w-[160px] shrink-0 rounded-xl border border-stone-300 bg-stone-50 px-3 text-sm font-semibold text-stone-900 focus:border-stone-900 focus:bg-white focus:outline-none"
            >
              {VOLUME_UNITS.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Field 3: Waste preset (hidden for silicone, which always uses 15%) */}
      {selectedVariant && !isSilicone && (
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-stone-800">
            Extra for waste
          </span>

          <div
            role="group"
            aria-label="Waste preset"
            className="grid grid-cols-3 gap-1.5 rounded-xl bg-stone-100 p-1"
          >
            {wasteButtons.map((preset) => {
              const active = formState.wastePct === preset.pct;
              return (
                <button
                  key={preset.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => updateState({ wastePct: preset.pct })}
                  className={`h-10 rounded-lg text-sm font-semibold transition-colors ${
                    active
                      ? "bg-[var(--accent)] text-stone-950 shadow-xs"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  {preset.label} ({preset.pct}%)
                </button>
              );
            })}
          </div>
          {(() => {
            const selectedPreset = wasteButtons.find(
              (p) => p.pct === formState.wastePct
            );
            const explanation = selectedPreset?.id
              ? WASTE_EXPLANATIONS[selectedPreset.id]
              : undefined;
            return explanation ? (
              <p className="text-xs text-stone-500">{explanation}</p>
            ) : null;
          })()}
        </div>
      )}
    </form>
  );
}

export default CalculatorForm;

