import Image from "next/image"
import { RepairActions } from "@/components/admin/RepairActions"
import { createClient } from "@/lib/supabase/server"

export default async function AdminRepairsPage() {
  const supabase = await createClient()
  const { data: bookings } = await supabase.from("repair_requests").select("*").order("created_at", { ascending: false })
  const userIds = Array.from(new Set(bookings?.map((booking) => booking.user_id) ?? []))
  const { data: profiles } = userIds.length
    ? await supabase.from("profiles").select("id,first_name,last_name,phone").in("id", userIds)
    : { data: [] }
  const customers = new Map(profiles?.map((profile) => [profile.id, profile]))
  const rows = await Promise.all((bookings ?? []).map(async (booking) => {
    const images = await Promise.all((booking.image_paths ?? []).map(async (path: string) => {
      const { data } = await supabase.storage.from("repair-images").createSignedUrl(path, 900)
      return data?.signedUrl
    }))
    return { ...booking, images: images.filter(Boolean) as string[] }
  }))

  return (
      <main className="min-w-0 p-5 lg:p-8">
        <h1 className="text-3xl font-bold">Repair bookings</h1>
        <p className="mt-1 text-muted-foreground">Review appointments, manage repair status, and notify customers.</p>
        <div className="mt-8 space-y-5">
          {!rows.length && <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">No repair bookings received.</div>}
          {rows.map((booking) => {
            const customer = customers.get(booking.user_id)
            return (
              <article key={booking.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">{booking.reference}</p>
                    <h2 className="mt-1 text-lg font-semibold">{booking.brand} {booking.device}</h2>
                    <p className="text-sm text-muted-foreground">{customer ? `${customer.first_name} ${customer.last_name}` : "Customer"}{customer?.phone ? ` · ${customer.phone}` : ""}</p>
                  </div>
                  <div className="text-right"><span className="rounded-full bg-muted px-3 py-1 text-xs font-medium capitalize">{booking.status.replaceAll("_", " ")}</span><p className="mt-2 text-sm font-medium">{booking.booking_date} · {String(booking.booking_time).slice(0, 5)}</p></div>
                </div>
                <div className="mt-4 rounded-xl bg-muted/60 p-4 text-sm"><p className="font-medium">Reported issue</p><p className="mt-1 whitespace-pre-wrap text-muted-foreground">{booking.issue}</p>{booking.serial_number && <p className="mt-2 text-xs">Serial / IMEI: {booking.serial_number}</p>}</div>
                {!!booking.images.length && <div className="mt-4 flex gap-3 overflow-x-auto">{booking.images.map((url: string, index: number) => <a key={url} href={url} target="_blank" rel="noreferrer" className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border"><Image src={url} alt={`Repair evidence ${index + 1}`} fill className="object-cover" unoptimized /></a>)}</div>}
                {booking.status_note && <p className="mt-4 text-sm"><span className="font-medium">Latest customer note:</span> {booking.status_note}</p>}
                <RepairActions id={booking.id} />
              </article>
            )
          })}
        </div>
      </main>
  )
}
