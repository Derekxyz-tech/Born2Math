'use client'

import { useEffect, useState } from 'react'
import { buyFreezeAction, buyCosmeticAction } from '@/app/actions/shopActions'
import { getUserStatsAction } from '@/app/actions/userActions'
import { Snowflake, Gem, Paintbrush, Lock } from 'lucide-react'

const COSMETICS = [
  { id: 'plate_crimson', name: 'Crimson Plate', type: 'Design', cost: 500, icon: <Paintbrush size={24}/>, color: '#E82B2B' },
  { id: 'plate_void', name: 'The Void Grid', type: 'Design', cost: 1500, icon: <Lock size={24}/>, color: '#682BE8' },
  { id: 'plate_gold', name: 'Sovereign Gold', type: 'Design', cost: 5000, icon: <Gem size={24}/>, color: '#FFB020' },
]

export default function ShopDesktop() {
  const [stats, setStats] = useState<{coins: number, freezes: number, unlocked: string[], active: string} | null>(null)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{msg: string, isErr: boolean} | null>(null)

  async function load() {
    const data = await getUserStatsAction()
    if (data) {
      setStats({
        coins: data.coins || 0,
        freezes: data.streak_freezes_available || 0,
        unlocked: Array.isArray((data as any).cosmetics_unlocked) ? (data as any).cosmetics_unlocked : [],
        active: data.active_cosmetic || 'default'
      })
    }
  }

  useEffect(() => { load() }, [])

  const handleBuyCosmetic = async (id: string, cost: number) => {
    if (loading) return
    setLoading(true)
    const res = await buyCosmeticAction(id, cost)
    if (res.success) {
      setStatus({ msg: res.message || 'Transaction Complete', isErr: false })
      await load()
    } else {
      setStatus({ msg: `❌ ${res.reason || 'Transaction Failed'}`, isErr: true })
    }
    setLoading(false)
  }

  const handleBuyFreeze = async () => {
    if (loading) return
    setLoading(true)
    const res = await buyFreezeAction()
    if (res.success) {
      setStatus({ msg: res.message || 'Transaction Complete', isErr: false })
      await load()
    } else {
      setStatus({ msg: `❌ ${res.reason || 'Transaction Failed'}`, isErr: true })
    }
    setLoading(false)
  }

  if (!stats) return <div className="animate-spin w-8 h-8 border-t-2 border-[#E82B2B] rounded-full mx-auto mt-20"></div>

  return (
    <div className="w-full max-w-7xl animate-in fade-in zoom-in-95 duration-500 pb-24 md:pb-0">
      
      <div className="w-full flex justify-between items-center mb-10 px-2 lg:px-4 mt-4">
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white flex items-center gap-4">
          The <span className="text-[#E82B2B]">Armory</span>
        </h1>
        
        <div className="bg-[#18181A] rounded-[24px] px-8 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.02)] flex items-center gap-6 relative overflow-hidden group border border-[rgba(255,255,255,0.02)]">
          <div className="flex flex-col items-end">
            <span className="text-[#8888A0] text-[10px] font-bold tracking-widest uppercase mb-1">Treasury</span>
            <span className="text-2xl font-mono font-black text-white">
              {stats.coins.toLocaleString()}
            </span>
          </div>
          <div className="w-12 h-12 rounded-full bg-[rgba(255,176,32,0.1)] text-[#FFB020] flex items-center justify-center shadow-[0_0_20px_rgba(255,176,32,0.2)]">🪙</div>
        </div>
      </div>

      {status && (
        <div className={`w-full p-4 mb-8 rounded-[16px] text-sm font-bold tracking-widest uppercase text-center ${status.isErr ? 'bg-[rgba(232,43,43,0.1)] text-[#E82B2B]' : 'bg-[rgba(0,217,126,0.1)] text-[#00D97E]'}`}>
          {status.msg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">

        {/* Consumables (Left 4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="w-full bg-[#111114] rounded-[40px] p-8 shadow-[0_30px_60px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.02)]">
            <h3 className="text-[#8888A0] text-xs font-bold tracking-widest uppercase mb-8 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#60C8FF]"></span> Utilities
            </h3>

            <div className="bg-[#18181A] rounded-[32px] p-6 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),0_1px_1px_rgba(255,255,255,0.01)] flex flex-col items-center border border-[rgba(255,255,255,0.01)] group relative overflow-hidden">
              <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-[rgba(96,200,255,0.1)] to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              
              <div className="w-20 h-20 rounded-[24px] bg-[rgba(96,200,255,0.05)] shadow-[inset_0_2px_10px_rgba(96,200,255,0.2)] flex items-center justify-center mb-6 z-10">
                <Snowflake size={36} className="text-[#60C8FF]" />
              </div>
              <span className="text-xl font-black text-white tracking-tight mb-2">Frost Freeze</span>
              <span className="text-xs text-[#8888A0] font-bold tracking-widest text-center mb-8 uppercase">Forgive 1 missed day without breaking your streak chain. (Owned: {stats.freezes})</span>
              
              <button 
                onClick={handleBuyFreeze} 
                disabled={loading || stats.coins < 100}
                className="w-full py-4 rounded-[20px] bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-[#60C8FF] hover:text-black transition-all shadow-[0_10px_20px_rgba(255,255,255,0.1)] hover:shadow-[0_10px_20px_rgba(96,200,255,0.4)] disabled:opacity-50"
              >
                Buy (100)
              </button>
            </div>
          </div>
        </div>


        {/* Cosmetics (Right 8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="w-full bg-[#111114] rounded-[40px] p-8 lg:p-10 shadow-[0_30px_60px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.02)] min-h-[500px]">
            <h3 className="text-[#8888A0] text-xs font-bold tracking-widest uppercase mb-8 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E82B2B]"></span> Identity Plates
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              {COSMETICS.map(item => {
                const owns = stats.unlocked.includes(item.id)
                const equip = stats.active === item.id
                return (
                  <div key={item.id} className="bg-[#18181A] rounded-[32px] p-6 pb-8 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),0_1px_1px_rgba(255,255,255,0.01)] flex flex-col items-center border border-[rgba(255,255,255,0.01)] relative">
                    <div className="w-full h-32 rounded-[24px] flex flex-col items-center justify-center mb-6 relative overflow-hidden" style={{ background: `linear-gradient(to bottom right, #111114, ${item.color}40)` }}>
                      <span className="text-[#ffffff20] font-black italic absolute bottom-4 right-4 text-4xl">{item.type}</span>
                      <div className="text-white z-10" style={{ color: item.color }}>{item.icon}</div>
                    </div>

                    <span className="text-xl font-bold text-white tracking-wide mb-6">{item.name}</span>

                    {owns ? (
                      <button 
                        disabled
                        className={`w-full py-4 rounded-[20px] font-black uppercase tracking-widest text-xs ${equip ? 'bg-[rgba(0,217,126,0.1)] text-[#00D97E] border border-[rgba(0,217,126,0.2)]' : 'bg-[#111114] text-[#8888A0]'}`}
                      >
                        {equip ? 'Equipped Active' : 'Possessed'}
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleBuyCosmetic(item.id, item.cost)}
                        disabled={loading || stats.coins < item.cost}
                        className="w-full py-4 rounded-[20px] bg-[rgba(255,255,255,0.05)] text-white hover:bg-white hover:text-black font-black uppercase tracking-widest text-xs transition-all shadow-inner disabled:opacity-50 disabled:hover:bg-[rgba(255,255,255,0.05)] disabled:hover:text-white"
                      >
                        Unlock ({item.cost.toLocaleString()})
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
