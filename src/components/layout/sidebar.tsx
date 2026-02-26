'use client';

import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  Receipt,
  Presentation,
  Bot,
  Settings,
  Rocket,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useUser } from '@/firebase';

const menuItems = [
  {
    href: '/dashboard',
    icon: LayoutDashboard,
    label: 'Panel',
    roles: ['superuser'],
  },
  {
    href: '/dashboard/transactions',
    icon: CreditCard,
    label: 'Transacciones',
    roles: ['superuser'],
  },
  {
    href: '/dashboard/invoices',
    icon: FileText,
    label: 'Cuentas',
    roles: ['superuser'],
  },
  {
    href: '/dashboard/customers',
    icon: Users,
    label: 'Clientes',
    roles: ['superuser'],
  },
  {
    href: '/dashboard/collaborators',
    icon: Receipt,
    label: 'Pagos',
    roles: ['superuser'],
  },
  {
    href: '/dashboard/services',
    icon: Presentation,
    label: 'Servicios',
    roles: ['superuser'],
  },
  {
    href: '/dashboard/automation',
    icon: Bot,
    label: 'Automatización',
    roles: ['superuser'],
  },
  {
    href: '/dashboard/projects',
    icon: Rocket,
    label: 'Proyectos',
    roles: ['superuser', 'collaborator'],
  },
  {
    href: '/dashboard/settings',
    icon: Settings,
    label: 'Configuración',
    roles: ['superuser', 'collaborator'],
  }
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { appUser } = useUser();
  
  // Por defecto tratamos como superuser si el rol no está definido explícitamente
  const userRole = appUser?.role || 'superuser';

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  // Filtrar ítems del menú según el rol del usuario actual
  const filteredItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2 group-data-[state=collapsed]:p-0 group-data-[state=collapsed]:justify-center">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="p-1 rounded-md shrink-0 flex items-center justify-center w-9 h-9">
                <Image src="/favicon.svg" alt="touch logo" width={28} height={28} className="object-contain" />
            </div>
            <h1 className="font-headline text-xl font-bold text-foreground group-data-[collapsible=icon]:hidden">
              touch
            </h1>
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {filteredItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.href)}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarRail />
    </>
  );
}
