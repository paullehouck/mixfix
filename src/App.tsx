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

  const accentColor =
    selectedMaterial?.id === "silicone"
      ? "#FE91E8"
      : selectedMaterial?.id === "jesmonite"
        ? "#FFC901"
        : selectedMaterial?.id === "concrete"
          ? "#BCC7D4"
          : (selectedMaterial?.theme.accent ?? DEFAULT_ACCENT);
  const accentSurfaceColor =
    selectedMaterial?.id === "silicone"
      ? "#FE91E8"
      : selectedMaterial?.id === "jesmonite"
        ? "#FFC901"
        : selectedMaterial?.id === "concrete"
          ? "#BCC7D4"
          : (selectedMaterial?.theme.surface ?? DEFAULT_ACCENT_SURFACE);

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", accentColor);
    document.documentElement.style.setProperty(
      "--accent-surface",
      accentSurfaceColor
    );
    if (selectedMaterial?.id) {
      document.documentElement.setAttribute(
        "data-material",
        selectedMaterial.id
      );
    } else {
      document.documentElement.removeAttribute("data-material");
    }
  }, [accentColor, accentSurfaceColor, selectedMaterial?.id]);

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
      className="min-h-screen text-[#222328] antialiased"
    >
      {/* Header */}
      <header className="sticky top-0 z-20 w-full h-[70px] bg-[#FFFFFF] border-b-[2px] border-[#222328]">
        <div className="mx-auto flex h-full max-w-[560px] items-center justify-between p-[16px]">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              closeAbout();
            }}
            className="font-bayon font-normal text-[36px] leading-[29px] tracking-[0px] text-[#000000]"
          >
            Fix your mix
          </a>

          <button
            type="button"
            aria-label="About Mixfix"
            onClick={openAbout}
            className="w-[38px] h-[38px] rounded-full bg-[#FFFFFF] border-[2.5px] border-[#222328] shadow-[4px_5px_0px_0px_#222328] font-display font-normal text-[19px] leading-none flex items-center justify-center text-[#222328] active:translate-x-0.5 active:translate-y-0.5 transition-transform cursor-pointer"
          >
            ?
          </button>
        </div>
      </header>

      {/* Main Centred Column */}
      <main className="mx-auto flex max-w-[560px] flex-col gap-5 px-[16px] pt-[28px] pb-[28px]">
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
            materialId={selectedMaterialId ?? undefined}
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-0 sm:p-4"
        >
          <div className="w-full h-full sm:h-auto sm:max-w-[560px] sm:max-h-[85vh] overflow-y-auto overflow-x-hidden rounded-none sm:rounded-3xl bg-white p-5 sm:p-6 border-0 sm:brutal-border flex flex-col gap-5 min-w-0">
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
                  Ratios come from official datasheets or are bench-tested recipes (look for Paul’s recipes).
                </p>
                <p className="text-sm leading-relaxed text-gray-600">
                  Just meake sure you check your material’s datasheet, wear gloves, and use a dust mask with dry powders.
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
