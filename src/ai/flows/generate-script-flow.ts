'use server';
/**
 * @fileOverview An AI-powered script generation flow.
 *
 * - generateScript - A function that generates a script based on a prompt.
 * - GenerateScriptInput - The input type for the generateScript function.
 * - GenerateScriptOutput - The return type for the generateScript function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateScriptInputSchema = z.object({
  prompt: z.string().describe('La instrucción o necesidad para la cual generar el guión.'),
});
export type GenerateScriptInput = z.infer<typeof GenerateScriptInputSchema>;

const GenerateScriptOutputSchema = z.object({
  script: z.string().describe('El guión generado por la IA.'),
});
export type GenerateScriptOutput = z.infer<typeof GenerateScriptOutputSchema>;

export async function generateScript(input: GenerateScriptInput): Promise<GenerateScriptOutput> {
  return generateScriptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateScriptPrompt',
  input: {schema: GenerateScriptInputSchema},
  output: {schema: GenerateScriptOutputSchema},
  prompt: `Eres un experto en marketing digital y creación de contenido viral para redes sociales como TikTok e Instagram.

Tu tarea es generar un guión detallado basado en la siguiente solicitud. El guión debe ser creativo, atractivo y optimizado para la plataforma de destino si se menciona.

Instrucción del usuario:
"{{{prompt}}}"

Formato del guión:
- **Título:** Un título pegadizo para el video.
- **Escena 1:** Descripción visual y diálogo.
- **Escena 2:** Descripción visual y diálogo.
- ... (y así sucesivamente)
- **Llamado a la acción (CTA):** Qué debe hacer el espectador al final.
- **Sugerencias de audio/música:**

Genera el guión ahora.`,
});

const generateScriptFlow = ai.defineFlow(
  {
    name: 'generateScriptFlow',
    inputSchema: GenerateScriptInputSchema,
    outputSchema: GenerateScriptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
      script: output!.script,
    };
  }
);
