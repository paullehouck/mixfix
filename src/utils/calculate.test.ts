import { describe, expect, it } from "vitest";
import { materials } from "../data/loadMaterials";
import type { MaterialVariant } from "../types/materials";
import { calculateMix, convertVolumeToMl } from "./calculate";

function getVariant(materialId: string, variantId: string): MaterialVariant {
  const material = materials.find((m) => m.id === materialId);
  if (!material) {
    throw new Error(`Material not found: ${materialId}`);
  }
  const variant = material.variants.find((v) => v.id === variantId);
  if (!variant) {
    throw new Error(`Variant not found: ${variantId} in ${materialId}`);
  }
  return variant;
}

describe("calculateMix", () => {
  it("calculates Jesmonite AC100 (500ml, 10% waste → liquid 275g, base 688g, total 963g)", () => {
    const variant = getVariant("jesmonite", "ac100-standard");
    const result = calculateMix({
      variant,
      volumeMl: 500,
      wastePct: 10,
      additives: [],
    });

    expect(result.components).toEqual([
      { id: "liquid", name: "AC100 Liquid", grams: 275 },
      { id: "base", name: "AC100 Base (powder)", grams: 688 },
    ]);
    expect(result.totalGrams).toBe(963);
    expect(result.mixBasis).toBe("weight");
    expect(result.sourceType).toBe("official");
  });

  it("calculates Jesmonite AC730 (500ml, 10% waste → liquid 170g, base 848g, total 1018g)", () => {
    const variant = getVariant("jesmonite", "ac730-standard");
    const result = calculateMix({
      variant,
      volumeMl: 500,
      wastePct: 10,
      additives: [],
    });

    expect(result.components).toEqual([
      { id: "liquid", name: "AC730 Liquid", grams: 170 },
      { id: "base", name: "AC730 Base (powder)", grams: 848 },
    ]);
    expect(result.totalGrams).toBe(1018);
  });

  it("calculates Concrete fine craft, balanced W/C 0.45 (500ml, 15% waste → cement 737g, sand 246g, water 110g, total 1092g)", () => {
    const variant = getVariant("concrete", "fine-craft");
    const result = calculateMix({
      variant,
      volumeMl: 500,
      wastePct: 15,
      wcRatioKey: "balanced",
      additives: [],
    });

    expect(result.components).toEqual([
      { id: "cement", name: "Portland cement", grams: 737 },
      { id: "sand", name: "Fine sand (play sand)", grams: 246 },
    ]);
    expect(result.water).toEqual({ grams: 110, adjusted: false });
    expect(result.totalGrams).toBe(1092);
  });

  it("calculates Concrete general casting, balanced (500ml, 15% waste → cement 543g, sand 271g, aggregate 271g, water 122g, total 1208g)", () => {
    const variant = getVariant("concrete", "general-casting");
    const result = calculateMix({
      variant,
      volumeMl: 500,
      wastePct: 15,
      wcRatioKey: "balanced",
      additives: [],
    });

    expect(result.components).toEqual([
      { id: "cement", name: "Portland cement", grams: 543 },
      { id: "sand", name: "Fine sand", grams: 271 },
      { id: "aggregate", name: "Pea gravel or small aggregate", grams: 271 },
    ]);
    expect(result.water).toEqual({ grams: 122, adjusted: false });
    expect(result.totalGrams).toBe(1208);
  });

  it("calculates Silicone platinum 1:1 (500ml, 15% waste → Part A 331g, Part B 331g, total 661g)", () => {
    const variant = getVariant("silicone", "platinum-1to1-weight");
    const result = calculateMix({
      variant,
      volumeMl: 500,
      wastePct: 15,
      additives: [],
    });

    expect(result.components).toEqual([
      { id: "a", name: "Part A", grams: 331 },
      { id: "b", name: "Part B", grams: 331 },
    ]);
    expect(result.totalGrams).toBe(661);
  });

  describe("volume unit conversion", () => {
    it("converts L, cm³, and mm³ to ml accurately", () => {
      expect(convertVolumeToMl(1, "L")).toBe(1000);
      expect(convertVolumeToMl(1, "l")).toBe(1000);
      expect(convertVolumeToMl(1, "cm³")).toBe(1);
      expect(convertVolumeToMl(1, "cm3")).toBe(1);
      expect(convertVolumeToMl(1, "mm³")).toBe(0.001);
      expect(convertVolumeToMl(1, "mm3")).toBe(0.001);
      expect(convertVolumeToMl(500, "ml")).toBe(500);
    });
  });

  describe("additives", () => {
    it("calculates percentOfTotal additive: AC100 500ml 10% waste, pigment 2% → ~19g", () => {
      const variant = getVariant("jesmonite", "ac100-standard");
      const result = calculateMix({
        variant,
        volumeMl: 500,
        wastePct: 10,
        additives: [{ id: "pigment", value: 2 }],
      });

      expect(result.additives).toHaveLength(1);
      expect(result.additives[0].id).toBe("pigment");
      expect(result.additives[0].grams).toBe(19);
      expect(result.additives[0].instruction).toContain("Maximum 2%");
    });

    it("calculates reducesWater additive: concrete 500ml, plasticiser 15% → water reduces by 15%", () => {
      const variant = getVariant("concrete", "fine-craft");
      const baseline = calculateMix({
        variant,
        volumeMl: 500,
        wastePct: 15,
        wcRatioKey: "balanced",
        additives: [],
      });
      const withPlasticiser = calculateMix({
        variant,
        volumeMl: 500,
        wastePct: 15,
        wcRatioKey: "balanced",
        additives: [{ id: "plasticiser", value: 15 }],
      });

      expect(baseline.water?.grams).toBe(110);
      // 110.4775 * (1 - 0.15) = 93.9059 -> 94g
      expect(withPlasticiser.water?.grams).toBe(94);
      expect(withPlasticiser.water?.adjusted).toBe(true);
      // Does NOT add mass to totalGrams
      expect(withPlasticiser.totalGrams).toBe(baseline.totalGrams);
      expect(withPlasticiser.additives[0].grams).toBe(0);
    });

    it("calculates percentOfComponent and gPerKg additives", () => {
      const concreteVariant = getVariant("concrete", "fine-craft");
      const concreteResult = calculateMix({
        variant: concreteVariant,
        volumeMl: 500,
        wastePct: 15,
        wcRatioKey: "balanced",
        additives: [{ id: "pigment", value: 5 }],
      });
      // 5% of cement (~736.52g) = ~36.83g -> 37g
      expect(concreteResult.additives[0].grams).toBe(37);

      const ac100Variant = getVariant("jesmonite", "ac100-standard");
      const ac100Result = calculateMix({
        variant: ac100Variant,
        volumeMl: 500,
        wastePct: 10,
        additives: [{ id: "retarder", value: 4 }],
      });
      // 4 g/kg of 962.5g = 3.85g -> 4g
      expect(ac100Result.additives[0].grams).toBe(4);
    });
  });

  describe("user-entered datasheet and example density overrides", () => {
    it("overrides variant density when selectedExampleDensity is provided and updates source to official", () => {
      const variant = getVariant("silicone", "platinum-1to1-weight");
      const result = calculateMix({
        variant,
        volumeMl: 500,
        wastePct: 15,
        selectedExampleDensity: 1.08, // Dragon Skin 30
        selectedExampleName: "Smooth-On Dragon Skin 30",
        additives: [],
      });

      // 500 * 1.08 * 1.15 = 621g total -> 311g each
      expect(result.totalGrams).toBe(621);
      expect(result.components[0].grams).toBe(311);
      expect(result.components[1].grams).toBe(311);
      expect(result.sourceType).toBe("official");
      expect(result.exampleName).toBe("Smooth-On Dragon Skin 30");
    });

    it("calculates custom datasheet values (sourceType === 'user')", () => {
      const variant = getVariant("silicone", "custom-datasheet");
      const result = calculateMix({
        variant,
        volumeMl: 500,
        wastePct: 10,
        userDensityGPerMl: 1.2,
        userComponents: [
          { id: "a", name: "Part A", parts: 100 },
          { id: "b", name: "Part B", parts: 3 },
        ],
        additives: [],
      });

      // 500 * 1.2 * 1.1 = 660g
      expect(result.sourceType).toBe("user");
      expect(result.totalGrams).toBe(660);
      expect(result.components[0].grams).toBe(641);
      expect(result.components[1].grams).toBe(19);
    });
  });

  describe("edge cases", () => {
    it("returns 0 grams for volume 0", () => {
      const variant = getVariant("jesmonite", "ac100-standard");
      const result = calculateMix({
        variant,
        volumeMl: 0,
        wastePct: 10,
        additives: [{ id: "pigment", value: 2 }],
      });

      expect(result.totalGrams).toBe(0);
      expect(result.components.every((c) => c.grams === 0)).toBe(true);
      expect(result.additives[0].grams).toBe(0);
    });

    it("returns 0 grams for negative volume", () => {
      const variant = getVariant("concrete", "fine-craft");
      const result = calculateMix({
        variant,
        volumeMl: -250,
        wastePct: 15,
        additives: [],
      });

      expect(result.totalGrams).toBe(0);
      expect(result.components.every((c) => c.grams === 0)).toBe(true);
      expect(result.water?.grams).toBe(0);
    });

    it("handles large volumes above 20000ml accurately", () => {
      const variant = getVariant("jesmonite", "ac100-standard");
      const result = calculateMix({
        variant,
        volumeMl: 25000,
        wastePct: 10,
        additives: [],
      });

      // 25000 * 1.75 * 1.1 = 48125g -> liquid 13750g, base 34375g
      expect(result.totalGrams).toBe(48125);
      expect(result.components).toEqual([
        { id: "liquid", name: "AC100 Liquid", grams: 13750 },
        { id: "base", name: "AC100 Base (powder)", grams: 34375 },
      ]);
    });
  });
});

