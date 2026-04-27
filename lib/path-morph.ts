import { interpolate } from "flubber";

/**
 * Cycle 0004: utilitário de morph path-to-path usado em duas transições:
 * - Fase 0 (overlay intro): retângulo fullscreen -> shape KPR.
 * - Fase C1 (recolhe): shape KPR -> retângulo (e/ou caminho inverso).
 */
export const KPR_CARD_PATH_NORMALIZED =
  "M 0.08 0 " +
  "H 0.92 " +
  "Q 1 0 1 0.08 " +
  "V 0.8 " +
  "L 0.8 1 " +
  "H 0.08 " +
  "Q 0 1 0 0.92 " +
  "V 0.08 " +
  "Q 0 0 0.08 0 " +
  "Z";

export function getRectPathNormalized() {
  return (
    "M 0.08 0 " +
    "H 0.92 " +
    "Q 1 0 1 0.08 " +
    "V 0.8 " +
    "L 0.8 1 " +
    "H 0.08 " +
    "Q 0 1 0 0.92 " +
    "V 0.08 " +
    "Q 0 0 0.08 0 " +
    "Z"
  );
}

export type KprMorphDirection = "rect-to-shape" | "shape-to-rect";

export function getKprMorphInterpolator(direction: KprMorphDirection) {
  const from =
    direction === "rect-to-shape" ? getRectPathNormalized() : KPR_CARD_PATH_NORMALIZED;
  const to =
    direction === "rect-to-shape" ? KPR_CARD_PATH_NORMALIZED : getRectPathNormalized();
  return interpolate(from, to, { maxSegmentLength: 0.01 });
}
