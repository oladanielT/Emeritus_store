import type { HomepageContent } from "./types"

export const homepageSeed: HomepageContent = {
  seo: {
    title: "Emeritus Global Gadgets — Premium Technology, Properly Selected",
    description: "Shop authentic smartphones, laptops, audio, gaming and accessories with expert support, secure payments and nationwide delivery.",
  },
  announcement: "Authentic devices · Nationwide delivery · Expert support",
  navigation: [
    { label: "New arrivals", href: "/shop?sort=newest" },
    { label: "Phones", href: "/shop?category=smartphones" },
    { label: "Laptops", href: "/shop?category=laptops" },
    { label: "Audio", href: "/shop?category=audio" },
    { label: "Repairs", href: "#repairs" },
  ],
  hero: {
    eyebrow: "The 2026 collection",
    title: "Technology that moves at your speed.",
    description: "Original flagship devices, considered accessories and dependable support—selected for people who expect more from their technology.",
    primaryAction: { label: "Shop the collection", href: "/shop" },
    secondaryAction: { label: "Talk to an expert", href: "https://wa.me/2348101795519" },
    image: {
      url: "https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&w=1800&q=90",
      alt: "Premium smartphone emerging from a cinematic blue-black backdrop",
      focalPoint: "center",
    },
    highlights: [
      { value: "100%", label: "Authentic devices" },
      { value: "24/7", label: "Customer support" },
      { value: "Nationwide", label: "Secure delivery" },
    ],
  },
  categories: [
    { id: "phones", name: "Smartphones", slug: "smartphones", count: "48 products", image: { url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=88", alt: "Premium smartphone" } },
    { id: "laptops", name: "Laptops", slug: "laptops", count: "26 products", image: { url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=88", alt: "Laptop on a clean desk" } },
    { id: "audio", name: "Audio", slug: "audio", count: "34 products", image: { url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=88", alt: "Premium over-ear headphones" } },
    { id: "wearables", name: "Wearables", slug: "wearables", count: "19 products", image: { url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=88", alt: "Modern smartwatch" } },
    { id: "gaming", name: "Gaming", slug: "gaming", count: "22 products", image: { url: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=900&q=88", alt: "White gaming controller" } },
  ],
  featured: {
    eyebrow: "Curated for you",
    title: "The devices everyone is talking about.",
    description: "Standout technology chosen for performance, design and long-term value.",
    products: [
      { id: "iphone-15-pro", slug: "iphone-15-pro-max", name: "iPhone 15 Pro Max", image: { url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=900&q=90", alt: "iPhone 15 Pro" }, price: "₦1,899,000", compareAtPrice: "₦2,050,000", rating: 4.9, reviewCount: 184, badge: "Bestseller", availability: "in-stock" },
      { id: "macbook-pro", slug: "macbook-pro-16", name: "MacBook Pro 16-inch", image: { url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=90", alt: "MacBook Pro laptop" }, price: "₦3,450,000", rating: 4.9, reviewCount: 97, badge: "New", availability: "low-stock" },
      { id: "sony-xm5", slug: "sony-wh-1000xm5", name: "Sony WH-1000XM5", image: { url: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=900&q=90", alt: "Black Sony headphones" }, price: "₦685,000", compareAtPrice: "₦740,000", rating: 4.8, reviewCount: 221, availability: "in-stock" },
      { id: "watch-ultra", slug: "apple-watch-ultra", name: "Apple Watch Ultra 2", image: { url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=90", alt: "Apple Watch" }, price: "₦1,140,000", rating: 4.7, reviewCount: 86, availability: "in-stock" },
    ],
  },
  flashSale: {
    eyebrow: "48-hour drop",
    title: "Serious technology. Less serious prices.",
    description: "Limited quantities, verified devices and the same Emeritus support.",
    endsAt: "2026-07-03T23:59:59+01:00",
    image: { url: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=1400&q=90", alt: "Premium wireless earbuds and smartphone" },
    products: [
      { id: "airpods-pro", slug: "airpods-pro-2", name: "AirPods Pro 2", image: { url: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=800&q=90", alt: "AirPods Pro" }, price: "₦399,000", compareAtPrice: "₦465,000", rating: 4.8, reviewCount: 154, badge: "Save 14%", availability: "in-stock" },
      { id: "ipad-air", slug: "ipad-air-m2", name: "iPad Air M2", image: { url: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=90", alt: "iPad tablet" }, price: "₦1,185,000", compareAtPrice: "₦1,320,000", rating: 4.7, reviewCount: 72, badge: "Save 10%", availability: "low-stock" },
    ],
  },
  benefits: [
    { icon: "shield", title: "Genuine, always", description: "Every device is sourced and verified by our team." },
    { icon: "truck", title: "Delivery, handled", description: "Secure dispatch and tracked nationwide delivery." },
    { icon: "headphones", title: "Real human support", description: "Gadget specialists before and after your purchase." },
    { icon: "refresh", title: "Straightforward cover", description: "Clear warranty and return guidance, without surprises." },
  ],
  repair: {
    eyebrow: "Emeritus Care",
    title: "Your device deserves expert hands.",
    description: "From cracked screens to battery issues and diagnostics, our technicians make the repair process clear from the first assessment.",
    image: { url: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1400&q=90", alt: "Technician carefully repairing a laptop" },
    services: ["Phones and tablets", "Laptops and computers", "Diagnostics and upgrades"],
    action: { label: "Book a repair", href: "/repairs/book" },
  },
  brands: ["Apple", "Samsung", "Sony", "Google", "Dell", "HP", "Lenovo", "Canon"],
  testimonials: [
    { id: "t1", quote: "The team helped me choose the right work laptop without trying to oversell me. Delivery was fast and the device was exactly as promised.", name: "Tosin A.", detail: "Verified MacBook buyer", rating: 5 },
    { id: "t2", quote: "This is what buying premium tech should feel like—clear advice, original products and someone available when you have a question.", name: "Mariam O.", detail: "Returning customer", rating: 5 },
    { id: "t3", quote: "My phone repair was assessed, quoted and completed exactly when they said it would be. Professional from start to finish.", name: "David K.", detail: "Emeritus Care customer", rating: 5 },
  ],
  about: {
    eyebrow: "Built on trust",
    title: "Technology is personal. We treat it that way.",
    description: "Emeritus Global Gadgets started with a simple standard: recommend the device we would confidently use ourselves. Today, we pair a carefully selected catalogue with honest advice, dependable repairs and service that continues long after checkout.",
    image: { url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=90", alt: "Bright premium retail store interior" },
    stats: [{ value: "10+", label: "Years serving customers" }, { value: "12k+", label: "Devices delivered" }, { value: "4.9/5", label: "Average customer rating" }],
  },
  store: {
    eyebrow: "Meet us in person",
    title: "Your next device is waiting in Ile-Ife.",
    address: "Zone C, Block 26, adjacent MTN Office, OAU Central Market, Mayfair, Ile-Ife, Osun State.",
    hours: "Open daily from 8:00 AM",
    phone: "0904 802 6350",
    mapHref: "https://maps.google.com/?q=OAU+Central+Market+Ile-Ife",
    image: { url: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=1600&q=90", alt: "Modern premium technology retail store" },
  },
  newsletter: {
    eyebrow: "Stay in the loop",
    title: "New drops. Honest reviews. Private offers.",
    description: "A considered update on the technology worth knowing about—never inbox noise.",
  },
  footer: {
    description: "Authentic gadgets, thoughtful advice and dependable support from Ile-Ife to anywhere in Nigeria.",
    email: "Emeritusglobalresources@gmail.com",
    phone: "09048026350",
    whatsapp: "https://wa.me/2348101795519",
    columns: [
      { title: "Shop", links: [{ label: "Smartphones", href: "/shop?category=smartphones" }, { label: "Laptops", href: "/shop?category=laptops" }, { label: "Audio", href: "/shop?category=audio" }, { label: "New arrivals", href: "/shop?sort=newest" }] },
      { title: "Support", links: [{ label: "Book a repair", href: "/repairs/book" }, { label: "Track an order", href: "/tracking" }, { label: "Returns", href: "/returns" }, { label: "Contact", href: "/contact" }] },
      { title: "Company", links: [{ label: "Our story", href: "/about" }, { label: "Visit store", href: "#store" }, { label: "Privacy", href: "/privacy" }, { label: "Terms", href: "/terms" }] },
    ],
  },
}
