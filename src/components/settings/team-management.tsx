'use client';

import { useFirebase, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, updateDoc } from 'firebase/firestore';
import type { User as AppUser } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Shield, User as UserIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function TeamManagement() {
  const { firestore } = useFirebase();
  const { user: currentUser } = useUser();
  const { toast } = useToast();

  const usersQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'users') : null),
    [firestore]
  );
  const { data: users, isLoading, error } = useCollection<AppUser>(usersQuery);

  const handleRoleChange = async (userId: string, newRole: AppUser['role']) => {
    if (!firestore) return;
    try {
      const userRef = doc(firestore, 'users', userId);
      await updateDoc(userRef, { role: newRole });
      toast({ title: 'Rol actualizado', description: 'El permiso ha sido modificado correctamente.' });
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'No se pudo actualizar el rol.', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-destructive">
        No tienes permisos para ver la lista de usuarios.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuario</TableHead>
            <TableHead>Contacto</TableHead>
            <TableHead>Rol Actual</TableHead>
            <TableHead className="text-right">Cambiar Rol</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(users || []).map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {user.displayName || 'Usuario sin nombre'}
                      {user.id === currentUser?.uid && (
                        <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">Tú</Badge>
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground">{user.id}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col text-sm">
                  <span>{user.email || 'N/A'}</span>
                  <span className="text-muted-foreground">{user.phoneNumber || ''}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={user.role === 'superuser' ? 'default' : 'secondary'} className="gap-1">
                  {user.role === 'superuser' && <Shield className="h-3 w-3" />}
                  {user.role === 'superuser' ? 'Superusuario' : 'Colaborador'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Select
                  disabled={user.id === currentUser?.uid}
                  value={user.role || 'collaborator'}
                  onValueChange={(val) => handleRoleChange(user.id, val as AppUser['role'])}
                >
                  <SelectTrigger className="ml-auto w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="superuser">Superusuario</SelectItem>
                    <SelectItem value="collaborator">Colaborador</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
