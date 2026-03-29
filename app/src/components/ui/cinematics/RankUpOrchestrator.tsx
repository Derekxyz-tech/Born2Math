'use client'

import React from 'react'
import CinematicNational from './CinematicNational'
import CinematicStandard from './CinematicStandard'

export default function RankUpOrchestrator({ newRank, coinReward, onComplete }: { newRank: string, coinReward: number, onComplete: () => void }) {
  
  // High-performance dynamic component injection based directly on the Rank String
  if (newRank === 'NATIONAL_LEVEL' || newRank === 'NATIONAL LEVEL' || newRank === 'National') {
    return <CinematicNational newRank="NATIONAL LEVEL" coinReward={coinReward} onComplete={onComplete} />
  }

  // All standard ranks (D, C, B, A, S) fall into the progressively escalating Standard Cinematic
  return <CinematicStandard newRank={newRank} coinReward={coinReward} onComplete={onComplete} />
}
