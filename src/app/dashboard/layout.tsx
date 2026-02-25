'use client';
import { DashboardHeader } from "@/components/layout/header";
import { DashboardSidebar } from "@/components/layout/sidebar";
import { DynamicFavicon } from "@/components/layout/dynamic-favicon";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from "@/components/ui/sidebar";
import { useUser } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, appUser, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Redirección si no está autenticado
    if (!isUserLoading && !user) {
      router.push('/login');
      return;
    }

    // Redirección por rol
    if (!isUserLoading && appUser?.role === 'collaborator') {
      // Si un colaborador intenta entrar a la raíz del dashboard o rutas prohibidas
      const forbiddenRoutes = ['/dashboard/transactions', '/dashboard/invoices', '/dashboard/customers', '/dashboard/collaborators', '/dashboard/services', '/dashboard/automation'];
      const isForbidden = forbiddenRoutes.some(route => pathname.startsWith(item => pathname === '/dashboard' || pathname.startsWith(route)));
      
      if (pathname === '/dashboard' || forbiddenRoutes.some(route => pathname.startsWith(route))) {
        router.push('/dashboard/projects');
      }
    }
  }, [user, appUser, isUserLoading, router, pathname]);

  // Mientras carga, mostrar indicador
  if (isUserLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Si hay usuario, renderizar el dashboard
  if (user) {
    return (
      <SidebarProvider>
        <DynamicFavicon />
        <Sidebar>
          <DashboardSidebar />
        </Sidebar>
        <SidebarInset>
          <DashboardHeader />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    );
  }
  
  return null;
}
