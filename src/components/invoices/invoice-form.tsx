"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Customer, Invoice, InvoiceItem } from "@/lib/types";
import { CalendarIcon, Plus, Trash, Upload, Download, Send, MessageCircle } from "lucide-react";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import { cn, formatCurrency } from "@/lib/utils";
import { Separator } from "../ui/separator";

type InvoiceFormProps = {
  customers: Customer[];
  invoice?: Invoice;
};

export function InvoiceForm({ customers, invoice }: InvoiceFormProps) {
  const [items, setItems] = useState<Partial<InvoiceItem>[]>(invoice?.items || [{ description: "", quantity: 1, price: 0 }]);
  const [issueDate, setIssueDate] = useState<Date | undefined>(invoice ? new Date(invoice.issueDate) : new Date());
  const [dueDate, setDueDate] = useState<Date | undefined>(invoice ? new Date(invoice.dueDate) : new Date(new Date().setDate(new Date().getDate() + 30)));

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, price: 0 }]);
  };
  
  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };
  
  const subtotal = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
  const tax = subtotal * 0.1; // Example 10% tax
  const total = subtotal + tax;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <form className="grid gap-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Customer & Dates</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="customer">Customer</Label>
              <Select defaultValue={invoice?.customer.id}>
                <SelectTrigger id="customer">
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
                <Label>Company Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 flex-shrink-0 rounded-md border flex items-center justify-center bg-muted">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <Button variant="outline" size="sm">Upload Logo</Button>
                </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="issue-date">Issue Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !issueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {issueDate ? format(issueDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={issueDate} onSelect={setIssueDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="due-date">Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Invoice Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 items-center gap-2">
                  <Input
                    placeholder="Item description"
                    className="col-span-6"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Qty"
                    className="col-span-2"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value, 10))}
                  />
                  <Input
                    type="number"
                    placeholder="Price"
                    className="col-span-3"
                    value={item.price}
                    onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value))}
                  />
                  <Button variant="ghost" size="icon" onClick={() => removeItem(index)} className="col-span-1">
                    <Trash className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={addItem} className="mt-4">
              <Plus className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </CardContent>
        </Card>
      </form>
      <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                </div>
                 <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (10%)</span>
                    <span>{formatCurrency(tax)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                </div>
            </CardContent>
             <CardFooter className="flex-col gap-2 items-stretch">
                <Button>{invoice ? "Save Changes" : "Create Invoice"}</Button>
             </CardFooter>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
                <Button variant="outline"><Download className="mr-2 h-4 w-4" /> PDF</Button>
                <Button variant="outline"><Send className="mr-2 h-4 w-4" /> Email</Button>
                <Button variant="outline" className="col-span-2"><MessageCircle className="mr-2 h-4 w-4" /> WhatsApp</Button>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
