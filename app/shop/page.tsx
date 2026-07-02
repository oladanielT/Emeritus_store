"use client";

import React, { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";

export default function ShopPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState([0, 3000]);
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  useEffect(() => {
    fetch("/api/products").then((response) => response.json()).then((result) => setProducts(result.data ?? []));
  }, []);
  const categories = useMemo(() => Array.from(new Set(products.map((product) => product.category))).map((name) => ({ name })), [products]);
  const brands = useMemo(() => Array.from(new Set(products.map((product) => product.brand))).map((name) => ({ name })), [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (selectedCategory && product.category !== selectedCategory)
        return false;
      if (selectedBrand && product.brand !== selectedBrand) return false;
      if (product.price < priceRange[0] || product.price > priceRange[1])
        return false;
      return true;
    });
  }, [products, selectedCategory, selectedBrand, priceRange]);

  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    switch (sortBy) {
      case "price-asc":
        return sorted.sort((a, b) => a.price - b.price);
      case "price-desc":
        return sorted.sort((a, b) => b.price - a.price);
      case "popular":
        return sorted.sort((a, b) => b.reviews - a.reviews);
      case "rating":
        return sorted.sort((a, b) => b.rating - a.rating);
      default:
        return sorted;
    }
  }, [filteredProducts, sortBy]);

  return (
    <div className="min-h-screen flex flex-col bg-[linear-gradient(135deg,_#ffffff_0%,_#f8f5ff_100%)]">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 rounded-[2rem] border border-purple-100 bg-white/80 p-8 shadow-[0_30px_80px_-40px_rgba(92,63,187,0.25)] backdrop-blur"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-purple-700">
              Emeritus collection
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">
              Curated tech for professionals, creators and discerning buyers.
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
              Browse genuine devices and premium accessories selected for
              performance, quality and long-term confidence.
            </p>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-4">
            <motion.aside
              className={`${showFilters ? "block" : "hidden"} lg:block rounded-[1.4rem] border border-purple-100 bg-white/80 p-6 shadow-sm backdrop-blur lg:h-fit`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-950">
                  Filters
                </h2>
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSelectedBrand(null);
                    setPriceRange([0, 3000]);
                  }}
                  className="text-sm font-semibold text-purple-700"
                >
                  Reset
                </button>
              </div>

              <div className="mb-8">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">
                  Category
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === null}
                      onChange={() => setSelectedCategory(null)}
                      className="h-4 w-4"
                    />
                    <span>All Categories</span>
                  </label>
                  {categories.map((cat) => (
                    <label
                      key={cat.name}
                      className="flex items-center gap-2 text-sm text-slate-700"
                    >
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === cat.name}
                        onChange={() => setSelectedCategory(cat.name)}
                        className="h-4 w-4"
                      />
                      <span>{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">
                  Brand
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="radio"
                      name="brand"
                      checked={selectedBrand === null}
                      onChange={() => setSelectedBrand(null)}
                      className="h-4 w-4"
                    />
                    <span>All Brands</span>
                  </label>
                  {brands.map((brand) => (
                    <label
                      key={brand.name}
                      className="flex items-center gap-2 text-sm text-slate-700"
                    >
                      <input
                        type="radio"
                        name="brand"
                        checked={selectedBrand === brand.name}
                        onChange={() => setSelectedBrand(brand.name)}
                        className="h-4 w-4"
                      />
                      <span>{brand.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">
                  Price range
                </h3>
                <input
                  type="range"
                  min="0"
                  max="3000"
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([priceRange[0], Number(e.target.value)])
                  }
                  className="w-full"
                />
                <div className="mt-2 flex justify-between text-sm text-slate-600">
                  <span>₦{priceRange[0].toLocaleString()}</span>
                  <span>₦{priceRange[1].toLocaleString()}</span>
                </div>
              </div>
            </motion.aside>

            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <SlidersHorizontal className="h-4 w-4 text-purple-700" />
                  <span>Showing {sortedProducts.length} products</span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 lg:hidden"
                  >
                    Filters
                  </button>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none rounded-full border border-slate-300 bg-white px-4 py-2 pr-10 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-200"
                    >
                      <option value="newest">Newest</option>
                      <option value="popular">Most Popular</option>
                      <option value="rating">Highest Rated</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
              >
                {sortedProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    viewport={{ once: true }}
                  >
                    <ProductCard
                      id={product.id}
                      name={product.name}
                      price={product.price}
                      comparePrice={product.comparePrice}
                      image={product.image}
                      rating={product.rating}
                      reviews={product.reviews}
                      inStock={product.inStock}
                    />
                  </motion.div>
                ))}
              </motion.div>

              {sortedProducts.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="rounded-[1.4rem] border border-dashed border-purple-200 bg-white/80 p-10 text-center text-slate-600"
                >
                  <p className="mb-3 font-semibold text-slate-900">
                    No products match these filters.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setSelectedBrand(null);
                      setPriceRange([0, 3000]);
                    }}
                    className="rounded-full bg-purple-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-purple-800"
                  >
                    Clear filters
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
