'use client';
import type { Project, Customer, Collaborator } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  return (
    <Card 
      className="bg-background hover:bg-card-hover transition-colors cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="p-4">
        <CardTitle className="text-base font-semibold">{project.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between p-4 pt-0">
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
      </CardContent>
    </Card>
  );
}
