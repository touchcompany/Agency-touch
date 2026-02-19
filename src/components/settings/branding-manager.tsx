'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFirebase, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import type { UserSettings } from '@/lib/types';
import { doc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

export function BrandingManager() {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();

  const settingsRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid, 'settings', 'main') : null),
    [firestore, user]
  );
  const { data: settings, isLoading } = useDoc<UserSettings>(settingsRef);

  const [iconUrl, setIconUrl] = useState('');

  useEffect(() => {
    if (settings) {
      setIconUrl(settings.appleTouchIconUrl || '');
    }
  }, [settings]);

  const handleSave = () => {
    if (!user || !firestore || !settingsRef) {
      toast({ variant: 'destructive', title: 'Error', description: 'No estás autenticado.' });
      return;
    }

    setDocumentNonBlocking(settingsRef, {
      userId: user.uid,
      id: 'main',
      appleTouchIconUrl: iconUrl,
    }, { merge: true });

    toast({ title: 'Configuración guardada', description: 'La configuración de branding ha sido actualizada.' });
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="apple-touch-icon">URL del Ícono para iOS (PNG)</Label>
        <Input
          id="apple-touch-icon"
          value={iconUrl}
          onChange={(e) => setIconUrl(e.target.value)}
          placeholder="https://example.com/icon.png"
        />
        <p className="text-xs text-muted-foreground">
          Pega aquí la URL de una imagen PNG (180x180px recomendado) para el ícono en la pantalla de inicio de iPhone/iPad.
        </p>
      </div>
      <Button onClick={handleSave} className="w-full">
        Guardar Configuración de Branding
      </Button>
    </div>
  );
}
