import { AddressForm } from "@/components/account/AccountForms"
import { deleteAddress } from "@/lib/account/actions"
import { requireUser } from "@/lib/auth/session"
import { createClient } from "@/lib/supabase/server"

export default async function AddressesPage() {
  const user = await requireUser()
  const supabase = await createClient()
  const { data: addresses } = await supabase.from("addresses").select("*").eq("user_id", user.id).order("is_default", { ascending: false }).order("created_at")
  return <div><h1 className="text-3xl font-bold">Addresses</h1><p className="mb-8 mt-2 text-muted-foreground">Delivery and billing locations.</p><div className="mb-6 grid gap-3 sm:grid-cols-2">{addresses?.map((address) => <article key={address.id} className="rounded-2xl border border-border p-5"><div className="flex justify-between"><p className="font-semibold">{address.label}</p>{address.is_default && <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">Default</span>}</div><p className="mt-3 text-sm text-muted-foreground">{address.recipient_name}<br />{address.line1}{address.line2 ? `, ${address.line2}` : ""}<br />{address.city}, {address.state} {address.postal_code}<br />{address.country}<br />{address.phone}</p><form action={deleteAddress} className="mt-4"><input type="hidden" name="id" value={address.id} /><button className="text-sm font-medium text-destructive">Remove</button></form></article>)}</div><AddressForm /></div>
}
