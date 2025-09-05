'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  HomeIcon, 
  BriefcaseIcon, 
  TrendingUpIcon, 
  UsersIcon,
  SettingsIcon,
  WalletIcon
} from 'lucide-react';

const navigation = [
  { name: '总览', href: '/', icon: HomeIcon },
  { name: '任务管理', href: '/jobs', icon: BriefcaseIcon },
  { name: 'DeFi 收益', href: '/yield', icon: TrendingUpIcon },
  { name: 'Agent 管理', href: '/agents', icon: UsersIcon },
  { name: '钱包', href: '/wallet', icon: WalletIcon },
  { name: '设置', href: '/settings', icon: SettingsIcon },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">DeFi Jobs</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-white">U</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">用户</p>
            <p className="text-xs text-gray-500">0x1234...5678</p>
          </div>
        </div>
      </div>
    </div>
  );
}