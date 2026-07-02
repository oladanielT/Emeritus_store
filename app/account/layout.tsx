import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { AccountNav } from "@/components/account/AccountNav"
import { signOut } from "@/lib/auth/actions"
import { requireUser } from "@/lib/auth/session"

export const dynamic = "force-dynamic"

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser()
  const name = [user.user_metadata.first_name, user.user_metadata.last_name].filter(Boolean).join(" ") || user.email
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="mx-auto grid w-full max-w-7xl flex-1 gap-6 px-4 py-8 lg:grid-cols-[230px_1fr] lg:px-8">
        <aside className="space-y-5">
          <div className="px-2"><p className="text-sm font-semibold">{name}</p><p className="truncate text-xs text-muted-foreground">{user.email}</p></div>
          <AccountNav />
          <form action={signOut}><button className="px-3 text-sm font-medium text-destructive hover:underline">Sign out</button></form>
        </aside>
        <section className="min-w-0">{children}</section>
      </main>
      <Footer />
    </div>
  )
}
