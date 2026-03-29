import { redirect } from 'next/navigation'

export default function RootPage() {
  // Automatically bounce users to the main protected app dashboard.
  // The middleware will automatically catch them and bounce them to /login if they aren't signed in yet.
  redirect('/app')
}
