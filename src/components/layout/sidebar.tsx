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
  
  const userRole = appUser?.role || 'superuser';

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const filteredItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <>
      <SidebarHeader className="py-4 px-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-transparent">
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground group-data-[state=collapsed]:mx-auto">
                   <Image src="/favicon.svg" alt="touch logo" width={24} height={24} />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[state=collapsed]:hidden">
                  <span className="truncate font-semibold font-headline text-lg text-foreground">touch</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
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
