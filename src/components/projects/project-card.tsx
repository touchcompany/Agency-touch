'use client';
import type { Project, Customer, Collaborator } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CalendarDays, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '../ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { Button } from '../ui/button';
import { useState } from 'react';

interface ProjectCardProps {
  project: Project;
  customer?: Customer;
  collaborator?: Collaborator;
  onClick?: () => void;
}

export function ProjectCard({
  project,
  customer,
  collaborator,
  onClick,
}: ProjectCardProps) {
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  return (
    <Collapsible
      open={isDescriptionOpen}
      onOpenChange={setIsDescriptionOpen}
      className="w-full"
    >
        <Card 
            className="bg-background hover:bg-card-hover transition-colors w-full"
        >
            <CardHeader 
                className="p-4 flex flex-row items-start justify-between cursor-pointer"
                onClick={onClick}
            >
                <CardTitle className="text-base font-semibold">{project.title}</CardTitle>
                 {project.description && (
                     <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <CollapsibleTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                                        <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:-rotate-180" />
                                    </Button>
                                </CollapsibleTrigger>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Ver descripción</p>
                            </TooltipContent>
                        </Tooltip>
                     </TooltipProvider>
                 )}
            </CardHeader>

             <CollapsibleContent>
                <CardContent className="px-4 pb-4 pt-0">
                    <p className="text-sm text-muted-foreground">{project.description}</p>
                </CardContent>
            </CollapsibleContent>


            <CardFooter className="flex items-center justify-between p-4 pt-0">
                <div className="flex -space-x-2">
                    <TooltipProvider>
                        {customer && (
                            <Tooltip>
                                <TooltipTrigger>
                                    <Avatar className="h-7 w-7 border-2 border-background">
                                        <AvatarImage src={customer.logoUrl || `https://picsum.photos/seed/${customer.id}/100`} data-ai-hint="logo" />
                                        <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Cliente: {customer.name}</p>
                                </TooltipContent>
                            </Tooltip>
                        )}
                        {collaborator && (
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
                        )}
                    </TooltipProvider>
                </div>
                {project.dueDate && (
                    <Badge variant="outline" className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        <span className="text-xs">{format(new Date(project.dueDate), "d MMM", { locale: es })}</span>
                    </Badge>
                )}
            </CardFooter>
        </Card>
    </Collapsible>
  );
}
