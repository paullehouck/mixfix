export type AdditiveType =
  | "percentOfTotal"
  | "percentOfComponent"
  | "gPerKg"
  | "reducesWater";

export interface Additive {
  id: string;
  name: string;
  type: AdditiveType;
  componentId?: string;
  reductionPct?: number;
  min: number;
  max: number;
  default: number;
  enabledByDefault?: boolean;
  addTo: string;
  note: string;
}

export interface Example {
  id: string;
  name: string;
  densityGPerMl: number | null;
  sourceNote: string;
}

export interface MaterialComponent {
  id: string;
  name: string;
  parts: number | null;
  derivedFromWC?: boolean;
}

export interface WastePreset {
  id: string;
  name: string;
  pct: number;
}

export type WcRatioKey = "pourable" | "balanced" | "stiff";

export interface WcRatioOption {
  label: string;
  wc: number;
  note: string;
}

export type MixBasis = "weight" | "volume";

export type VariantStatus = "live" | "draft";

export type SourceType = "official" | "estimate" | "user" | "maker-tested" | string;

export interface MaterialVariant {
  id: string;
  status: VariantStatus;
  name: string;
  useCase?: string;
  sourceType: SourceType;
  sourceNote: string;
  sourceUrls?: string[];
  mixBasis: MixBasis;
  userInputs?: string[];
  components: MaterialComponent[];
  wcRatioOptions?: Partial<Record<WcRatioKey, WcRatioOption>>;
  wcRatioDefault?: WcRatioKey;
  densityGPerMl: number | null;
  wastePctDefault: number;
  wastePresets?: WastePreset[];
  additives: Additive[];
  examples?: Example[];
  potLifeMin: [number, number] | number | null;
  demouldTime: string | null;
  tips: string[];
  safety: string[];
}

export interface MaterialTheme {
  accent: string;
  surface: string;
  blockIllustration: string;
  selectAnimation: string;
}

export interface Material {
  id: string;
  name: string;
  theme: MaterialTheme;
  volumeHint?: string;
  variants: MaterialVariant[];
}

