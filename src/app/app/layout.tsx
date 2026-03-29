import ClientSidebar from '@/components/ui/ClientSidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen bg-[#070709] w-full text-white selection:bg-[#E82B2B]/30 font-sans">
      <ClientSidebar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 flex flex-col items-center">
        {children}
      </main>
    </div>
  )
}
