"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/lib/contexts/CartContext";
import { usePayment } from "@/lib/hooks/usePayment";
import { AlertCircle, CheckCircle2, ChevronDown, Lock } from "lucide-react";
import { motion } from "framer-motion";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const {
    initializePayment,
    isLoading: paymentLoading,
    error: paymentError,
  } = usePayment();
  const [currentStep, setCurrentStep] = useState<
    "shipping" | "payment" | "review"
  >("shipping");
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paystack">(
    "paystack",
  );

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  const subtotal = useMemo(() => total, [total]);
  const tax = subtotal * 0.08;
  const grandTotal = subtotal + tax;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleShippingSubmit = () => {
    if (
      formData.firstName &&
      formData.email &&
      formData.address &&
      formData.city
    ) {
      setCurrentStep("payment");
    }
  };

  const handlePaymentSubmit = () => {
    if (paymentMethod === "paystack") {
      setCurrentStep("review");
    } else if (
      formData.cardName &&
      formData.cardNumber &&
      formData.expiry &&
      formData.cvv
    ) {
      setCurrentStep("review");
    }
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    try {
      if (paymentMethod === "paystack") {
        const paymentData = await initializePayment({
          email: formData.email,
          customerName: `${formData.firstName} ${formData.lastName}`,
          items: items.map(({ productId, quantity }) => ({ productId, quantity })),
          shippingAddress: formData,
        });

        if (paymentData?.authorization_url) {
          window.location.href = paymentData.authorization_url;
          return;
        }
      }

      setTimeout(() => {
        setOrderPlaced(true);
        clearCart();
      }, 1500);
    } catch (error) {
      console.error("Order placement error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen flex flex-col bg-[linear-gradient(135deg,_#ffffff_0%,_#f8f5ff_100%)]">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="rounded-[2rem] border border-purple-100 bg-white/80 p-10 text-center shadow-sm">
            <p className="mb-4 text-slate-600">Your cart is empty</p>
            <Link
              href="/shop"
              className="font-semibold text-purple-700 hover:text-purple-800"
            >
              Continue shopping
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen flex flex-col bg-[linear-gradient(135deg,_#ffffff_0%,_#f8f5ff_100%)]">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <motion.div
            className="max-w-md rounded-[2rem] border border-purple-100 bg-white/80 p-10 text-center shadow-[0_30px_80px_-40px_rgba(92,63,187,0.25)]"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-emerald-600" />
            <h1 className="mb-2 text-3xl font-semibold text-slate-950">
              Order placed
            </h1>
            <p className="mb-6 text-slate-600">
              Thank you for your purchase. Your confirmation will be sent to
              your email shortly.
            </p>
            <div className="space-y-3">
              <Link
                href="/"
                className="block rounded-full bg-purple-700 px-6 py-3 font-semibold text-white transition hover:bg-purple-800"
              >
                Continue shopping
              </Link>
              <Link
                href="/shop"
                className="block rounded-full border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:border-purple-300 hover:text-purple-700"
              >
                Browse more
              </Link>
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[linear-gradient(135deg,_#ffffff_0%,_#f8f5ff_100%)]">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <motion.h1
            className="mb-8 text-3xl font-semibold text-slate-950 sm:text-4xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Checkout
          </motion.h1>

          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-8 flex gap-2">
                {["shipping", "payment", "review"].map((step, index) => (
                  <motion.div
                    key={step}
                    className={`h-1 flex-1 rounded-full ${currentStep === step ? "bg-purple-700" : ["shipping", "payment"].includes(currentStep) && index < ["shipping", "payment", "review"].indexOf(currentStep) ? "bg-purple-700" : "bg-slate-200"}`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: index * 0.08 }}
                  />
                ))}
              </div>

              {currentStep === "shipping" && (
                <motion.div
                  className="mb-8 rounded-[2rem] border border-purple-100 bg-white/80 p-6 shadow-sm backdrop-blur"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <h2 className="mb-6 text-2xl font-semibold text-slate-950">
                    Shipping details
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none ring-0 focus:border-purple-400"
                    />
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none ring-0 focus:border-purple-400"
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="sm:col-span-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none ring-0 focus:border-purple-400"
                    />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone Number"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="sm:col-span-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none ring-0 focus:border-purple-400"
                    />
                    <input
                      type="text"
                      name="address"
                      placeholder="Delivery Address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="sm:col-span-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none ring-0 focus:border-purple-400"
                    />
                    <input
                      type="text"
                      name="city"
                      placeholder="City"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none ring-0 focus:border-purple-400"
                    />
                    <input
                      type="text"
                      name="state"
                      placeholder="State"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none ring-0 focus:border-purple-400"
                    />
                  </div>
                  <button
                    onClick={handleShippingSubmit}
                    className="mt-6 w-full rounded-full bg-purple-700 px-6 py-3 font-semibold text-white transition hover:bg-purple-800"
                  >
                    Continue to payment
                  </button>
                </motion.div>
              )}

              {currentStep === "payment" && (
                <motion.div
                  className="mb-8 rounded-[2rem] border border-purple-100 bg-white/80 p-6 shadow-sm backdrop-blur"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <h2 className="mb-6 text-2xl font-semibold text-slate-950">
                    Payment method
                  </h2>
                  <div className="mb-6 space-y-3">
                    <label
                      className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 ${paymentMethod === "paystack" ? "border-purple-400 bg-purple-50" : "border-slate-200 bg-white"}`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="paystack"
                        checked={paymentMethod === "paystack"}
                        onChange={(e) =>
                          setPaymentMethod(
                            e.target.value as "paystack" | "card",
                          )
                        }
                        className="h-4 w-4"
                      />
                      <div>
                        <p className="font-semibold text-slate-900">Paystack</p>
                        <p className="text-sm text-slate-600">
                          Secure card, transfer, wallet and USSD support.
                        </p>
                      </div>
                    </label>
                    <label
                      className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 ${paymentMethod === "card" ? "border-purple-400 bg-purple-50" : "border-slate-200 bg-white"}`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={paymentMethod === "card"}
                        onChange={(e) =>
                          setPaymentMethod(
                            e.target.value as "paystack" | "card",
                          )
                        }
                        className="h-4 w-4"
                      />
                      <div>
                        <p className="font-semibold text-slate-900">
                          Credit/Debit card
                        </p>
                        <p className="text-sm text-slate-600">
                          Direct card submission for manual checkout.
                        </p>
                      </div>
                    </label>
                  </div>

                  {paymentError && (
                    <div className="mb-6 flex gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                      {paymentError}
                    </div>
                  )}

                  {paymentMethod === "card" && (
                    <div className="mb-6 space-y-4">
                      <input
                        type="text"
                        name="cardName"
                        placeholder="Name on card"
                        value={formData.cardName}
                        onChange={handleInputChange}
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none ring-0 focus:border-purple-400"
                      />
                      <input
                        type="text"
                        name="cardNumber"
                        placeholder="Card number"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none ring-0 focus:border-purple-400"
                      />
                      <div className="grid gap-4 sm:grid-cols-2">
                        <input
                          type="text"
                          name="expiry"
                          placeholder="MM/YY"
                          value={formData.expiry}
                          onChange={handleInputChange}
                          className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none ring-0 focus:border-purple-400"
                        />
                        <input
                          type="text"
                          name="cvv"
                          placeholder="CVV"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none ring-0 focus:border-purple-400"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handlePaymentSubmit}
                    className="w-full rounded-full bg-purple-700 px-6 py-3 font-semibold text-white transition hover:bg-purple-800"
                  >
                    Review order
                  </button>
                </motion.div>
              )}

              {currentStep === "review" && (
                <motion.div
                  className="rounded-[2rem] border border-purple-100 bg-white/80 p-6 shadow-sm backdrop-blur"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <h2 className="mb-6 text-2xl font-semibold text-slate-950">
                    Review & confirm
                  </h2>
                  <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    <p className="font-semibold text-slate-900">Delivery to:</p>
                    <p>
                      {formData.firstName} {formData.lastName}
                    </p>
                    <p>
                      {formData.address}, {formData.city}, {formData.state}
                    </p>
                    <p>{formData.email}</p>
                  </div>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isProcessing || paymentLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-purple-700 px-6 py-3 font-semibold text-white transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Lock className="h-4 w-4" />{" "}
                    {isProcessing || paymentLoading
                      ? "Processing..."
                      : `Pay ₦${grandTotal.toLocaleString()}`}
                  </button>
                </motion.div>
              )}
            </motion.div>

            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="h-fit rounded-[2rem] border border-purple-100 bg-white/80 p-6 shadow-sm backdrop-blur"
            >
              <h2 className="text-xl font-semibold text-slate-950">
                Order summary
              </h2>
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Subtotal</span>
                  <span>₦{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Processing charge</span>
                  <span>₦{tax.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-base font-semibold text-slate-950">
                  <span>Total</span>
                  <span>₦{grandTotal.toLocaleString()}</span>
                </div>
              </div>
              <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <ChevronDown className="h-4 w-4 text-purple-700" />
                  <span>
                    Secure payment via Paystack and trusted local delivery.
                  </span>
                </div>
              </div>
            </motion.aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
