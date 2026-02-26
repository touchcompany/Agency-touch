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
    CalendarIcon, Wand2, Save, User, Video, Send, Eye, Monitor, 
    Box, Flag, Tag, Link as LinkIcon, CalendarDays, ClipboardList, 
    Users, UserCheck, Music, Clapperboard, Sparkles
} from 'lucide-react';
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
} from '@/components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { ScriptAssistantDialog } from './script-assistant-dialog';
import { RichTextEditor } from '../ui/rich-text-editor';
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
  const [editingInstructions, setEditingInstructions] = useState('');
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [newTemplateTitle, setNewTemplateTitle] = useState('');
  
  const [priority, setPriority] = useState<Project['priority'] | undefined>();
  const [tags, setTags] = useState<string[]>([]);
  const [campaign, setCampaign] = useState('');


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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="font-headline text-2xl">
            {project?.id ? 'Editar Proyecto' : 'Crear Nuevo Proyecto'}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-full max-h-[75vh] w-full px-6">
            <div className="grid grid-cols-3 gap-8 py-4">
                
                {/* --- LEFT COLUMN --- */}
                <div className="col-span-3 lg:col-span-2 flex flex-col gap-6">
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
                        className="border-0 px-0 shadow-none focus-visible:ring-0 min-h-[60px]"
                        rows={2}
                    />

                    <Separator />

                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                             <Label htmlFor="script" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Guion del Video</Label>
                             <Button variant="ghost" size="sm" onClick={() => setIsAssistantOpen(true)} className="text-primary hover:bg-primary/10">
                                <Wand2 className="mr-2 h-4 w-4" />
                                Asistente IA
                             </Button>
                        </div>
                        <RichTextEditor 
                          value={script}
                          onChange={setScript}
                          placeholder="Escribe el guion detallado aquí..."
                          className="min-h-[300px]"
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
                                <AlertDialogTitle>Guardar Plantilla de Guion</AlertDialogTitle>
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
                                        placeholder="Ej: Guion para Reels de Producto"
                                    />
                                </div>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={handleSaveTemplate}>Guardar Plantilla</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>

                    {/* --- EDICIÓN Y ENTREGA SECTION --- */}
                    <div className="space-y-4 pt-4">
                        <div className="flex items-center gap-2 text-xl font-bold">
                            <Video className="h-6 w-6" />
                            <h2>Edición y Entrega</h2>
                        </div>
                        <Separator />
                        
                        {/* Instrucciones para Editor */}
                        <div className="rounded-xl border border-blue-100 bg-blue-50/30 p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="editing-instructions" className="text-xs font-bold uppercase tracking-wider text-blue-800">
                                    Instrucciones para Editor
                                </Label>
                                <Button variant="ghost" size="sm" className="text-blue-700 hover:text-blue-900 hover:bg-blue-100/50">
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Sugerir Estilo
                                </Button>
                            </div>
                            <Textarea
                                id="editing-instructions"
                                value={editingInstructions}
                                onChange={(e) => setEditingInstructions(e.target.value)}
                                placeholder="Instrucciones manuales o generadas por IA..."
                                className="border-0 bg-transparent p-0 text-blue-600/80 placeholder:text-blue-300 shadow-none focus-visible:ring-0 min-h-[100px]"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Video Final */}
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

                            {/* Música Usada */}
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

                {/* --- RIGHT COLUMN --- */}
                <div className="col-span-3 lg:col-span-1 space-y-4 bg-muted/20 p-4 rounded-xl">
                    <div className="space-y-2">
                        <Label htmlFor="status" className="flex items-center gap-2 text-muted-foreground"><ClipboardList className="h-4 w-4" />Estado</Label>
                        <Select value={status} onValueChange={(v) => setStatus(v as Project['status'])}>
                            <SelectTrigger className="bg-background"><SelectValue placeholder="Selecciona un estado" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pending">Idea</SelectItem>
                                <SelectItem value="in-progress">Edición</SelectItem>
                                <SelectItem value="customer-review">Para publicar</SelectItem>
                                <SelectItem value="completed">Publicada</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="customer" className="flex items-center gap-2 text-muted-foreground"><Users className="h-4 w-4" />Cliente</Label>
                        <Select value={customerId} onValueChange={setCustomerId}>
                            <SelectTrigger className="bg-background"><SelectValue placeholder="Asignar un cliente" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value={NINGUNO_VALUE}>Ninguno</SelectItem>
                                {(customers || []).map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="collaborator" className="flex items-center gap-2 text-muted-foreground"><UserCheck className="h-4 w-4" />Editor</Label>
                        <Select value={collaboratorId} onValueChange={setCollaboratorId}>
                            <SelectTrigger className="bg-background"><SelectValue placeholder="Asignar un editor" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value={NINGUNO_VALUE}>Ninguno</SelectItem>
                                {(collaborators || []).map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="due-date" className="flex items-center gap-2 text-muted-foreground"><CalendarDays className="h-4 w-4" />Fecha de Entrega</Label>
                         <Popover>
                            <PopoverTrigger asChild>
                                <Button variant={'outline'} className={cn('w-full justify-start text-left font-normal bg-background',!dueDate && 'text-muted-foreground')}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dueDate ? format(dueDate, 'PPP', { locale: es }) : (<span>Elige una fecha</span>)}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start" disablePortal>
                                <Calendar 
                                    mode="single" 
                                    selected={dueDate} 
                                    onSelect={setDueDate}
                                    initialFocus 
                                    locale={es}
                                    captionLayout="dropdown-buttons"
                                    fromYear={new Date().getFullYear() - 5}
                                    toYear={new Date().getFullYear() + 5}
                                    footer={
                                    <div className="flex justify-between p-2 pt-4 border-t">
                                        <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setDueDate(undefined)}
                                        >
                                        Borrar
                                        </Button>
                                        <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setDueDate(new Date())}
                                        >
                                        Hoy
                                        </Button>
                                    </div>
                                    }
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="priority" className="flex items-center gap-2 text-muted-foreground"><Flag className="h-4 w-4" />Prioridad</Label>
                        <Select value={priority} onValueChange={(v) => setPriority(v as Project['priority'])}>
                            <SelectTrigger id="priority" className="bg-background"><SelectValue placeholder="Establecer prioridad" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">Baja</SelectItem>
                                <SelectItem value="medium">Media</SelectItem>
                                <SelectItem value="high">Alta</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                        <Label htmlFor="campaign" className="flex items-center gap-2 text-muted-foreground">Campaña</Label>
                        <Input id="campaign" value={campaign} onChange={(e) => setCampaign(e.target.value)} placeholder="Ej: Lanzamiento Verano" className="bg-background" />
                    </div>
                    
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-muted-foreground"><Tag className="h-4 w-4" />Lista de Planos</Label>
                         <div className="grid grid-cols-2 gap-2">
                            {planoTagsConfig.map(tag => (
                                <Button 
                                    key={tag.id} 
                                    variant="ghost"
                                    onClick={() => handleTagToggle(tag.id)}
                                    type="button" 
                                    className={cn(
                                        "h-auto flex-row justify-start p-3 gap-3 border-none transition-colors duration-200 rounded-xl",
                                        tags.includes(tag.id) 
                                            ? "bg-blue-500 text-white shadow-none" 
                                            : "bg-muted/50 text-muted-foreground hover:bg-muted"
                                    )}
                                >
                                    <tag.icon className={cn("h-4 w-4", tags.includes(tag.id) ? "text-white" : "text-muted-foreground")} />
                                    <span className={cn("text-[10px] font-medium", tags.includes(tag.id) ? "text-white" : "text-muted-foreground")}>{tag.label}</span>
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </ScrollArea>
        <DialogFooter className="p-6 border-t bg-background">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" onClick={handleSubmit} className="px-8">
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
