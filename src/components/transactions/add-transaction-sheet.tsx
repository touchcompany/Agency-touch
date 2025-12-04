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

const categories = ["Food", "Transportation", "Utilities", "Rent", "Entertainment", "Shopping", "Travel", "Salary", "Investments", "Other"] as const;

export function AddTransactionSheet() {
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("");
  const [isCategorizing, startCategorizing] = useTransition();
  const { toast } = useToast();

  const handleAiCategorize = () => {
    if (!description) {
      toast({
        variant: "destructive",
        title: "Description needed",
        description: "Please enter a description before using AI categorization.",
      });
      return;
    }
    startCategorizing(async () => {
      const result = await categorizeExpenseAction(description);
      if (result.success && result.category) {
        if (categories.includes(result.category as any)) {
            setCategory(result.category);
        } else {
            setCategory("Other");
        }
        toast({
          title: "AI Categorization",
          description: `Expense categorized as "${result.category}".`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "AI Categorization Failed",
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
          Add Transaction
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="font-headline">Add New Transaction</SheetTitle>
          <SheetDescription>
            Record a new income or expense. Use AI to categorize expenses automatically.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount
            </Label>
            <Input id="amount" type="number" placeholder="0.00" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Type
            </Label>
            <Select>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="income">Income</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select category" />
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
              Categorize with AI
            </Button>
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit">Save Transaction</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
