"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Music, Library, History, Sparkles } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "创作工坊", icon: Music },
  { href: "/styles", label: "风格模板库", icon: Library },
  { href: "/history", label: "创作历史", icon: History },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-[#121212]/90 backdrop-blur-md border-b border-[#2F2F2F]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center group-hover:bg-brand-600 transition-colors">
            <Sparkles className="w-5 h-5 text-black" />
          </div>
          <span className="text-xl font-bold text-surface-900">
            Canor
          </span>
          <span className="text-xs font-medium text-brand-400 bg-brand-900/30 px-2 py-0.5 rounded-full">
            V4
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-brand-900/20 text-brand-400"
                    : "text-surface-600 hover:text-surface-900 hover:bg-surface-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}