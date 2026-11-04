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
  it("calculates Jesmonite AC100 (500ml, 10% waste → liquid 290g, base 725g, total 1015g)", () => {
    const variant = getVariant("jesmonite", "ac100-standard");
    const result = calculateMix({
      variant,
      volumeMl: 500,
      wastePct: 10,
      additives: [],
    });

    expect(result.components).toEqual([
      { id: "liquid", name: "AC100 Liquid", grams: 290 },
      { id: "base", name: "AC100 Powder Base", grams: 725 },
    ]);
    expect(result.totalGrams).toBe(1015);
    expect(result.mixBasis).toBe("weight");
    expect(result.sourceType).toBe("official");
  });

  it("calculates Jesmonite AC730 (500ml, 10% waste → liquid 179g, base 894g, total 1073g)", () => {
    const variant = getVariant("jesmonite", "ac730-standard");
    const result = calculateMix({
      variant,
      volumeMl: 500,
      wastePct: 10,
      additives: [],
    });

    expect(result.components).toEqual([
      { id: "liquid", name: "AC730 Liquid", grams: 179 },
      { id: "base", name: "AC730 Powder Base", grams: 894 },
    ]);
    expect(result.totalGrams).toBe(1073);
  });

  it("calculates Concrete fine craft, 1:2 cement:sand, balanced W/C 0.45 (500ml, 15% waste → cement 370g, sand 740g, water 167g, total 1277g)", () => {
    const variant = getVariant("concrete", "fine-craft");
    const result = calculateMix({
      variant,
      volumeMl: 500,
      wastePct: 15,
      wcRatioKey: "balanced",
      additives: [],
    });

    expect(result.components).toEqual([
      { id: "cement", name: "Portland cement", grams: 370 },
      { id: "sand", name: "Fine sand (play sand)", grams: 740 },
    ]);
    expect(result.water).toEqual({ grams: 167, adjusted: false });
    expect(result.totalGrams).toBe(1277);
  });

  it("calculates Concrete general casting, balanced (500ml, 15% waste → cement 610g, sand 305g, aggregate 305g, water 137g, total 1357g)", () => {
    const variant = getVariant("concrete", "general-casting");
    const result = calculateMix({
      variant,
      volumeMl: 500,
      wastePct: 15,
      wcRatioKey: "balanced",
      additives: [],
    });

    expect(result.components).toEqual([
      { id: "cement", name: "Portland cement", grams: 610 },
      { id: "sand", name: "Fine sand", grams: 305 },
      { id: "aggregate", name: "Pea gravel or small aggregate", grams: 305 },
    ]);
    expect(result.water).toEqual({ grams: 137, adjusted: false });
    expect(result.totalGrams).toBe(1357);
  });

  it("calculates Silicone platinum 1:1 (500ml, 15% waste → Part A 319g, Part B 319g, total 638g)", () => {
    const variant = getVariant("silicone", "platinum-1to1-weight");
    const result = calculateMix({
      variant,
      volumeMl: 500,
      wastePct: 15,
      additives: [],
    });

    expect(result.components).toEqual([
      { id: "a", name: "Part A", grams: 319 },
      { id: "b", name: "Part B", grams: 319 },
    ]);
    expect(result.totalGrams).toBe(638);
  });

  it("calculates Silicone tin 10:1 (500ml, 15% waste → Part A 601g, Part B 60g, total 661g)", () => {
    const variant = getVariant("silicone", "tin-10to1-weight");
    const result = calculateMix({
      variant,
      volumeMl: 500,
      wastePct: 15,
      additives: [],
    });

    expect(result.components).toEqual([
      { id: "a", name: "Part A (base)", grams: 601 },
      { id: "b", name: "Part B (catalyst)", grams: 60 },
    ]);
    expect(result.totalGrams).toBe(661);
  });

  describe("volume unit conversion", () => {
    it("converts L, cm³, mm³, and g of water to ml accurately", () => {
      expect(convertVolumeToMl(1, "L")).toBe(1000);
      expect(convertVolumeToMl(1, "l")).toBe(1000);
      expect(convertVolumeToMl(1, "cm³")).toBe(1);
      expect(convertVolumeToMl(1, "cm3")).toBe(1);
      expect(convertVolumeToMl(1, "mm³")).toBe(0.001);
      expect(convertVolumeToMl(1, "mm3")).toBe(0.001);
      expect(convertVolumeToMl(500, "ml")).toBe(500);
      expect(convertVolumeToMl(500, "g of water")).toBe(500);
    });
  });

  describe("additives", () => {
    it("calculates percentOfTotal additive: AC100 500ml 10% waste, pigment 2% → ~20g", () => {
      const variant = getVariant("jesmonite", "ac100-standard");
      const result = calculateMix({
        variant,
        volumeMl: 500,
        wastePct: 10,
        additives: [{ id: "pigment", value: 2 }],
      });

      expect(result.additives).toHaveLength(1);
      expect(result.additives[0].id).toBe("pigment");
      expect(result.additives[0].grams).toBe(20);
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

      expect(baseline.water?.grams).toBe(167);
      // 166.5 * (1 - 0.15) = 141.525 -> 142g
      expect(withPlasticiser.water?.grams).toBe(142);
      expect(withPlasticiser.water?.adjusted).toBe(true);
      // Does NOT add mass to totalGrams
      expect(withPlasticiser.totalGrams).toBe(baseline.totalGrams);
      expect(withPlasticiser.additives[0].grams).toBe(0);
    });

    it("calculates percentOfComponent and gPerKgOfComponent additives", () => {
      const concreteVariant = getVariant("concrete", "fine-craft");
      const concreteResult = calculateMix({
        variant: concreteVariant,
        volumeMl: 500,
        wastePct: 15,
        wcRatioKey: "balanced",
        additives: [{ id: "pigment", value: 5 }],
      });
      // 5% of cement (370g) = 18.5g -> 19g
      expect(concreteResult.additives[0].grams).toBe(19);

      const ac100Variant = getVariant("jesmonite", "ac100-standard");
      const ac100Result = calculateMix({
        variant: ac100Variant,
        volumeMl: 500,
        wastePct: 10,
        additives: [{ id: "retarder", value: 4 }],
      });
      // 4 g/kg of liquid (289.93g) = 1.16g
      expect(ac100Result.additives[0].grams).toBe(1.16);
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

    it("verifies source badge types for AC100 (official) and silicone presets (estimate)", () => {
      const ac100 = getVariant("jesmonite", "ac100-standard");
      const ac100Result = calculateMix({
        variant: ac100,
        volumeMl: 500,
        wastePct: 10,
        additives: [],
      });
      expect(ac100Result.sourceType).toBe("official");

      const silicone = getVariant("silicone", "platinum-1to1-weight");
      const siliconeResult = calculateMix({
        variant: silicone,
        volumeMl: 500,
        wastePct: 15,
        additives: [],
      });
      expect(siliconeResult.sourceType).toBe("estimate");
      expect(siliconeResult.exampleName).toBeUndefined();

      const tinSilicone = getVariant("silicone", "tin-10to1-weight");
      const tinResult = calculateMix({
        variant: tinSilicone,
        volumeMl: 500,
        wastePct: 15,
        additives: [],
      });
      expect(tinResult.sourceType).toBe("estimate");
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

      // 25000 * 1.845 * 1.1 = 50737.5g -> liquid 14496g, base 36241g
      expect(result.totalGrams).toBe(50738);
      expect(result.components).toEqual([
        { id: "liquid", name: "AC100 Liquid", grams: 14496 },
        { id: "base", name: "AC100 Powder Base", grams: 36241 },
      ]);
    });
  });
});

