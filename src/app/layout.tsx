import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { PlayerBar } from "@/components/layout/player-bar";
import { PropertyPanel } from "@/components/layout/property-panel";
import { initializeDefaultConfig } from "@/lib/kernel";

initializeDefaultConfig();

export const metadata: Metadata = {
  title: "Canor - AI 音乐创作平台 V4",
  description: "V4 自进化引擎驱动的 AI 音乐创作平台，支持上下文理解、情感分析、智能推荐与迭代优化等核心能力",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="bg-[#121212]">
        <div className="flex h-screen">
          <Sidebar />
          <main className="flex-1 overflow-y-auto pb-[90px]">{children}</main>
          <PropertyPanel />
        </div>
        <PlayerBar />
      </body>
    </html>
  );
}