'use client';

import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  Briefcase,
  Presentation,
  Bot,
  Settings,
  Rocket,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

const menuItems = [
  {
    href: '/dashboard',
    icon: LayoutDashboard,
    label: 'Panel',
  },
  {
    href: '/dashboard/transactions',
    icon: CreditCard,
    label: 'Transacciones',
  },
  {
    href: '/dashboard/invoices',
    icon: FileText,
    label: 'Cuentas',
  },
  {
    href: '/dashboard/customers',
    icon: Users,
    label: 'Clientes',
  },
  {
    href: '/dashboard/collaborators',
    icon: Briefcase,
    label: 'Colaboradores',
  },
  {
    href: '/dashboard/services',
    icon: Presentation,
    label: 'Servicios',
  },
  {
    href: '/dashboard/automation',
    icon: Bot,
    label: 'Automatización'
  },
  {
    href: '/dashboard/projects',
    icon: Rocket,
    label: 'Proyectos',
  },
    {
    href: '/dashboard/settings',
    icon: Settings,
    label: 'Configuración'
  }
];

export function DashboardSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="p-1 rounded-md">
                <Image src="/favicon.svg" alt="touch logo" width={28} height={28} />
            </div>
            <h1 className="font-headline text-xl font-bold text-foreground">
              touch
            </h1>
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.href)}
                tooltip={{ children: item.label, side: 'right' }}
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
    </>
  );
}
