'use client';
import type { Project, Customer, Collaborator } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '../ui/separator';
import { cn } from '@/lib/utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '../ui/badge';


interface ProjectCardProps {
  project: Project;
  customer?: Customer;
  collaborator?: Collaborator;
  onClick?: () => void;
}

const statusDisplay: Record<Project['status'], { text: string; className: string }> = {
  pending: { text: 'PENDIENTE', className: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800' },
  'in-progress': { text: 'EN PROGRESO', className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800' },
  'customer-review': { text: 'REVISIÓN', className: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-800' },
  completed: { text: 'APROBADO', className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800' },
};


export function ProjectCard({
  project,
  collaborator,
  onClick
}: ProjectCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({id: project.id});

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 'auto',
  };
  
  const displayStatus = statusDisplay[project.status] || statusDisplay.pending;

  // Helper to check if content is present but ignore HTML tags if empty-ish
  const hasScript = project.script && project.script.replace(/<[^>]*>/g, '').trim().length > 0;

  return (
    <div 
        ref={setNodeRef} 
        style={style}
        className={cn("w-full touch-none", isDragging ? 'opacity-50' : 'opacity-100')}
        onClick={onClick}
    >
        <Card 
            {...attributes} 
            {...listeners} 
            className={cn(
            "bg-card hover:bg-card-hover/80 transition-shadow w-full cursor-grab",
            isDragging && "shadow-lg ring-2 ring-primary"
            )}
        >
            <CardHeader 
                className="p-4 flex flex-row items-center justify-between space-y-0"
            >
                <Badge variant="outline" className={cn("text-xs font-bold tracking-wider", displayStatus.className)}>{displayStatus.text}</Badge>
                <TooltipProvider>
                    {collaborator ? (
                        <Tooltip>
                            <TooltipTrigger>
                                <Avatar className="h-7 w-7 border-2 border-background">
                                    <AvatarImage src={`https://picsum.photos/seed/${collaborator.id}/100`} data-ai-hint="person" />
                                    <AvatarFallback>{collaborator.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Asignado a: {collaborator.name}</p>
                            </TooltipContent>
                        </Tooltip>
                    ) : (
                        <div className="h-7 w-7 rounded-full bg-muted border-2 border-background"></div>
                    )}
                </TooltipProvider>
            </CardHeader>

            <CardContent className="px-4 pb-4 pt-2">
                <CardTitle className="text-lg font-semibold leading-tight mb-4">{project.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{hasScript ? 'Guion listo' : 'Sin guion...'}</p>
                <Separator className="my-3" />
                <p className="text-sm text-muted-foreground">{project.tags && project.tags.length > 0 ? `Planos: ${project.tags.join(', ')}` : 'Sin planos'}</p>
            </CardContent>
          </Card>
    </div>
  );
}
