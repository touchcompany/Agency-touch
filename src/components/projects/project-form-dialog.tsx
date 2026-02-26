'use client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    CalendarIcon, Wand2, Video, ClipboardList, 
    Users, UserCheck, Music, Clapperboard, Sparkles,
    Flag, CalendarDays
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useFirebase, useCollection, useMemoFirebase, addDocumentNonBlocking, setDocumentNonBlocking, useUser } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { Customer, Collaborator, Project } from '@/lib/types';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { ScriptAssistantDialog } from './script-assistant-dialog';

interface ProjectFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    project?: Partial<Project>;
}

const NINGUNO_VALUE = 'ninguno';

export function ProjectFormDialog({ open, onOpenChange, project }: ProjectFormDialogProps) {
  const { firestore, user } = useFirebase();
  const { appUser } = useUser();
  const { toast } = useToast();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Project['status']>('pending');
  const [customerId, setCustomerId] = useState(NINGUNO_VALUE);
  const [collaboratorId, setCollaboratorId] = useState(NINGUNO_VALUE);
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [script, setScript] = useState('');
  const [songUrl, setSongUrl] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [publishTime, setPublishTime] = useState('');
  const [editingInstructions, setEditingInstructions] = useState('');
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  
  const [priority, setPriority] = useState<Project['priority'] | undefined>();
  const [tags, setTags] = useState<string[]>([]);
  const [campaign, setCampaign] = useState('');

  const isCollaborator = appUser?.role === 'collaborator';

  useEffect(() => {
    if (open) {
      if (project && project.id) {
          setTitle(project.title || '');
          setDescription(project.description || '');
          setStatus(project.status || 'pending');
          setCustomerId(project.customerId || NINGUNO_VALUE);
          setCollaboratorId(project.collaboratorId || NINGUNO_VALUE);
          setDueDate(project.dueDate ? new Date(project.dueDate) : undefined);
          setScript(project.script || '');
          setSongUrl(project.songUrl || '');
          setProjectUrl(project.projectUrl || '');
          setPublishTime(project.publishTime || '');
          setPriority(project.priority);
          setTags(project.tags || []);
          setCampaign(project.campaign || '');
          setEditingInstructions(project.editingInstructions || '');
      } else {
          setTitle('');
          setDescription('');
          setStatus(project?.status || 'pending');
          setCustomerId(NINGUNO_VALUE);
          setCollaboratorId(NINGUNO_VALUE);
          setDueDate(undefined);
          setScript('');
          setSongUrl('');
          setProjectUrl('');
          setPublishTime('');
          setPriority(undefined);
          setTags([]);
          setCampaign('');
          setEditingInstructions('');
      }
    }
  }, [project, open]);


  const customersQuery = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'customers') : null),
    [firestore, user]
  );
  const { data: customers } = useCollection<Customer>(customersQuery);

  const collaboratorsQuery = useMemoFirebase(
    () =>
      user ? collection(firestore, 'users', user.uid, 'collaborators') : null,
    [firestore, user]
  );
  const { data: collaborators } = useCollection<Collaborator>(
    collaboratorsQuery
  );

  const handleSubmit = async () => {
    if (!firestore || !user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo conectar a la base de datos.',
      });
      return;
    }

    if (!title) {
      toast({
        variant: 'destructive',
        title: 'Campo requerido',
        description: 'El título del proyecto es obligatorio.',
      });
      return;
    }

    const projectData = {
      userId: user.uid,
      title,
      description,
      status,
      customerId: customerId === NINGUNO_VALUE ? null : customerId,
      collaboratorId: collaboratorId === NINGUNO_VALUE ? null : collaboratorId,
      dueDate: dueDate ? dueDate.toISOString() : null,
      script,
      songUrl,
      projectUrl,
      publishTime,
      priority: priority || null,
      tags: tags,
      campaign,
      editingInstructions,
    };

    if (project?.id) {
        const projectRef = doc(firestore, 'users', user.uid, 'projects', project.id);
        await setDocumentNonBlocking(projectRef, projectData, { merge: true });
        toast({ title: 'Proyecto Actualizado', description: `El proyecto "${title}" ha sido actualizado.` });

    } else {
        const projectsRef = collection(firestore, 'users', user.uid, 'projects');
        await addDocumentNonBlocking(projectsRef, projectData);
        toast({ title: 'Proyecto Creado', description: `El proyecto "${title}" ha sido añadido.` });
    }

    onOpenChange(false);
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0 flex flex-col">
        <DialogHeader className="p-6 pb-4 flex-shrink-0 border-b">
          <DialogTitle className="font-headline text-2xl">
            {project?.id ? 'Detalles del Proyecto' : 'Crear Nuevo Proyecto'}
          </DialogTitle>
          {isCollaborator && (
            <DialogDescription>Como colaborador, puedes actualizar el guion, el estado y los enlaces de entrega.</DialogDescription>
          )}
        </DialogHeader>
        
        <ScrollArea className="flex-1 w-full px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-6">
                
                {/* --- COLUMNA IZQUIERDA --- */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="space-y-4">
                        <Label htmlFor="title" className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Título del Proyecto</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ej: Lanzamiento Producto Nuevo"
                            disabled={isCollaborator}
                            className="text-lg font-bold h-12"
                        />
                    </div>
                    <div className="space-y-4">
                        <Label htmlFor="description" className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Descripción / Objetivo</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Define el objetivo del video..."
                            disabled={isCollaborator}
                            rows={3}
                        />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                             <Label htmlFor="script" className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Guion Detallado</Label>
                             <Button variant="ghost" size="sm" onClick={() => setIsAssistantOpen(true)} className="text-primary hover:bg-primary/10">
                                <Wand2 className="mr-2 h-4 w-4" />
                                Asistente IA
                             </Button>
                        </div>
                        <Textarea
                            id="script"
                            value={script}
                            onChange={(e) => setScript(e.target.value)}
                            placeholder="Escribe el guion paso a paso aquí..."
                            className="min-h-[200px] font-mono text-sm leading-relaxed"
                        />
                    </div>

                    <div className="space-y-4 pt-4">
                        <div className="flex items-center gap-2 text-xl font-bold">
                            <Video className="h-6 w-6" />
                            <h2>Edición y Entrega</h2>
                        </div>
                        <Separator />
                        
                        <div className="rounded-xl border border-blue-100 bg-blue-50/30 p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="editing-instructions" className="text-xs font-bold uppercase tracking-wider text-blue-800">
                                    Instrucciones para Editor
                                </Label>
                                {!isCollaborator && (
                                    <Button variant="ghost" size="sm" className="text-blue-700 hover:text-blue-900 hover:bg-blue-100/50">
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        Sugerir Estilo
                                    </Button>
                                )}
                            </div>
                            <Textarea
                                id="editing-instructions"
                                value={editingInstructions}
                                onChange={(e) => setEditingInstructions(e.target.value)}
                                placeholder="Añade instrucciones de estilo, transiciones o ritmo..."
                                className="border-0 bg-transparent p-0 text-blue-600/80 placeholder:text-blue-300 shadow-none focus-visible:ring-0 min-h-[80px]"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="rounded-xl bg-muted/30 p-6 space-y-4 border border-transparent hover:border-muted-foreground/20 transition-all">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Video Final (Drive/Dropbox)
                                </Label>
                                <div className="flex items-center gap-3">
                                    <Clapperboard className="h-5 w-5 text-muted-foreground" />
                                    <Input
                                        value={projectUrl}
                                        onChange={(e) => setProjectUrl(e.target.value)}
                                        placeholder="Pegar enlace..."
                                        className="border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 h-auto"
                                    />
                                </div>
                            </div>

                            <div className="rounded-xl bg-muted/30 p-6 space-y-4 border border-transparent hover:border-muted-foreground/20 transition-all">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Música Usada
                                </Label>
                                <div className="flex items-center gap-3">
                                    <Music className="h-5 w-5 text-muted-foreground" />
                                    <Input
                                        value={songUrl}
                                        onChange={(e) => setSongUrl(e.target.value)}
                                        placeholder="Pegar enlace canción..."
                                        className="border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 h-auto"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* --- COLUMNA DERECHA --- */}
                <div className="space-y-6">
                    <div className="space-y-4 bg-muted/50 p-4 rounded-xl">
                        <div className="space-y-2">
                            <Label htmlFor="status" className="flex items-center gap-2"><ClipboardList className="h-4 w-4" />Estado</Label>
                            <Select value={status} onValueChange={(v) => setStatus(v as Project['status'])}>
                                <SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Idea</SelectItem>
                                    <SelectItem value="in-progress">Edición</SelectItem>
                                    <SelectItem value="customer-review">Para publicar</SelectItem>
                                    <SelectItem value="completed">Publicado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="customer" className="flex items-center gap-2"><Users className="h-4 w-4" />Cliente</Label>
                            <Select value={customerId} onValueChange={setCustomerId} disabled={isCollaborator}>
                                <SelectTrigger><SelectValue placeholder="Asignar Cliente" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={NINGUNO_VALUE}>Ninguno</SelectItem>
                                    {(customers || []).map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="collaborator" className="flex items-center gap-2"><UserCheck className="h-4 w-4" />Responsable</Label>
                            <Select value={collaboratorId} onValueChange={setCollaboratorId} disabled={isCollaborator}>
                                <SelectTrigger><SelectValue placeholder="Asignar Editor" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={NINGUNO_VALUE}>Ninguno</SelectItem>
                                    {(collaborators || []).map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="due-date" className="flex items-center gap-2"><CalendarDays className="h-4 w-4" />Fecha de Entrega</Label>
                             <Popover>
                                <PopoverTrigger asChild disabled={isCollaborator}>
                                    <Button variant={'outline'} className={cn('w-full justify-start text-left font-normal',!dueDate && 'text-muted-foreground')} disabled={isCollaborator}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dueDate ? format(dueDate, 'PPP', { locale: es }) : (<span>Elige una fecha</span>)}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start" disablePortal>
                                    <Calendar 
                                        mode="single" 
                                        selected={dueDate} 
                                        onSelect={(date) => {
                                            setDueDate(date);
                                        }}
                                        initialFocus 
                                        locale={es}
                                        captionLayout="dropdown-buttons"
                                        fromYear={new Date().getFullYear() - 5}
                                        toYear={new Date().getFullYear() + 5}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    
                    <div className="space-y-4 bg-muted/20 p-4 rounded-xl">
                         <div className="space-y-2">
                            <Label htmlFor="priority" className="flex items-center gap-2"><Flag className="h-4 w-4" />Prioridad</Label>
                            <Select value={priority} onValueChange={(v) => setPriority(v as Project['priority'])} disabled={isCollaborator}>
                                <SelectTrigger id="priority"><SelectValue placeholder="Prioridad" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Baja</SelectItem>
                                    <SelectItem value="medium">Media</SelectItem>
                                    <SelectItem value="high">Alta</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="campaign" className="flex items-center gap-2">Campaña</Label>
                            <Input id="campaign" value={campaign} onChange={(e) => setCampaign(e.target.value)} placeholder="Ej: Verano 2024" disabled={isCollaborator} />
                        </div>
                    </div>
                </div>
            </div>
        </ScrollArea>

        <DialogFooter className="p-6 border-t flex-shrink-0 bg-background">
            <div className="flex w-full items-center justify-end gap-3">
                <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
                <Button type="submit" onClick={handleSubmit} className="px-8 font-bold">
                  {project?.id ? 'Guardar Cambios' : 'Crear Proyecto'}
                </Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    <ScriptAssistantDialog 
        open={isAssistantOpen}
        onOpenChange={setIsAssistantOpen}
        projectTitle={title}
        projectDescription={description}
        onScriptGenerated={setScript}
    />
    </>
  );
}
