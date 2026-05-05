"use client";

import { useState } from "react";
import { contentService } from "@/services/content.service";
import { ExternalLink, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";

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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableSkeleton } from "@/components/shared/TableSkeleton";

const ITEMS_PER_PAGE = 5;

export default function AllContentPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: contents = [], isLoading } = useQuery({
    queryKey: ["allContent"],
    queryFn: () => contentService.getAllContent(),
  });

  // Derived state for filtering
  let filteredContents = contents;
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filteredContents = filteredContents.filter(
      c => c.title.toLowerCase().includes(q) || 
           c.teacherName.toLowerCase().includes(q) ||
           c.subject.toLowerCase().includes(q)
    );
  }
  if (statusFilter !== "all") {
    filteredContents = filteredContents.filter(c => c.status === statusFilter);
  }

  const totalPages = Math.max(1, Math.ceil(filteredContents.length / ITEMS_PER_PAGE));
  const paginatedContents = filteredContents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 if filters change
  const handleSearch = (v) => { setSearchQuery(v); setCurrentPage(1); };
  const handleFilter = (v) => { setStatusFilter(v); setCurrentPage(1); };

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
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">All Content</h2>
        <p className="text-gray-500 dark:text-gray-400">View and filter all content uploaded across the platform.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-gray-950 p-4 rounded-md border dark:border-gray-800 shadow-sm transition-colors">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Input
            placeholder="Search by title, teacher, or subject..."
            className="pl-9 dark:bg-gray-900 dark:border-gray-800"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-[200px]">
          <Select value={statusFilter} onValueChange={handleFilter}>
            <SelectTrigger className="dark:bg-gray-900 dark:border-gray-800">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton columns={6} rows={5} />
      ) : (
        <div className="space-y-4">
          <div className="rounded-md border dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm overflow-hidden transition-colors">
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-900">
                <TableRow className="dark:border-gray-800">
                  <TableHead className="w-[80px] dark:text-gray-300">Preview</TableHead>
                  <TableHead className="dark:text-gray-300">Teacher</TableHead>
                  <TableHead className="dark:text-gray-300">Title & Subject</TableHead>
                  <TableHead className="dark:text-gray-300">Schedule</TableHead>
                  <TableHead className="dark:text-gray-300">Status</TableHead>
                  <TableHead className="text-right dark:text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedContents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-gray-500 dark:text-gray-400">
                      No content found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedContents.map((content) => (
                    <TableRow key={content.id} className="dark:border-gray-800">
                      <TableCell>
                        <div className="h-12 w-16 rounded overflow-hidden bg-gray-100 dark:bg-gray-800 border dark:border-gray-700">
                          {content.fileUrl ? (
                            <img src={content.fileUrl} alt={content.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">N/A</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-gray-900 dark:text-gray-100">{content.teacherName}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-gray-900 dark:text-gray-100">{content.title}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{content.subject}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs dark:text-gray-300">
                          <div className="text-gray-500 dark:text-gray-400 whitespace-nowrap">{format(new Date(content.startTime), "MMM d, h:mm a")}</div>
                          <div className="text-gray-500 dark:text-gray-400 whitespace-nowrap">to {format(new Date(content.endTime), "MMM d, h:mm a")}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col items-start gap-1">
                          {getStatusBadge(content.status)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300" onClick={() => window.open(content.fileUrl, '_blank')}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View
                        </Button>
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
