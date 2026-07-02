import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  try {
    const { email, customerName, items, shippingAddress } = await request.json()
    if (!email || !Array.isArray(items) || !items.length || !shippingAddress) {
      return NextResponse.json({ error: "Email, cart items and shipping address are required" }, { status: 400 })
    }
    const secret = process.env.PAYSTACK_SECRET_KEY
    if (!secret) return NextResponse.json({ error: "Payment service unavailable" }, { status: 503 })
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Sign in before checkout" }, { status: 401 })
    const { data: rawOrder, error: orderError } = await supabase.rpc("create_checkout_order", {
      p_items: items.map((item: any) => ({ productId: item.productId, quantity: item.quantity })),
      p_shipping_address: shippingAddress,
    }).single()
    if (orderError || !rawOrder) return NextResponse.json({ error: orderError?.message || "Could not create order" }, { status: 400 })
    const order = rawOrder as { id: string; order_number: string; total: number | string; currency: string }
    const reference = `EG-${order.id}-${crypto.randomUUID().slice(0, 8)}`
    const { error: attemptError } = await supabase.from("payment_attempts").insert({
      order_id: order.id, user_id: user.id, reference, amount: order.total, currency: order.currency,
    })
    if (attemptError) return NextResponse.json({ error: attemptError.message }, { status: 500 })
    const paystack = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        email, amount: Math.round(Number(order.total) * 100), reference,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin}/account/orders`,
        metadata: { orderId: order.id, orderNumber: order.order_number, customerName },
      }),
    })
    const payload = await paystack.json()
    const admin = createAdminClient()
    if (!paystack.ok) {
      await admin.rpc("settle_payment", { p_reference: reference, p_success: false, p_provider_response: payload })
      return NextResponse.json({ error: payload.message || "Failed to initialize payment" }, { status: 502 })
    }
    await admin.from("orders").update({ payment_reference: reference }).eq("id", order.id)
    return NextResponse.json({ success: true, data: { ...payload.data, orderId: order.id, orderNumber: order.order_number } })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Payment initialization failed" }, { status: 500 })
  }
}
