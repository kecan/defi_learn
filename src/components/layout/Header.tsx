"use client";

import { ConnectWallet } from "@/components/wallet/ConnectWallet";
import { useAccount, useBalance } from "wagmi";
import { formatEther } from "viem";
import { Coins, Briefcase } from "lucide-react";

export function Header() {
  const { address } = useAccount();
  const { data: balance } = useBalance({
    address: address,
  });

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-primary to-purple-600 p-2 rounded-lg">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                DeFi Jobs
              </h1>
              <p className="text-xs text-muted-foreground -mt-1">
                Web3 Learning Platform
              </p>
            </div>
          </div>

          {/* Balance Info */}
          {address && (
            <div className="hidden md:flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2 bg-secondary/50 px-3 py-2 rounded-lg">
                <Coins className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">余额:</span>
                <span className="font-medium">
                  {balance ? `${parseFloat(formatEther(balance.value)).toFixed(4)} ETH` : '0.0000 ETH'}
                </span>
              </div>
            </div>
          )}

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            <ConnectWallet />
          </div>
        </div>
      </div>
    </header>
  );
}