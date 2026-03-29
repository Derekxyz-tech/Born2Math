// Thresholds are now CUMULATIVE to simulate the "Reset" mechanic cleanly!
// i.e., D requires 1k total. C requires 3k MORE (4k total).
export const XP_THRESHOLDS = {
  E: 0,
  D: 1000,                   // 1,000 raw XP needed in E to reach D
  C: 4000,                   // 3,000 raw XP needed in D to reach C
  B: 12000,                  // 8,000 raw XP needed in C to reach B
  A: 32000,                  // 20,000 raw XP needed in B to reach A
  S: 82000,                  // 50,000 raw XP needed in A to reach S
  NATIONAL_LEVEL: 182000     // 100,000 raw XP needed in S to reach National
}

export const COIN_REWARDS = {
  E: 0,
  D: 100,
  C: 250,
  B: 500,
  A: 1000,
  S: 2500,
  NATIONAL_LEVEL: 10000
}

export function evaluateRank(currentXp: number): string {
  if (currentXp >= XP_THRESHOLDS.NATIONAL_LEVEL) return 'NATIONAL_LEVEL'
  if (currentXp >= XP_THRESHOLDS.S) return 'S'
  if (currentXp >= XP_THRESHOLDS.A) return 'A'
  if (currentXp >= XP_THRESHOLDS.B) return 'B'
  if (currentXp >= XP_THRESHOLDS.C) return 'C'
  if (currentXp >= XP_THRESHOLDS.D) return 'D'
  return 'E'
}

export function detectRankUp(oldXp: number, newXp: number) {
  const oldRank = evaluateRank(oldXp)
  const newRank = evaluateRank(newXp)
  
  if (oldRank !== newRank) {
    return {
      rankUp: true,
      newRank,
      coinReward: COIN_REWARDS[newRank as keyof typeof COIN_REWARDS] || 0
    }
  }
  return { rankUp: false, coinReward: 0, newRank: oldRank }
}

export function calculateTimeDecayedXp(baseXp: number, timeSpentMs: number, rank: string): number {
  // Define time targets per rank: [fastMs (100% xp limit), slowMs (40% bottom out)]
  const timeTargets: Record<string, [number, number]> = {
    E: [2000, 5000],               
    D: [3500, 8000],          
    C: [5000, 12000],
    B: [8000, 18000],
    A: [12000, 25000],
    S: [18000, 45000],
    NATIONAL_LEVEL: [25000, 60000] // Up to 60s for full decay on insane queries
  }

  const [tFast, tSlow] = timeTargets[rank] || timeTargets.E
  const minXpFactor = 0.40

  if (timeSpentMs <= tFast) return baseXp // Max XP achieved!
  if (timeSpentMs >= tSlow) return Math.floor(baseXp * minXpFactor) // 40% floor reached

  // Linear decay interpolation
  const penaltyRange = tSlow - tFast
  const timeOver = timeSpentMs - tFast
  const percentPenalty = timeOver / penaltyRange // 0.0 to 1.0 progress towards worst penalty
  
  // Interpolate the factor from 1.0 down to minXpFactor (0.4)
  const factor = 1.0 - (percentPenalty * (1.0 - minXpFactor))
  
  return Math.max(1, Math.floor(baseXp * factor))
}
