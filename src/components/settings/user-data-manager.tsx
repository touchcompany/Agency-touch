'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import {
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  linkWithCredential,
} from 'firebase/auth';
import { Separator } from '../ui/separator';

export function UserDataManager() {
  const { user, auth } = useFirebase();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hasPassword, setHasPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      // Check if the user has a password provider linked
      const passwordProvider = user.providerData.some(
        (provider) => provider.providerId === 'password'
      );
      setHasPassword(passwordProvider);
    }
  }, [user]);


  const handleUpdateEmail = async () => {
    if (!user || !auth || !email) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'El campo de correo no puede estar vacío.',
      });
      return;
    }
    try {
      await updateEmail(user, email);
      toast({
        title: '¡Correo Actualizado!',
        description:
          'Tu correo electrónico ha sido actualizado exitosamente.',
      });
    } catch (error: any) {
      console.error('Error updating email:', error);
      toast({
        variant: 'destructive',
        title: 'Error al actualizar correo',
        description:
          error.code === 'auth/requires-recent-login'
            ? 'Por favor, cierra sesión y vuelve a iniciarla para actualizar tu correo.'
            : error.message,
      });
    }
  };

  const handleSetOrUpdatePassword = async () => {
    if (!user || !auth) {
        toast({ variant: 'destructive', title: 'Error', description: 'No estás autenticado.' });
        return;
    }
    if (!email) {
        toast({ variant: 'destructive', title: 'Correo Requerido', description: 'Debes añadir y guardar un correo electrónico antes de establecer una contraseña.' });
        return;
    }
    if (newPassword !== confirmPassword) {
        toast({ variant: 'destructive', title: 'Error', description: 'Las contraseñas no coinciden.' });
        return;
    }
    if (newPassword.length < 6) {
        toast({ variant: 'destructive', title: 'Error', description: 'La contraseña debe tener al menos 6 caracteres.' });
        return;
    }

    try {
        if (hasPassword) {
            // User already has a password, update it
            await updatePassword(user, newPassword);
            toast({ title: 'Contraseña Actualizada', description: 'Tu contraseña ha sido cambiada exitosamente.' });
        } else {
            // User does not have a password, link a new one
            const credential = EmailAuthProvider.credential(email, newPassword);
            await linkWithCredential(user, credential);
            toast({ title: 'Contraseña Añadida', description: 'Ahora puedes iniciar sesión con tu correo y contraseña.' });
            setHasPassword(true); // Update state to reflect the change
        }
        setNewPassword('');
        setConfirmPassword('');
    } catch (error: any) {
        console.error("Error setting/updating password:", error);
         toast({
            variant: 'destructive',
            title: 'Error al guardar contraseña',
            description: error.code === 'auth/requires-recent-login'
                ? 'Por favor, cierra sesión y vuelve a iniciarla para cambiar tu contraseña.'
                : error.message,
        });
    }
  };


  return (
    <div className="space-y-6">
        <div className="space-y-4">
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
                Guardar Correo
            </Button>
        </div>

        <Separator />

        <div className="space-y-4">
             <h3 className="text-sm font-medium">{hasPassword ? 'Cambiar Contraseña' : 'Añadir Contraseña'}</h3>
             <div className="space-y-2">
                <Label htmlFor="new-password">Nueva Contraseña</Label>
                <Input 
                    id="new-password" 
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                />
             </div>
             <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                <Input 
                    id="confirm-password" 
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                />
             </div>
             <Button onClick={handleSetOrUpdatePassword} className="w-full">
                {hasPassword ? 'Actualizar Contraseña' : 'Guardar Contraseña'}
             </Button>
        </div>

    </div>
  );
}
