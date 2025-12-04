'use server';
/**
 * @fileOverview An AI-powered expense categorization flow.
 *
 * - categorizeExpense - A function that categorizes an expense based on its description.
 * - CategorizeExpenseInput - The input type for the categorizeExpense function.
 * - CategorizeExpenseOutput - The return type for the categorizeExpense function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeExpenseInputSchema = z.object({
  description: z.string().describe('The description of the expense transaction.'),
  previousCategories: z
    .record(z.string(), z.string())
    .optional()
    .describe('A record of previous transaction descriptions and their categories.'),
});
export type CategorizeExpenseInput = z.infer<typeof CategorizeExpenseInputSchema>;

const CategorizeExpenseOutputSchema = z.object({
  category: z.string().describe('The predicted category for the expense.'),
});
export type CategorizeExpenseOutput = z.infer<typeof CategorizeExpenseOutputSchema>;

export async function categorizeExpense(input: CategorizeExpenseInput): Promise<CategorizeExpenseOutput> {
  return categorizeExpenseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeExpensePrompt',
  input: {schema: CategorizeExpenseInputSchema},
  output: {schema: CategorizeExpenseOutputSchema},
  prompt: `You are a financial expert tasked with categorizing expenses based on their descriptions.

  Consider the following categories: ["Food", "Transportation", "Utilities", "Rent", "Entertainment", "Shopping", "Travel", "Salary", "Investments", "Other"].

  Analyze the transaction description provided and determine the most appropriate category.

  Here are some previously categorized expenses that you may use as reference:
  {{#if previousCategories}}
    {{#each previousCategories}}
      - Description: {{key}}, Category: {{this}}
    {{/each}}
  {{else}}
    No previous categories available.
  {{/if}}

  Transaction Description: {{{description}}}

  Category:`,
});

const categorizeExpenseFlow = ai.defineFlow(
  {
    name: 'categorizeExpenseFlow',
    inputSchema: CategorizeExpenseInputSchema,
    outputSchema: CategorizeExpenseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
      category: output!.category,
    };
  }
);
