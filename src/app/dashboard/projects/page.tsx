'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useFirebase, useCollection, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import type { Project, Customer, Collaborator } from '@/lib/types';
import { Loader2, Plus } from 'lucide-react';
import { ProjectFormSheet } from '@/components/projects/add-project-sheet';
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
import { ProjectColumn } from '@/components/projects/project-column';

const projectColumns: { id: Project['status']; title: string }[] = [
  { id: 'todo', title: 'Por Hacer' },
  { id: 'in-progress', title: 'En Progreso' },
  { id: 'done', title: 'Hecho' },
];

export default function ProjectsPage() {
  const { firestore, user } = useFirebase();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | undefined>(undefined);

  const projectsQuery = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'projects') : null),
    [firestore, user]
  );
  const { data: projects, isLoading: projectsLoading } = useCollection<Project>(projectsQuery);

  const customersQuery = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'customers') : null),
    [firestore, user]
  );
  const { data: customers, isLoading: customersLoading } = useCollection<Customer>(customersQuery);

  const collaboratorsQuery = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'collaborators') : null),
    [firestore, user]
  );
  const { data: collaborators, isLoading: collaboratorsLoading } = useCollection<Collaborator>(collaboratorsQuery);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleOpenSheet = (project?: Project) => {
    setSelectedProject(project);
    setIsSheetOpen(true);
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
        const activeProject = projects?.find(p => p.id === active.id);
        const newStatus = over.id as Project['status'];

        if (activeProject && newStatus && activeProject.status !== newStatus && user && firestore) {
             const projectRef = doc(firestore, 'users', user.uid, 'projects', activeProject.id);
             setDocumentNonBlocking(projectRef, { status: newStatus }, { merge: true });
        }
    }
  }
  
  const projectsByStatus = useMemo(() => {
    return (projects || []).reduce((acc, project) => {
        if (!acc[project.status]) {
            acc[project.status] = [];
        }
        acc[project.status].push(project);
        return acc;
    }, {} as Record<Project['status'], Project[]>);
  }, [projects]);


  const isLoading = projectsLoading || customersLoading || collaboratorsLoading;

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold">Proyectos</h1>
          <p className="text-muted-foreground">
            Gestiona tus proyectos y tareas en un solo lugar.
          </p>
        </div>
        <Button onClick={() => handleOpenSheet(undefined)}>
            <Plus className="mr-2 h-4 w-4" />
            Crear Proyecto
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <div className="grid flex-1 grid-cols-1 items-start gap-6 md:grid-cols-3">
                {projectColumns.map((column) => (
                    <ProjectColumn 
                        key={column.id}
                        id={column.id}
                        title={column.title}
                        projects={projectsByStatus[column.id] || []}
                        customers={customers || []}
                        collaborators={collaborators || []}
                        onCardClick={handleOpenSheet}
                    />
                ))}
            </div>
        </DndContext>
      )}
       <ProjectFormSheet 
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        project={selectedProject}
      />
    </div>
  );
}
