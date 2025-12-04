"use server";

import { categorizeExpense } from "@/ai/flows/ai-expense-categorization";

export async function categorizeExpenseAction(description: string): Promise<{ success: boolean; category?: string; error?: string }> {
  if (!description) {
    return { success: false, error: "La descripción no puede estar vacía." };
  }

  try {
    const result = await categorizeExpense({ description });
    return { success: true, category: result.category };
  } catch (error) {
    console.error("Error de categorización de IA:", error);
    return { success: false, error: "No se pudo categorizar el gasto con IA." };
  }
}
