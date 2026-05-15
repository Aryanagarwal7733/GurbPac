"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { contentService } from "@/services/content.service";
import { Loader2, Tv, MonitorOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function LiveBroadcastingPage({ params }) {
  // Next.js 15: params is a promise, unwrap it using React.use
  const unwrappedParams = use(params);
  const { teacherId } = unwrappedParams;

  const { data: activeContent, isLoading } = useQuery({
    queryKey: ["liveContent", teacherId],
    queryFn: async () => {
      const contents = await contentService.getActiveTeacherContent(teacherId);
      return contents.length > 0 ? contents[0] : null;
    },
    refetchInterval: 5000, // Poll every 5 seconds
    enabled: !!teacherId,
  });

  // Handle rotation if there's active content with rotation duration
  // In a real app, if multiple are active, we'd cycle through them.
  // Here, we'll simulate a simple rotation by refreshing the active content
  // in the `fetchActiveContent` but the requirement just says "Currently active content".

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
        <p className="text-xl font-medium tracking-wide">Connecting to Broadcast...</p>
      </div>
    );
  }

  if (!activeContent) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <MonitorOff className="w-10 h-10 text-gray-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-white">No content available</h1>
            <p className="text-gray-400">
              The broadcast has ended or is not scheduled at this time. Please check back later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header overlay */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent z-10 pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="bg-red-600 animate-pulse px-3 py-1 rounded-full flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-white" />
            <span className="text-white text-sm font-bold tracking-wider uppercase">Live</span>
          </div>
          <div className="bg-black/50 backdrop-blur-md px-4 py-1 rounded-full">
            <span className="text-white text-sm font-medium">{activeContent.teacherName}'s Broadcast</span>
          </div>
        </div>
        
        <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-lg text-right max-w-sm">
          <h2 className="text-white font-bold truncate">{activeContent.title}</h2>
          <p className="text-blue-300 text-sm">{activeContent.subject}</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        {activeContent.fileUrl ? (
          activeContent.fileUrl.startsWith('data:video') ? (
            <video 
              src={activeContent.fileUrl} 
              autoPlay 
              loop 
              muted 
              className="w-full h-full object-contain"
            />
          ) : (
            <img 
              src={activeContent.fileUrl} 
              alt={activeContent.title}
              className="w-full h-full object-contain"
            />
          )
        ) : (
          <div className="text-white text-2xl font-bold tracking-widest">{activeContent.title}</div>
        )}
        
        {/* Description overlay */}
        {activeContent.description && (
          <div className="absolute bottom-10 left-10 right-10 bg-black/60 backdrop-blur-md p-6 rounded-xl border border-white/10">
            <p className="text-white/90 text-lg leading-relaxed">{activeContent.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
