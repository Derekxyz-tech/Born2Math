'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function CinematicNational({ newRank, coinReward, onComplete }: { newRank: string, coinReward: number, onComplete: () => void }) {
  const [phase, setPhase] = useState(1)

  useEffect(() => {
    let audioCtx: AudioContext | null = null;
    try { audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)(); } catch (e) {}

    // Phase 1: High Pitch Tinnitus (Silence ringing)
    const playTinnitus = () => {
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.type = 'sine'; osc.frequency.setValueAtTime(8000, audioCtx.currentTime);
      gain.gain.setValueAtTime(0, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.05, audioCtx.currentTime + 2.0);
      gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 5.0);
      osc.start(audioCtx.currentTime); osc.stop(audioCtx.currentTime + 5.0);
    }

    // Phase 2: Warp Engine Rumble
    const playWarpRumble = () => {
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.type = 'sawtooth'; osc.frequency.setValueAtTime(40, audioCtx.currentTime);
      gain.gain.setValueAtTime(0, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.4, audioCtx.currentTime + 5.0);
      gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 10.0);
      osc.start(audioCtx.currentTime); osc.stop(audioCtx.currentTime + 10.0);
    }

    // Phase 3 & 4: Planetary Gravity & Supernova Chord
    const playSupernova = () => {
      if (!audioCtx) return;
      // Massive Bass Drop
      const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.type = 'square'; osc.frequency.setValueAtTime(100, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1, audioCtx.currentTime + 5.0);
      gain.gain.setValueAtTime(1, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 5.0);
      osc.start(audioCtx.currentTime); osc.stop(audioCtx.currentTime + 5.0);

      // Major Synth Chord (C Major) to signify awe/awakening
      const chordHz = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
      chordHz.forEach((hz) => {
        const cOsc = audioCtx!.createOscillator(); const cGain = audioCtx!.createGain();
        cOsc.connect(cGain); cGain.connect(audioCtx!.destination);
        cOsc.type = 'sawtooth'; cOsc.frequency.setValueAtTime(hz, audioCtx!.currentTime);
        cGain.gain.setValueAtTime(0, audioCtx!.currentTime);
        cGain.gain.linearRampToValueAtTime(0.15, audioCtx!.currentTime + 0.1);
        cGain.gain.exponentialRampToValueAtTime(0.01, audioCtx!.currentTime + 5.0);
        cOsc.start(audioCtx!.currentTime); cOsc.stop(audioCtx!.currentTime + 5.0);
      })
    }

    const seq = async () => {
      playTinnitus() // 0-5s
      setTimeout(() => { setPhase(2); playWarpRumble(); }, 5000) // 5s-15s
      setTimeout(() => { setPhase(3); }, 15000) // 15s-20s Gravity pull
      setTimeout(() => { setPhase(4); playSupernova(); }, 20000) // 20s-25s Collision
      setTimeout(() => { setPhase(5); }, 25000) // 25s-30s Awakening
      setTimeout(() => { onComplete() }, 30000)
    }

    seq()
    return () => { if (audioCtx) audioCtx.close(); }
  }, [onComplete])

  // Optimization: Pre-calculate deterministic random stars for phase 2 so React doesn't reflow
  const starsArray = Array.from({ length: 40 }).map((_, i) => ({
    angle: Math.random() * 360,
    depth: Math.random() * 2 + 0.5,
    speed: Math.random() * 0.5 + 0.5
  }))

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black overflow-hidden perspective-1000">
      
      {/* PHASE 1: Absolute Silence & System Override */}
      {phase === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
          <motion.div animate={{ opacity: [0.1, 1, 0.1] }} transition={{ repeat: Infinity, duration: 2 }} className="w-2 h-2 bg-white rounded-full mb-8 shadow-[0_0_15px_white]" />
          <h2 className="text-[#8888A0] font-mono tracking-[0.5em] uppercase text-[10px] md:text-sm animate-pulse text-center">
            SYSTEM ARCHITECTURE FAILING.<br /><br />OVERRIDE DETECTED.
          </h2>
        </motion.div>
      )}

      {/* PHASE 2: Hyperspace Warp Speed */}
      {phase === 2 && (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <motion.h1 
            initial={{ scale: 0.5, opacity: 0 }} 
            animate={{ scale: [1, 1.5], opacity: [0, 1, 0] }} 
            transition={{ duration: 10, ease: "linear" }}
            className="absolute z-10 text-[#E82B2B] font-black text-6xl tracking-[0.2em] opacity-30 blur-sm"
          >
            WARP
          </motion.h1>
          
          {/* Warp Star Particles */}
          {starsArray.map((star, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-8 bg-white rounded-full"
              style={{
                top: '50%', left: '50%',
                rotate: `${star.angle}deg`,
                transformOrigin: '0 0',
                willChange: 'transform, opacity' // Hardware Accel
              }}
              initial={{ x: 0, opacity: 0, scale: 0 }}
              animate={{ 
                x: `${400 * star.speed}px`, 
                opacity: [0, 1, 0],
                scale: [0, star.depth, 0]
              }}
              transition={{ repeat: Infinity, duration: 1 / star.speed, ease: "linear" }}
            />
          ))}
        </div>
      )}

      {/* PHASE 3: The Convergence (Two celestial bodies drawing near) */}
      {(phase === 3 || phase === 4) && (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          
          {/* Planet 1: Dark Matter / Red Giant */}
          <motion.div
            initial={{ x: '-150vw', scale: 0.5, rotate: 0 }}
            animate={phase === 3 ? { x: '-5vw', scale: 1.5, rotate: 90 } : { x: 0, scale: 4, opacity: 0 }}
            transition={phase === 3 ? { duration: 5, ease: "easeIn" } : { duration: 0.5 }}
            className="absolute rounded-full w-96 h-96"
            style={{ backgroundImage: 'radial-gradient(circle at 30% 30%, #E82B2B, #200000 80%)', boxShadow: '0 0 100px #E82B2B', willChange: 'transform' }}
          />

          {/* Planet 2: White Dwarf / Energy Sphere */}
          <motion.div
            initial={{ x: '150vw', scale: 0.5, rotate: 0 }}
            animate={phase === 3 ? { x: '5vw', scale: 1.5, rotate: -90 } : { x: 0, scale: 4, opacity: 0 }}
            transition={phase === 3 ? { duration: 5, ease: "easeIn" } : { duration: 0.5 }}
            className="absolute rounded-full w-96 h-96"
            style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, #60C8FF, #001f3f 80%)', boxShadow: '0 0 100px #60C8FF', willChange: 'transform' }}
          />
        </div>
      )}

      {/* PHASE 4: Supernova Flashbang (Collision occurs at exactly phase 4 start) */}
      {(phase === 4 || phase === 5) && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={phase === 4 ? { opacity: [0, 1, 1] } : { opacity: [1, 0] }}
          transition={{ duration: phase === 4 ? 5 : 5 }}
          className="absolute inset-0 bg-white z-40 pointer-events-none"
        />
      )}

      {/* PHASE 5: Awakening typography out of the dust */}
      {phase === 5 && (
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
          {/* Galaxy Dust Background looping */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }}
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(232,43,43,0.3)_0%,_rgba(0,0,0,0.8)_80%)]"
          />

          <motion.div
            initial={{ scale: 0, rotate: -5, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 50, damping: 20, delay: 1 }}
            className="flex flex-col items-center"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-300 to-[#E82B2B] font-black text-6xl md:text-9xl tracking-tight uppercase" style={{ filter: 'drop-shadow(0 0 50px rgba(232,43,43,0.8))' }}>
              NATIONAL<br/>HUNTER
            </span>
            
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 3.0, duration: 1 }}
              className="mt-12 font-mono text-[#FFB020] text-4xl md:text-5xl font-black drop-shadow-[0_0_20px_rgba(255,176,32,0.8)] flex items-center gap-4 bg-[rgba(255,176,32,0.1)] px-8 py-4 border-2 border-[#FFB020]/30 rounded-2xl backdrop-blur-md"
            >
              <span>+ {coinReward.toLocaleString()}</span>
              <span>COINS</span>
            </motion.div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
