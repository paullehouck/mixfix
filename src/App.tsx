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

function lerp(a: number, b: number, t: number): number {
  return Number((a + (b - a) * t).toFixed(2));
}

function getResponsiveBackgroundPaths(aspectRatio: number) {
  const mobileAspect = 399 / 687;
  const desktopAspect = 1440 / 800;
  const t = Math.min(
    1,
    Math.max(0, (aspectRatio - mobileAspect) / (desktopAspect - mobileAspect))
  );

  const L = (m: number, d: number) => lerp(m, d, t);

  const topLeftPath = [
    `M 0 0`,
    `H ${L(302, 295)}`,
    `C ${L(300, 295)} ${L(20, 35)} ${L(294, 282)} ${L(32, 55)} ${L(294, 282)} ${L(50, 90)}`,
    `C ${L(294, 282)} ${L(68, 125)} ${L(303, 294)} ${L(80, 145)} ${L(302, 294)} ${L(96, 180)}`,
    `C ${L(300, 294)} ${L(114, 220)} ${L(268, 260)} ${L(120, 245)} ${L(268, 260)} ${L(142, 290)}`,
    `C ${L(268, 260)} ${L(165, 335)} ${L(236, 272)} ${L(235, 365)} ${L(238, 262)} ${L(276, 410)}`,
    `C ${L(240, 250)} ${L(315, 460)} ${L(268, 175)} ${L(355, 475)} ${L(261, 155)} ${L(392, 520)}`,
    `C ${L(252, 135)} ${L(435, 565)} ${L(110, 142)} ${L(510, 595)} ${L(65, 110)} ${L(552, 630)}`,
    `C ${L(48, 82)} ${L(575, 660)} ${L(42, 42)} ${L(635, 678)} 0 ${L(668, 687)}`,
    `V 0 Z`,
  ].join(" ");

  const bottomRightPath = [
    `M 399 ${L(527, 440)}`,
    `C ${L(368, 360)} ${L(536, 452)} ${L(315, 316)} ${L(544, 476)} ${L(292, 302)} ${L(556, 520)}`,
    `C ${L(282, 290)} ${L(566, 558)} ${L(288, 298)} ${L(606, 588)} ${L(274, 284)} ${L(622, 622)}`,
    `C ${L(258, 272)} ${L(632, 650)} ${L(230, 254)} ${L(636, 662)} ${L(252, 254)} 687`,
    `H 399 V ${L(527, 440)} Z`,
  ].join(" ");

  return { topLeftPath, bottomRightPath };
}

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

  const [viewportAspect, setViewportAspect] = useState<number>(() =>
    typeof window !== "undefined" && window.innerHeight > 0
      ? window.innerWidth / window.innerHeight
      : 399 / 687
  );

  useEffect(() => {
    function handleHashChange() {
      setIsAboutOpen(window.location.hash === "#about");
    }
    function handleResize() {
      if (window.innerHeight > 0) {
        setViewportAspect(window.innerWidth / window.innerHeight);
      }
    }
    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("resize", handleResize);
    };
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

  const { topLeftPath, bottomRightPath } =
    getResponsiveBackgroundPaths(viewportAspect);

  return (
    <div
      style={rootStyle}
      className="relative min-h-screen text-[var(--color-primary)] antialiased"
    >
      {/* Decorative Background */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[var(--bg-cream)]"
      >
        <svg
          viewBox="0 0 399 687"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full block"
        >
          <path d={topLeftPath} fill="var(--bg-lavender)" />
          <path d={bottomRightPath} fill="var(--bg-lavender)" />
        </svg>
      </div>

      {/* Header */}
      <header className="relative z-10 w-full h-[86px]">
        <div className="mx-auto flex h-full max-w-[560px] items-center justify-between px-[16px]">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              closeAbout();
            }}
            className="font-bayon font-normal text-[42px] leading-[29px] tracking-[0.02em] text-[var(--color-primary)]"
          >
            Fix your mix
          </a>

          <button
            type="button"
            aria-label="About Mixfix"
            onClick={openAbout}
            className="w-[38px] h-[38px] rounded-full bg-[#FFFFFF] border-[2.5px] border-[var(--color-primary)] shadow-[4px_5px_0px_0px_var(--color-primary)] font-help font-normal text-[19px] leading-none flex items-center justify-center text-[var(--color-primary)] active:translate-x-0.5 active:translate-y-0.5 transition-transform cursor-pointer"
          >
            ?
          </button>
        </div>
      </header>

      {/* Main Centred Column */}
      <main className="relative z-10 mx-auto flex max-w-[560px] flex-col gap-5 px-[16px] pt-[28px] pb-[28px]">
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
