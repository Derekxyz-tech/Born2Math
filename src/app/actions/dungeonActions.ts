'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { getBossRank, generateProblem } from '@/utils/mathEngine'
import { detectRankUp } from '@/utils/rankLogic'
import { auth } from '@clerk/nextjs/server'
import { ensureUserExistsAction } from './userActions'

interface DungeonState {
  speed: boolean
  accuracy: boolean
  boss: boolean
  claimed: boolean
}

export async function fetchDungeonStateAction(): Promise<DungeonState> {
  const { userId } = await auth()
  if (!userId) throw new Error('Not authenticated')

  await ensureUserExistsAction()

  const supabase = createAdminClient()
  const { data: userData } = await supabase.from('users')
    .select('dungeon_date_utc, dungeon_speed_cleared, dungeon_accuracy_cleared, dungeon_boss_cleared, dungeon_bonus_claimed')
    .eq('id', userId).single()
  
  if (!userData) throw new Error('User not found')

  const todayUTC = new Date().toISOString().split('T')[0]
  
  if (userData.dungeon_date_utc !== todayUTC) {
    await supabase.from('users').update({
      dungeon_date_utc: todayUTC,
      dungeon_speed_cleared: false,
      dungeon_accuracy_cleared: false,
      dungeon_boss_cleared: false,
      dungeon_bonus_claimed: false
    }).eq('id', userId)

    return { speed: false, accuracy: false, boss: false, claimed: false }
  }

  return {
    speed: userData.dungeon_speed_cleared,
    accuracy: userData.dungeon_accuracy_cleared,
    boss: userData.dungeon_boss_cleared,
    claimed: userData.dungeon_bonus_claimed
  }
}

export async function clearDungeonAction(type: 'speed' | 'accuracy' | 'boss'): Promise<{ success: boolean; message: string; rankUp?: boolean; newRank?: string; coinReward?: number }> {
  const { userId } = await auth()
  if (!userId) return { success: false, message: 'Unauthenticated' }

  const supabase = createAdminClient()

  const { data: userStats } = await supabase.from('users').select('total_xp, coins, rank').eq('id', userId).single()
  if (!userStats) return { success: false, message: 'No stats found' }

  const columnToUpdate = `dungeon_${type}_cleared`
  const targetRank = type === 'boss' ? getBossRank(userStats.rank || 'E') : (userStats.rank || 'E')
  const baseEquateXp = generateProblem(targetRank).baseXp

  let xpReward = 0
  if (type === 'speed') xpReward = Math.floor(baseEquateXp * 30 * 1.5)
  if (type === 'accuracy') xpReward = Math.floor(baseEquateXp * 20 * 1.5)
  if (type === 'boss') xpReward = Math.floor(baseEquateXp * 10 * 2.0)
  
  const coinReward = Math.floor(xpReward / 5)

  const oldXp = userStats.total_xp || 0
  const newXp = oldXp + xpReward
  const rankData = detectRankUp(oldXp, newXp)

  await supabase.from('users').update({
    [columnToUpdate]: true,
    total_xp: newXp,
    coins: (userStats.coins || 0) + coinReward + rankData.coinReward,
    rank: rankData.newRank
  }).eq('id', userId)

  let alertMessage = `Matrix Successfully Neutralized. +${xpReward} XP | +${coinReward} Coins`
  if (rankData.rankUp) alertMessage += ` 🎉 RANK UP TRIGGERED: ${rankData.newRank}!`

  return { success: true, message: alertMessage, rankUp: rankData.rankUp, newRank: rankData.newRank, coinReward: rankData.coinReward }
}

export async function claimDailyDungeonBonusAction(): Promise<{ success: boolean; message: string; rankUp?: boolean; newRank?: string; coinReward?: number }> {
  const { userId } = await auth()
  if (!userId) return { success: false, message: 'Unauthenticated' }

  const supabase = createAdminClient()
  const state = await fetchDungeonStateAction()
  if (!state.speed || !state.accuracy || !state.boss) return { success: false, message: 'Remaining Dungeons Active.' }
  if (state.claimed) return { success: false, message: 'Vault Already Claimed Today.' }

  const { data: userStats } = await supabase.from('users').select('total_xp, coins, rank').eq('id', userId).single()
  
  const baseEquateXp = generateProblem(userStats?.rank || 'E').baseXp
  const bonusXp = Math.floor(baseEquateXp * 50)
  const bonusCoins = Math.floor(bonusXp / 5)

  const oldXp = userStats?.total_xp || 0
  const newXp = oldXp + bonusXp
  const rankData = detectRankUp(oldXp, newXp)

  await supabase.from('users').update({
    dungeon_bonus_claimed: true,
    total_xp: newXp,
    coins: (userStats?.coins || 0) + bonusCoins + rankData.coinReward,
    rank: rankData.newRank
  }).eq('id', userId)

  let alertMessage = `THE TRIFECTA CLEAR. +${bonusXp} XP | +${bonusCoins} Coins`
  if (rankData.rankUp) alertMessage += ` 🎉 ASCENSION ACHIEVED: ${rankData.newRank}!`

  return { success: true, message: alertMessage, rankUp: rankData.rankUp, newRank: rankData.newRank, coinReward: rankData.coinReward }
}
