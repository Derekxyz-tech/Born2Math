import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#070709] flex items-center justify-center">
      <SignUp 
        appearance={{
          elements: {
            card: "bg-[#111114] border border-[#22222A] shadow-2xl",
            headerTitle: "text-white text-2xl font-black tracking-tighter",
            headerSubtitle: "text-[#8888A0]",
            socialButtonsBlockButton: "text-white bg-[#1A1A22] border-[#33333A] hover:bg-[#22222C] transition-colors",
            socialButtonsBlockButtonText: "text-white font-bold tracking-widest uppercase text-xs",
            dividerLine: "bg-[#33333A]",
            dividerText: "text-[#8888A0] text-xs uppercase tracking-widest",
            formFieldLabel: "text-[#8888A0] font-bold uppercase tracking-widest text-xs",
            formFieldInput: "bg-[#0A0A0C] border-[#22222A] text-white focus:border-[#E82B2B] focus:ring-[#E82B2B]",
            formButtonPrimary: "bg-[#E82B2B] hover:bg-[#ff4444] text-white font-black uppercase tracking-widest transition-colors",
            footerActionText: "text-[#8888A0]",
            footerActionLink: "text-[#E82B2B] hover:text-[#ff4444] font-bold",
            identityPreviewText: "text-white",
            identityPreviewEditButtonIcon: "text-[#E82B2B]",
            formFieldInputShowPasswordButton: "text-[#8888A0]",
            formFieldSuccessText: "text-[#00D97E] text-xs font-medium",
            formFieldInfoText: "text-[#8888A0] text-xs"
          },
          layout: {
            logoImageUrl: "/born2math.png",
            logoPlacement: "inside"
          }
        }}
      />
    </div>
  )
}
