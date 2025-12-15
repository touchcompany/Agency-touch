'use client';
import type { Collaborator } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import Link from 'next/link';

export function CollaboratorsTable() {
  const { firestore, user } = useFirebase();

  const collaboratorsQuery = useMemoFirebase(() => 
    user ? collection(firestore, 'users', user.uid, 'collaborators') : null
  , [firestore, user]);
  const { data: collaborators, isLoading } = useCollection<Collaborator>(collaboratorsQuery);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!collaborators || collaborators.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No hay colaboradores todavía. ¡Añade uno para empezar!
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Colaborador</TableHead>
            <TableHead>Correo Electrónico</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead className="w-[50px] text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {collaborators.map((collaborator) => (
            <TableRow key={collaborator.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={`https://picsum.photos/seed/${collaborator.id}/100/100`}
                      data-ai-hint="person"
                    />
                    <AvatarFallback>
                      {collaborator.name?.charAt(0) ?? ''}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{collaborator.name}</span>
                </div>
              </TableCell>
              <TableCell>{collaborator.email}</TableCell>
              <TableCell>{collaborator.phoneNumber}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menú</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                       <Link href={`/dashboard/collaborators/${collaborator.id}/edit`}>Editar Colaborador</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                       <Link href={`/dashboard/collaborators/${collaborator.id}`}>Ver Detalles</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
