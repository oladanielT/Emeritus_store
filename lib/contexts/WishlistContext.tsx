'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { WishlistContextType } from '../types'

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist')
    let localItems: string[] = []
    if (savedWishlist) {
      try {
        const parsed: unknown = JSON.parse(savedWishlist)
        if (Array.isArray(parsed)) {
          localItems = parsed.filter((id): id is string => typeof id === 'string')
          setItems(localItems)
        }
      } catch (error) {
        console.error('Failed to load wishlist:', error)
        localStorage.removeItem('wishlist')
      }
    }
    fetch('/api/wishlist')
      .then((response) => response.ok ? response.json() : null)
      .then((result) => {
        if (result?.data) {
          setItems((local) => Array.from(new Set([...local, ...result.data])))
          result.data.length === 0 && localStorage.getItem('wishlist') &&
            localItems.forEach((productId: string) =>
              fetch('/api/wishlist', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ productId, action: 'add' }) }),
            )
        }
      })
      .catch(() => undefined)
    setMounted(true)
  }, [])

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('wishlist', JSON.stringify(items))
    }
  }, [items, mounted])

  const addItem = (productId: string) => {
    setItems((prevItems) => (prevItems.includes(productId) ? prevItems : [...prevItems, productId]))
    void fetch('/api/wishlist', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ productId, action: 'add' }) })
  }

  const removeItem = (productId: string) => {
    setItems((prevItems) => prevItems.filter((id) => id !== productId))
    void fetch('/api/wishlist', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ productId, action: 'remove' }) })
  }

  const isWishlisted = (productId: string) => {
    return items.includes(productId)
  }

  return (
    <WishlistContext.Provider value={{ items, addItem, removeItem, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}
