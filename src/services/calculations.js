export function generateCATOrder(testType, seedValue = null) {
  if (testType === 'BBS') {
    if (seedValue !== null && !isNaN(seedValue)) {
      return [8, 1, 14, 4, 11, 2, 13, 9, 5, 7, 12, 3, 6, 10];
    } else {
      return [8, 11, 1, 14, 4, 9, 13, 2, 5, 7, 12, 3, 6, 10];
    }
  } else {
    if (seedValue !== null && !isNaN(seedValue)) {
      return [5, 1, 10, 3, 8, 2, 9, 6, 4, 7];
    } else {
      return [5, 8, 1, 10, 3, 6, 9, 2, 4, 7];
    }
  }
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