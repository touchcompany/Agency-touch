'use client';
import { useState } from 'react';
import { useFirebase, useCollection, useMemoFirebase, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import type { CompanyProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Plus, Edit, Trash, Loader2 } from 'lucide-react';
import { CompanyProfileForm } from './settings-form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

export function CompanyProfileManager() {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<CompanyProfile | undefined>(undefined);

  const companyProfilesQuery = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'companyProfiles') : null),
    [firestore, user]
  );
  const { data: profiles, isLoading } = useCollection<CompanyProfile>(companyProfilesQuery);

  const handleAddNew = () => {
    setSelectedProfile(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (profile: CompanyProfile) => {
    setSelectedProfile(profile);
    setIsDialogOpen(true);
  };
  
  const handleDelete = (profileId: string) => {
    if (!user || !firestore) return;
    const profileRef = doc(firestore, 'users', user.uid, 'companyProfiles', profileId);
    deleteDocumentNonBlocking(profileRef);
    toast({
      title: "Perfil eliminado",
      description: "El perfil de empresa ha sido eliminado.",
    });
  }

  const handleFormSave = () => {
    setIsDialogOpen(false);
    setSelectedProfile(undefined);
  };
  
  if (isLoading) {
    return <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={handleAddNew}>
            <Plus className="mr-2 h-4 w-4" />
            Añadir Perfil de Empresa
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {profiles && profiles.length > 0 ? (
            profiles.map((profile) => (
              <Card key={profile.id}>
                <CardHeader>
                  <CardTitle>{profile.profileName}</CardTitle>
                  <CardDescription>{profile.companyName} - NIT: {profile.companyNit}</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-end gap-2">
                   <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon"><Trash className="h-4 w-4" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente el perfil de la empresa.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(profile.id)}>Eliminar</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  <Button variant="outline" size="icon" onClick={() => handleEdit(profile)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-muted-foreground col-span-full text-center py-8">
              No has creado ningún perfil de empresa. Añade uno para empezar a facturar.
            </p>
          )}
        </div>
      </div>

      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">
            {selectedProfile ? 'Editar Perfil de Empresa' : 'Nuevo Perfil de Empresa'}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
            <CompanyProfileForm profile={selectedProfile} onSave={handleFormSave} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
