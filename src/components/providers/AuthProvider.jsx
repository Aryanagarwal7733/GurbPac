"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useRouter, usePathname } from 'next/navigation';

export default function AuthProvider({ children }) {
  const { checkAuth, isAuthenticated, user } = useAuthStore();
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
    setIsClient(true);
  }, [checkAuth]);

  useEffect(() => {
    if (!isClient) return;

    const isPublicRoute = pathname.startsWith('/live');
    
    if (!isAuthenticated && !isPublicRoute && pathname !== '/') {
      router.push('/');
    } else if (isAuthenticated && pathname === '/') {
      if (user?.role === 'principal') {
        router.push('/principal');
      } else if (user?.role === 'teacher') {
        router.push('/teacher');
      }
    }
    
    // Role-based protection
    if (isAuthenticated) {
      if (pathname.startsWith('/teacher') && user?.role !== 'teacher') {
        router.push('/principal');
      }
      if (pathname.startsWith('/principal') && user?.role !== 'principal') {
        router.push('/teacher');
      }
    }

  }, [isAuthenticated, isClient, pathname, router, user]);

  if (!isClient) {
    return null; // or a full page loader
  }

  return <>{children}</>;
}
