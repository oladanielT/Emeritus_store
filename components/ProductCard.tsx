"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { useCart } from "@/lib/contexts/CartContext";
import { useWishlist } from "@/lib/contexts/WishlistContext";
import { motion } from "framer-motion";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  comparePrice?: number;
  image: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  featured?: boolean;
}

export default function ProductCard({
  id,
  name,
  price,
  comparePrice,
  image,
  rating,
  reviews,
  inStock,
  featured = false,
}: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const { addItem } = useCart();
  const {
    isWishlisted,
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
  } = useWishlist();
  const wishlisted = isWishlisted(id);
  const discount = comparePrice
    ? Math.round(((comparePrice - price) / comparePrice) * 100)
    : 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!inStock) return;

    setIsAdding(true);
    addItem(id, 1);

    setTimeout(() => {
      setIsAdding(false);
    }, 500);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (wishlisted) {
      removeFromWishlist(id);
    } else {
      addToWishlist(id);
    }
  };

  return (
    <Link href={`/product/${id}`} className="group/card block h-full rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4">
      <motion.div
        className="h-full cursor-pointer overflow-hidden rounded-3xl border border-border/80 bg-card shadow-sm transition-[border-color,box-shadow] duration-300 hover:border-primary/25 hover:shadow-xl"
        whileHover={{ y: -6 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Image Container */}
        <div className="group relative aspect-square overflow-hidden bg-gradient-to-br from-muted to-background">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />

          {/* Featured Badge */}
          {featured && (
            <div className="absolute top-3 left-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
              Featured
            </div>
          )}

          {/* Discount Badge */}
          {discount > 0 && (
            <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
              -{discount}%
            </div>
          )}

          {/* Out of Stock Badge */}
          {!inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-semibold">Out of Stock</span>
            </div>
          )}

          {/* Quick Actions */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 flex gap-2 translate-y-full group-hover:translate-y-0 transition-transform"
            initial={{ y: 20 }}
            whileHover={{ y: 0 }}
          >
            <button
              onClick={handleAddToCart}
              disabled={!inStock || isAdding}
              aria-label={`Add ${name} to cart`}
              className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-2 font-semibold text-primary-foreground shadow-md hover:bg-primary/90 disabled:opacity-50"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Add</span>
            </button>
            <button
              onClick={handleWishlist}
              aria-label={wishlisted ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
              aria-pressed={wishlisted}
              className={`px-3 py-2 rounded-lg transition-colors ${
                wishlisted
                  ? "bg-red-500 text-white"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              <Heart
                className={`w-4 h-4 ${wishlisted ? "fill-current" : ""}`}
              />
            </button>
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5">
          <h3 className="mb-2 line-clamp-2 min-h-12 font-semibold leading-6 tracking-[-0.02em] text-foreground transition-colors group-hover/card:text-primary">
            {name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">({reviews})</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold tracking-[-0.03em] text-foreground">
              ${price.toFixed(2)}
            </span>
            {comparePrice && (
              <span className="text-sm text-muted-foreground line-through">
                ${comparePrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="mt-3 text-xs font-semibold">
            {inStock ? (
              <span className="text-green-600">In Stock</span>
            ) : (
              <span className="text-red-600">Out of Stock</span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
