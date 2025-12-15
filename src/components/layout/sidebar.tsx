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
  Sparkles,
  Wrench,
  Briefcase,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
    icon: Wrench,
    label: 'Servicios',
  },
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
            <div className="p-2 bg-primary text-primary-foreground rounded-md">
              <Sparkles className="h-5 w-5" />
            </div>
            <h1 className="font-headline text-xl font-bold text-foreground">
              FinancioAI
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
