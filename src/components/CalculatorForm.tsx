import { useEffect, useState } from "react";
import type { Material, WcRatioKey } from "../types/materials";
import type { VolumeUnit } from "../utils/calculate";
import { InfoPopover } from "./InfoPopover";

export type DisplayVolumeUnit = "ml" | "L" | "cm³" | "mm³" | "g of water";

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
  "Fill the mould with water and weigh it (1g of water equals 1 ml). Alternatively, submerge your master in water and record the volume increase.";

const WASTE_EXPLANATIONS: Record<string, string> = {
  simple: "Basic open-face mould with minimal detail or waste.",
  standard: "Typical hobby mould with everyday spillage and cup cling.",
  fiddly: "Complex shapes, deep undercuts, or large moulds.",
};

const VOLUME_UNITS: { value: DisplayVolumeUnit; label: string }[] = [
  { value: "ml", label: "ml" },
  { value: "L", label: "L" },
  { value: "cm³", label: "cm³" },
  { value: "mm³", label: "mm³" },
  { value: "g of water", label: "g of water" },
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
    { id: "fiddly", label: "Fiddly or large", pct: fiddlyPct },
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
      className="flex flex-col gap-5 bg-white brutal-border brutal-shadow-lg rounded-2xl p-5 mb-4"
    >
      {/* Field 1: Type / use */}
      <div className="flex flex-col">
        <label
          htmlFor="variant-select"
          className="font-display text-xs tracking-widest uppercase text-gray-500 mb-1"
        >
          Type / use
        </label>
        <div className="relative">
          <select
            id="variant-select"
            value={selectedVariant?.id ?? ""}
            onChange={(e) => handleVariantChange(e.target.value)}
            className="w-full appearance-none brutal-border rounded-xl pl-4 pr-10 py-3 font-body text-base bg-white text-[#1E1E24] focus:outline-none cursor-pointer"
          >
            {liveVariants.map((variant) => (
              <option key={variant.id} value={variant.id}>
                {variant.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#1E1E24]">
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-3.5 h-3.5"
            >
              <path
                d="M3.5 6L8 10.5L12.5 6"
                stroke="#1E1E24"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        {selectedVariant?.useCase && (
          <p className="mt-1.5 font-body text-xs text-gray-500">{selectedVariant.useCase}</p>
        )}
      </div>

      {/* Silicone only: Product */}
      {selectedVariant && isSilicone && availableExamples.length > 0 && (
        <div className="flex flex-col">
          <label
            htmlFor="example-select"
            className="font-display text-xs tracking-widest uppercase text-gray-500 mb-1"
          >
            Product
          </label>
          <div className="relative">
            <select
              id="example-select"
              value={formState.selectedExampleId ?? ""}
              onChange={(e) =>
                updateState({
                  selectedExampleId: e.target.value ? e.target.value : null,
                })
              }
              className="w-full appearance-none brutal-border rounded-xl pl-4 pr-10 py-3 font-body text-base bg-white text-[#1E1E24] focus:outline-none cursor-pointer"
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
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#1E1E24]">
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-3.5 h-3.5"
              >
                <path
                  d="M3.5 6L8 10.5L12.5 6"
                  stroke="#1E1E24"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Custom datasheet inputs when sourceType === "user" */}
      {selectedVariant && isCustomDatasheet && (
        <div className="grid grid-cols-3 gap-3 brutal-border rounded-xl bg-gray-50 p-3.5">
          <div className="flex flex-col">
            <label
              htmlFor="user-part-a"
              className="font-display text-xs tracking-widest uppercase text-gray-500 mb-1"
            >
              Part A wt
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
              className="w-full brutal-border rounded-lg px-2.5 py-2 font-body text-base bg-white text-[#1E1E24] focus:outline-none"
            />
          </div>
          <div className="flex flex-col">
            <label
              htmlFor="user-part-b"
              className="font-display text-xs tracking-widest uppercase text-gray-500 mb-1"
            >
              Part B wt
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
              className="w-full brutal-border rounded-lg px-2.5 py-2 font-body text-base bg-white text-[#1E1E24] focus:outline-none"
            />
          </div>
          <div className="flex flex-col">
            <label
              htmlFor="user-density"
              className="font-display text-xs tracking-widest uppercase text-gray-500 mb-1"
            >
              Density
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
              className="w-full brutal-border rounded-lg px-2.5 py-2 font-body text-base bg-white text-[#1E1E24] focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Concrete only: W/C ratio segmented control */}
      {selectedVariant && isConcrete && (
        <div className="flex flex-col">
          <span className="font-display text-xs tracking-widest uppercase text-gray-500 mb-1">
            Mix consistency (water-to-cement)
          </span>
          <div
            role="group"
            aria-label="Mix consistency"
            className="grid grid-cols-3 brutal-border rounded-xl overflow-hidden divide-x-2 divide-[#1E1E24]"
          >
            {WC_OPTIONS.map((opt) => {
              const active = formState.wcRatioKey === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => updateState({ wcRatioKey: opt.key })}
                  className={`min-h-[44px] py-2.5 px-2 font-display text-sm transition-colors ${
                    active
                      ? "bg-[#1E1E24] text-white"
                      : "bg-white text-[#1E1E24] hover:bg-gray-50"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          {selectedVariant.wcRatioOptions?.[formState.wcRatioKey]?.note && (
            <p className="mt-1.5 font-body text-xs text-gray-500">
              {selectedVariant.wcRatioOptions[formState.wcRatioKey]?.note}
            </p>
          )}
        </div>
      )}

      {/* Field 2: Volume */}
      {selectedVariant && (
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor="volume-input"
              className="font-display text-xs tracking-widest uppercase text-gray-500"
            >
              Volume
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
              className="min-w-0 flex-1 brutal-border rounded-xl px-4 py-3 font-body text-lg text-[#1E1E24] placeholder:text-gray-400 focus:outline-none"
            />

            <div className="relative shrink-0">
              <select
                aria-label="Volume unit"
                value={formState.volumeUnit}
                onChange={(e) =>
                  updateState({ volumeUnit: e.target.value as VolumeUnit })
                }
                className="appearance-none brutal-border rounded-xl pl-3 pr-8 py-3 font-body text-base text-[#1E1E24] bg-white focus:outline-none cursor-pointer"
              >
                {VOLUME_UNITS.map((unit) => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-[#1E1E24]">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3 h-3"
                >
                  <path
                    d="M3.5 6L8 10.5L12.5 6"
                    stroke="#1E1E24"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Field 3: Waste preset (hidden for silicone, which always uses 15%) */}
      {selectedVariant && !isSilicone && (
        <div className="flex flex-col">
          <span className="font-display text-xs tracking-widest uppercase text-gray-500 mb-1">
            Extra for waste
          </span>

          <div
            role="group"
            aria-label="Waste preset"
            className="grid grid-cols-3 brutal-border rounded-xl overflow-hidden divide-x-2 divide-[#1E1E24]"
          >
            {wasteButtons.map((preset) => {
              const active = formState.wastePct === preset.pct;
              return (
                <button
                  key={preset.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => updateState({ wastePct: preset.pct })}
                  className={`min-h-[44px] py-2.5 px-1.5 font-display text-xs sm:text-sm transition-colors ${
                    active
                      ? "bg-[#1E1E24] text-white"
                      : "bg-white text-[#1E1E24] hover:bg-gray-50"
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
              <p className="mt-1.5 font-body text-xs text-gray-500">{explanation}</p>
            ) : null;
          })()}
        </div>
      )}
    </form>
  );
}

export default CalculatorForm;
