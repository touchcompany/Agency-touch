'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { updateEmail } from 'firebase/auth';

export function UserDataManager() {
  const { user, auth } = useFirebase();
  const { toast } = useToast();

  // Initialize email state with user's current email or an empty string
  const [email, setEmail] = useState(user?.email || '');

  const handleUpdateEmail = async () => {
    if (!user || !auth) {
      toast({ variant: 'destructive', title: 'Error', description: 'No estás autenticado.' });
      return;
    }
    if (!email) {
      toast({ variant: 'destructive', title: 'Error', description: 'El campo de correo no puede estar vacío.' });
      return;
    }

    try {
      // The updateEmail function from Firebase Auth is used here.
      // Note: This is a sensitive operation and may require recent user sign-in.
      // Firebase might throw an error asking the user to re-authenticate.
      await updateEmail(user, email);
      toast({ title: '¡Correo Actualizado!', description: 'Tu correo electrónico ha sido actualizado exitosamente.' });
    } catch (error: any) {
      console.error("Error updating email:", error);
      toast({
        variant: 'destructive',
        title: 'Error al actualizar correo',
        // Provide a helpful message, especially for re-authentication errors.
        description: error.code === 'auth/requires-recent-login'
          ? 'Esta es una operación sensible. Por favor, cierra sesión y vuelve a iniciar sesión antes de intentarlo de nuevo.'
          : error.message,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="phone">Número de Teléfono</Label>
        <Input id="phone" value={user?.phoneNumber || 'No disponible'} disabled />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Correo Electrónico</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@correo.com"
        />
      </div>
      <Button onClick={handleUpdateEmail} className="w-full">
        Guardar Cambios
      </Button>
    </div>
  );
}
