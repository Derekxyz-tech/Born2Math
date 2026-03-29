'use client'

import { useState, useRef, useEffect } from 'react'
import { getProblemAction, submitAnswerAction } from '@/app/actions/mathActions'
import { getUserStatsAction } from '@/app/actions/userActions'
import { Infinity as InfinityIcon, Zap, Target, Gauge } from 'lucide-react'

export default function TrainSandbox() {
  const [problem, setProblem] = useState<any>(null)
  const [answerInput, setAnswerInput] = useState('')
  const [status, setStatus] = useState<{msg: string, isError: boolean} | null>(null)
  const [loading, setLoading] = useState(false)
  const [userRank, setUserRank] = useState('E')
  
  // SESSION STATS (Resets on Page Load)
  const [sessionStats, setSessionStats] = useState({ solved: 0, failed: 0, totalTime: 0 })

  const startTime = useRef<number>(0)

  useEffect(() => {
    const fetchStats = async () => {
      const data = await getUserStatsAction()
      if (data) setUserRank(data.rank)
    }
    fetchStats()
  }, [])

  const handleStart = async () => {
    setLoading(true)
    setStatus(null)
    setAnswerInput('')
    try {
      const data = await getProblemAction(userRank)
      if (data) {
        setProblem(data)
        startTime.current = Date.now()
      }
    } catch (e: any) {
      setStatus({ msg: (e as Error).message, isError: true })
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!problem || !answerInput) return
    
    setLoading(true)
    const timeSpentMs = Date.now() - startTime.current
    
    const res = await submitAnswerAction(
      problem.payload, 
      parseInt(answerInput, 10), 
      timeSpentMs, 
      problem.baseXp,
      problem.rank,
      true // isTraining = true
    )

    if (res.success) {
      setSessionStats(prev => ({ ...prev, solved: prev.solved + 1, totalTime: prev.totalTime + timeSpentMs }))
      setStatus({ msg: 'SEQUENCE CORRECT', isError: false })
      setTimeout(() => {
        handleStart()
      }, 500)
    } else {
      setSessionStats(prev => ({ ...prev, failed: prev.failed + 1 }))
      setStatus({ msg: 'DATA CORRUPTED [INCORRECT]', isError: true })
      setTimeout(() => {
        handleStart()
      }, 1500)
    }
    
    setLoading(false)
    setAnswerInput('')
  }

  const sessionTotal = sessionStats.solved + sessionStats.failed
  const sessionAccuracy = sessionTotal === 0 ? 0 : Math.round((sessionStats.solved / sessionTotal) * 100)
  const sessionAvgSpeed = sessionStats.solved === 0 ? 0 : (sessionStats.totalTime / sessionStats.solved / 1000).toFixed(2)

  return (
    <div className="w-full max-w-7xl animate-in fade-in zoom-in-95 duration-500 pb-24 md:pb-0">
      
      <div className="w-full flex flex-col items-center justify-center min-h-[80vh] gap-8">
        
        <div className="text-center max-w-lg mb-4">
          <div className="inline-flex items-center justify-center p-4 rounded-full bg-[rgba(255,255,255,0.03)] shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] mb-6">
            <InfinityIcon size={32} className="text-[#8888A0]" />
          </div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tighter uppercase">The Sandbox</h1>
          <p className="text-[#8888A0] text-[10px] font-bold tracking-widest uppercase">Equations solved here yield exactly 0 XP and immediately insulate your lifetime accuracy metrics.</p>
        </div>

        {/* SESSION HUD */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-2xl">
           <div className="bg-[#111114] rounded-[32px] p-6 shadow-inner border border-[rgba(255,255,255,0.01)] flex flex-col items-center">
             <Target size={16} className="text-[#00D97E] mb-2 opacity-50" />
             <span className="text-[10px] text-[#4A4A5A] uppercase tracking-widest font-black mb-1">Accuracy</span>
             <span className="text-2xl font-mono text-white font-bold">{sessionAccuracy}%</span>
           </div>
           
           <div className="bg-[#111114] rounded-[32px] p-6 shadow-inner border border-[rgba(255,255,255,0.01)] flex flex-col items-center">
             <Gauge size={16} className="text-[#60C8FF] mb-2 opacity-50" />
             <span className="text-[10px] text-[#4A4A5A] uppercase tracking-widest font-black mb-1">Avg Speed</span>
             <span className="text-2xl font-mono text-white font-bold">{sessionAvgSpeed}s</span>
           </div>

           <div className="bg-[#111114] rounded-[32px] p-6 shadow-inner border border-[rgba(255,255,255,0.01)] flex flex-col items-center">
             <Zap size={16} className="text-[#FFB020] mb-2 opacity-50" />
             <span className="text-[10px] text-[#4A4A5A] uppercase tracking-widest font-black mb-1">Sequence</span>
             <span className="text-2xl font-mono text-white font-bold">{sessionStats.solved}</span>
           </div>
        </div>

        <div className="w-full max-w-2xl bg-[#111114] rounded-[40px] p-8 shadow-[0_30px_60px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.02)] min-h-[400px] flex flex-col relative select-none items-center justify-center">

          {!problem ? (
            <button 
              onClick={handleStart} 
              disabled={loading} 
              className="w-full h-full min-h-[300px] bg-gradient-to-b from-[#18181A] to-[#111114] border border-[rgba(255,255,255,0.02)] rounded-[32px] font-bold tracking-widest text-lg text-[#8888A0] uppercase shadow-[inset_0_2px_20px_rgba(0,0,0,0.5)] hover:text-white transition-all duration-300 disabled:opacity-50"
            >
              Initialize Practice Protocol
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="w-full h-full min-h-[300px] bg-[#0A0A0C] rounded-[32px] p-8 shadow-[inset_0_20px_40px_rgba(0,0,0,0.9)] border border-[rgba(255,255,255,0.01)] flex flex-col items-center justify-center">
              <span className="text-[#60C8FF] text-xs uppercase tracking-widest font-bold mb-8 animate-pulse">Warmup Sequence Active</span>
              
              <div className="text-5xl md:text-7xl font-mono mb-12 tracking-tighter text-white text-center">
                {problem.equation.split(' ').map((part:string, i:number) => (
                  <span key={i} className={['+','-','×','÷'].includes(part) ? 'text-[#3E3E4A] mx-4 md:mx-6' : 'drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]'}>{part}</span>
                ))}
              </div>

              <input 
                type="number" 
                autoFocus 
                value={answerInput} 
                onChange={e => setAnswerInput(e.target.value)} 
                className="w-full max-w-sm bg-[#14141A] shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] border-none focus:ring-1 focus:ring-[#60C8FF] rounded-[24px] p-6 text-white text-center text-3xl font-mono mb-6 outline-none transition-all placeholder:text-[#333]" 
                placeholder="..."
              />
              
              <button type="submit" disabled={loading} className="w-full max-w-sm bg-white text-black p-5 rounded-[20px] font-bold tracking-wide shadow-[0_10px_30px_rgba(255,255,255,0.1)] hover:bg-[#60C8FF] hover:text-black transition-all duration-300 uppercase">
                Submit Test
              </button>
            </form>
          )}

          {status && (
            <div className={`absolute -bottom-20 w-full max-w-md p-4 rounded-2xl text-xs font-semibold text-center border shadow-[0_10px_20px_rgba(0,0,0,0.5)] ${status.isError ? 'bg-[rgba(232,43,43,0.1)] border-[rgba(232,43,43,0.2)] text-[#E82B2B]' : 'bg-[rgba(0,217,126,0.1)] border-[rgba(0,217,126,0.2)] text-[#00D97E]'}`}>
              {status.msg}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
