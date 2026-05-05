"use client";

import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Upload, List, CheckSquare, Settings, LogOut, Tv, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const teacherLinks = [
    { name: "Dashboard", href: "/teacher", icon: LayoutDashboard },
    { name: "Upload Content", href: "/teacher/upload", icon: Upload },
    { name: "My Content", href: "/teacher/content", icon: List },
  ];

  const principalLinks = [
    { name: "Dashboard", href: "/principal", icon: LayoutDashboard },
    { name: "Pending Approvals", href: "/principal/pending", icon: CheckSquare },
    { name: "All Content", href: "/principal/content", icon: List },
  ];

  const links = user?.role === "teacher" ? teacherLinks : principalLinks;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-white dark:bg-gray-950 border-r dark:border-gray-800 flex flex-col transition-colors">
        <div className="h-16 flex items-center px-6 border-b dark:border-gray-800">
          <Tv className="w-6 h-6 text-blue-600 dark:text-blue-500 mr-2" />
          <span className="text-xl font-bold text-gray-800 dark:text-gray-100">EduBroadcast</span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-3 space-y-1">
            {links.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
              const isExact = pathname === link.href;
              const Icon = link.icon;
              
              // Handle exact match for dashboard
              const isCurrent = link.href === "/teacher" || link.href === "/principal" ? isExact : isActive;

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors",
                    isCurrent
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                  )}
                >
                  <Icon className={cn("flex-shrink-0 w-5 h-5 mr-3", isCurrent ? "text-blue-700 dark:text-blue-400" : "text-gray-400 dark:text-gray-500")} />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t dark:border-gray-800 flex flex-col gap-3">
          <div className="px-3">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-200">{user?.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
          </div>
          <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 dark:border-red-900/50 dark:hover:bg-red-900/20 dark:text-red-500" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white dark:bg-gray-950 border-b dark:border-gray-800 flex items-center px-6 justify-between flex-shrink-0 transition-colors">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            {links.find(l => l.href === pathname || (l.href !== '/teacher' && l.href !== '/principal' && pathname.startsWith(l.href)))?.name || "Dashboard"}
          </h1>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-gray-500 dark:text-gray-400"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            {user?.role === 'teacher' && (
               <Link href={`/live/${user.id}`} target="_blank">
                 <Button variant="secondary" size="sm" className="gap-2">
                   <Tv className="w-4 h-4" />
                   View Live Page
                 </Button>
               </Link>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900 transition-colors">
          {children}
        </main>
      </div>
    </div>
  );
}
