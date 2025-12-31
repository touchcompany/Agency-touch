'use client';

import { Card, CardContent } from '@/components/ui/card';
import type { Project, Customer, Collaborator } from '@/lib/types';
import { ProjectCard } from '@/components/projects/project-card';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

interface ProjectColumnProps {
  id: Project['status'];
  title: string;
  projects: Project[];
  customers: Customer[];
  collaborators: Collaborator[];
  onCardClick: (project: Project) => void;
}

export function ProjectColumn({ id, title, projects, customers, collaborators, onCardClick }: ProjectColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });
  
  const projectIds = useMemo(() => projects.map(p => p.id), [projects]);

  return (
    <div className="flex h-full flex-col gap-4">
      <h2 className="px-2 text-lg font-semibold">{title}</h2>
      <Card
        ref={setNodeRef}
        className={cn('flex-1 bg-muted/50 transition-colors', isOver && 'bg-accent')}
      >
        <CardContent className="space-y-4 p-4">
            <SortableContext items={projectIds} strategy={verticalListSortingStrategy}>
            {projects.length === 0 ? (
                <div className="flex h-32 items-center justify-center">
                    <p className="text-center text-sm text-muted-foreground">
                        No hay proyectos aquí.
                    </p>
                </div>
            ) : (
                projects.map((project) => (
                    <ProjectCard
                        key={project.id}
                        project={project}
                        customer={customers?.find(c => c.id === project.customerId)}
                        collaborator={collaborators?.find(c => c.id === project.collaboratorId)}
                        onClick={() => onCardClick(project)}
                    />
                ))
            )}
           </SortableContext>
        </CardContent>
      </Card>
    </div>
  );
}
