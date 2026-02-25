'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { Project, Customer, Collaborator } from '@/lib/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { UserCheck, Users, Calendar } from 'lucide-react';

interface ProjectsListViewProps {
  projects: Project[];
  customers: Customer[];
  collaborators: Collaborator[];
  onRowClick: (project: Project) => void;
}

const statusTranslations: Record<Project['status'], string> = {
  pending: 'Pendiente',
  'in-progress': 'En Progreso',
  'customer-review': 'Revisión Cliente',
  completed: 'Completada',
};

const statusVariants: Record<Project['status'], 'secondary' | 'default' | 'outline' | 'destructive'> = {
    pending: 'secondary',
    'in-progress': 'default',
    'customer-review': 'outline',
    completed: 'secondary',
};


export function ProjectsListView({ projects, customers, collaborators, onRowClick }: ProjectsListViewProps) {
  
  const getCustomerName = (customerId?: string) => {
    return customers.find(c => c.id === customerId)?.name || 'N/A';
  }

  const getCollaboratorName = (collaboratorId?: string) => {
    return collaborators.find(c => c.id === collaboratorId)?.name || 'N/A';
  }

  if (projects.length === 0) {
      return (
          <div className="text-center p-8 text-muted-foreground rounded-lg border">
              No hay tareas que coincidan con los filtros actuales.
          </div>
      );
  }

  return (
    <div className="space-y-4">
      {/* --- Mobile View (Optimized for iPhone) --- */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {projects.map((project) => (
          <Card 
            key={project.id} 
            onClick={() => onRowClick(project)} 
            className="cursor-pointer hover:bg-muted/50 transition-colors active:scale-[0.98]"
          >
            <CardContent className="p-4 flex flex-col gap-3">
               <div className="flex justify-between items-start gap-2">
                  <h3 className="font-bold text-lg leading-tight line-clamp-2">{project.title}</h3>
                  <Badge variant={statusVariants[project.status] || 'default'} className="shrink-0 text-[10px] py-0 px-2 h-5">
                    {statusTranslations[project.status]}
                  </Badge>
               </div>
               
               <div className="grid grid-cols-2 gap-y-2 pt-1 border-t">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span className="truncate">{getCustomerName(project.customerId)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground justify-end">
                    <Calendar className="h-3 w-3" />
                    <span>{project.dueDate ? format(new Date(project.dueDate), 'd MMM', { locale: es }) : 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground col-span-2">
                    <UserCheck className="h-3 w-3" />
                    <span className="truncate">Responsable: {getCollaboratorName(project.collaboratorId)}</span>
                  </div>
               </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* --- Desktop View (Standard Table) --- */}
      <div className="hidden md:block border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tarea</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead>Fecha Entrega</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow 
                key={project.id} 
                onClick={() => onRowClick(project)} 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <TableCell className="font-medium">{project.title}</TableCell>
                <TableCell>
                    <Badge variant={statusVariants[project.status] || 'default'}>{statusTranslations[project.status]}</Badge>
                </TableCell>
                <TableCell>{getCustomerName(project.customerId)}</TableCell>
                <TableCell>{getCollaboratorName(project.collaboratorId)}</TableCell>
                <TableCell>
                  {project.dueDate ? format(new Date(project.dueDate), 'd MMM yyyy', { locale: es }) : 'N/A'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
