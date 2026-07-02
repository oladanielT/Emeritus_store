import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  const secret = process.env.PAYSTACK_SECRET_KEY
  if (!secret) return NextResponse.json({ error: "Webhook unavailable" }, { status: 503 })
  const raw = await request.text()
  const signature = request.headers.get("x-paystack-signature") ?? ""
  const expected = crypto.createHmac("sha512", secret).update(raw).digest("hex")
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }
  const event = JSON.parse(raw)
  const reference = event.data?.reference
  if (!reference) return NextResponse.json({ success: true })
  const admin = createAdminClient()
  const { data: attempt } = await admin.from("payment_attempts").select("order_id,amount,currency,status").eq("reference", reference).maybeSingle()
  if (!attempt || attempt.status === "successful") return NextResponse.json({ success: true })
  if (event.event === "charge.success" && event.data.amount === Math.round(Number(attempt.amount) * 100) && event.data.currency === attempt.currency) {
    await admin.rpc("settle_payment", { p_reference: reference, p_success: true, p_provider_response: event.data })
  } else if (event.event === "charge.failed") {
    await admin.rpc("settle_payment", { p_reference: reference, p_success: false, p_provider_response: event.data })
  }
  return NextResponse.json({ success: true })
}
