"use client";

import { ReactNode } from "react";
import { RainbowKitProvider, getDefaultWallets, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia } from "wagmi/chains";
import { WagmiProvider } from "wagmi";
import "@rainbow-me/rainbowkit/styles.css";

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "demo-project-id";

const { wallets } = getDefaultWallets({
  appName: "DeFi Jobs Platform",
  projectId,
});

const config = getDefaultConfig({
  appName: "DeFi Jobs Platform",
  projectId,
  wallets,
  chains: [sepolia],
  ssr: true,
});

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <RainbowKitProvider
        theme="auto"
        appInfo={{
          appName: "DeFi Jobs Platform",
          learnMoreUrl: "https://github.com/kecan/defi_learn",
        }}
      >
        {children}
      </RainbowKitProvider>
    </WagmiProvider>
  );
}