'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useFirebase } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Download, Loader2 } from 'lucide-react';

export function DataExportManager() {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async () => {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No estás autenticado.',
      });
      return;
    }

    setIsLoading(true);
    toast({
      title: 'Exportando datos...',
      description: 'Esto puede tardar unos segundos.',
    });

    try {
      const collectionsToExport = [
        'customers',
        'collaborators',
        'invoices',
        'income',
        'expenses',
        'services',
        'companyProfiles',
      ];

      const exportedData: Record<string, any[]> = {};

      for (const collectionName of collectionsToExport) {
        const collectionRef = collection(firestore, 'users', user.uid, collectionName);
        const snapshot = await getDocs(collectionRef);
        exportedData[collectionName] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }

      const jsonString = JSON.stringify(exportedData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      const date = new Date().toISOString().split('T')[0];
      link.download = `backup-touchplus-${date}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      toast({
        title: '¡Exportación Completa!',
        description: 'Tus datos se han descargado como un archivo JSON.',
      });
    } catch (error) {
      console.error("Error exporting data:", error);
      toast({
        variant: 'destructive',
        title: 'Error al exportar',
        description: 'No se pudieron exportar los datos. Inténtalo de nuevo.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleExport} disabled={isLoading} className="w-full">
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Exportando...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Exportar Mis Datos
        </>
      )}
    </Button>
  );
}
