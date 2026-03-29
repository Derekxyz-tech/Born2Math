'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'

export async function buyFreezeAction() {
  const { userId } = await auth()
  if (!userId) throw new Error('Not auth')

  const admin = createAdminClient()
  
  const { data: userData, error } = await admin
    .from('users')
    .select('coins, streak_freezes_available')
    .eq('id', userId)
    .single()
  
  if (error || !userData) throw new Error('User wallet fetch failed')
  if (userData.coins < 100) return { success: false, reason: 'Insufficient B2M Coins.' }

  const newCoins = userData.coins - 100
  const newFreezes = (userData.streak_freezes_available || 0) + 1

  await admin.from('users').update({ 
    coins: newCoins, 
    streak_freezes_available: newFreezes 
  }).eq('id', userId)
  
  await admin.from('coin_transactions').insert({
    user_id: userId,
    amount: -100,
    type: 'spent',
    reference_id: 'shop_streak_freeze'
  })

  revalidatePath('/app', 'page')

  return { 
    success: true, 
    message: '❄️ Successfully Purchased 1x Frost Freeze! (-100 Coins)' 
  }
}

export async function buyCosmeticAction(itemId: string, cost: number) {
  const { userId } = await auth()
  if (!userId) throw new Error('Not auth')

  const admin = createAdminClient()
  
  const { data: userData, error: fetchErr } = await admin
    .from('users')
    .select('coins, cosmetics_unlocked, active_cosmetic')
    .eq('id', userId).single()
    
  if (fetchErr || !userData) return { success: false, reason: 'Profile validation failed.' }
  if (userData.coins < cost) return { success: false, reason: 'Insufficient Treasury Balance.' }

  let unlocked = Array.isArray(userData.cosmetics_unlocked) ? userData.cosmetics_unlocked : []
  if (unlocked.includes(itemId)) return { success: false, reason: 'Already possessed.' }

  unlocked.push(itemId)

  const newCoins = userData.coins - cost

  await admin.from('users').update({
    coins: newCoins,
    cosmetics_unlocked: unlocked,
    active_cosmetic: itemId
  }).eq('id', userId)

  await admin.from('coin_transactions').insert({
    user_id: userId, amount: -cost, type: 'spent', reference_id: `shop_cosmetic_${itemId}`
  })

  revalidatePath('/app/shop', 'page')
  revalidatePath('/app/profile', 'page')

  return { success: true, message: `Access Grant Acquired for ${itemId} (-${cost} Coins)` }
}
