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

    // Redirección por rol: Si es colaborador y está en una ruta financiera, mandarlo a Proyectos
    if (!isUserLoading && appUser?.role === 'collaborator') {
      const financialRoutes = [
        '/dashboard/transactions', 
        '/dashboard/invoices', 
        '/dashboard/customers', 
        '/dashboard/collaborators', 
        '/dashboard/services', 
        '/dashboard/automation'
      ];
      
      const isTryingToAccessForbidden = financialRoutes.some(route => pathname.startsWith(route)) || pathname === '/dashboard';
      
      if (isTryingToAccessForbidden) {
        router.push('/dashboard/projects');
      }
    }
  }, [user, appUser, isUserLoading, router, pathname]);

  // Mientras carga el estado del usuario, mostrar un indicador de pantalla completa
  if (isUserLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Si hay usuario, renderizar el dashboard con la estructura de sidebar
  if (user) {
    return (
      <SidebarProvider>
        <DynamicFavicon />
        <Sidebar collapsible="icon">
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
