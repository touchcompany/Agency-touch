import { mockTransactions } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const categoryIcons: { [key: string]: string } = {
  Comida: '🍔',
  Transporte: '🚗',
  Servicios: '💡',
  Alquiler: '🏠',
  Entretenimiento: '🎬',
  Compras: '🛍️',
  Viajes: '✈️',
  Salario: '💼',
  Inversiones: '📈',
  Otro: '📎',
}

export function RecentTransactions() {
  const recent = mockTransactions.slice(0, 5);
  const locale = 'es-ES';

  return (
    <div className="space-y-4">
      {recent.map((transaction) => (
        <div key={transaction.id} className="flex items-center gap-4">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-muted text-foreground">
              {categoryIcons[transaction.category]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">
              {transaction.description}
            </p>
            <p className="text-sm text-muted-foreground">
              {new Date(transaction.date).toLocaleDateString(locale)}
            </p>
          </div>
          <div
            className={`font-medium ${
              transaction.type === "income" ? "text-green-500" : "text-red-500"
            }`}
          >
            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
          </div>
        </div>
      ))}
    </div>
  );
}
