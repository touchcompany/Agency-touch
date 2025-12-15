'use client';
import { formatCurrency } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import type { Income, Customer } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export function RecentTransactions() {
  const { firestore, user } = useFirebase();
  const locale = 'es-ES';

  const incomeQuery = useMemoFirebase(() => 
    user ? query(collection(firestore, 'users', user.uid, 'income'), orderBy('date', 'desc'), limit(5)) : null
  , [firestore, user]);
  const { data: recentIncome, isLoading: incomeLoading } = useCollection<Income>(incomeQuery);

  const customersQuery = useMemoFirebase(() => 
    user ? collection(firestore, 'users', user.uid, 'customers') : null
  , [firestore, user]);
  const { data: customers, isLoading: customersLoading } = useCollection<Customer>(customersQuery);

  const getClientName = (customerId?: string) => {
    if (!customerId || !customers) return 'Cliente Desconocido';
    return customers.find((c) => c.id === customerId)?.name || 'Cliente Desconocido';
  };

  const getClientAvatar = (customerId?: string) => {
    return `https://picsum.photos/seed/${customerId || 'default'}/100/100`;
  };

  if (incomeLoading || customersLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (!recentIncome || recentIncome.length === 0) {
    return (
        <div className="text-center p-8 text-muted-foreground">
            No hay transacciones recientes.
        </div>
    )
  }

  return (
    <div className="space-y-4">
      {recentIncome.map((income) => (
        <div key={income.id} className="flex items-center gap-4">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={getClientAvatar(income.customerId)}
              data-ai-hint="person"
            />
            <AvatarFallback>
              {getClientName(income.customerId).charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">
              {income.description}
            </p>
            <p className="text-sm text-muted-foreground">
              {getClientName(income.customerId)}
            </p>
          </div>
          <div className={`font-medium text-green-500`}>
            +{formatCurrency(income.amount)}
          </div>
        </div>
      ))}
    </div>
  );
}
