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
import { 
    User, Video, Send, Eye, Monitor, Box, FileText 
} from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  customer?: Customer;
  collaborator?: Collaborator;
  onClick?: () => void;
}

const statusDisplay: Record<Project['status'], { text: string; className: string }> = {
  pending: { text: 'IDEA', className: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800' },
  'in-progress': { text: 'EDICIÓN', className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800' },
  'customer-review': { text: 'PARA PUBLICAR', className: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-800' },
  completed: { text: 'PUBLICADO', className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800' },
};

const tagIcons: Record<string, React.ElementType> = {
    'Talking Head': User,
    'B-Roll': Video,
    'Drone': Send,
    'POV': Eye,
    'Pantalla': Monitor,
    'Producto': Box,
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
                <Badge variant="outline" className={cn("text-[10px] font-bold tracking-wider px-2 py-0 h-5", displayStatus.className)}>{displayStatus.text}</Badge>
                <TooltipProvider>
                    {collaborator ? (
                        <Tooltip>
                            <TooltipTrigger asChild>
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
                <CardTitle className="text-base font-bold leading-tight mb-4 line-clamp-2">{project.title}</CardTitle>
                
                <div className="flex items-center gap-3">
                    {/* Script Status Icon */}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-1">
                                    <FileText className={cn("h-4 w-4", hasScript ? "text-blue-500" : "text-muted-foreground/30")} />
                                    <span className={cn("text-[9px] font-black uppercase tracking-tighter", hasScript ? "text-blue-600" : "text-muted-foreground/40")}>
                                        {hasScript ? 'Guion' : 'Sin Guion'}
                                    </span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{hasScript ? 'El guion está redactado' : 'Aún no hay guion'}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <Separator orientation="vertical" className="h-3" />

                    {/* Plano Icons */}
                    <div className="flex items-center gap-1.5">
                        {project.tags && project.tags.length > 0 ? (
                            project.tags.map(tagId => {
                                const Icon = tagIcons[tagId];
                                return Icon ? (
                                    <TooltipProvider key={tagId}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Icon className="h-3.5 w-3.5 text-muted-foreground/70" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{tagId}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                ) : null;
                            })
                        ) : (
                            <span className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground/30">Sin Planos</span>
                        )}
                    </div>
                </div>
            </CardContent>
          </Card>
    </div>
  );
}
