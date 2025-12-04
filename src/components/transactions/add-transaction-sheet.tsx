"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Sparkles, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { categorizeExpenseAction } from "@/app/actions/transactions";

const categories = ["Comida", "Transporte", "Servicios", "Alquiler", "Entretenimiento", "Compras", "Viajes", "Salario", "Inversiones", "Otro"] as const;

export function AddTransactionSheet() {
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("");
  const [isCategorizing, startCategorizing] = useTransition();
  const { toast } = useToast();

  const handleAiCategorize = () => {
    if (!description) {
      toast({
        variant: "destructive",
        title: "Descripción necesaria",
        description: "Por favor, introduce una descripción antes de usar la categorización con IA.",
      });
      return;
    }
    startCategorizing(async () => {
      const result = await categorizeExpenseAction(description);
      if (result.success && result.category) {
        if (categories.includes(result.category as any)) {
            setCategory(result.category);
        } else {
            setCategory("Otro");
        }
        toast({
          title: "Categorización con IA",
          description: `Gasto categorizado como "${result.category}".`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Falló la categorización con IA",
          description: result.error,
        });
      }
    });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Añadir Transacción
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="font-headline">Añadir Nueva Transacción</SheetTitle>
          <SheetDescription>
            Registra un nuevo ingreso o gasto. Usa la IA para categorizar gastos automáticamente.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Descripción
            </Label>
            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Monto
            </Label>
            <Input id="amount" type="number" placeholder="0.00" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Tipo
            </Label>
            <Select>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecciona el tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Gasto</SelectItem>
                <SelectItem value="income">Ingreso</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Categoría
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecciona la categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-4 flex justify-end">
            <Button variant="outline" size="sm" onClick={handleAiCategorize} disabled={isCategorizing}>
              {isCategorizing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Categorizar con IA
            </Button>
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit">Guardar Transacción</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
