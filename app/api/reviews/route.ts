import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  let query = supabase.from("product_reviews").select("id,product_id,rating,title,body,created_at,profiles(first_name,last_name)").eq("status", "approved").order("created_at", { ascending: false })
  const productId = request.nextUrl.searchParams.get("productId")
  if (productId) query = query.eq("product_id", productId)
  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const reviews = (data ?? []).map((row: any) => ({ id: row.id, productId: row.product_id, rating: row.rating, title: row.title, content: row.body, date: row.created_at, author: [row.profiles?.first_name, row.profiles?.last_name].filter(Boolean).join(" ") || "Customer", verified: true }))
  return NextResponse.json({ success: true, data: reviews, count: reviews.length })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Sign in to review a product" }, { status: 401 })
  const { productId, rating, title, content } = await request.json()
  if (!productId || !title || !content || !Number.isInteger(rating) || rating < 1 || rating > 5) return NextResponse.json({ error: "Valid product, rating, title and review are required" }, { status: 400 })
  const { data, error } = await supabase.from("product_reviews").insert({ product_id: productId, user_id: user.id, rating, title, body: content, status: "pending" }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true, data, message: "Review submitted for moderation" }, { status: 201 })
}
