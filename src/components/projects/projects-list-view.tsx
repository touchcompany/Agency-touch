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
import type { Project, Customer, Collaborator } from '@/lib/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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
    <div className="border rounded-lg">
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
            <TableRow key={project.id} onClick={() => onRowClick(project)} className="cursor-pointer">
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
  );
}
