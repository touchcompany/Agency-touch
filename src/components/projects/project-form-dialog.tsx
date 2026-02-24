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
import { CalendarIcon, Wand2, Save, User, Video, Send, Eye, Monitor, Box, Flag, Tag, Link as LinkIcon, CalendarDays, ClipboardList, Users, UserCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useFirebase, useCollection, useMemoFirebase, addDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { Customer, Collaborator, Project, ScriptTemplate } from '@/lib/types';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { ScriptAssistantDialog } from './script-assistant-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from '../ui/badge';


interface ProjectFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    project?: Partial<Project>;
}

const NINGUNO_VALUE = 'ninguno';

const planoTagsConfig = [
    { id: 'Talking Head', label: 'Talking Head', icon: User },
    { id: 'B-Roll', label: 'B-Roll', icon: Video },
    { id: 'Drone', label: 'Drone', icon: Send },
    { id: 'POV', label: 'POV', icon: Eye },
    { id: 'Pantalla', label: 'Pantalla', icon: Monitor },
    { id: 'Producto', label: 'Producto', icon: Box },
];

export function ProjectFormDialog({ open, onOpenChange, project }: ProjectFormDialogProps) {
  const { firestore, user } = useFirebase();
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
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [newTemplateTitle, setNewTemplateTitle] = useState('');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  
  const [priority, setPriority] = useState<Project['priority'] | undefined>();
  const [tags, setTags] = useState<string[]>([]);
  const [campaign, setCampaign] = useState('');


  useEffect(() => {
    if (open) {
      if (project && project.id) { // Check for project.id to confirm it's an existing project
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
      } else {
          // Reset form for new project, pre-filling status if provided
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
  
  const handleSaveTemplate = () => {
    if (!firestore || !user) return;
    if (!newTemplateTitle || !script) {
        toast({ title: "Faltan datos", description: "El título de la plantilla y el contenido del guion no pueden estar vacíos.", variant: "destructive"});
        return;
    }

    const templatesRef = collection(firestore, 'users', user.uid, 'scriptTemplates');
    addDocumentNonBlocking(templatesRef, {
        userId: user.uid,
        title: newTemplateTitle,
        content: script,
    });
    toast({ title: "Plantilla guardada", description: "Tu guion ha sido guardado como una plantilla." });
    setNewTemplateTitle('');
  };

  const handleTagToggle = (tag: string) => {
    setTags(prev => 
        prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

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
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">
            {project?.id ? 'Editar Proyecto' : 'Crear Nuevo Proyecto'}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[75vh] w-full">
            <div className="grid grid-cols-3 gap-8 py-4 pr-6">
                
                {/* --- LEFT COLUMN --- */}
                <div className="col-span-2 flex flex-col gap-6">
                    <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Nueva Idea Sin Título"
                        className="h-12 border-0 px-0 text-2xl font-bold shadow-none focus-visible:ring-0"
                    />
                    <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Añade una descripción detallada del proyecto..."
                        className="border-0 px-0 shadow-none focus-visible:ring-0"
                        rows={3}
                    />

                    <Separator />

                    <div>
                        <div className="flex items-center justify-between mb-2">
                             <Label htmlFor="script" className="font-semibold">Guión</Label>
                             <Button variant="ghost" size="sm" onClick={() => setIsAssistantOpen(true)}>
                                <Wand2 className="mr-2 h-4 w-4" />
                                Asistente IA
                             </Button>
                        </div>
                        <Textarea
                            id="script"
                            value={script}
                            onChange={(e) => setScript(e.target.value)}
                            placeholder="Escribe el guión para el proyecto aquí o géneralo con IA..."
                            rows={12}
                        />
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" disabled={!script} className="mt-2">
                                    <Save className="mr-2 h-4 w-4" />
                                    Guardar como plantilla
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Guardar Plantilla de Guión</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Dale un nombre a esta plantilla para reutilizarla en otros proyectos.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="py-4">
                                    <Label htmlFor="template-name">Nombre de la Plantilla</Label>
                                    <Input 
                                        id="template-name"
                                        value={newTemplateTitle}
                                        onChange={(e) => setNewTemplateTitle(e.target.value)}
                                        placeholder="Ej: Guión para Reels de Producto"
                                    />
                                </div>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={handleSaveTemplate}>Guardar Plantilla</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>

                </div>

                {/* --- RIGHT COLUMN --- */}
                <div className="col-span-1 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="status" className="flex items-center gap-2 text-muted-foreground"><ClipboardList className="h-4 w-4" />Estado</Label>
                        <Select value={status} onValueChange={(v) => setStatus(v as Project['status'])}>
                            <SelectTrigger><SelectValue placeholder="Selecciona un estado" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pending">Pendiente</SelectItem>
                                <SelectItem value="in-progress">En Progreso</SelectItem>
                                <SelectItem value="customer-review">Revisión Cliente</SelectItem>
                                <SelectItem value="completed">Completada</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="customer" className="flex items-center gap-2 text-muted-foreground"><Users className="h-4 w-4" />Cliente</Label>
                        <Select value={customerId} onValueChange={setCustomerId}>
                            <SelectTrigger><SelectValue placeholder="Asignar un cliente" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value={NINGUNO_VALUE}>Ninguno</SelectItem>
                                {(customers || []).map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="collaborator" className="flex items-center gap-2 text-muted-foreground"><UserCheck className="h-4 w-4" />Editor</Label>
                        <Select value={collaboratorId} onValueChange={setCollaboratorId}>
                            <SelectTrigger><SelectValue placeholder="Asignar un editor" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value={NINGUNO_VALUE}>Ninguno</SelectItem>
                                {(collaborators || []).map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="due-date" className="flex items-center gap-2 text-muted-foreground"><CalendarDays className="h-4 w-4" />Fecha de Entrega</Label>
                        <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                            <PopoverTrigger asChild>
                                <Button variant={'outline'} className={cn('w-full justify-start text-left font-normal',!dueDate && 'text-muted-foreground')}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dueDate ? format(dueDate, 'PPP', { locale: es }) : (<span>Elige una fecha</span>)}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar 
                                    mode="single" 
                                    selected={dueDate} 
                                    onSelect={(date) => {
                                        setDueDate(date);
                                        setIsDatePickerOpen(false);
                                    }} 
                                    initialFocus 
                                    locale={es}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="priority" className="flex items-center gap-2 text-muted-foreground"><Flag className="h-4 w-4" />Prioridad</Label>
                        <Select value={priority} onValueChange={(v) => setPriority(v as Project['priority'])}>
                            <SelectTrigger id="priority"><SelectValue placeholder="Establecer prioridad" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">Baja</SelectItem>
                                <SelectItem value="medium">Media</SelectItem>
                                <SelectItem value="high">Alta</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                        <Label htmlFor="songUrl" className="flex items-center gap-2 text-muted-foreground"><LinkIcon className="h-4 w-4" />Referencia (URL)</Label>
                        <Input id="songUrl" value={songUrl} onChange={(e) => setSongUrl(e.target.value)} placeholder="https://tiktok.com/..."/>
                    </div>
                    
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-muted-foreground"><Tag className="h-4 w-4" />Lista de Planos</Label>
                         <div className="grid grid-cols-3 gap-2">
                            {planoTagsConfig.map(tag => (
                                <Button 
                                    key={tag.id} 
                                    variant={tags.includes(tag.id) ? 'secondary' : 'outline'}
                                    onClick={() => handleTagToggle(tag.id)}
                                    type="button" 
                                    className="h-auto flex-col p-2 gap-1"
                                >
                                    <tag.icon className="h-5 w-5" />
                                    <span className="text-xs">{tag.label}</span>
                                </Button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2 hidden">
                        <Label htmlFor="campaign">Campaña</Label>
                        <Input id="campaign" value={campaign} onChange={(e) => setCampaign(e.target.value)} placeholder="Ej: Lanzamiento Verano 2024"/>
                    </div>
                     <div className="space-y-2 hidden">
                        <Label htmlFor="projectUrl">URL del Proyecto Final</Label>
                        <Input id="projectUrl" value={projectUrl} onChange={(e) => setProjectUrl(e.target.value)} placeholder="https://..."/>
                    </div>
                    <div className="space-y-2 hidden">
                        <Label htmlFor="publishTime">Hora de Publicación</Label>
                        <Input id="publishTime" type="time" value={publishTime} onChange={(e) => setPublishTime(e.target.value)} placeholder="HH:MM"/>
                    </div>
                </div>
            </div>
        </ScrollArea>
        <DialogFooter className="pr-6">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" onClick={handleSubmit}>
              Guardar Proyecto
            </Button>
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
