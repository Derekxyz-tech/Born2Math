// B2M uses exact UTC midnight to determine strict Day boundaries universally, preventing timezone manipulation
export function getUTCMidnight(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

export function processDailyStreak(
  currentStreak: number, 
  longestStreak: number,
  lastDateStr: string | null, 
  freezesAvailable: number,
  today = getUTCMidnight()
) {
  let newStreak = currentStreak || 0
  let newLongest = longestStreak || 0
  let usedFreeze = false
  let streakBroken = false
  let coinsEarned = 0
  let isNewDay = false

  if (!lastDateStr) {
    // Extremely first day ever playing on a fresh account
    newStreak = 1
    newLongest = 1
    isNewDay = true
    coinsEarned = 10 // base formula (1 * 10)
  } else {
    // Calculate difference in absolute whole days at UTC midnight
    const lastDate = getUTCMidnight(new Date(lastDateStr))
    const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      // Perfect consecutive day!
      isNewDay = true
      newStreak++
    } else if (diffDays > 1) {
      // Missed at least one day completely
      isNewDay = true
      if (freezesAvailable > 0) {
        // 🔥 SAVED BY THE FROST FREEZE 🔥
        usedFreeze = true
        // The freeze consumes and seamlessly preserves the momentum + 1
        newStreak++
      } else {
        // ❌ STREAK SHATTERED ❌
        streakBroken = true
        newStreak = 1
      }
    } else if (diffDays <= 0) {
      // Already played today (or they are somehow time traveling backwards). 
      // No extra streak computation or economy injections!
      isNewDay = false
    }
  }

  // Record historical highs
  if (newStreak > newLongest) newLongest = newStreak
  
  // Economy logic is strictly generated ONLY if a successful new day was bridged
  let milestoneBonus = 0
  if (isNewDay) {
    // 1. Daily Multiplier (+10 per day, aggressively capped at 300 to prevent inflation collapses)
    coinsEarned = Math.min(newStreak * 10, 300)
    
    // 2. Huge Milestone Drops for severe dedication
    if (newStreak === 7) milestoneBonus = 500
    if (newStreak === 30) milestoneBonus = 2000
    if (newStreak === 100) milestoneBonus = 5000
    if (newStreak === 365) milestoneBonus = 20000
  }

  return {
    isNewDay,
    newStreak,
    newLongest,
    usedFreeze,
    streakBroken,
    dailyCoins: coinsEarned,
    milestoneCoins: milestoneBonus,
    totalCoinsAwarded: coinsEarned + milestoneBonus
  }
}
