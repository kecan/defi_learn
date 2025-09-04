import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/components/providers/Web3Provider";
import { QueryProvider } from "@/components/providers/QueryProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DeFi Jobs Platform - Web3 Learning Project",
  description: "Learn Web3 DeFi development through building a decentralized jobs platform",
  keywords: ["DeFi", "Web3", "Blockchain", "Ethereum", "Jobs", "Learning"],
  authors: [{ name: "kecan" }],
  openGraph: {
    title: "DeFi Jobs Platform",
    description: "Learn Web3 DeFi development through building a decentralized jobs platform",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <Web3Provider>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
              {children}
            </div>
          </Web3Provider>
        </QueryProvider>
      </body>
    </html>
  );
}