"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Music, Library, History, Disc, User } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "创作工坊", icon: Music },
  { href: "/styles", label: "风格模板库", icon: Library },
  { href: "/history", label: "创作历史", icon: History },
  { href: "/library", label: "我的曲库", icon: Disc },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[280px] flex-shrink-0 bg-[#121212] flex flex-col h-screen sticky top-0">
      <div className="px-6 pt-6 pb-4">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-[#1DB954] flex items-center justify-center group-hover:bg-[#1ED760] transition-colors">
            <Sparkles className="w-5 h-5 text-black" />
          </div>
          <span className="text-h4 text-white">
            Canor
          </span>
          <span className="text-xs font-medium text-[#1DB954] bg-[#1DB954]/10 px-2 py-0.5 rounded-full">
            V4
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-3">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-body-m font-medium transition-all duration-200 border-l-[3px] ${
                isActive
                  ? "bg-[#1DB954]/10 text-white border-l-[#1DB954]"
                  : "text-[#B3B3B3] border-l-transparent hover:text-white hover:bg-[#282828]"
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-4 border-t border-[#2F2F2F]">
        <div className="flex items-center gap-3 text-[#B3B3B3] hover:text-white transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-[#282828] flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <span className="text-body-m font-medium">用户</span>
        </div>
      </div>
    </aside>
  );
}