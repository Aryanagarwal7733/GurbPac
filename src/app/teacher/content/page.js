"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { contentService } from "@/services/content.service";
import { ExternalLink, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/shared/TableSkeleton";

const ITEMS_PER_PAGE = 5;

export default function MyContentPage() {
  const user = useAuthStore((state) => state.user);
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id) => contentService.deleteContent(id),
    onSuccess: () => {
      toast.success("Content deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["teacherContent"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete content");
    }
  });

  const { data: contents = [], isLoading } = useQuery({
    queryKey: ["teacherContent", user?.id],
    queryFn: () => contentService.getTeacherContent(user.id),
    enabled: !!user?.id,
  });

  const totalPages = Math.ceil(contents.length / ITEMS_PER_PAGE);
  const paginatedContents = contents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">My Content</h2>
        <p className="text-gray-500 dark:text-gray-400">View and manage the content you have uploaded for broadcasting.</p>
      </div>

      {isLoading ? (
        <TableSkeleton columns={5} rows={5} />
      ) : (
        <div className="space-y-4">
          <div className="rounded-md border dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm overflow-hidden transition-colors">
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-900 transition-colors">
                <TableRow className="dark:border-gray-800">
                  <TableHead className="w-[100px] dark:text-gray-300">Preview</TableHead>
                  <TableHead className="dark:text-gray-300">Details</TableHead>
                  <TableHead className="dark:text-gray-300">Schedule</TableHead>
                  <TableHead className="dark:text-gray-300">Status</TableHead>
                  <TableHead className="text-right dark:text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedContents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-gray-500 dark:text-gray-400">
                      No content uploaded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedContents.map((content) => (
                    <TableRow key={content.id} className="dark:border-gray-800">
                      <TableCell>
                        <div className="h-16 w-24 rounded overflow-hidden bg-gray-100 dark:bg-gray-800 border dark:border-gray-700">
                          {content.fileUrl ? (
                            content.fileUrl.startsWith('data:video') ? (
                              <video src={content.fileUrl} className="w-full h-full object-cover" muted />
                            ) : (
                              <img src={content.fileUrl} alt={content.title} className="w-full h-full object-cover" />
                            )
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Media</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-gray-900 dark:text-gray-100">{content.title}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{content.subject}</div>
                        {content.description && (
                          <div className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-xs mt-1">{content.description}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm dark:text-gray-300">
                          <span className="text-gray-500 dark:text-gray-400">From: </span>
                          {format(new Date(content.startTime), "PPp")}
                        </div>
                        <div className="text-sm dark:text-gray-300">
                          <span className="text-gray-500 dark:text-gray-400">To: </span>
                          {format(new Date(content.endTime), "PPp")}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">Duration: {content.rotationDuration}s</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col items-start gap-1">
                          {getStatusBadge(content.status)}
                          {content.status === "rejected" && content.rejectionReason && (
                            <span className="text-xs text-red-600 dark:text-red-400 max-w-[150px] truncate" title={content.rejectionReason}>
                              {content.rejectionReason}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300" onClick={() => window.open(content.fileUrl, '_blank')}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Full
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950" 
                            onClick={() => {
                              if(window.confirm('Are you sure you want to delete this content?')) {
                                deleteMutation.mutate(content.id);
                              }
                            }}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="dark:border-gray-800"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="dark:border-gray-800"
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
