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
import { CalendarIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useFirebase, useCollection, useMemoFirebase, addDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
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
} from '../ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';

interface ProjectFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    project?: Project;
}

const NINGUNO_VALUE = 'ninguno';

export function ProjectFormDialog({ open, onOpenChange, project }: ProjectFormDialogProps) {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Project['status']>('todo');
  const [customerId, setCustomerId] = useState(NINGUNO_VALUE);
  const [collaboratorId, setCollaboratorId] = useState(NINGUNO_VALUE);
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [script, setScript] = useState('');
  const [songUrl, setSongUrl] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [publishTime, setPublishTime] = useState('');

  useEffect(() => {
    if (open) {
      if (project) {
          setTitle(project.title);
          setDescription(project.description || '');
          setStatus(project.status);
          setCustomerId(project.customerId || NINGUNO_VALUE);
          setCollaboratorId(project.collaboratorId || NINGUNO_VALUE);
          setDueDate(project.dueDate ? new Date(project.dueDate) : undefined);
          setScript(project.script || '');
          setSongUrl(project.songUrl || '');
          setProjectUrl(project.projectUrl || '');
          setPublishTime(project.publishTime || '');
      } else {
          // Reset form for new project
          setTitle('');
          setDescription('');
          setStatus('todo');
          setCustomerId(NINGUNO_VALUE);
          setCollaboratorId(NINGUNO_VALUE);
          setDueDate(undefined);
          setScript('');
          setSongUrl('');
          setProjectUrl('');
          setPublishTime('');
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">
            {project ? 'Editar Proyecto' : 'Crear Nuevo Proyecto'}
          </DialogTitle>
          <DialogDescription>
            {project ? 'Actualiza los detalles del proyecto.' : 'Añade los detalles del nuevo proyecto.'}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[70vh] w-full">
            <div className="grid gap-4 py-4 pr-6">
                <div className="space-y-2">
                <Label htmlFor="title">Título del Proyecto</Label>
                <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ej: Campaña de Marketing Digital"
                />
                </div>
                <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe los objetivos y tareas del proyecto."
                    rows={4}
                />
                </div>
                <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as Project['status'])}>
                    <SelectTrigger>
                    <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="todo">Por Hacer</SelectItem>
                    <SelectItem value="in-progress">En Progreso</SelectItem>
                    <SelectItem value="done">Hecho</SelectItem>
                    </SelectContent>
                </Select>
                </div>
                <div className="space-y-2">
                <Label htmlFor="customer">Cliente</Label>
                <Select value={customerId} onValueChange={setCustomerId}>
                    <SelectTrigger>
                    <SelectValue placeholder="Asignar a un cliente (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value={NINGUNO_VALUE}>Ninguno</SelectItem>
                    {(customers || []).map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                        {c.name}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                </div>
                <div className="space-y-2">
                <Label htmlFor="collaborator">Colaborador Asignado</Label>
                <Select value={collaboratorId} onValueChange={setCollaboratorId}>
                    <SelectTrigger>
                    <SelectValue placeholder="Asignar a un colaborador (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value={NINGUNO_VALUE}>Ninguno</SelectItem>
                    {(collaborators || []).map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                        {c.name}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                </div>
                <div className="space-y-2">
                <Label htmlFor="due-date">Fecha de Entrega</Label>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant={'outline'}
                        className={cn(
                        'w-full justify-start text-left font-normal',
                        !dueDate && 'text-muted-foreground'
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dueDate ? (
                        format(dueDate, 'PPP', { locale: es })
                        ) : (
                        <span>Elige una fecha (opcional)</span>
                        )}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={dueDate}
                        onSelect={setDueDate}
                        initialFocus
                        locale={es}
                    />
                    </PopoverContent>
                </Popover>
                </div>

                <Separator className="my-2" />

                <div className="space-y-2">
                <Label htmlFor="script">Guión</Label>
                <Textarea
                    id="script"
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    placeholder="Escribe el guión para el proyecto aquí..."
                    rows={6}
                />
                </div>
                <div className="space-y-2">
                <Label htmlFor="songUrl">URL de Canción de Referencia</Label>
                <Input
                    id="songUrl"
                    value={songUrl}
                    onChange={(e) => setSongUrl(e.target.value)}
                    placeholder="https://..."
                />
                </div>
                <div className="space-y-2">
                <Label htmlFor="projectUrl">URL del Proyecto Final</Label>
                <Input
                    id="projectUrl"
                    value={projectUrl}
                    onChange={(e) => setProjectUrl(e.target.value)}
                    placeholder="https://..."
                />
                </div>
                <div className="space-y-2">
                <Label htmlFor="publishTime">Hora de Publicación</Label>
                <Input
                    id="publishTime"
                    type="time"
                    value={publishTime}
                    onChange={(e) => setPublishTime(e.target.value)}
                    placeholder="HH:MM"
                />
                </div>
            </div>
        </ScrollArea>
        <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" onClick={handleSubmit}>
              Guardar Proyecto
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}