// BBS item difficulty parameters (Rasch logit scale; higher = harder)
// Ordering derived from published BBS Rasch analyses (Berg et al., Mao et al.)
export const BBS_ITEM_DIFFICULTIES = {
  1: -2.8,  // Sitting to Standing
  2: -1.5,  // Standing Unsupported
  3: -3.5,  // Sitting Unsupported (easiest)
  4: -2.5,  // Standing to Sitting
  5: -2.0,  // Transfers
  6:  1.0,  // Standing Eyes Closed
  7:  1.5,  // Standing Feet Together
  8: -0.5,  // Reaching Forward with Outstretched Arm
  9:  0.5,  // Pick Up Object from Floor
  10: -1.0, // Turning to Look Behind Over Shoulders
  11:  0.0, // Turn 360 Degrees
  12:  2.0, // Placing Alternate Foot on Step
  13:  2.5, // Tandem Stance (One Foot in Front)
  14:  3.0, // Standing on One Leg (hardest)
};

// FGA item difficulty parameters (Rasch logit scale; higher = harder)
// Ordering derived from published FGA Rasch analyses (Wrisley & Kumar 2010)
export const FGA_ITEM_DIFFICULTIES = {
  1: -3.0,  // Gait on Level Surface (easiest)
  2: -2.0,  // Change in Gait Speed
  3: -1.5,  // Gait with Horizontal Head Turns
  4: -1.0,  // Gait with Vertical Head Turns
  5: -0.5,  // Gait and Pivot Turn
  6:  0.0,  // Step Over Obstacle
  7:  1.0,  // Gait with Narrow Base of Support
  8:  1.5,  // Gait with Eyes Closed
  9:  0.5,  // Ambulating Backwards
  10:  2.5, // Steps / Stairs (hardest)
};

/**
 * Select the first CAT item for a new assessment.
 *
 * Builds a pool of "moderate-difficulty" candidates (|b| ≤ 1.5 logits from
 * the population median θ = 0) so the test can move in either direction.
 *
 * - With a numeric seedValue: picks deterministically using seed % pool size,
 *   so different seeds produce different starting items reproducibly.
 * - Without a seed: picks randomly from the pool, ensuring patients in the
 *   same session don't all begin on the same item.
 */
export function selectFirstCATItem(difficulties, seedValue = null) {
  // Pool: items with |b| ≤ 1.5, sorted closest-to-zero first
  const candidates = Object.entries(difficulties)
    .filter(([, b]) => Math.abs(b) <= 1.5)
    .sort((a, b) => Math.abs(parseFloat(a[1])) - Math.abs(parseFloat(b[1])));

  const pool = candidates.length > 0 ? candidates : Object.entries(difficulties);

  const seed = seedValue !== null ? parseInt(seedValue) : NaN;
  if (!isNaN(seed)) {
    // Seed-based: reproducible across devices but varies by seed value
    return parseInt(pool[Math.abs(seed) % pool.length][0]);
  }

  // No seed: random pick so different patients start on different items
  return parseInt(pool[Math.floor(Math.random() * pool.length)][0]);
}

/**
 * Estimate patient ability (θ) from responses administered so far.
 *
 * Uses a weighted logit estimator:
 *   θ̂ = mean over scored items of [ b_i + logit(p_i) ]
 * where p_i = score_i / maxScore (proportion of maximum score).
 *
 * @param {number[]} catOrder      - 1-based item numbers in administration order
 * @param {Array}    scores        - item-indexed score array (scores[itemNum-1])
 * @param {Object}   difficulties  - item difficulty map {itemNum: logit}
 * @param {number}   maxScore      - maximum possible score per item (4=BBS, 3=FGA)
 * @returns {number} theta estimate (logit scale)
 */
export function estimateTheta(catOrder, scores, difficulties, maxScore) {
  let sum = 0;
  let count = 0;
  catOrder.forEach((itemNum) => {
    const s = scores[itemNum - 1];
    if (s === null || s < 0) return; // skip unadministered / Not Administered
    const p = Math.max(0.05, Math.min(0.95, s / maxScore)); // clamp to avoid log(0)
    sum += difficulties[itemNum] + Math.log(p / (1 - p));
    count++;
  });
  return count > 0 ? sum / count : 0; // prior: θ = 0 when no data
}

/**
 * Select the next CAT item: the unadministered item whose difficulty is
 * closest to the current θ estimate (maximum Fisher information criterion).
 *
 * @param {number}   theta          - current ability estimate
 * @param {number[]} administeredNums - 1-based item numbers already in catOrder
 * @param {Object}   difficulties   - item difficulty map {itemNum: logit}
 * @returns {number|null} 1-based item number, or null if all items administered
 */
export function selectNextCATItem(theta, administeredNums, difficulties) {
  let bestItem = null;
  let minDist = Infinity;
  Object.entries(difficulties).forEach(([key, b]) => {
    const itemNum = parseInt(key);
    if (administeredNums.includes(itemNum)) return;
    const dist = Math.abs(b - theta);
    if (dist < minDist) {
      minDist = dist;
      bestItem = itemNum;
    }
  });
  return bestItem;
}

export function calculateRaschScore(rawScore, testType, population = 'General') {
  const adjustments = {
    'Stroke': 0.9,
    'Spinal Cord Injury (SCI)': 0.8,
    'Traumatic Brain Injury (TBI)': 0.85,
    "Parkinson's Disease": 0.75
  };
  const adjustment = adjustments[population] || 1.0;
  const raschScore = rawScore * 1.2 * adjustment;
  const standardError = Math.sqrt(rawScore * 0.1 + 0.05);
  return { rasch: raschScore, se: standardError };
}

export function assessFallRisk(rawScore, testType, population = 'General') {
  const thresholds = {
    'BBS': {
      'General': { low: 45, moderate: 35 },
      'Stroke': { low: 42, moderate: 32 },
      'Spinal Cord Injury (SCI)': { low: 40, moderate: 30 },
      'Traumatic Brain Injury (TBI)': { low: 43, moderate: 33 },
      "Parkinson's Disease": { low: 38, moderate: 28 }
    },
    'FGA': {
      'General': { low: 22, moderate: 15 },
      'Stroke': { low: 20, moderate: 13 },
      'Spinal Cord Injury (SCI)': { low: 18, moderate: 12 },
      'Traumatic Brain Injury (TBI)': { low: 21, moderate: 14 },
      "Parkinson's Disease": { low: 16, moderate: 10 }
    }
  };
  const popThresholds = thresholds[testType][population] || thresholds[testType]['General'];
  if (rawScore >= popThresholds.low) return 'Low';
  else if (rawScore >= popThresholds.moderate) return 'Moderate';
  else return 'High';
}
