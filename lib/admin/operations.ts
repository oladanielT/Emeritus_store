"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { requireAdmin } from "@/lib/auth/session"
import { createClient } from "@/lib/supabase/server"

export async function updateInventory(formData: FormData) {
  await requireAdmin()
  const parsed = z.object({ productId: z.string().uuid(), quantity: z.coerce.number().int().min(0), reserved: z.coerce.number().int().min(0), threshold: z.coerce.number().int().min(0) }).safeParse({
    productId: formData.get("productId"), quantity: formData.get("quantity"), reserved: formData.get("reserved"), threshold: formData.get("threshold"),
  })
  if (!parsed.success || parsed.data.reserved > parsed.data.quantity) redirect("/admin/inventory?error=invalid")
  const supabase = await createClient()
  await supabase.from("inventory").update({ quantity: parsed.data.quantity, reserved: parsed.data.reserved, low_stock_threshold: parsed.data.threshold }).eq("product_id", parsed.data.productId)
  revalidatePath("/admin/inventory")
}

export async function updateOrder(formData: FormData) {
  await requireAdmin()
  const parsed = z.object({ id: z.string().uuid(), status: z.enum(["pending","confirmed","processing","shipped","delivered","cancelled","refunded"]) }).safeParse({ id: formData.get("id"), status: formData.get("status") })
  if (!parsed.success) return
  const supabase = await createClient()
  await supabase.from("orders").update({ status: parsed.data.status }).eq("id", parsed.data.id)
  revalidatePath("/admin/orders")
}

export async function updateCustomer(formData: FormData) {
  await requireAdmin()
  const parsed = z.object({ id: z.string().uuid(), firstName: z.string().trim().max(60), lastName: z.string().trim().max(60), phone: z.string().trim().max(30) }).safeParse({
    id: formData.get("id"), firstName: formData.get("firstName"), lastName: formData.get("lastName"), phone: formData.get("phone"),
  })
  if (!parsed.success) return
  const supabase = await createClient()
  await supabase.from("profiles").update({ first_name: parsed.data.firstName, last_name: parsed.data.lastName, phone: parsed.data.phone || null }).eq("id", parsed.data.id)
  revalidatePath("/admin/customers")
}

export async function saveSetting(formData: FormData) {
  const user = await requireAdmin()
  const key = z.string().min(1).max(100).parse(formData.get("key"))
  const label = z.string().min(1).max(120).parse(formData.get("label"))
  const group = z.string().min(1).max(80).parse(formData.get("group"))
  const raw = String(formData.get("value") ?? "")
  let value: unknown
  try { value = JSON.parse(raw) } catch { value = raw }
  const supabase = await createClient()
  await supabase.from("store_settings").upsert({ key, label, group_name: group, value, updated_by: user.id })
  revalidatePath("/admin/settings")
}

export async function deleteSetting(formData: FormData) {
  await requireAdmin()
  const supabase = await createClient()
  await supabase.from("store_settings").delete().eq("key", String(formData.get("key")))
  revalidatePath("/admin/settings")
}

export async function uploadMedia(formData: FormData) {
  const user = await requireAdmin()
  const file = formData.get("file")
  if (!(file instanceof File) || !file.size || file.size > 10 * 1024 * 1024 || !["image/jpeg","image/png","image/webp","image/gif","image/svg+xml"].includes(file.type)) redirect("/admin/media?error=invalid")
  const supabase = await createClient()
  const path = `${new Date().getUTCFullYear()}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`
  const { error } = await supabase.storage.from("admin-media").upload(path, file, { contentType: file.type })
  if (error) redirect(`/admin/media?error=${encodeURIComponent(error.message)}`)
  await supabase.from("media_assets").insert({ name: String(formData.get("name") || file.name), alt_text: String(formData.get("alt") || ""), path, mime_type: file.type, size_bytes: file.size, uploaded_by: user.id })
  revalidatePath("/admin/media")
}

export async function deleteMedia(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get("id")); const path = String(formData.get("path"))
  const supabase = await createClient()
  await supabase.storage.from("admin-media").remove([path])
  await supabase.from("media_assets").delete().eq("id", id)
  revalidatePath("/admin/media")
}

export async function generateReport(formData: FormData) {
  const user = await requireAdmin()
  const parsed = z.object({ type: z.enum(["sales","orders","customers","inventory","repairs"]), start: z.iso.date(), end: z.iso.date() }).parse({ type: formData.get("type"), start: formData.get("start"), end: formData.get("end") })
  const supabase = await createClient()
  let data: unknown[] | null = []
  if (parsed.type === "sales" || parsed.type === "orders") data = (await supabase.from("orders").select("*").gte("created_at", parsed.start).lte("created_at", `${parsed.end}T23:59:59Z`)).data
  if (parsed.type === "customers") data = (await supabase.from("profiles").select("id,first_name,last_name,phone,created_at").gte("created_at", parsed.start).lte("created_at", `${parsed.end}T23:59:59Z`)).data
  if (parsed.type === "inventory") data = (await supabase.from("inventory").select("*,products(name,sku)")).data
  if (parsed.type === "repairs") data = (await supabase.from("repair_requests").select("*").gte("created_at", parsed.start).lte("created_at", `${parsed.end}T23:59:59Z`)).data
  await supabase.from("generated_reports").insert({ name: `${parsed.type} ${parsed.start} – ${parsed.end}`, report_type: parsed.type, period_start: parsed.start, period_end: parsed.end, data: data ?? [], generated_by: user.id })
  revalidatePath("/admin/reports")
}
