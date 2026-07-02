"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { entities, type EntityName } from "@/lib/admin/entities"
import { requireAdmin } from "@/lib/auth/session"
import { createClient } from "@/lib/supabase/server"

function entity(value: FormDataEntryValue | null) {
  const name = String(value) as EntityName
  if (!(name in entities)) throw new Error("Unsupported admin entity")
  return { name, config: entities[name] }
}

export async function saveEntity(formData: FormData) {
  await requireAdmin()
  const { name, config } = entity(formData.get("entity"))
  const id = String(formData.get("id") ?? "")
  const values: Record<string, unknown> = {}
  for (const field of config.fields) {
    const raw = formData.get(field.name)
    if (field.type === "boolean") values[field.name] = raw === "on"
    else if (field.type === "number") values[field.name] = raw === null || raw === "" ? null : Number(raw)
    else if (field.type === "json") {
      try { values[field.name] = JSON.parse(String(raw || "{}")) } catch { redirect(`/admin/${name}?error=invalid-json`) }
    } else values[field.name] = raw === null || raw === "" ? null : String(raw).trim()
  }
  const missing = config.fields.some((field) => field.required && (values[field.name] === null || values[field.name] === ""))
  if (missing) redirect(`/admin/${name}?error=required`)
  const supabase = await createClient()
  const result = id ? await supabase.from(config.table).update(values).eq("id", id) : await supabase.from(config.table).insert(values)
  if (result.error) redirect(`/admin/${name}?error=${encodeURIComponent(result.error.message)}`)
  revalidatePath(`/admin/${name}`)
  redirect(`/admin/${name}?saved=1`)
}

export async function deleteEntity(formData: FormData) {
  await requireAdmin()
  const { name, config } = entity(formData.get("entity"))
  const id = String(formData.get("id") ?? "")
  const supabase = await createClient()
  await supabase.from(config.table).delete().eq("id", id)
  revalidatePath(`/admin/${name}`)
}
