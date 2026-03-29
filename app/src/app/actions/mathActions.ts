'use server'

import { generateProblem, verifyPayload } from '@/utils/mathEngine'
import { calculateTimeDecayedXp, detectRankUp } from '@/utils/rankLogic'
import { processDailyStreak } from '@/utils/streakLogic'
import { createAdminClient } from '@/utils/supabase/admin'
import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'

export async function getProblemAction(rank: string) {
  const { userId } = await auth()
  if (!userId) throw new Error('Not authenticated')
  return generateProblem(rank)
}

export async function submitAnswerAction(
  payload: string, 
  userAnswer: number, 
  timeSpentMs: number, 
  baseXp: number,
  rank: string,
  isTraining: boolean = false
) {
  const { userId } = await auth()
  if (!userId) throw new Error('Not authenticated')

  const result = verifyPayload(payload, userAnswer, timeSpentMs)
  
  const adminSupabase = createAdminClient()
  const { data: userData, error: fetchError } = await adminSupabase
    .from('users')
    .select('total_xp, coins, streak_current, streak_longest, streak_last_date, streak_freezes_available, rank, total_solved, total_failed, total_time_ms')
    .eq('id', userId)
    .single()
    
  if (fetchError || !userData) throw new Error('Could not fetch user profile')

  if (result.success) {
    if (isTraining) {
      return { success: true, earnedXp: 0, earnedCoins: 0, rankUp: false, newRank: rank, streakData: {}, message: `✅ TRAINING CLEAR: ${(timeSpentMs/1000).toFixed(2)}s. Stats perfectly insulated.` }
    }

    const earnedXp = calculateTimeDecayedXp(baseXp, timeSpentMs, rank)
    const streakData = processDailyStreak(userData.streak_current || 0, userData.streak_longest || 0, userData.streak_last_date, userData.streak_freezes_available || 1)

    const baseCoins = Math.max(2, Math.floor(baseXp / 3))
    const rankArr = ['E', 'D', 'C', 'B', 'A', 'S', 'NATIONAL_LEVEL']
    const rIndex = rankArr.indexOf(userData.rank || 'E')
    const buffMultiplier = 1.0 + (Math.max(0, rIndex) * 0.05)
    const equationCoinsEarned = Math.floor(baseCoins * buffMultiplier)

    const oldXp = userData.total_xp || 0
    const newXp = oldXp + earnedXp
    const rankData = detectRankUp(oldXp, newXp)
    
    const finalCoinsEarned = equationCoinsEarned + rankData.coinReward + streakData.totalCoinsAwarded
    const newCoins = (userData.coins || 0) + finalCoinsEarned
    
    const updates: any = {
      total_xp: newXp,
      rank: rankData.newRank,
      coins: newCoins,
      total_solved: (userData.total_solved || 0) + 1,
      total_time_ms: (userData.total_time_ms || 0) + timeSpentMs
    }

    if (streakData.isNewDay) {
      updates.streak_current = streakData.newStreak
      updates.streak_longest = streakData.newLongest
      updates.streak_last_date = new Date().toISOString()
      if (streakData.usedFreeze) {
        updates.streak_freezes_available = Math.max(0, (userData.streak_freezes_available || 1) - 1)
      }
    }

    await adminSupabase.from('users').update(updates).eq('id', userId)

    await adminSupabase.from('match_history').insert({
      user_id: userId, 
      equation: result.equation || 'Unknown', 
      difficulty: result.rank || rank, 
      time_ms: timeSpentMs, 
      is_correct: true, 
      xp_earned: earnedXp
    })

    if (finalCoinsEarned > 0) {
      await adminSupabase.from('coin_transactions').insert({ user_id: userId, amount: finalCoinsEarned, type: 'earned', reference_id: 'math_session' })
    }

    revalidatePath('/app', 'page')
    
    let alertMsg = `✅ +${earnedXp} XP & +${equationCoinsEarned} Coins (${(timeSpentMs/1000).toFixed(2)}s)`
    if (rIndex > 0) alertMsg += ` (Includes +${(rIndex * 5)}% Rank Buff)`
    if (streakData.isNewDay) alertMsg += ` | 🔥 Streak: Day ${streakData.newStreak} (+${streakData.totalCoinsAwarded} Coins)`
    if (streakData.usedFreeze) alertMsg += ` ❄️ FROST FREEZE CONSUMED (Missed a day saved!)`
    if (streakData.streakBroken) alertMsg += ` ❌ Streak Shattered.`
    if (rankData.rankUp) alertMsg += ` 🎉 RANK UP TO ${rankData.newRank}!!! (+${rankData.coinReward} COINS)`

    return { success: true, earnedXp, earnedCoins: finalCoinsEarned, rankUp: rankData.rankUp, newRank: rankData.newRank, streakData, message: alertMsg }
  } else {
    let niceError = 'Incorrect.'
    if (result.reason === 'too_fast') niceError = 'Anti-cheat triggered: Submitted impossibly fast.'
    if (result.reason === 'payload_expired') niceError = 'Took too long to answer!'

    if (isTraining) {
      return { success: false, reason: `TRAINING FAILED: ${niceError} (Stats functionally insulated)` }
    }

    await adminSupabase.from('users').update({
      total_failed: (userData.total_failed || 0) + 1,
      total_time_ms: (userData.total_time_ms || 0) + timeSpentMs
    }).eq('id', userId)

    if (result.equation) {
      await adminSupabase.from('match_history').insert({
        user_id: userId, 
        equation: result.equation, 
        difficulty: result.rank || rank, 
        time_ms: timeSpentMs, 
        is_correct: false, 
        xp_earned: 0
      })
    }
    
    return { success: false, reason: niceError }
  }
}
