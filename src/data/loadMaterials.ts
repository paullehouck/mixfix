import jesmoniteData from "../../data/materials/jesmonite.json";
import siliconeData from "../../data/materials/silicone.json";
import concreteData from "../../data/materials/concrete.json";
import type { Material } from "../types/materials";

export const materials: Material[] = [
  jesmoniteData as Material,
  siliconeData as Material,
  concreteData as Material,
];

export function loadMaterials(): Material[] {
  return materials;
}

export default materials;

