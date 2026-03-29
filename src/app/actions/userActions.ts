'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { auth, currentUser } from '@clerk/nextjs/server'

export async function ensureUserExistsAction() {
  const { userId } = await auth()
  if (!userId) throw new Error('Not authenticated')

  const admin = createAdminClient()

  // Check if user row exists
  const { data: existing } = await admin
    .from('users')
    .select('id, username')
    .eq('id', userId)
    .single()

  if (existing) {
    return existing
  }

  // Create the row using Clerk user data
  const user = await currentUser()
  const username = user?.username || user?.firstName || `user_${userId.slice(-6)}`
  
  const { data: newUser, error } = await admin.from('users').insert({
    id: userId,
    email: user?.emailAddresses?.[0]?.emailAddress || '',
    username: username,
  }).select('id, username').single()

  if (error) {
    // Could be a race condition — try fetching again
    const { data: retry } = await admin.from('users').select('id, username').eq('id', userId).single()
    if (retry) return retry
    throw new Error('Failed to create user profile')
  }

  return newUser
}

export async function getUserStatsAction() {
  const { userId } = await auth()
  if (!userId) throw new Error('Not authenticated')

  const admin = createAdminClient()
  const { data } = await admin.from('users')
    .select('total_xp, coins, rank, streak_current, streak_freezes_available, username, total_solved, total_failed, total_time_ms, active_cosmetic, id')
    .eq('id', userId)
    .single()

  return data
}

export async function getMatchHistoryAction() {
  const { userId } = await auth()
  if (!userId) throw new Error('Not authenticated')

  const admin = createAdminClient()
  const { data } = await admin.from('match_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)

  return data || []
}

export async function getPublicProfileAction(targetUserId: string) {
  const { userId } = await auth()
  if (!userId) throw new Error('Not authenticated')

  const admin = createAdminClient()
  
  // Get core ranking data
  const { data: lb, error: lbErr } = await admin
    .from('leaderboard_view')
    .select('username, rank, global_rank')
    .eq('user_id', targetUserId)
    .single()
    
  // Get raw player metrics
  const { data: stats, error: statsErr } = await admin
    .from('users')
    .select('total_solved, total_failed, total_time_ms, active_cosmetic')
    .eq('id', targetUserId)
    .single()

  if (lbErr || statsErr || !lb || !stats) {
    throw new Error("Could not resolve public profile")
  }

  // Calculate derivatives
  const total = stats.total_solved + stats.total_failed
  const accuracy = total > 0 ? (stats.total_solved / total) * 100 : 0
  const avgTime = stats.total_solved > 0 ? (stats.total_time_ms / stats.total_solved) / 1000 : 0

  return {
    userId: targetUserId,
    username: lb.username || 'Ghost',
    rank: lb.rank || 'E',
    globalRank: lb.global_rank || 0,
    totalSolved: stats.total_solved || 0,
    accuracy: Number(accuracy.toFixed(1)),
    avgTime: Number(avgTime.toFixed(2)),
    activeCosmetic: stats.active_cosmetic || 'default'
  }
}
