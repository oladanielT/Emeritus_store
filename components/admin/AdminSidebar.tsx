"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3, Boxes, Building2, ChartNoAxesCombined, CircleDollarSign, Clapperboard,
  FolderOpen, Gauge, Image, LayoutDashboard, MessageSquareText, Package, ReceiptText,
  Settings, ShoppingCart, Tags, TicketPercent, Users, Wrench,
} from "lucide-react"

const navigation = [
  ["Overview", [["/admin", "Dashboard", LayoutDashboard], ["/admin/analytics", "Analytics", BarChart3], ["/admin/revenue", "Revenue", CircleDollarSign]]],
  ["Commerce", [["/admin/orders", "Orders", ShoppingCart], ["/admin/customers", "Customers", Users], ["/admin/products", "Products", Package], ["/admin/inventory", "Inventory", Boxes], ["/admin/categories", "Categories", Tags], ["/admin/brands", "Brands", Building2], ["/admin/coupons", "Coupons", TicketPercent], ["/admin/reviews", "Reviews", MessageSquareText]]],
  ["Content", [["/admin/media", "Media library", Image], ["/admin/hero", "Hero manager", Clapperboard], ["/admin/homepage", "Homepage manager", FolderOpen]]],
  ["Operations", [["/admin/repairs", "Repair bookings", Wrench], ["/admin/reports", "Reports", ReceiptText], ["/admin/settings", "Settings", Settings]]],
] as const

export default function AdminSidebar() {
  const path = usePathname()
  return <aside className="sticky top-0 z-40 flex w-full shrink-0 flex-col border-r border-slate-800 bg-slate-950 text-slate-100 lg:h-screen lg:w-64">
    <Link href="/admin" className="hidden h-18 items-center gap-3 border-b border-slate-800 px-5 lg:flex"><span className="grid size-9 place-items-center rounded-xl bg-primary font-bold">E</span><span><span className="block text-sm font-semibold">Emeritus Admin</span><span className="block text-xs text-slate-400">Commerce control</span></span></Link>
    <nav className="flex flex-1 gap-1 overflow-x-auto p-2 lg:block lg:overflow-y-auto lg:p-3">
      {navigation.map(([group, links]) => <div key={group} className="contents lg:mb-5 lg:block"><p className="mb-2 hidden px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 lg:block">{group}</p><div className="contents lg:block lg:space-y-1">{links.map(([href, label, Icon]) => {
        const active = path === href || (href !== "/admin" && path.startsWith(`${href}/`))
        return <Link key={href} href={href} className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs transition lg:gap-3 lg:py-2.5 lg:text-sm ${active ? "bg-primary text-white" : "text-slate-400 hover:bg-slate-900 hover:text-white"}`}><Icon className="size-4" />{label}</Link>
      })}</div></div>)}
    </nav>
  </aside>
}
