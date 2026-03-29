'use client'

import { useEffect, useState } from 'react'
import { Target, Clock, AlertTriangle, ShieldAlert, Link } from 'lucide-react'

const COSMETICS_MAP: Record<string, string> = {
  'plate_crimson': '#E82B2B',
  'plate_void': '#682BE8',
  'plate_gold': '#FFB020',
  'default': '#ffffff'
}

export default function ProfileDesktop() {
  const [stats, setStats] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [copying, setCopying] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      const { getUserStatsAction } = await import('@/app/actions/userActions')
      const data = await getUserStatsAction()
      if (!data) return
      setStats(data)

      // Fetch match history via server action
      const { getMatchHistoryAction } = await import('@/app/actions/userActions')
      const matchData = await getMatchHistoryAction()
      setHistory(matchData || [])
    }
    loadProfile()
  }, [])

  if (!stats) return <div className="min-h-screen bg-[#070709] flex items-center justify-center"><div className="w-8 h-8 rounded-full border-t-2 border-[#E82B2B] animate-spin"></div></div>

  const totalAttempted = (stats.total_solved || 0) + (stats.total_failed || 0)
  const accuracy = totalAttempted === 0 ? 0 : Math.round(((stats.total_solved || 0) / totalAttempted) * 100)
  const avgSpeed = (stats.total_solved || 0) === 0 ? 0 : ((stats.total_time_ms || 0) / stats.total_solved / 1000).toFixed(2)

  const activeColor = COSMETICS_MAP[stats.active_cosmetic] || '#E82B2B'

  const copyUrl = () => {
    setCopying(true)
    navigator.clipboard.writeText(`https://born2math.app/u/${stats.id}`)
    setTimeout(() => setCopying(false), 2000)
  }

  // Rank Ladder Generator
  const ranks = ['E', 'D', 'C', 'B', 'A', 'S', 'NAT']
  const rIdx = ranks.findIndex(r => stats.rank.startsWith(r)) >= 0 ? ranks.findIndex(r => stats.rank.startsWith(r)) : 0

  return (
    <div className="w-full max-w-7xl animate-in fade-in zoom-in-95 duration-500 pb-24 md:pb-0">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full p-4 lg:p-0 mt-4 lg:mt-0">

        {/* ========================================================== */}
        {/* LEFT PANE | Player Identity Grid                           */}
        {/* ========================================================== */}
        <div className="lg:col-span-4 flex flex-col gap-6">

          {/* Core Identity Plate & URL */}
          <div className="flex flex-col gap-4">
            <div className="w-full bg-[#111114] rounded-[40px] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.01)] relative overflow-hidden group">
              <div className="absolute -right-20 -bottom-20 w-48 h-48 bg-white opacity-[0.03] rounded-full blur-3xl group-hover:opacity-[0.06] transition-all duration-1000" style={{ backgroundColor: activeColor }}></div>
              
              <div className="w-20 h-20 rounded-[28px] bg-white bg-opacity-[0.05] flex items-center justify-center shadow-inner mb-8" style={{ color: activeColor }}>
                <Target size={36} />
              </div>

              <h3 className="text-[#8888A0] text-lg font-bold tracking-widest uppercase mb-2">@{stats.username || 'Operative'}</h3>
              <span className="text-4xl lg:text-5xl font-black block tracking-tighter leading-none mb-4" style={{ color: activeColor }}>{stats.rank.replace('NATIONAL_LEVEL', 'NATIONAL')}</span>
            </div>

            <button onClick={copyUrl} className="w-full bg-[#18181A] hover:bg-white hover:text-black hover:shadow-[0_10px_30px_rgba(255,255,255,0.2)] text-[#8888A0] rounded-[24px] p-4 flex items-center justify-between transition-all group">
              <span className="text-[10px] font-bold tracking-widest uppercase group-hover:text-black flex gap-2"><Link size={14}/> {copying ? 'Coppied to Clipboard!' : 'Public Dossier URL'}</span>
              <span className="font-mono text-xs opacity-50 truncate max-w-[120px]">b2m.app/u/...</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-[#111114] rounded-[32px] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.01)] flex flex-col justify-between h-[180px]">
              <div className="flex items-center gap-2 text-[#8888A0]">
                <ShieldAlert size={16} className="text-white" />
                <span className="text-xs font-bold tracking-widest uppercase">Accuracy</span>
              </div>
              <span className="font-mono text-4xl lg:text-5xl font-semibold text-white block tracking-tighter">{accuracy}<span className="text-xl text-[#8888A0] ml-1">%</span></span>
            </div>
            
            <div className="bg-[#111114] rounded-[32px] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.01)] flex flex-col justify-between h-[180px]">
              <div className="flex items-center gap-2 text-[#8888A0]">
                <Clock size={16} className="text-white" />
                <span className="text-xs font-bold tracking-widest uppercase">V-Speed</span>
              </div>
              <span className="font-mono text-3xl md:text-4xl font-semibold text-[#8888A0] block tracking-tighter">{avgSpeed}<span className="text-lg ml-1">s</span></span>
            </div>
          </div>

          {/* Visual Rank Ladder */}
          <div className="bg-[#111114] rounded-[32px] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.01)] flex flex-col gap-6">
            <h3 className="text-[#8888A0] text-xs font-bold tracking-widest uppercase">Rank Ascension Ladder</h3>
            <div className="flex items-center justify-between w-full relative">
              <div className="absolute top-1/2 left-0 w-full h-[2px] bg-[#18181A] -translate-y-1/2 z-0"></div>
              {ranks.map((r, i) => (
                <div key={r} className={`w-10 h-10 rounded-[12px] flex items-center justify-center font-black text-sm z-10 transition-all ${i === rIdx ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.5)] scale-125' : i < rIdx ? 'bg-[#18181A] text-[#8888A0] shadow-inner' : 'bg-[#0A0A0C] text-[#2A2A35]'}`}>
                  {r}
                </div>
              ))}
            </div>
          </div>

        </div>


        {/* ========================================================== */}
        {/* RIGHT PANE | Protocol Ledger (Match History)                */}
        {/* ========================================================== */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="w-full bg-[#111114] rounded-[40px] p-8 lg:p-10 shadow-[0_30px_60px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.02)] min-h-[500px] flex flex-col">
            
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-[#8888A0] mb-8 tracking-tight">
              Combat Ledger
            </h1>

            <div className="flex flex-col gap-4 overflow-y-auto pr-2 max-h-[800px] custom-scrollbar">
              {history.length === 0 ? (
                <div className="w-full h-[300px] rounded-[32px] bg-[#0A0A0C] shadow-[inset_0_2px_20px_rgba(0,0,0,0.8)] border border-[rgba(255,255,255,0.01)] flex items-center justify-center text-sm font-bold tracking-widest text-[#4A4A5A] uppercase">
                  No Deployments Logged.
                </div>
              ) : (
                history.map((match: any) => (
                  <div key={match.id} className="bg-[#18181A] hover:bg-[#1C1C22] transition-colors rounded-[24px] p-6 lg:p-8 flex justify-between items-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),0_1px_1px_rgba(255,255,255,0.01)] min-h-[100px]">
                    <div className="flex flex-col h-full justify-center">
                      <span className="font-mono text-white text-2xl md:text-3xl leading-none tracking-tighter">{match.equation}</span>
                      <span className="text-xs text-[#8888A0] font-bold tracking-widest mt-3 uppercase">Target Level: {match.difficulty.replace('NATIONAL_LEVEL', 'NAT-LEVEL')}</span>
                    </div>
                    
                    {match.is_correct ? (
                      <div className="flex flex-col items-end h-full justify-center">
                        <span className="text-lg md:text-xl font-bold text-[#00D97E] tracking-tight">+{match.xp_earned} XP</span>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock size={12} className="text-[#60C8FF]" />
                          <span className="text-xs font-mono text-[#60C8FF] tracking-widest mb-0.5">{(match.time_ms / 1000).toFixed(2)}s</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-end gap-2 h-full justify-center bg-[rgba(232,43,43,0.05)] px-6 py-3 rounded-2xl border border-[rgba(232,43,43,0.1)]">
                        <div className="flex items-center gap-2">
                          <AlertTriangle size={16} className="text-[#E82B2B]" />
                          <span className="text-[10px] font-bold text-[#E82B2B] uppercase tracking-widest truncate">Corrupted</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
