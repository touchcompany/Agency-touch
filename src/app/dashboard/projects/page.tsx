'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const projectColumns = [
  { id: 'todo', title: 'Por Hacer' },
  { id: 'in-progress', title: 'En Progreso' },
  { id: 'done', title: 'Hecho' },
];

export default function ProjectsPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-headline text-3xl font-bold">Proyectos</h1>
          <p className="text-muted-foreground">
            Gestiona tus proyectos y tareas en un solo lugar.
          </p>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {projectColumns.map((column) => (
          <div key={column.id} className="flex flex-col gap-4 h-full">
            <h2 className="font-semibold text-lg px-2">{column.title}</h2>
            <Card className="flex-1">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground text-center py-8">
                  No hay proyectos en esta columna.
                </p>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
