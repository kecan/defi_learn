"use client";

import { useState } from "react";
import { ConnectWallet } from "@/components/wallet/ConnectWallet";
import { JobsSection } from "@/components/jobs/JobsSection";
import { DeFiSection } from "@/components/defi/DeFiSection";
import { Header } from "@/components/layout/Header";
import { Navigation } from "@/components/layout/Navigation";
import { useAccount } from "wagmi";

export type Section = "jobs" | "defi" | "profile";

export default function Home() {
  const [activeSection, setActiveSection] = useState<Section>("jobs");
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-4">
              DeFi Jobs Platform
            </h1>
            <p className="text-muted-foreground text-lg">
              去中心化任务平台 - 学习Web3 DeFi业务交互
            </p>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border">
            <ConnectWallet />
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              连接钱包开始使用平台功能
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <Navigation activeSection={activeSection} onSectionChange={setActiveSection} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeSection === "jobs" && <JobsSection />}
        {activeSection === "defi" && <DeFiSection />}
        {activeSection === "profile" && (
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold text-muted-foreground">
              用户资料功能开发中...
            </h2>
          </div>
        )}
      </main>
    </div>
  );
}