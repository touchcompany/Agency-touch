'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '../ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Wand2, Loader2, Sparkles } from 'lucide-react';
import { generateScript } from '@/ai/flows/generate-script-flow';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { ScriptTemplate } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';

interface ScriptAssistantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectTitle: string;
  projectDescription?: string;
  onScriptGenerated: (script: string) => void;
}

export function ScriptAssistantDialog({
  open,
  onOpenChange,
  projectTitle,
  projectDescription,
  onScriptGenerated,
}: ScriptAssistantDialogProps) {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const templatesQuery = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'scriptTemplates') : null),
    [firestore, user]
  );
  const { data: templates } = useCollection<ScriptTemplate>(templatesQuery);

  useState(() => {
    if (open) {
      setPrompt(`Genera un guión para un video corto (Reel/TikTok) titulado "${projectTitle}". La idea principal es: "${projectDescription || 'No hay descripción adicional'}".`);
    }
  });

  const handleGenerateScript = async () => {
    if (!prompt) {
      toast({
        variant: 'destructive',
        title: 'El prompt no puede estar vacío',
      });
      return;
    }
    setIsLoading(true);
    try {
      const result = await generateScript({ prompt });
      onScriptGenerated(result.script);
      toast({
        title: 'Guión generado',
        description: 'La IA ha creado una propuesta de guión.',
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error generating script:', error);
      toast({
        variant: 'destructive',
        title: 'Error de la IA',
        description: 'No se pudo generar el guión.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTemplateSelect = (templateId: string) => {
    const template = templates?.find(t => t.id === templateId);
    if(template) {
        onScriptGenerated(template.content);
        toast({ title: 'Plantilla aplicada' });
        onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-headline text-2xl">
            <Sparkles className="h-6 w-6 text-primary" />
            Asistente de Guion IA
          </DialogTitle>
          <DialogDescription>
            Usa una plantilla o describe qué guion necesitas que la IA genere para ti.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
           <div className="space-y-2">
            <Label htmlFor="template">Usar Plantilla</Label>
             <Select onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                    <SelectValue placeholder="Selecciona una plantilla guardada" />
                </SelectTrigger>
                <SelectContent>
                    {(templates || []).map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                        {template.title}
                    </SelectItem>
                    ))}
                </SelectContent>
             </Select>
          </div>
          
          <Separator className="my-2" />

          <div className="space-y-2">
            <Label htmlFor="prompt">O Genera con IA</Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ej: Un guión para un reel de 15 segundos sobre la importancia de la gestión financiera..."
              rows={5}
            />
             <p className="text-xs text-muted-foreground">
                Sé lo más descriptivo posible para obtener mejores resultados.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleGenerateScript} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            Generar Guión
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
