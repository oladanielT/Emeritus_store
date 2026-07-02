import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  const { reference } = await request.json()
  if (!reference) return NextResponse.json({ error: "Reference is required" }, { status: 400 })
  const secret = process.env.PAYSTACK_SECRET_KEY
  if (!secret) return NextResponse.json({ error: "Payment service unavailable" }, { status: 503 })
  const userClient = await createClient()
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { data: attempt } = await userClient.from("payment_attempts").select("order_id,amount,currency").eq("reference", reference).eq("user_id", user.id).single()
  if (!attempt) return NextResponse.json({ error: "Payment not found" }, { status: 404 })
  const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, { headers: { Authorization: `Bearer ${secret}` } })
  const payload = await response.json()
  if (!response.ok || payload.data?.status !== "success" || payload.data.reference !== reference ||
      payload.data.amount !== Math.round(Number(attempt.amount) * 100) || payload.data.currency !== attempt.currency) {
    return NextResponse.json({ error: "Payment verification failed" }, { status: 400 })
  }
  const admin = createAdminClient()
  const { error } = await admin.rpc("settle_payment", { p_reference: reference, p_success: true, p_provider_response: payload.data })
  if (error) return NextResponse.json({ error: "Could not finalize payment" }, { status: 500 })
  return NextResponse.json({ success: true, data: payload.data })
}
