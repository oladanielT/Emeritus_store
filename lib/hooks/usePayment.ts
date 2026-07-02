'use client'

import { useState } from 'react'

interface InitializePaymentParams {
  email: string
  customerName: string
  items: Array<{ productId: string; quantity: number }>
  shippingAddress: Record<string, string>
}

interface PaymentResponse {
  authorization_url?: string
  access_code?: string
  reference?: string
}

export function usePayment() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const initializePayment = async (
    params: InitializePaymentParams
  ): Promise<PaymentResponse | null> => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize payment')
      }

      return data.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment initialization failed'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const verifyPayment = async (reference: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reference }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify payment')
      }

      if (data.data.status === 'success') {
        setSuccess(true)
        return true
      }

      throw new Error('Payment not successful')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment verification failed'
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const openPaystackCheckout = (
    reference: string,
    publicKey: string
  ) => {
    if (typeof window === 'undefined') {
      console.error('Paystack checkout can only be opened in browser')
      return
    }

    const script = document.createElement('script')
    script.src = 'https://js.paystack.co/v1/inline.js'
    script.async = true

    script.onload = () => {
      const PaystackPop = (window as any).PaystackPop

      PaystackPop.cancelledTransaction = () => {
        setError('Payment cancelled')
      }

      PaystackPop.transactionVerified = () => {
        setSuccess(true)
      }
    }

    document.body.appendChild(script)
  }

  return {
    isLoading,
    error,
    success,
    initializePayment,
    verifyPayment,
    openPaystackCheckout,
  }
}
