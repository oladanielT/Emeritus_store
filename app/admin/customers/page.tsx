import { updateCustomer } from "@/lib/admin/operations"
import { createClient } from "@/lib/supabase/server"

export default async function CustomersPage() {
  const supabase = await createClient()
  const [{ data: profiles }, { data: orders }] = await Promise.all([supabase.from("profiles").select("*").eq("role","customer").order("created_at",{ascending:false}), supabase.from("orders").select("user_id,total,status")])
  const totals = new Map<string,{orders:number;spent:number}>()
  orders?.forEach((order) => { const current=totals.get(order.user_id)??{orders:0,spent:0}; current.orders++; if(!["cancelled","refunded"].includes(order.status)) current.spent+=Number(order.total); totals.set(order.user_id,current) })
  return <main className="p-5 lg:p-8"><h1 className="text-3xl font-bold">Customers</h1><p className="mt-2 text-slate-500">Customer profiles and lifetime value.</p><div className="mt-7 grid gap-4 xl:grid-cols-2">{profiles?.map((profile) => {const total=totals.get(profile.id)??{orders:0,spent:0};return <form action={updateCustomer} key={profile.id} className="rounded-2xl border bg-white p-5 shadow-sm"><input type="hidden" name="id" value={profile.id}/><div className="grid grid-cols-2 gap-3"><input name="firstName" defaultValue={profile.first_name} placeholder="First name" className="rounded-lg border p-2.5"/><input name="lastName" defaultValue={profile.last_name} placeholder="Last name" className="rounded-lg border p-2.5"/><input name="phone" defaultValue={profile.phone??""} placeholder="Phone" className="col-span-2 rounded-lg border p-2.5"/></div><div className="mt-4 flex items-center justify-between text-sm"><span className="text-slate-500">{total.orders} orders · {new Intl.NumberFormat("en-NG",{style:"currency",currency:"NGN"}).format(total.spent)}</span><button className="rounded-lg bg-slate-900 px-3 py-2 text-white">Save</button></div></form>})}</div></main>
}
