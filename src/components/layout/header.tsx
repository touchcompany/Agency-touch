"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

const titleTranslations: { [key: string]: string } = {
  dashboard: "Panel",
  pagos: "Pagos",
  invoices: "Cuentas",
  clientes: "Clientes",
  settings: "Configuración",
  edit: "Editar",
  new: "Nueva"
};

const getTitleFromPath = (path: string) => {
  const pathParts = path.split("/").filter(Boolean);
  if (pathParts.length < 2) return titleTranslations.dashboard || "Dashboard";

  const lastPart = pathParts[pathParts.length - 1];
  
  if (lastPart === 'new' && pathParts.length > 2) {
    const parent = pathParts[pathParts.length - 2];
    let translatedParent = titleTranslations[parent] || parent;
    
    // Singularize
    if (translatedParent.endsWith('s')) {
      translatedParent = translatedParent.slice(0, -1);
    }
    
    return `${titleTranslations.new} ${translatedParent}`;
  }
  
  if (lastPart === 'edit' && pathParts.length > 3) {
    const parent = pathParts[pathParts.length-3];
    let translatedParent = titleTranslations[parent] || parent;

    // Singularize
    if (translatedParent.endsWith('s')) {
      translatedParent = translatedParent.slice(0, -1);
    }
     return `${titleTranslations.edit} ${translatedParent}`;
  }

  return titleTranslations[lastPart] || lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
};


export function DashboardHeader() {
  const pathname = usePathname();
  const title = useMemo(() => getTitleFromPath(pathname), [pathname]);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <h1 className="font-headline text-2xl font-bold text-foreground">{title}</h1>
      {/* Future header items like search or notifications can go here */}
    </header>
  );
}
