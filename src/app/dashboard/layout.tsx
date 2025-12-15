'use client';
import { DashboardHeader } from "@/components/layout/header";
import { DashboardSidebar } from "@/components/layout/sidebar";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from "@/components/ui/sidebar";
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If loading is finished and there's no user, redirect to login
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  // While loading, show a loading indicator
  if (isUserLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If there is a user, render the dashboard
  if (user) {
    return (
      <SidebarProvider>
        <Sidebar>
          <DashboardSidebar />
        </Sidebar>
        <SidebarInset>
          <DashboardHeader />
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    );
  }
  
  // If no user and not loading (should be covered by useEffect, but as a fallback)
  return null;
}
