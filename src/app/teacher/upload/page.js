"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuthStore } from "@/store/auth.store";
import { contentService } from "@/services/content.service";
import { useRouter } from "next/navigation";
import { Loader2, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Schema for validation
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif"];

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  subject: z.string().min(2, "Subject must be at least 2 characters").max(50),
  description: z.string().max(500).optional(),
  startTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid start time",
  }),
  endTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid end time",
  }),
  rotationDuration: z.coerce.number().min(5).max(3600).default(10),
}).refine((data) => {
  const start = new Date(data.startTime);
  const end = new Date(data.endTime);
  return end > start;
}, {
  message: "End time must be after start time",
  path: ["endTime"], // set error path to endTime field
});

export default function UploadContentPage() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      subject: "",
      description: "",
      startTime: "",
      endTime: "",
      rotationDuration: 10,
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ payload, fileDataUrl }) => {
      return contentService.uploadContent({
        ...payload,
        teacherId: user.id,
        teacherName: user.name,
        fileUrl: fileDataUrl, // In a real app, upload the file to S3 and return URL
      });
    },
    onSuccess: () => {
      toast.success("Content uploaded successfully and is pending approval!");
      queryClient.invalidateQueries({ queryKey: ["teacherContent"] });
      queryClient.invalidateQueries({ queryKey: ["teacherStats"] });
      router.push("/teacher/content");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to upload content");
    }
  });

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      toast.error("File is invalid or exceeds 10MB limit.");
      return;
    }
    
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/gif": []
    },
    maxSize: MAX_FILE_SIZE,
    multiple: false
  });

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const onSubmit = async (values) => {
    if (!selectedFile) {
      toast.error("Please upload a file");
      return;
    }

    // Convert file to base64 for mock backend
    const reader = new FileReader();
    reader.onloadend = async () => {
      uploadMutation.mutate({
        payload: values,
        fileDataUrl: reader.result,
      });
    };
    reader.readAsDataURL(selectedFile);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Upload Content</h2>
        <p className="text-gray-500 dark:text-gray-400">Fill in the details below to submit new broadcasting content for approval.</p>
      </div>

      <div className="bg-white dark:bg-gray-950 p-6 rounded-lg shadow-sm border dark:border-gray-800 transition-colors">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-gray-200">Title <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Introduction to Calculus" className="dark:bg-gray-900 dark:border-gray-800" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-gray-200">Subject <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Mathematics" className="dark:bg-gray-900 dark:border-gray-800" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-gray-200">Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Optional description of this content..." 
                      className="resize-none h-20 dark:bg-gray-900 dark:border-gray-800"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel className="dark:text-gray-200">Content File <span className="text-red-500">*</span></FormLabel>
              <div 
                {...getRootProps()} 
                className={cn(
                  "mt-2 border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors",
                  isDragActive ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                )}
              >
                <input {...getInputProps()} />
                
                {previewUrl ? (
                  <div className="relative w-full max-w-sm">
                    <img src={previewUrl} alt="Preview" className="w-full h-auto rounded-md shadow-sm" />
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="icon" 
                      className="absolute -top-3 -right-3 h-8 w-8 rounded-full"
                      onClick={handleRemoveFile}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="h-10 w-10 text-gray-400 dark:text-gray-500 mb-3" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-semibold text-blue-600 dark:text-blue-500">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG, or GIF (max. 10MB)</p>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t dark:border-gray-800">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-gray-200">Start Time <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input type="datetime-local" className="dark:bg-gray-900 dark:border-gray-800" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-gray-200">End Time <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input type="datetime-local" className="dark:bg-gray-900 dark:border-gray-800" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="rotationDuration"
              render={({ field }) => (
                <FormItem className="md:w-1/2">
                  <FormLabel className="dark:text-gray-200">Rotation Duration (seconds)</FormLabel>
                  <FormControl>
                    <Input type="number" min="5" max="3600" className="dark:bg-gray-900 dark:border-gray-800" {...field} />
                  </FormControl>
                  <FormDescription className="dark:text-gray-500">
                    How long this content should appear on screen if multiple contents are active.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-4">
              <Button type="button" variant="outline" className="mr-3 dark:border-gray-800" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={uploadMutation.isPending}>
                {uploadMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit for Approval
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
