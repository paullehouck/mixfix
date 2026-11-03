import { useEffect, useState, type CSSProperties } from "react";
import {
  CalculatorForm,
  createInitialFormState,
  type CalculatorFormState,
} from "./components/CalculatorForm";
import { MaterialPicker } from "./components/MaterialPicker";
import { ResultCard } from "./components/ResultCard";
import { materials } from "./data/loadMaterials";
import type { WcRatioKey } from "./types/materials";
import {
  calculateMix,
  convertVolumeToMl,
  type AdditiveInput,
  type VolumeUnit,
} from "./utils/calculate";

const DEFAULT_ACCENT = "#E9967A";

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

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", accentColor);
  }, [accentColor]);

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
          wastePct,
          selectedExampleDensity:
            selectedExample?.densityGPerMl ?? undefined,
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

  const rootStyle = { "--accent": accentColor } as CSSProperties;

  return (
    <div
      style={rootStyle}
      className="min-h-screen bg-stone-100 text-stone-900 antialiased"
    >
      {/* Fixed Header */}
      <header className="fixed inset-x-0 top-0 z-20 border-b border-stone-200 bg-stone-100/95 backdrop-blur-xs">
        <div className="mx-auto flex h-16 max-w-[560px] items-center justify-between px-4">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              closeAbout();
            }}
            className="text-2xl font-black tracking-tight text-stone-950"
          >
            Mixfix
          </a>

          <button
            type="button"
            aria-label="About Mixfix"
            onClick={openAbout}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 bg-white text-base font-bold text-stone-800 shadow-2xs hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
          >
            ?
          </button>
        </div>
      </header>

      {/* Main Centred Column */}
      <main className="mx-auto flex max-w-[560px] flex-col gap-5 px-4 pt-22 pb-16">
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

      {/* Full-screen About Sheet (#about) */}
      {isAboutOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="about-title"
          className="fixed inset-0 z-40 overflow-y-auto bg-stone-100"
        >
          <div className="mx-auto flex min-h-screen max-w-[560px] flex-col justify-between px-4 py-6">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                <h2
                  id="about-title"
                  className="text-2xl font-black tracking-tight text-stone-950"
                >
                  What is Mixfix?
                </h2>
                <button
                  type="button"
                  onClick={closeAbout}
                  className="rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-sm font-bold text-stone-800 hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
                >
                  Close
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <p className="text-base leading-relaxed text-stone-700">
                  Mixfix is here to fix your mix, so bench math never gets in the way of making.
                  Pick your material, enter your mould&apos;s volume, and get exact grams in seconds. No spreadsheets, no guesswork, and no sticky buckets of uncured regret.
                </p>
              </div>

              <div className="flex flex-col gap-2 rounded-2xl border border-stone-200 bg-white p-4">
                <h3 className="text-sm font-bold tracking-tight text-stone-900">
                  Where do the numbers come from?
                </h3>
                <p className="text-sm leading-relaxed text-stone-600">
                  Every ratio comes straight from official datasheets or bench-tested workshop recipes (look for the Paul’s recipes). Mixfix handles the math, but workshop safety is on you: check your material’s datasheet, wear gloves, and use a dust mask with dry powders.
                </p>
              </div>

              <div className="flex flex-col gap-2 rounded-2xl border border-stone-200 bg-white p-4">
                <h3 className="text-sm font-bold tracking-tight text-stone-900">
                  Got feedback or a recipe to add?
                </h3>
                <p className="text-sm leading-relaxed text-stone-600">
                  Email{" "}
                  <a
                    href="mailto:suggestions@mixfix.com"
                    className="font-medium text-stone-900 underline decoration-stone-400 underline-offset-4 hover:decoration-stone-900"
                  >
                    suggestions@mixfix.com
                  </a>
                  .
                </p>
              </div>
            </div>

            <div className="pt-8">
              <button
                type="button"
                onClick={closeAbout}
                className="h-12 w-full rounded-xl bg-[var(--accent)] text-base font-bold text-stone-950 shadow-xs hover:opacity-90"
              >
                Back to calculator
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
