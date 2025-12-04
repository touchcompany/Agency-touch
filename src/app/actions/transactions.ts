"use server";

import { categorizeExpense } from "@/ai/flows/ai-expense-categorization";

export async function categorizeExpenseAction(description: string): Promise<{ success: boolean; category?: string; error?: string }> {
  if (!description) {
    return { success: false, error: "Description cannot be empty." };
  }

  try {
    const result = await categorizeExpense({ description });
    return { success: true, category: result.category };
  } catch (error) {
    console.error("AI Categorization Error:", error);
    return { success: false, error: "Failed to categorize expense with AI." };
  }
}
