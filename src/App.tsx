import { useEffect, useState, type CSSProperties } from "react";
import {
  CalculatorForm,
  createInitialFormState,
  type CalculatorFormState,
} from "./components/CalculatorForm";
import { MaterialPicker } from "./components/MaterialPicker";
import { MakerBenchIllustration } from "./components/MakerBenchIllustration";
import { ResultCard } from "./components/ResultCard";
import { materials } from "./data/loadMaterials";
import type { WcRatioKey } from "./types/materials";
import {
  calculateMix,
  convertVolumeToMl,
  type AdditiveInput,
  type VolumeUnit,
} from "./utils/calculate";

const DEFAULT_ACCENT = "#1FB5A6";
const DEFAULT_ACCENT_SURFACE = "#E8F8F7";

export function App() {
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(
    null
  );
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");
  const [selectedExampleId, setSelectedExampleId] = useState<string | null>(
    null
  );
  const [wcRatioKey, setWcRatioKey] = useState<WcRatioKey>("balanced");
  const [volumeInput, setVolumeInput] = useState<string>("");
  const [volumeUnit, setVolumeUnit] = useState<VolumeUnit>("ml");
  const [wastePct, setWastePct] = useState<number>(10);
  const [activeAdditives, setActiveAdditives] = useState<AdditiveInput[]>([]);
  const [userDensityGPerMl, setUserDensityGPerMl] = useState<
    number | undefined
  >(undefined);
  const [userRatioPartA, setUserRatioPartA] = useState<number | undefined>(100);
  const [userRatioPartB, setUserRatioPartB] = useState<number | undefined>(10);

  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(
    () => typeof window !== "undefined" && window.location.hash === "#about"
  );

  useEffect(() => {
    function handleHashChange() {
      setIsAboutOpen(window.location.hash === "#about");
    }
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const selectedMaterial =
    materials.find((m) => m.id === selectedMaterialId) ?? null;

  const accentColor = selectedMaterial?.theme.accent ?? DEFAULT_ACCENT;
  const accentSurfaceColor =
    selectedMaterial?.id === "silicone"
      ? "#E8F8F7"
      : selectedMaterial?.id === "jesmonite"
        ? "#EFE3C8"
        : selectedMaterial?.id === "concrete"
          ? "#E8E8E6"
          : (selectedMaterial?.theme.surface ?? DEFAULT_ACCENT_SURFACE);

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", accentColor);
    document.documentElement.style.setProperty(
      "--accent-surface",
      accentSurfaceColor
    );
  }, [accentColor, accentSurfaceColor]);

  function openAbout() {
    window.location.hash = "about";
    setIsAboutOpen(true);
  }

  function closeAbout() {
    if (window.location.hash === "#about") {
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search
      );
    }
    setIsAboutOpen(false);
  }

  function handleSelectMaterial(materialId: string | null) {
    setSelectedMaterialId(materialId);

    if (!materialId) {
      setSelectedVariantId("");
      setSelectedExampleId(null);
      setVolumeInput("");
      setActiveAdditives([]);
      return;
    }

    const mat = materials.find((m) => m.id === materialId);
    if (!mat) return;

    const initial = createInitialFormState(mat);
    setSelectedVariantId(initial.selectedVariantId);
    setSelectedExampleId(initial.selectedExampleId);
    setWcRatioKey(initial.wcRatioKey);
    setVolumeInput(initial.volumeInput);
    setVolumeUnit(initial.volumeUnit);
    setWastePct(initial.wastePct);
    setUserDensityGPerMl(initial.userDensityGPerMl);
    setUserRatioPartA(initial.userRatioPartA);
    setUserRatioPartB(initial.userRatioPartB);

    const variant = mat.variants.find(
      (v) => v.id === initial.selectedVariantId
    );
    const defaultAdditives = (variant?.additives ?? [])
      .filter((a) => a.enabledByDefault && a.default > 0)
      .map((a) => ({ id: a.id, value: a.default }));
    setActiveAdditives(defaultAdditives);
  }

  function handleFormChange(next: CalculatorFormState) {
    const variantChanged = next.selectedVariantId !== selectedVariantId;
    setSelectedVariantId(next.selectedVariantId);
    setSelectedExampleId(next.selectedExampleId);
    setWcRatioKey(next.wcRatioKey);
    setVolumeInput(next.volumeInput);
    setVolumeUnit(next.volumeUnit);
    setWastePct(next.wastePct);
    setUserDensityGPerMl(next.userDensityGPerMl);
    setUserRatioPartA(next.userRatioPartA);
    setUserRatioPartB(next.userRatioPartB);

    if (variantChanged && selectedMaterial) {
      const nextVariant = selectedMaterial.variants.find(
        (v) => v.id === next.selectedVariantId
      );
      const defaultAdditives = (nextVariant?.additives ?? [])
        .filter((a) => a.enabledByDefault && a.default > 0)
        .map((a) => ({ id: a.id, value: a.default }));
      setActiveAdditives(defaultAdditives);
    }
  }

  function handleReset() {
    handleSelectMaterial(null);
  }

  const selectedVariant =
    selectedMaterial?.variants.find((v) => v.id === selectedVariantId) ?? null;

  const selectedExample =
    selectedVariant?.examples?.find((ex) => ex.id === selectedExampleId) ??
    null;

  const parsedVolume = parseFloat(volumeInput);
  const volumeMl =
    !Number.isNaN(parsedVolume) && parsedVolume > 0
      ? convertVolumeToMl(parsedVolume, volumeUnit)
      : 0;

  const isSilicone = selectedMaterial?.id === "silicone";
  const effectiveWastePct = isSilicone ? 15 : wastePct;
  const isCustomDatasheet = selectedVariant?.sourceType === "user";
  const hasValidDensity = isCustomDatasheet
    ? Boolean(userDensityGPerMl && userDensityGPerMl > 0)
    : Boolean(
        (selectedExample?.densityGPerMl ?? selectedVariant?.densityGPerMl ?? 0) >
          0
      );

  const calculationResult =
    selectedVariant && volumeMl > 0 && hasValidDensity
      ? calculateMix({
          variant: selectedVariant,
          volumeMl,
          wastePct: effectiveWastePct,
          selectedExampleDensity:
            selectedExample?.densityGPerMl ?? undefined,
          selectedExampleName:
            selectedExample?.name ?? undefined,
          wcRatioKey,
          additives: activeAdditives,
          userDensityGPerMl,
          userComponents: isCustomDatasheet
            ? [
                {
                  id: "a",
                  name: "Part A",
                  parts: userRatioPartA ?? 100,
                },
                {
                  id: "b",
                  name: "Part B",
                  parts: userRatioPartB ?? 10,
                },
              ]
            : undefined,
        })
      : null;

  const rootStyle = {
    "--accent": accentColor,
    "--accent-surface": accentSurfaceColor,
  } as CSSProperties;

  return (
    <div
      style={rootStyle}
      className="min-h-screen text-[#1E1E24] antialiased"
    >
      {/* Neo-brutalist Header */}
      <header className="sticky top-0 z-50 border-b-[2.5px] border-[#1E1E24] bg-[#F7F7F5]">
        <div className="mx-auto flex h-16 max-w-[560px] items-center justify-between px-4">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              closeAbout();
            }}
            className="font-display text-2xl tracking-tight"
          >
            <span className="text-[#1E1E24]">MIX</span>
            <span className="text-[var(--accent)]">FIX</span>
          </a>

          <button
            type="button"
            aria-label="About Mixfix"
            onClick={openAbout}
            className="brutal-border brutal-shadow rounded-full w-11 h-11 bg-white font-display font-bold flex items-center justify-center text-[#1E1E24] active:translate-x-0.5 active:translate-y-0.5 transition-transform"
          >
            ?
          </button>
        </div>
      </header>

      {/* Main Centred Column */}
      <main className="mx-auto flex max-w-[560px] flex-col gap-5 px-4 pt-6 pb-16">
        <MaterialPicker
          materials={materials}
          selectedId={selectedMaterialId}
          onSelect={handleSelectMaterial}
        />

        {selectedMaterial && (
          <CalculatorForm
            material={selectedMaterial}
            value={{
              selectedVariantId,
              selectedExampleId,
              wcRatioKey,
              volumeInput,
              volumeUnit,
              wastePct,
              userDensityGPerMl,
              userRatioPartA,
              userRatioPartB,
            }}
            onFormChange={handleFormChange}
          />
        )}

        {selectedVariant && calculationResult && (
          <ResultCard
            result={calculationResult}
            variant={selectedVariant}
            activeAdditives={activeAdditives}
            onAdditivesChange={setActiveAdditives}
            onReset={handleReset}
          />
        )}
      </main>

      {/* About Sheet Dialog (#about) */}
      {isAboutOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="about-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeAbout();
          }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
        >
          <div className="animate-slide-up w-full max-w-[560px] max-h-[85vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white p-6 brutal-border border-t-[3px] border-[#1E1E24] flex flex-col gap-5">
            <div className="flex items-center justify-between border-b-2 border-[#1E1E24] pb-3">
              <h2
                id="about-title"
                className="font-display text-2xl text-[#1E1E24]"
              >
                What is Mixfix?
              </h2>
              <button
                type="button"
                aria-label="Close about dialog"
                onClick={closeAbout}
                className="brutal-border brutal-shadow rounded-full w-11 h-11 font-display text-xl text-[#1E1E24] bg-white flex items-center justify-center active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* Messy Maker Bench Illustration */}
            <MakerBenchIllustration />

            <div className="flex flex-col gap-3 font-body">
              <p className="text-base leading-relaxed text-gray-700">
                Mixfix is here to fix your mix, so bench math never gets in the way of making. Pick your material, enter your mould&apos;s volume, and get exact grams in seconds. No spreadsheets, no guesswork, and no sticky buckets of uncured regret.
              </p>
            </div>

            <div className="flex flex-col gap-3 rounded-xl brutal-border bg-gray-50/70 p-4 font-body">
              <div className="flex flex-col gap-2">
                <h3 className="font-display text-xs uppercase tracking-wider text-gray-900">
                  Where do the numbers come from?
                </h3>
                <p className="text-sm leading-relaxed text-gray-600">
                  Ratios come from official datasheets or bench-tested workshop recipes (look for the Paul’s recipes badge).
                </p>
                <p className="text-sm leading-relaxed text-gray-600">
                  Mixfix does the math, but workshop safety is on you: check your material’s datasheet, wear gloves, and use a dust mask with dry powders.
                </p>
              </div>

              <div className="border-t border-gray-200 pt-3 text-sm leading-relaxed text-gray-600">
                Got feedback or a recipe to add? Email{" "}
                <a
                  href="mailto:suggestions@mixfix.com"
                  className="font-semibold text-gray-900 underline decoration-[#1E1E24] underline-offset-4 hover:text-[var(--accent)]"
                >
                  suggestions@mixfix.com
                </a>
                .
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
