'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Project, Customer, Collaborator } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { AddProjectSheet } from '@/components/projects/add-project-sheet';
import { ProjectCard } from '@/components/projects/project-card';

const projectColumns: { id: Project['status']; title: string }[] = [
  { id: 'todo', title: 'Por Hacer' },
  { id: 'in-progress', title: 'En Progreso' },
  { id: 'done', title: 'Hecho' },
];

export default function ProjectsPage() {
  const { firestore, user } = useFirebase();

  const projectsQuery = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'projects') : null),
    [firestore, user]
  );
  const { data: projects, isLoading: projectsLoading } =
    useCollection<Project>(projectsQuery);

  const customersQuery = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'customers') : null),
    [firestore, user]
  );
  const { data: customers, isLoading: customersLoading } =
    useCollection<Customer>(customersQuery);

  const collaboratorsQuery = useMemoFirebase(
    () =>
      user ? collection(firestore, 'users', user.uid, 'collaborators') : null,
    [firestore, user]
  );
  const { data: collaborators, isLoading: collaboratorsLoading } =
    useCollection<Collaborator>(collaboratorsQuery);

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
        <AddProjectSheet />
      </div>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid flex-1 grid-cols-1 items-start gap-6 md:grid-cols-3">
          {projectColumns.map((column) => (
            <div key={column.id} className="flex h-full flex-col gap-4">
              <h2 className="px-2 text-lg font-semibold">{column.title}</h2>
              <Card className="flex-1 bg-muted/50">
                <CardContent className="space-y-4 p-4">
                  {projects?.filter((p) => p.status === column.id).length ===
                  0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      No hay proyectos en esta columna.
                    </p>
                  ) : (
                    projects
                      ?.filter((p) => p.status === column.id)
                      .map((project) => (
                        <ProjectCard
                          key={project.id}
                          project={project}
                          customer={customers?.find(
                            (c) => c.id === project.customerId
                          )}
                          collaborator={collaborators?.find(
                            (c) => c.id === project.collaboratorId
                          )}
                        />
                      ))
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
