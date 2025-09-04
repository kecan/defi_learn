"use client";

import { useState } from "react";
import { JobsList } from "./JobsList";
import { CreateJobModal } from "./CreateJobModal";
import { JobStats } from "./JobStats";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";

export function JobsSection() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [userType, setUserType] = useState<'creator' | 'agent'>('creator');

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <JobStats />
      
      {/* User Type Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex bg-secondary/50 rounded-lg p-1">
          <button
            onClick={() => setUserType('creator')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              userType === 'creator'
                ? 'bg-white dark:bg-slate-800 shadow-sm text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            任务发布者
          </button>
          <button
            onClick={() => setUserType('agent')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              userType === 'agent'
                ? 'bg-white dark:bg-slate-800 shadow-sm text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            任务接取者
          </button>
        </div>

        {/* Create Job Button - Only show for creators */}
        {userType === 'creator' && (
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-primary to-purple-600 text-white btn-glow"
          >
            <Plus className="mr-2 h-4 w-4" />
            发布任务
          </Button>
        )}
      </div>

      {/* Jobs List */}
      <JobsList userType={userType} />

      {/* Create Job Modal */}
      <CreateJobModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}