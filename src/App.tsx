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

const MATERIAL_CLOUD_STYLE: Record<
  string,
  {
    fill: string;
    topTransform: string;
    bottomTransform: string;
    blob1Transform: string;
    blob2Transform: string;
  }
> = {
  default: {
    fill: "#C2C6EC",
    topTransform: "translate3d(0px, 0px, 0) scale(1, 1)",
    bottomTransform: "translate3d(0px, 0px, 0) scale(1, 1)",
    blob1Transform: "translate3d(0px, 0px, 0) scale(1)",
    blob2Transform: "translate3d(0px, 0px, 0) scale(1)",
  },
  silicone: {
    fill: "#FFC2F2",
    topTransform: "translate3d(-22px, -26px, 0) scale(1.04, 0.97)",
    bottomTransform: "translate3d(-26px, -18px, 0) scale(1.07, 1.05)",
    blob1Transform: "translate3d(42px, -28px, 0) scale(1.18)",
    blob2Transform: "translate3d(-26px, 38px, 0) scale(1.12)",
  },
  jesmonite: {
    fill: "#FFE270",
    topTransform: "translate3d(18px, -30px, 0) scale(1.03, 1.03)",
    bottomTransform: "translate3d(-18px, -28px, 0) scale(1.09, 1.04)",
    blob1Transform: "translate3d(-36px, -22px, 0) scale(1.1)",
    blob2Transform: "translate3d(-18px, 54px, 0) scale(1.22)",
  },
  concrete: {
    fill: "#D5DFEA",
    topTransform: "translate3d(-16px, 18px, 0) scale(0.98, 1.04)",
    bottomTransform: "translate3d(-30px, -14px, 0) scale(1.06, 1.08)",
    blob1Transform: "translate3d(28px, -34px, 0) scale(0.92)",
    blob2Transform: "translate3d(-34px, 24px, 0) scale(1.15)",
  },
};

function buildNormalGelWave(
  A: [number, number],
  B: [number, number],
  amps: [number, number][],
  closeCorner: [number, number]
): string {
  const dx = B[0] - A[0];
  const dy = B[1] - A[1];
  const L = Math.hypot(dx, dy) || 1;
  const tx = dx / L;
  const ty = dy / L;
  let nx = -ty;
  let ny = tx;
  if (nx < 0) {
    nx = -nx;
    ny = -ny;
  }

  const pts = amps.map(([s, a]) => ({
    s,
    x: A[0] + dx * s + nx * a,
    y: A[1] + dy * s + ny * a,
  }));

  const d: string[] = [
    `M ${closeCorner[0].toFixed(1)} ${closeCorner[1].toFixed(1)}`,
    `L ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`,
  ];

  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i];
    const p1 = pts[i + 1];
    const segLen = (p1.s - p0.s) * L;
    const h = segLen * 0.44;
    const c1x = p0.x + tx * h;
    const c1y = p0.y + ty * h;
    const c2x = p1.x - tx * h;
    const c2y = p1.y - ty * h;
    d.push(
      `C ${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`
    );
  }

  d.push(`L ${closeCorner[0].toFixed(1)} ${pts[pts.length - 1].y.toFixed(1)} Z`);
  return d.join(" ");
}

function buildGelBlob(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  rotDeg = 0
): string {
  const k = 0.55228475;
  const rad = (rotDeg * Math.PI) / 180;
  const ca = Math.cos(rad);
  const sa = Math.sin(rad);
  const tr = (x: number, y: number): [number, number] => [
    cx + x * ca - y * sa,
    cy + x * sa + y * ca,
  ];
  const kx = rx * k;
  const ky = ry * k;
  const p0 = tr(0, -ry);
  const c0a = tr(kx, -ry);
  const c0b = tr(rx, -ky);
  const p1 = tr(rx, 0);
  const c1a = tr(rx, ky);
  const c1b = tr(kx, ry);
  const p2 = tr(0, ry);
  const c2a = tr(-kx, ry);
  const c2b = tr(-rx, ky);
  const p3 = tr(-rx, 0);
  const c3a = tr(-rx, -ky);
  const c3b = tr(-kx, -ry);

  return [
    `M ${p0[0].toFixed(1)} ${p0[1].toFixed(1)}`,
    `C ${c0a[0].toFixed(1)} ${c0a[1].toFixed(1)} ${c0b[0].toFixed(1)} ${c0b[1].toFixed(1)} ${p1[0].toFixed(1)} ${p1[1].toFixed(1)}`,
    `C ${c1a[0].toFixed(1)} ${c1a[1].toFixed(1)} ${c1b[0].toFixed(1)} ${c1b[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`,
    `C ${c2a[0].toFixed(1)} ${c2a[1].toFixed(1)} ${c2b[0].toFixed(1)} ${c2b[1].toFixed(1)} ${p3[0].toFixed(1)} ${p3[1].toFixed(1)}`,
    `C ${c3a[0].toFixed(1)} ${c3a[1].toFixed(1)} ${c3b[0].toFixed(1)} ${c3b[1].toFixed(1)} ${p0[0].toFixed(1)} ${p0[1].toFixed(1)} Z`,
  ].join(" ");
}

function getGelBackgroundPaths(W: number, H: number) {
  const u = Math.min(W, H);
  const isWide = W > H;

  const topStart: [number, number] = [W * (isWide ? 0.74 : 0.8), -H * 0.06];
  const topEnd: [number, number] = [-W * 0.06, H * 0.96];
  const topCorner: [number, number] = [-W * 0.35, -H * 0.35];

  const makeAmps = (
    m: number,
    base: number,
    phase: number,
    sign: number
  ): [number, number][] => {
    const pts: [number, number][] = [[0, 0]];
    for (let j = 0; j < m; j++) {
      const s = (j + 0.5) / m;
      const mag = base * (0.8 + 0.35 * Math.sin(j * 1.7 + phase));
      pts.push([s, (j % 2 === 0 ? 1 : -1) * sign * mag]);
    }
    pts.push([1, 0]);
    return pts;
  };

  const topFrames = [
    buildNormalGelWave(topStart, topEnd, makeAmps(7, u * 0.125, 0, 1), topCorner),
    buildNormalGelWave(topStart, topEnd, makeAmps(7, u * 0.115, 2.1, -1), topCorner),
    buildNormalGelWave(topStart, topEnd, makeAmps(7, u * 0.13, 4.2, 1), topCorner),
  ];

  const botStart: [number, number] = [
    W * 1.06,
    H * (isWide ? 0.56 : 0.66),
  ];
  const botEnd: [number, number] = [
    W * (isWide ? 0.56 : 0.52),
    H * 1.06,
  ];
  const botCorner: [number, number] = [W * 1.35, H * 1.35];

  const bottomFrames = [
    buildNormalGelWave(botStart, botEnd, makeAmps(5, u * 0.11, 0.5, -1), botCorner),
    buildNormalGelWave(botStart, botEnd, makeAmps(5, u * 0.1, 2.6, 1), botCorner),
    buildNormalGelWave(botStart, botEnd, makeAmps(5, u * 0.115, 4.6, -1), botCorner),
  ];

  const b1x = W * (isWide ? 0.44 : 0.42);
  const b1y = H * (isWide ? 0.81 : 0.84);
  const b1r = u * 0.088;
  const blob1Frames = [
    buildGelBlob(b1x, b1y, b1r * 1.06, b1r * 0.94, -14),
    buildGelBlob(b1x, b1y, b1r * 0.93, b1r * 1.07, 12),
    buildGelBlob(b1x, b1y, b1r * 1.04, b1r * 0.96, 28),
  ];

  const b2x = W * (isWide ? 0.84 : 0.85);
  const b2y = H * (isWide ? 0.23 : 0.17);
  const b2r = u * 0.052;
  const blob2Frames = [
    buildGelBlob(b2x, b2y, b2r * 0.94, b2r * 1.06, 18),
    buildGelBlob(b2x, b2y, b2r * 1.08, b2r * 0.92, -16),
    buildGelBlob(b2x, b2y, b2r * 0.97, b2r * 1.04, -32),
  ];

  return {
    topValues: [...topFrames, topFrames[0]].join(";"),
    bottomValues: [...bottomFrames, bottomFrames[0]].join(";"),
    blob1Values: [...blob1Frames, blob1Frames[0]].join(";"),
    blob2Values: [...blob2Frames, blob2Frames[0]].join(";"),
    topInitial: topFrames[0],
    bottomInitial: bottomFrames[0],
    blob1Initial: blob1Frames[0],
    blob2Initial: blob2Frames[0],
  };
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

  const [viewport, setViewport] = useState<{ width: number; height: number }>(
    () => ({
      width: typeof window !== "undefined" ? window.innerWidth : 399,
      height: typeof window !== "undefined" ? window.innerHeight : 687,
    })
  );

  useEffect(() => {
    function handleHashChange() {
      setIsAboutOpen(window.location.hash === "#about");
    }
    function handleResize() {
      if (window.innerWidth > 0 && window.innerHeight > 0) {
        setViewport({ width: window.innerWidth, height: window.innerHeight });
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

  const gelPaths = getGelBackgroundPaths(viewport.width, viewport.height);
  const cloudStyle =
    MATERIAL_CLOUD_STYLE[selectedMaterial?.id ?? "default"] ??
    MATERIAL_CLOUD_STYLE.default;

  const gelTransition =
    "fill 550ms cubic-bezier(0.22, 1, 0.36, 1), transform 800ms cubic-bezier(0.22, 1, 0.36, 1)";

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
          viewBox={`0 0 ${viewport.width} ${viewport.height}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full block"
        >
          <defs>
            <filter
              id="gel-goo"
              filterUnits="userSpaceOnUse"
              x={-200}
              y={-200}
              width={viewport.width + 400}
              height={viewport.height + 400}
              colorInterpolationFilters="sRGB"
            >
              <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="blur" />
              <feColorMatrix
                in="blur"
                mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9"
              />
            </filter>
          </defs>
          <g filter="url(#gel-goo)">
          <g className="liquid-flow-a">
            <path
              d={gelPaths.topInitial}
              style={{
                fill: cloudStyle.fill,
                transform: cloudStyle.topTransform,
                transformBox: "fill-box",
                transformOrigin: "center",
                transition: gelTransition,
              }}
            >
              <animate
                attributeName="d"
                values={gelPaths.topValues}
                dur="15s"
                repeatCount="indefinite"
                calcMode="spline"
                keyTimes="0;0.33;0.66;1"
                keySplines="0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1"
              />
            </path>
          </g>
          <g className="liquid-flow-b">
            <path
              d={gelPaths.bottomInitial}
              style={{
                fill: cloudStyle.fill,
                transform: cloudStyle.bottomTransform,
                transformBox: "fill-box",
                transformOrigin: "center",
                transition: gelTransition,
              }}
            >
              <animate
                attributeName="d"
                values={gelPaths.bottomValues}
                dur="18s"
                repeatCount="indefinite"
                calcMode="spline"
                keyTimes="0;0.33;0.66;1"
                keySplines="0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1"
              />
            </path>
          </g>
          <g className="liquid-blob-a">
            <path
              d={gelPaths.blob1Initial}
              style={{
                fill: cloudStyle.fill,
                transform: cloudStyle.blob1Transform,
                transformBox: "fill-box",
                transformOrigin: "center",
                transition: gelTransition,
              }}
            >
              <animate
                attributeName="d"
                values={gelPaths.blob1Values}
                dur="11s"
                repeatCount="indefinite"
                calcMode="spline"
                keyTimes="0;0.33;0.66;1"
                keySplines="0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1"
              />
            </path>
          </g>
          <g className="liquid-blob-b">
            <path
              d={gelPaths.blob2Initial}
              style={{
                fill: cloudStyle.fill,
                transform: cloudStyle.blob2Transform,
                transformBox: "fill-box",
                transformOrigin: "center",
                transition: gelTransition,
              }}
            >
              <animate
                attributeName="d"
                values={gelPaths.blob2Values}
                dur="13s"
                repeatCount="indefinite"
                calcMode="spline"
                keyTimes="0;0.33;0.66;1"
                keySplines="0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1"
              />
            </path>
          </g>
          </g>
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
            <div className="flex items-center justify-between border-b-2 border-[var(--color-primary)] pb-3">
              <h2
                id="about-title"
                className="font-display text-2xl text-[var(--color-primary)]"
              >
                What is Mixfix?
              </h2>
              <button
                type="button"
                aria-label="Close about dialog"
                onClick={closeAbout}
                className="brutal-border brutal-shadow rounded-full w-11 h-11 font-display text-xl text-[var(--color-primary)] bg-white flex items-center justify-center active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* Messy Maker Bench Illustration */}
            <MakerBenchIllustration />

            <div className="flex flex-col gap-3 font-body">
              <p className="text-base leading-relaxed text-[var(--color-description)]">
                Mixfix is here to fix your mix, so bench math never gets in the way of making. Pick your material, enter your mould&apos;s volume, and get exact grams in seconds. No spreadsheets, no guesswork, and no sticky buckets of uncured regret.
              </p>
            </div>

            <div className="flex flex-col gap-3 rounded-xl brutal-border bg-[#F3F5FC] p-4 font-body">
              <div className="flex flex-col gap-2">
                <h3 className="font-display text-xs uppercase tracking-wider text-[var(--color-primary)]">
                  Where do the numbers come from?
                </h3>
                <p className="text-sm leading-relaxed text-[var(--color-muted)]">
                  Ratios come from official datasheets or are bench-tested recipes (look for Paul’s recipes).
                </p>
                <p className="text-sm leading-relaxed text-[var(--color-muted)]">
                  Just meake sure you check your material’s datasheet, wear gloves, and use a dust mask with dry powders.
                </p>
              </div>

              <div className="border-t border-[#C2C6EC] pt-3 text-sm leading-relaxed text-[var(--color-muted)]">
                Got feedback or a recipe to add? Email{" "}
                <a
                  href="mailto:suggestions@mixfix.com"
                  className="font-semibold text-[var(--color-primary)] underline decoration-[var(--color-primary)] underline-offset-4 hover:text-[var(--accent)]"
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
