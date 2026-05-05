"use client";

import { useState } from "react";
import { contentService } from "@/services/content.service";
import { Loader2, ExternalLink, CheckCircle, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { TableSkeleton } from "@/components/shared/TableSkeleton";

const ITEMS_PER_PAGE = 5;

export default function PendingApprovalsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const queryClient = useQueryClient();

  const { data: contents = [], isLoading } = useQuery({
    queryKey: ["pendingContent"],
    queryFn: async () => {
      const data = await contentService.getAllContent();
      return data.filter(c => c.status === "pending");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, reason }) => contentService.updateContentStatus(id, status, reason),
    onSuccess: (updatedContent) => {
      queryClient.setQueryData(["pendingContent"], (old) => old.filter(c => c.id !== updatedContent.id));
      queryClient.invalidateQueries({ queryKey: ["principalStats"] });
      queryClient.invalidateQueries({ queryKey: ["allContent"] });
    },
    onError: () => {
      toast.error("Failed to update content status");
    }
  });

  const handleApprove = (id) => {
    updateStatusMutation.mutate(
      { id, status: "approved" },
      { onSuccess: () => toast.success("Content approved successfully") }
    );
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast.error("Rejection reason is required");
      return;
    }

    updateStatusMutation.mutate(
      { id: rejectingId, status: "rejected", reason: rejectionReason },
      {
        onSuccess: () => {
          toast.success("Content rejected");
          setRejectingId(null);
          setRejectionReason("");
        }
      }
    );
  };

  const totalPages = Math.max(1, Math.ceil(contents.length / ITEMS_PER_PAGE));
  const paginatedContents = contents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Pending Approvals</h2>
        <p className="text-gray-500 dark:text-gray-400">Review and approve or reject content uploaded by teachers.</p>
      </div>

      {isLoading ? (
        <TableSkeleton columns={4} rows={5} />
      ) : (
        <div className="space-y-4">
          <div className="rounded-md border dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm overflow-hidden transition-colors">
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-900">
                <TableRow className="dark:border-gray-800">
                  <TableHead className="w-[100px] dark:text-gray-300">Preview</TableHead>
                  <TableHead className="dark:text-gray-300">Teacher & Details</TableHead>
                  <TableHead className="dark:text-gray-300">Schedule</TableHead>
                  <TableHead className="text-right dark:text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedContents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-gray-500 dark:text-gray-400">
                      No pending content awaiting approval.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedContents.map((content) => (
                    <TableRow key={content.id} className="dark:border-gray-800">
                      <TableCell>
                        <div className="h-16 w-24 rounded overflow-hidden bg-gray-100 dark:bg-gray-800 border dark:border-gray-700 relative group">
                          {content.fileUrl ? (
                            <>
                              <img src={content.fileUrl} alt={content.title} className="w-full h-full object-cover" />
                              <div 
                                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                                onClick={() => window.open(content.fileUrl, '_blank')}
                              >
                                <ExternalLink className="h-5 w-5 text-white" />
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Image</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-gray-900 dark:text-gray-100">{content.title}</div>
                        <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">{content.teacherName} <span className="text-gray-500 dark:text-gray-400 font-normal">({content.subject})</span></div>
                        {content.description && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-sm mt-1">{content.description}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm dark:text-gray-300">
                          <span className="text-gray-500 dark:text-gray-400">Start: </span>
                          {format(new Date(content.startTime), "PPp")}
                        </div>
                        <div className="text-sm dark:text-gray-300">
                          <span className="text-gray-500 dark:text-gray-400">End: </span>
                          {format(new Date(content.endTime), "PPp")}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 dark:border-red-900/50 dark:hover:bg-red-900/20 dark:text-red-500"
                            onClick={() => setRejectingId(content.id)}
                            disabled={updateStatusMutation.isPending}
                          >
                            <XCircle className="w-4 h-4 mr-1" /> Reject
                          </Button>
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700 text-white dark:bg-green-600 dark:hover:bg-green-700"
                            onClick={() => handleApprove(content.id)}
                            disabled={updateStatusMutation.isPending}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" /> Approve
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

      {/* Rejection Modal */}
      <Dialog open={!!rejectingId} onOpenChange={(open) => !open && setRejectingId(null)}>
        <DialogContent className="dark:bg-gray-950 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="dark:text-gray-100">Reject Content</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Please provide a reason for rejecting this content. This will be visible to the teacher.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="E.g. Inappropriate content, poor resolution, incorrect subject..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-[100px] dark:bg-gray-900 dark:border-gray-800"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectingId(null)} disabled={updateStatusMutation.isPending} className="dark:border-gray-800">Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={updateStatusMutation.isPending || !rejectionReason.trim()}>
              {updateStatusMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
