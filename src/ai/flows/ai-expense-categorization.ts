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
  description: z.string().describe('La descripción de la transacción de gasto.'),
  previousCategories: z
    .record(z.string(), z.string())
    .optional()
    .describe('Un registro de descripciones de transacciones anteriores y sus categorías.'),
});
export type CategorizeExpenseInput = z.infer<typeof CategorizeExpenseInputSchema>;

const CategorizeExpenseOutputSchema = z.object({
  category: z.string().describe('La categoría predicha para el gasto.'),
});
export type CategorizeExpenseOutput = z.infer<typeof CategorizeExpenseOutputSchema>;

export async function categorizeExpense(input: CategorizeExpenseInput): Promise<CategorizeExpenseOutput> {
  return categorizeExpenseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeExpensePrompt',
  input: {schema: CategorizeExpenseInputSchema},
  output: {schema: CategorizeExpenseOutputSchema},
  prompt: `Eres un experto financiero encargado de categorizar gastos según sus descripciones.

  Considera las siguientes categorías: ["Comida", "Transporte", "Servicios", "Alquiler", "Entretenimiento", "Compras", "Viajes", "Salario", "Inversiones", "Otro"].

  Analiza la descripción de la transacción proporcionada y determina la categoría más apropiada.

  Aquí hay algunos gastos categorizados previamente que puedes usar como referencia:
  {{#if previousCategories}}
    {{#each previousCategories}}
      - Descripción: {{key}}, Categoría: {{this}}
    {{/each}}
  {{else}}
    No hay categorías anteriores disponibles.
  {{/if}}

  Descripción de la transacción: {{{description}}}

  Categoría:`,
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
