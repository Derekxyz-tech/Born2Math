'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useAuth } from '@clerk/nextjs'
import { Trophy } from 'lucide-react'
import PublicProfileModal from '@/components/ui/PublicProfileModal'
import { getPublicProfileAction } from '@/app/actions/userActions'

// XP Formatter (e.g., 92.1k)
function formatXP(xp: number) {
  if (xp >= 1000) {
    return (xp / 1000).toFixed(1) + 'k'
  }
  return xp.toString()
}

export default function LeaderboardDesktop() {
  const [leaders, setLeaders] = useState<any[]>([])
  const [myRank, setMyRank] = useState<number | null>(null)
  const [myRankLetter, setMyRankLetter] = useState<string | null>(null)
  const supabase = createClient()
  const { userId } = useAuth()

  // Profile Modal State
  const [profileOpen, setProfileOpen] = useState(false)
  const [targetProfileData, setTargetProfileData] = useState<any>(null)
  const [profileLoading, setProfileLoading] = useState(false)

  useEffect(() => {
    async function fetchLB() {
      const { data, error } = await supabase.from('leaderboard_view').select('*').limit(100)
      
      if (!error && data) {
        setLeaders(data)
        if (userId) {
          const myEntry = data.find((row) => row.user_id === userId)
          if (myEntry) {
            setMyRank(myEntry.global_rank)
            setMyRankLetter(myEntry.rank)
          }
        }
      }
    }
    fetchLB()
  }, [userId])

  const handleProfileClick = async (targetId: string) => {
    setProfileOpen(true)
    setProfileLoading(true)
    try {
      const pData = await getPublicProfileAction(targetId)
      setTargetProfileData(pData)
    } catch (e) {
      console.error(e)
    }
    setProfileLoading(false)
  }

  const handleCloseProfile = () => {
    setProfileOpen(false)
    setTimeout(() => {
      setTargetProfileData(null)
    }, 300)
  }

  const top3 = leaders.slice(0, 3)
  const rest = leaders.slice(3)

  return (
    <div className="w-full max-w-2xl animate-in fade-in zoom-in-95 duration-500 pb-24 md:pb-0 font-sans">
      
      <PublicProfileModal 
        isOpen={profileOpen} 
        onClose={handleCloseProfile} 
        data={targetProfileData} 
        loading={profileLoading} 
      />

      {/* HEADER SECTION - Back to "Ranking in Red" style */}
      <div className="w-full flex justify-between items-center mb-10 px-2 lg:px-4 mt-4">
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white flex items-center gap-4">
          Global <span className="text-[#E82B2B]">Rankings</span>
        </h1>
        
        {/* Isolated Identity Tab - Desktop Only */}
        <div className="hidden lg:flex bg-[#18181A] rounded-[24px] px-8 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.02)] items-center gap-6 relative overflow-hidden group border border-[rgba(255,255,255,0.02)]">
          <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-[rgba(232,43,43,0.05)] to-transparent group-hover:from-[rgba(232,43,43,0.1)] transition-all"></div>
          <div className="flex flex-col">
            <span className="text-[#8888A0] text-[10px] font-bold tracking-widest uppercase mb-1">Your Division Rank</span>
            <span className="text-2xl font-mono font-black text-white">
              {myRank ? `#${myRank}` : 'Scouting...'}
            </span>
          </div>
          <Trophy className={myRank && myRank <= 3 ? "text-white" : "text-[#4A4A5A]"} size={24} />
        </div>
      </div>

      <div className="w-full min-h-[600px] flex flex-col gap-10">

        {/* PODIUM SECTION - Adjusted to match screenshot */}
        {leaders.length > 0 ? (
          <div className="flex items-end justify-center gap-4 mt-8 px-2 shrink-0">
            {/* 2nd Place */}
            {top3[1] && (
              <div onClick={() => handleProfileClick(top3[1].user_id)} className="flex flex-col items-center flex-1 cursor-pointer group transition-transform hover:-translate-y-2">
                <div className="text-[11px] font-bold text-[#8888A0] mb-3">2nd</div>
                <div className="w-[58px] h-[58px] rounded-full border border-white/20 bg-transparent flex items-center justify-center font-sans font-medium text-lg text-white shrink-0 shadow-[0_0_15px_rgba(255,255,255,0.05)] mb-4 group-hover:bg-white/5 transition-colors">
                  {top3[1].username.substring(0, 2).toUpperCase()}
                </div>
                <div className="text-[13px] font-bold text-center text-white truncate max-w-[100px] w-full mb-1">{top3[1].username}</div>
                <div className="font-sans text-[11px] font-bold text-[#8888A0] text-center mb-6">{formatXP(top3[1].total_xp || 0)}</div>
                <div className="w-full max-w-[110px] rounded-t-xl bg-[#1A1A22] border border-white/5 border-b-0 h-[50px] group-hover:bg-[#22222A] transition-colors relative">
                   <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/5" />
                </div>
              </div>
            )}

            {/* 1st Place */}
            {top3[0] && (
              <div onClick={() => handleProfileClick(top3[0].user_id)} className="flex flex-col items-center flex-[1.2] cursor-pointer group transition-transform hover:-translate-y-2 relative">
                <div className="absolute -top-10 text-2xl drop-shadow-[0_0_12px_rgba(255,176,32,0.6)] z-10">👑</div>
                <div className="text-[11px] font-bold text-[#FFB020] mb-3">1st</div>
                <div className="w-[78px] h-[78px] rounded-full border-2 border-[#FFB020] bg-transparent flex items-center justify-center font-sans font-medium text-xl text-[#FFB020] shrink-0 shadow-[0_0_20px_rgba(255,176,32,0.3)] mb-4 group-hover:bg-[#FFB020]/10 transition-colors">
                  {top3[0].username.substring(0, 2).toUpperCase()}
                </div>
                <div className="text-[15px] font-bold text-center text-white truncate max-w-[120px] w-full mb-1">{top3[0].username}</div>
                <div className="font-sans text-[12px] font-bold text-[#FFB020] text-center mb-8">{formatXP(top3[0].total_xp || 0)}</div>
                <div className="w-full max-w-[130px] rounded-t-xl bg-[#FFB020]/[0.1] border border-[#FFB020]/40 border-b-0 h-[80px] group-hover:bg-[#FFB020]/[0.15] transition-colors relative overflow-hidden shadow-[0_0_30px_rgba(255,176,32,0.1)]">
                  <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-[#FFB020]/20 to-transparent" />
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {top3[2] && (
              <div onClick={() => handleProfileClick(top3[2].user_id)} className="flex flex-col items-center flex-1 cursor-pointer group transition-transform hover:-translate-y-2">
                <div className="text-[11px] font-bold text-[#8888A0] mb-3">3rd</div>
                <div className="w-[58px] h-[58px] rounded-full border border-[#B460FF] bg-transparent flex items-center justify-center font-sans font-medium text-lg text-[#B460FF] shrink-0 shadow-[0_0_15px_rgba(180,96,255,0.2)] mb-4 group-hover:bg-[#B460FF]/10 transition-colors">
                  {top3[2].username.substring(0, 2).toUpperCase()}
                </div>
                <div className="text-[13px] font-bold text-center text-white truncate max-w-[100px] w-full mb-1">{top3[2].username}</div>
                <div className="font-sans text-[11px] font-bold text-[#8888A0] text-center mb-6">{formatXP(top3[2].total_xp || 0)}</div>
                <div className="w-full max-w-[110px] rounded-t-xl bg-[#1A1A22] border border-white/5 border-b-0 h-[40px] group-hover:bg-[#22222A] transition-colors relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent to-[#B460FF]/5" />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-12 flex items-center justify-center text-[#4A4A5A] text-xs font-bold uppercase tracking-widest gap-3">
            <div className="w-4 h-4 rounded-full border-t-2 border-[#4A4A5A] animate-spin"></div>
            Calibrating Ranks...
          </div>
        )}

        {/* LIST SECTION - Rounded Pills style */}
        <div className="flex flex-col gap-3 px-2 pb-48 lg:pb-0">
          {rest.map((lb) => {
            const isMe = lb.user_id === userId
            
            // Badge styles based on rank
            let badgeStyle = "bg-white/10 text-white"
            let badgeBg = "rgba(255,255,255,0.1)"
            if (lb.rank === 'S' || lb.rank === 'NATIONAL_LEVEL') {
              badgeStyle = "text-[#E82B2B] border-[#E82B2B]/40"
              badgeBg = "rgba(232,43,43,0.15)"
            } else if (lb.rank === 'A') {
              badgeStyle = "text-[#FFB020] border-[#FFB020]/40"
              badgeBg = "rgba(255,176,32,0.15)"
            } else if (lb.rank === 'B') {
              badgeStyle = "text-[#60C8FF] border-[#60C8FF]/40"
              badgeBg = "rgba(96,200,255,0.15)"
            }

            return (
              <div 
                key={lb.user_id} 
                onClick={() => handleProfileClick(lb.user_id)}
                className={`flex items-center gap-5 p-4 bg-[#18181B] border border-white/5 rounded-[26px] cursor-pointer hover:bg-[#1C1C20] hover:border-white/10 transition-all group relative ${isMe ? 'ring-1 ring-[#E82B2B] border-[#E82B2B]/40 bg-[#E82B2B]/10 overflow-hidden shadow-[0_0_20px_rgba(232,43,43,0.1)]' : ''}`}
              >
                {/* Vertical status bar for "You" */}
                {isMe && <div className="absolute left-0 top-0 w-1.5 h-full bg-[#E82B2B] shadow-[2px_0_10px_rgba(232,43,43,0.5)]" />}
                
                {/* Rank Number */}
                <div className={`w-6 text-center font-sans text-sm font-black ${isMe ? 'text-[#E82B2B]' : 'text-[#4A4A5A]'}`}>
                  {lb.global_rank}
                </div>
                
                {/* Large Round Avatar */}
                <div className={`w-[48px] h-[48px] rounded-[18px] flex items-center justify-center font-sans font-bold text-sm shrink-0 transition-all ${isMe ? 'bg-[#E82B2B]/20 text-white ring-1 ring-[#E82B2B]/30 shadow-[0_0_15px_rgba(232,43,43,0.2)]' : 'bg-white/5 text-[#8888A0] group-hover:bg-white/10'}`}>
                  {lb.username.substring(0, 2).toUpperCase()}
                </div>
                
                {/* Name & Title */}
                <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
                  <div className={`text-[15px] font-black truncate ${isMe ? 'text-[#E82B2B]' : 'text-white'}`}>
                    {lb.username} {isMe && <span className="text-[#8888A0] font-bold">(You)</span>}
                  </div>
                  <div className="text-[11px] text-[#8888A0] font-serif italic font-medium truncate">
                    {lb.active_cosmetic && lb.active_cosmetic !== 'default' ? lb.active_cosmetic.replace('plate_', ' ') : 'Rookie'}
                  </div>
                </div>

                {/* Rank Letter Badge */}
                <div 
                  className={`w-[24px] h-[24px] rounded-[8px] flex items-center justify-center text-[10px] font-black shrink-0 border uppercase ${badgeStyle}`}
                  style={{ backgroundColor: badgeBg }}
                >
                  {lb.rank === 'NATIONAL_LEVEL' ? 'N' : lb.rank}
                </div>

                {/* XP Text */}
                <div className="font-sans text-[15px] font-black text-white text-right min-w-[55px] tracking-tight">
                  {formatXP(lb.total_xp || 0)}
                </div>
              </div>
            )
          })}
        </div>

      </div>

      {/* MOBILE STICKY RANK BAR */}
      <div className="fixed bottom-[100px] left-0 right-0 lg:hidden px-4 z-40 pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          <div className="bg-[#111114]/95 backdrop-blur-2xl border border-white/10 rounded-[28px] p-4 shadow-[0_-15px_40px_rgba(0,0,0,0.7)] flex items-center justify-between overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#E82B2B]/10 to-transparent opacity-40"></div>
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-10 h-10 rounded-[16px] bg-[#E82B2B]/20 flex items-center justify-center text-[#E82B2B] shadow-[inset_0_0_10px_rgba(232,43,43,0.2)]">
                <Trophy size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold tracking-widest uppercase text-[#8888A0] block mb-0.5">Your Ranking</span>
                <span className="text-xl font-mono font-black text-white leading-none">
                  {myRank ? `#${myRank}` : 'Scouting...'}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end relative z-10 gap-0.5">
              <div className="flex items-center gap-1.5">
                {myRankLetter && (
                  <span className="px-1.5 py-0.5 rounded bg-[#E82B2B] text-white text-[9px] font-black uppercase ring-1 ring-[#E82B2B]/40">
                    {myRankLetter === 'NATIONAL_LEVEL' ? 'N' : myRankLetter}
                  </span>
                )}
                <span className="text-[10px] font-bold tracking-widest uppercase text-[#E82B2B]">Division Active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-[#E82B2B] animate-pulse"></div>
                <span className="text-white text-[9px] font-bold tracking-wider uppercase opacity-80">Live Sync</span>
              </div>
            </div>
            
            {/* Glossy overlay effect */}
            <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-25deg] group-hover:left-[100%] transition-all duration-1000 ease-in-out"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
