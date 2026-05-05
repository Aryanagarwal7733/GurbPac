"use client";

import { useAuthStore } from "@/store/auth.store";
import { contentService } from "@/services/content.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Clock, CheckCircle2, XCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { CardsSkeleton } from "@/components/shared/TableSkeleton";

export default function PrincipalDashboard() {
  const user = useAuthStore((state) => state.user);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["principalStats"],
    queryFn: async () => {
      const contents = await contentService.getAllContent();
      return contents.reduce(
        (acc, curr) => {
          acc.total += 1;
          acc[curr.status] += 1;
          return acc;
        },
        { total: 0, pending: 0, approved: 0, rejected: 0 }
      );
    },
    enabled: !!user?.id,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 transition-colors">Welcome, {user?.name}</h2>
        <p className="text-gray-500 dark:text-gray-400">System overview of all teacher content across the platform.</p>
      </div>

      {isLoading ? (
        <CardsSkeleton count={4} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="dark:bg-gray-950 dark:border-gray-800 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">All Content</CardTitle>
              <Database className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats?.total || 0}</div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-950 dark:border-gray-800 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-amber-600 dark:text-amber-500">Pending Approval</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-500">{stats?.pending || 0}</div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-950 dark:border-gray-800 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-green-600 dark:text-green-500">Approved</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 dark:text-green-500">{stats?.approved || 0}</div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-950 dark:border-gray-800 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-red-600 dark:text-red-500">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600 dark:text-red-500">{stats?.rejected || 0}</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
