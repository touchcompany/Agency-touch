
"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import { useFirebase } from "@/firebase";
import { signOut } from "firebase/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User as UserIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const titleTranslations: { [key: string]: string } = {
  dashboard: "Panel",
  transactions: "Transacciones",
  invoices: "Cuentas",
  customers: "Clientes",
  collaborators: "Colaboradores",
  services: "Servicios",
  settings: "Configuración",
  edit: "Editar",
  new: "Nueva",
  automation: "Automatización",
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
  
  if (titleTranslations[lastPart]) {
    return titleTranslations[lastPart];
  }
  
  // If no direct translation, check if it's an ID (if it looks like one)
  // This is a simple check, can be improved
  if(pathParts.length > 2 && lastPart.length > 10) { // Assume long strings are IDs
    const parent = pathParts[pathParts.length-2];
    let translatedParent = titleTranslations[parent] || parent;
     // Singularize
    if (translatedParent.endsWith('s')) {
      translatedParent = translatedParent.slice(0, -1);
    }
    return `Detalle de ${translatedParent}`;
  }


  return lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
};


export function DashboardHeader() {
  const pathname = usePathname();
  const title = useMemo(() => getTitleFromPath(pathname), [pathname]);
  const { auth, user } = useFirebase();
  const router = useRouter();

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push("/login");
    }
  };

  const getInitials = (phoneNumber: string | null | undefined) => {
    if (!phoneNumber) return 'U';
    // Get last 2 digits for initials
    return phoneNumber.slice(-2);
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <h1 className="font-headline flex-1 text-xl sm:text-2xl font-bold text-foreground">{title}</h1>
      
      {user && (
         <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="overflow-hidden rounded-full"
            >
               <Image src="/favicon.svg" alt="touch+ logo" width={28} height={28} />

            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{user.phoneNumber || 'Mi Cuenta'}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">
                <UserIcon className="mr-2 h-4 w-4" />
                Perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  );
}
