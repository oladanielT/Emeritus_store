import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase.from("categories").select("id,name,slug,description,image_url,display_order").eq("active", true).order("display_order")
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, data: (data ?? []).map((row) => ({ ...row, image: row.image_url })), count: data?.length ?? 0 })
}
