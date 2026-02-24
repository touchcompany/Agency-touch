'use client';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useMemo } from 'react';
import type { Project, Customer, Collaborator } from '@/lib/types';
import { ProjectColumn } from '@/components/projects/project-column';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';

interface ProjectsKanbanViewProps {
  projects: Project[];
  customers: Customer[];
  collaborators: Collaborator[];
  onCardClick: (project: Partial<Project>) => void;
}

const projectColumns: { id: Project['status']; title: string }[] = [
  { id: 'pending', title: 'Pendiente' },
  { id: 'in-progress', title: 'En Progreso' },
  { id: 'customer-review', title: 'Revisión Cliente' },
  { id: 'completed', title: 'Completada' },
];

export function ProjectsKanbanView({ projects, customers, collaborators, onCardClick }: ProjectsKanbanViewProps) {
  const { firestore, user } = useFirebase();
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const handleNewTaskInColumn = (status: Project['status']) => {
    onCardClick({ status });
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const activeProject = projects?.find(p => p.id === active.id);
      
      const isOverAColumn = projectColumns.some(c => c.id === over.id);

      if (activeProject && isOverAColumn) {
        const newStatus = over.id as Project['status'];
        if (activeProject.status !== newStatus && user && firestore) {
            const projectRef = doc(firestore, 'users', user.uid, 'projects', activeProject.id);
            setDocumentNonBlocking(projectRef, { status: newStatus }, { merge: true });
        }
      }
    }
  };

  const projectsByStatus = useMemo(() => {
    const initial: Record<Project['status'], Project[]> = {
      'pending': [],
      'in-progress': [],
      'customer-review': [],
      'completed': []
    };

    return (projects || []).reduce((acc, project) => {
      const status = project.status || 'pending';
      if (acc[status]) {
        acc[status].push(project);
      }
      return acc;
    }, initial);
  }, [projects]);

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="grid flex-1 grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-4">
        {projectColumns.map((column) => (
          <div key={column.id} className="flex h-full flex-col gap-2">
            <div className="flex items-center justify-between px-2">
                <h2 className="text-base font-semibold text-muted-foreground">
                    {column.title} ({projectsByStatus[column.id]?.length || 0})
                </h2>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleNewTaskInColumn(column.id)}>
                    <Plus className="h-4 w-4 text-muted-foreground" />
                </Button>
            </div>
            <ProjectColumn 
                id={column.id}
                title={column.title}
                projects={projectsByStatus[column.id] || []}
                customers={customers}
                collaborators={collaborators}
                onCardClick={(project) => onCardClick(project)}
            />
          </div>
        ))}
      </div>
    </DndContext>
  );
}
