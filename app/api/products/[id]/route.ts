import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { productSelect, toStorefrontProduct, type ProductRow } from "@/lib/supabase/catalog"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const id = (await params).id
  const [{ data, error }, { data: reviews }] = await Promise.all([
    supabase.from("products").select(productSelect).eq("id", id).eq("active", true).single(),
    supabase.from("product_reviews").select("id,product_id,rating,title,body,created_at,profiles(first_name,last_name)").eq("product_id", id).eq("status", "approved").order("created_at", { ascending: false }),
  ])
  if (error || !data) return NextResponse.json({ error: "Product not found" }, { status: 404 })
  const mappedReviews = (reviews ?? []).map((review: any) => ({
    id: review.id, productId: review.product_id, rating: review.rating, title: review.title,
    content: review.body, author: [review.profiles?.first_name, review.profiles?.last_name].filter(Boolean).join(" ") || "Customer",
    date: review.created_at, verified: true,
  }))
  return NextResponse.json({ success: true, data: { ...toStorefrontProduct(data as unknown as ProductRow), reviewsList: mappedReviews } })
}
