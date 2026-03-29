'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function CinematicStandard({ newRank, coinReward, onComplete }: { newRank: string, coinReward: number, onComplete: () => void }) {
  const [phase, setPhase] = useState(1)

  // Explicit dynamic styling based on Rank escalating progressively
  const isS = newRank === 'S' || newRank === 'S-Rank'
  const isA = newRank === 'A' || newRank === 'A-Rank'
  
  const mainColor = isS ? '#FFB020' : isA ? '#9C27B0' : '#E82B2B'
  const vibeName = isS ? "SUPREME LIMITER" : isA ? "ADVANCED BARRIER" : "SYSTEM THRESHOLD"

  useEffect(() => {
    let audioCtx: AudioContext | null = null;
    try { audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)(); } catch (e) {}

    const playLowHeartbeat = () => {
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.type = 'sine'; osc.frequency.setValueAtTime(isS ? 80 : 60, audioCtx.currentTime); 
      osc.frequency.exponentialRampToValueAtTime(isS ? 40 : 30, audioCtx.currentTime + 0.5);
      gain.gain.setValueAtTime(1, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      osc.start(audioCtx.currentTime); osc.stop(audioCtx.currentTime + 0.5);
    };

    const playRiser = () => {
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.type = isS ? 'sawtooth' : 'triangle'; 
      osc.frequency.setValueAtTime(100, audioCtx.currentTime); osc.frequency.exponentialRampToValueAtTime(isS ? 1200 : 800, audioCtx.currentTime + 3.0);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime); gain.gain.linearRampToValueAtTime(1.0, audioCtx.currentTime + 3.0);
      osc.start(audioCtx.currentTime); osc.stop(audioCtx.currentTime + 3.0);
    };

    const playExplosion = () => {
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.type = 'square'; osc.frequency.setValueAtTime(isS ? 200 : 150, audioCtx.currentTime); osc.frequency.exponentialRampToValueAtTime(1, audioCtx.currentTime + 2.0);
      gain.gain.setValueAtTime(1, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 2.0);
      osc.start(audioCtx.currentTime); osc.stop(audioCtx.currentTime + 2.0);
    };

    const seq = async () => {
      playLowHeartbeat(); setTimeout(playLowHeartbeat, 1000); setTimeout(playLowHeartbeat, 2000);
      setTimeout(() => { setPhase(2); playRiser(); }, 3000)
      setTimeout(() => { setPhase(3); playExplosion(); }, 6000)
      setTimeout(() => { onComplete() }, 9500)
    }

    seq()
    return () => { if (audioCtx) audioCtx.close(); }
  }, [onComplete, isS])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black overflow-hidden backdrop-blur-3xl">
      
      {/* PHASE 1: Analytics Processing */}
      {phase === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4">
          <motion.div animate={{ opacity: [0.1, 1, 0.1] }} transition={{ repeat: Infinity, duration: 1 }} style={{ borderColor: mainColor }} className="w-12 h-12 border-t-2 rounded-full animate-spin" />
          <h2 style={{ color: mainColor }} className="font-mono tracking-[0.4em] uppercase text-sm animate-pulse">Analyzing {vibeName}...</h2>
        </motion.div>
      )}

      {/* PHASE 2 */}
      {phase === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, x: [0, -10, 10, -10, 10, 0], y: [0, 10, -10, 10, -10, 0] }} transition={{ repeat: Infinity, duration: isS ? 0.1 : 0.2 }} className="flex flex-col items-center gap-2">
          <h1 className="text-white font-black text-4xl tracking-tighter uppercase text-center md:text-5xl drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]">LIMITER RELEASED</h1>
          <h2 style={{ color: mainColor }} className="font-mono tracking-[0.2em] uppercase text-xl">AWAKENING IMMINENT</h2>
        </motion.div>
      )}

      {/* PHASE 3 */}
      {phase === 3 && (
        <>
          <motion.div initial={{ scale: 0, opacity: 0, rotate: 0 }} animate={{ scale: [0, 4, 3], opacity: [0, 1, 0.2], rotate: 180 }} transition={{ duration: 3.5, ease: "easeOut" }} className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle, ${mainColor}40 0%, transparent 70%)` }} />
          <motion.div initial={{ y: -300, scale: 4, opacity: 0 }} animate={{ y: -100, scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 150, damping: 10, delay: 0.1 }} className="absolute top-1/3 flex flex-col items-center" style={{ filter: `drop-shadow(0 0 40px ${mainColor})` }}>
            <span className="text-[#8888A0] font-mono tracking-[0.8em] text-sm md:text-md uppercase mb-2">Promotion</span>
            <h1 className="text-white font-black text-7xl md:text-9xl tracking-tighter uppercase italic">RANK UP</h1>
          </motion.div>
          <motion.div initial={{ scale: 0, rotate: -20, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 12, delay: 1.0 }} className="absolute top-1/2 flex flex-col items-center mt-12">
            <div className="text-[#60C8FF] text-xs font-mono font-bold uppercase tracking-[0.4em] mb-4">New Class Classification</div>
            <div className="px-16 py-6 border-4 rounded-2xl backdrop-blur-sm relative overflow-hidden" style={{ borderColor: mainColor, backgroundColor: `${mainColor}20`, boxShadow: `0 0 80px ${mainColor}60` }}>
              <span className="text-transparent bg-clip-text font-black text-6xl md:text-8xl" style={{ backgroundImage: `linear-gradient(to bottom right, white, ${mainColor})` }}>{newRank}</span>
            </div>
            <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 2.0, duration: 0.5 }} className="mt-8 font-mono text-[#FFB020] text-3xl font-black flex items-center gap-3 bg-[rgba(255,176,32,0.15)] px-6 py-3 border-2 border-[#FFB020]/40 rounded-xl">
              <span>+ {coinReward.toLocaleString()} COINS</span>
            </motion.div>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} transition={{ duration: 0.5, times: [0, 0.1, 1], ease: "easeOut" }} className="absolute inset-0 bg-white pointer-events-none" />
        </>
      )}

    </div>
  )
}
