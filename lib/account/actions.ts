"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import { createClient } from "@/lib/supabase/server"

export type AccountState = { status: "idle" | "error" | "success"; message?: string }

async function authenticatedClient() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login?next=/account")
  return { supabase, user }
}

export async function updateProfile(_: AccountState, formData: FormData): Promise<AccountState> {
  const parsed = z.object({
    firstName: z.string().trim().min(2).max(60),
    lastName: z.string().trim().min(2).max(60),
    phone: z.string().trim().max(30),
  }).safeParse({ firstName: formData.get("firstName"), lastName: formData.get("lastName"), phone: formData.get("phone") })
  if (!parsed.success) return { status: "error", message: "Enter a valid name and phone number." }
  const { supabase, user } = await authenticatedClient()
  const { error } = await supabase.from("profiles").upsert({
    id: user.id, first_name: parsed.data.firstName, last_name: parsed.data.lastName, phone: parsed.data.phone || null,
  })
  if (error) return { status: "error", message: "Your profile could not be updated." }
  await supabase.auth.updateUser({ data: { first_name: parsed.data.firstName, last_name: parsed.data.lastName } })
  revalidatePath("/account", "layout")
  return { status: "success", message: "Profile updated." }
}

export async function saveAddress(_: AccountState, formData: FormData): Promise<AccountState> {
  const schema = z.object({
    id: z.string().uuid().optional(), label: z.string().trim().min(2).max(40), recipient: z.string().trim().min(2).max(120),
    phone: z.string().trim().min(7).max(30), line1: z.string().trim().min(5).max(160), line2: z.string().trim().max(160),
    city: z.string().trim().min(2).max(80), state: z.string().trim().min(2).max(80), postalCode: z.string().trim().max(20),
    country: z.string().trim().min(2).max(80), isDefault: z.boolean(),
  })
  const parsed = schema.safeParse({
    id: formData.get("id") || undefined, label: formData.get("label"), recipient: formData.get("recipient"), phone: formData.get("phone"),
    line1: formData.get("line1"), line2: formData.get("line2") || "", city: formData.get("city"), state: formData.get("state"),
    postalCode: formData.get("postalCode") || "", country: formData.get("country"), isDefault: formData.get("isDefault") === "on",
  })
  if (!parsed.success) return { status: "error", message: "Check all required address fields." }
  const { supabase, user } = await authenticatedClient()
  const values = { user_id: user.id, label: parsed.data.label, recipient_name: parsed.data.recipient, phone: parsed.data.phone,
    line1: parsed.data.line1, line2: parsed.data.line2 || null, city: parsed.data.city, state: parsed.data.state,
    postal_code: parsed.data.postalCode || null, country: parsed.data.country, is_default: parsed.data.isDefault }
  if (parsed.data.isDefault) await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id)
  const result = parsed.data.id
    ? await supabase.from("addresses").update(values).eq("id", parsed.data.id).eq("user_id", user.id)
    : await supabase.from("addresses").insert(values)
  if (result.error) return { status: "error", message: "Address could not be saved." }
  revalidatePath("/account/addresses")
  return { status: "success", message: "Address saved." }
}

export async function deleteAddress(formData: FormData) {
  const id = z.string().uuid().safeParse(formData.get("id"))
  if (!id.success) return
  const { supabase, user } = await authenticatedClient()
  await supabase.from("addresses").delete().eq("id", id.data).eq("user_id", user.id)
  revalidatePath("/account/addresses")
}

export async function createRepairRequest(_: AccountState, formData: FormData): Promise<AccountState> {
  const parsed = z.object({
    device: z.string().trim().min(2).max(120), brand: z.string().trim().min(1).max(80),
    serial: z.string().trim().max(120), issue: z.string().trim().min(20).max(2000),
    date: z.iso.date(), time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  }).safeParse({
    device: formData.get("device"), brand: formData.get("brand"), serial: formData.get("serial") || "",
    issue: formData.get("issue"), date: formData.get("date"), time: formData.get("time"),
  })
  if (!parsed.success) return { status: "error", message: "Complete the device, brand, issue, date, and time fields." }
  const today = new Date().toISOString().slice(0, 10)
  if (parsed.data.date < today) return { status: "error", message: "Choose a future booking date." }
  const files = formData.getAll("images").filter((value): value is File => value instanceof File && value.size > 0)
  if (files.length > 5) return { status: "error", message: "Upload no more than 5 images." }
  const allowed = new Set(["image/jpeg", "image/png", "image/webp"])
  if (files.some((file) => file.size > 5 * 1024 * 1024 || !allowed.has(file.type))) {
    return { status: "error", message: "Images must be JPG, PNG, or WebP and no larger than 5 MB each." }
  }
  const { supabase, user } = await authenticatedClient()
  const [{ data: validDevice }, { data: validBrand }] = await Promise.all([
    supabase.from("repair_device_types").select("name").eq("name", parsed.data.device).eq("active", true).maybeSingle(),
    supabase.from("repair_brands").select("name").eq("name", parsed.data.brand).eq("active", true).maybeSingle(),
  ])
  if (!validDevice || !validBrand) return { status: "error", message: "Choose a valid device and brand." }
  const uploaded: string[] = []
  for (const file of files) {
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg"
    const path = `${user.id}/${crypto.randomUUID()}.${extension}`
    const { error } = await supabase.storage.from("repair-images").upload(path, file, { contentType: file.type, upsert: false })
    if (error) {
      if (uploaded.length) await supabase.storage.from("repair-images").remove(uploaded)
      return { status: "error", message: "An image could not be uploaded. Please try again." }
    }
    uploaded.push(path)
  }
  const { error } = await supabase.from("repair_requests").insert({
    user_id: user.id, device: parsed.data.device, brand: parsed.data.brand,
    serial_number: parsed.data.serial || null, issue: parsed.data.issue,
    booking_date: parsed.data.date, booking_time: parsed.data.time, image_paths: uploaded,
  })
  if (error) {
    if (uploaded.length) await supabase.storage.from("repair-images").remove(uploaded)
    return { status: "error", message: "Repair booking could not be submitted." }
  }
  revalidatePath("/account/repairs")
  revalidatePath("/admin/repairs")
  return { status: "success", message: "Repair booking submitted for admin review." }
}

export async function markAllNotificationsRead() {
  const { supabase, user } = await authenticatedClient()
  await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", user.id).is("read_at", null)
  revalidatePath("/account/notifications")
}

export async function changePassword(_: AccountState, formData: FormData): Promise<AccountState> {
  const parsed = z.object({
    password: z.string().min(8).max(128).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/),
    confirm: z.string(),
  }).refine((value) => value.password === value.confirm).safeParse({ password: formData.get("password"), confirm: formData.get("confirm") })
  if (!parsed.success) return { status: "error", message: "Passwords must match and include upper/lowercase letters and a number." }
  const { supabase } = await authenticatedClient()
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password })
  return error ? { status: "error", message: "Password could not be updated." } : { status: "success", message: "Password updated." }
}
