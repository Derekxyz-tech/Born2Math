'use client'

import Link from 'next/link'
import { Trophy, Target, LayoutDashboard, LogOut, Swords, ShoppingCart } from 'lucide-react'
import { useClerk } from '@clerk/nextjs'
import { useRouter, usePathname } from 'next/navigation'

export default function ClientSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { signOut } = useClerk()

  const handleLogout = async () => {
    await signOut()
    router.push('/sign-in')
  }

  const isActive = (path: string) => {
    if (path === '/app' && pathname === '/app') return true
    if (path !== '/app' && pathname?.startsWith(path)) return true
    return false
  }

  const navLinks = [
    { name: 'Home', href: '/app', icon: <LayoutDashboard size={20} /> },
    { name: 'Train', href: '/app/train', icon: <Swords size={20} /> },
    { name: 'Ranks', href: '/app/leaderboard', icon: <Trophy size={20} /> },
    { name: 'Shop', href: '/app/shop', icon: <ShoppingCart size={20} /> },
    { name: 'Profile', href: '/app/profile', icon: <Target size={20} /> },
  ]

  return (
    <>
      <div className="hidden md:flex flex-col w-[80px] lg:w-[100px] h-screen bg-[#0E0E11] border-r border-[rgba(255,255,255,0.03)] shadow-[20px_0_40px_rgba(0,0,0,0.8)] sticky top-0 left-0 items-center py-10 z-50">
        
        <Link href="/app" className="mb-12 transition-transform hover:scale-110 active:scale-95">
          <div className="w-14 h-14 rounded-[18px] bg-[#111114] border border-[#22222A] shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center justify-center p-2 relative group">
            <div className="absolute inset-0 bg-[#E82B2B]/10 rounded-[18px] blur-md group-hover:bg-[#E82B2B]/20 transition-colors" />
            <img 
              src="/born2math.png" 
              alt="Born2Math" 
              className="w-full h-full object-contain relative z-10" 
            />
          </div>
        </Link>

        <nav className="flex-grow flex flex-col gap-6 w-full items-center">
          {navLinks.map(link => {
            const active = isActive(link.href)
            return (
              <Link 
                key={link.name} 
                href={link.href}
                className={`w-14 h-14 rounded-[20px] flex items-center justify-center transition-all duration-300 relative group
                  ${active ? 'bg-[#1A1A22] text-[#E82B2B] shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]' : 'text-[#8888A0] hover:bg-[#15151A] hover:text-white'}
                `}
              >
                {active && <div className="absolute left-[-22px] lg:left-[-12px] w-1.5 h-8 bg-[#E82B2B] rounded-r-md shadow-[0_0_10px_#E82B2B]"></div>}
                {link.icon}
                <div className="absolute left-16 opacity-0 group-hover:opacity-100 bg-[#1A1A22] text-xs font-bold text-white px-3 py-1.5 rounded-lg tracking-widest uppercase pointer-events-none transition-opacity shadow-lg">
                  {link.name}
                </div>
              </Link>
            )
          })}
        </nav>

        <button 
          onClick={handleLogout}
          className="w-14 h-14 rounded-[20px] flex items-center justify-center bg-[#1A1A22] text-[#8888A0] hover:text-[#FF4444] hover:bg-[#FF4444]/10 transition-colors shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
        >
          <LogOut size={20} />
        </button>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 w-full h-[80px] bg-[#0E0E11] border-t border-[rgba(255,255,255,0.05)] shadow-[0_-20px_40px_rgba(0,0,0,0.8)] z-50 flex items-center justify-around pb-safe">
        {navLinks.map(link => {
          const active = isActive(link.href)
          return (
            <Link 
              key={link.name} 
              href={link.href}
              className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl w-16
                ${active ? 'text-[#E82B2B]' : 'text-[#8888A0] hover:text-white'}
              `}
            >
              {link.icon}
              <span className="text-[10px] font-bold uppercase tracking-widest">{link.name}</span>
            </Link>
          )
        })}
      </div>
    </>
  )
}
