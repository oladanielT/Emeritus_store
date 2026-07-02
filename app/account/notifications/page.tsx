import { Bell } from "lucide-react"
import { markAllNotificationsRead } from "@/lib/account/actions"
import { requireUser } from "@/lib/auth/session"
import { createClient } from "@/lib/supabase/server"

export default async function NotificationsPage() {
  const user = await requireUser()
  const supabase = await createClient()
  const { data } = await supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100)
  return <div><div className="flex items-end justify-between"><div><h1 className="text-3xl font-bold">Notifications</h1><p className="mt-2 text-muted-foreground">Account and order updates.</p></div><form action={markAllNotificationsRead}><button className="text-sm font-medium text-primary">Mark all read</button></form></div><div className="mt-8 space-y-2">{!data?.length && <div className="rounded-2xl border border-dashed p-12 text-center"><Bell className="mx-auto size-10 text-muted-foreground" /><p className="mt-4">You are all caught up.</p></div>}{data?.map((item) => <article key={item.id} className={`rounded-xl border p-4 ${item.read_at ? "border-border" : "border-primary/30 bg-primary/5"}`}><p className="font-semibold">{item.title}</p><p className="mt-1 text-sm text-muted-foreground">{item.message}</p><p className="mt-2 text-xs text-muted-foreground">{new Date(item.created_at).toLocaleString()}</p></article>)}</div></div>
}
