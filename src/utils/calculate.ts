import type { MaterialVariant, MixBasis, WcRatioKey } from "../types/materials";

export type VolumeUnit = "ml" | "L" | "l" | "cm³" | "cm3" | "mm³" | "mm3";

export const MAX_RECOMMENDED_VOLUME_ML = 20000;

/**
 * Converts a volume value in the given unit to millilitres (ml).
 * 1 L = 1000 ml, 1 cm³ = 1 ml, 1 mm³ = 0.001 ml
 */
export function convertVolumeToMl(value: number, unit: VolumeUnit): number {
  switch (unit) {
    case "ml":
    case "cm³":
    case "cm3":
      return value;
    case "L":
    case "l":
      return value * 1000;
    case "mm³":
    case "mm3":
      return value * 0.001;
  }
}

export interface AdditiveInput {
  id: string;
  value: number;
}

export interface UserComponentInput {
  id: string;
  name: string;
  parts: number;
}

export interface CalculateParams {
  variant: MaterialVariant;
  volumeMl: number;
  wastePct: number;
  selectedExampleDensity?: number;
  wcRatioKey?: WcRatioKey;
  additives: AdditiveInput[];
  userDensityGPerMl?: number;
  userComponents?: UserComponentInput[];
}

export interface CalculatedComponent {
  id: string;
  name: string;
  grams: number;
}

export interface CalculatedWater {
  grams: number;
  adjusted?: boolean;
}

export interface CalculatedAdditive {
  id: string;
  name: string;
  grams: number;
  instruction: string;
}

export interface CalculateResult {
  components: CalculatedComponent[];
  water?: CalculatedWater;
  additives: CalculatedAdditive[];
  totalGrams: number;
  mixBasis: MixBasis;
  sourceType: string;
}

export function calculateMix(params: CalculateParams): CalculateResult {
  const {
    variant,
    volumeMl,
    wastePct,
    selectedExampleDensity,
    wcRatioKey,
    additives,
    userDensityGPerMl,
    userComponents,
  } = params;

  const density =
    selectedExampleDensity ?? userDensityGPerMl ?? variant.densityGPerMl ?? 0;

  const safeVolumeMl = volumeMl > 0 ? volumeMl : 0;
  const safeWastePct = wastePct >= 0 ? wastePct : 0;

  const totalMass =
    safeVolumeMl > 0 && density > 0
      ? safeVolumeMl * (density * (1 + safeWastePct / 100))
      : 0;

  const isConcreteWcMix =
    Boolean(
      variant.wcRatioOptions &&
        Object.keys(variant.wcRatioOptions).length > 0 &&
        variant.components.some((c) => c.derivedFromWC)
    );

  const rawComponentMassById = new Map<string, number>();
  const components: CalculatedComponent[] = [];
  let water: CalculatedWater | undefined;

  if (isConcreteWcMix && variant.wcRatioOptions) {
    const activeWcKey: WcRatioKey =
      wcRatioKey ?? variant.wcRatioDefault ?? "balanced";
    const wcOption =
      variant.wcRatioOptions[activeWcKey] ??
      variant.wcRatioOptions.balanced ??
      Object.values(variant.wcRatioOptions)[0];
    const wcRatio = wcOption ? wcOption.wc : 0.45;

    const dryComponents = variant.components.filter(
      (c) => !c.derivedFromWC && (c.parts ?? 0) > 0
    );
    const sumDryParts = dryComponents.reduce(
      (sum, c) => sum + (c.parts ?? 0),
      0
    );

    const basePart =
      totalMass > 0 && sumDryParts + wcRatio > 0
        ? totalMass / (sumDryParts + wcRatio)
        : 0;

    for (const comp of dryComponents) {
      const rawGrams = basePart * (comp.parts ?? 0);
      rawComponentMassById.set(comp.id, rawGrams);
      components.push({
        id: comp.id,
        name: comp.name,
        grams: Math.round(rawGrams),
      });
    }

    let rawWaterGrams = basePart * wcRatio;
    let waterAdjusted = false;

    for (const activeAdd of additives) {
      if (activeAdd.value <= 0) continue;
      const def = variant.additives.find((a) => a.id === activeAdd.id);
      if (def && def.type === "reducesWater") {
        rawWaterGrams = rawWaterGrams * (1 - activeAdd.value / 100);
        waterAdjusted = true;
      }
    }

    water = {
      grams: Math.round(rawWaterGrams),
      adjusted: waterAdjusted,
    };
  } else {
    const sourceComponents =
      userComponents && userComponents.length > 0
        ? userComponents
        : variant.components.filter(
            (c) => !c.derivedFromWC && (c.parts ?? 0) > 0
          );

    const sumParts = sourceComponents.reduce(
      (sum, c) => sum + (c.parts ?? 0),
      0
    );

    for (const comp of sourceComponents) {
      const rawGrams =
        totalMass > 0 && sumParts > 0
          ? (totalMass * (comp.parts ?? 0)) / sumParts
          : 0;
      rawComponentMassById.set(comp.id, rawGrams);
      components.push({
        id: comp.id,
        name: comp.name,
        grams: Math.round(rawGrams),
      });
    }
  }

  const calculatedAdditives: CalculatedAdditive[] = [];

  for (const activeAdd of additives) {
    if (activeAdd.value <= 0) continue;
    const def = variant.additives.find((a) => a.id === activeAdd.id);
    if (!def) continue;

    let rawAdditiveGrams = 0;

    switch (def.type) {
      case "percentOfTotal":
        rawAdditiveGrams = totalMass * (activeAdd.value / 100);
        break;
      case "percentOfComponent": {
        const compMass = def.componentId
          ? (rawComponentMassById.get(def.componentId) ?? 0)
          : 0;
        rawAdditiveGrams = compMass * (activeAdd.value / 100);
        break;
      }
      case "gPerKg":
        rawAdditiveGrams = (totalMass / 1000) * activeAdd.value;
        break;
      case "reducesWater":
        // Does NOT add mass; adjusts water directly above
        rawAdditiveGrams = 0;
        break;
    }

    calculatedAdditives.push({
      id: def.id,
      name: def.name,
      grams: Math.round(rawAdditiveGrams),
      instruction: def.note,
    });
  }

  const result: CalculateResult = {
    components,
    additives: calculatedAdditives,
    totalGrams: Math.round(totalMass),
    mixBasis: variant.mixBasis,
    sourceType: variant.sourceType,
  };

  if (water !== undefined) {
    result.water = water;
  }

  return result;
}
