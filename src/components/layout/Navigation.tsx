"use client";

import { Button } from "@/components/ui/Button";
import { Briefcase, TrendingUp, User } from "lucide-react";
import type { Section } from "@/app/page";

interface NavigationProps {
  activeSection: Section;
  onSectionChange: (section: Section) => void;
}

export function Navigation({ activeSection, onSectionChange }: NavigationProps) {
  const sections = [
    {
      id: "jobs" as const,
      label: "任务中心",
      icon: Briefcase,
      description: "创建和管理任务",
    },
    {
      id: "defi" as const,
      label: "DeFi收益",
      icon: TrendingUp,
      description: "资金管理和收益",
    },
    {
      id: "profile" as const,
      label: "个人中心",
      icon: User,
      description: "用户资料和历史",
    },
  ];

  return (
    <nav className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 py-4">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            
            return (
              <Button
                key={section.id}
                variant={isActive ? "default" : "ghost"}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? "bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg" 
                    : "hover:bg-secondary/80"
                }`}
                onClick={() => onSectionChange(section.id)}
              >
                <Icon className="h-4 w-4" />
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium">{section.label}</div>
                  <div className={`text-xs ${
                    isActive ? "text-white/80" : "text-muted-foreground"
                  }`}>
                    {section.description}
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}