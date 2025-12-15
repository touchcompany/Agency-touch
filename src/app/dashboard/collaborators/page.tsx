
'use client';
import { AddCollaboratorSheet } from '@/components/collaborators/add-collaborator-sheet';
import { CollaboratorsTable } from '@/components/collaborators/collaborators-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CollaboratorsPage() {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="font-headline">Colaboradores</CardTitle>
        <AddCollaboratorSheet />
      </CardHeader>
      <CardContent>
        <CollaboratorsTable />
      </CardContent>
    </Card>
  );
}
