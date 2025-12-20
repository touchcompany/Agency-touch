'use client';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useFirebase } from '@/firebase';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Download, Upload, Loader2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';


export function DataExportManager() {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileToImport, setFileToImport] = useState<File | null>(null);

  const collectionsToBackup = [
    'customers',
    'collaborators',
    'invoices',
    'income',
    'expenses',
    'services',
    'companyProfiles',
  ];

  const handleExport = async () => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'No estás autenticado.' });
      return;
    }

    setIsExporting(true);
    toast({ title: 'Exportando datos...', description: 'Esto puede tardar unos segundos.' });

    try {
      const exportedData: Record<string, any[]> = {};
      for (const collectionName of collectionsToBackup) {
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
      toast({ title: '¡Exportación Completa!', description: 'Tus datos se han descargado.' });

    } catch (error) {
      console.error("Error exporting data:", error);
      toast({ variant: 'destructive', title: 'Error al exportar', description: 'No se pudieron exportar los datos.' });
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        setFileToImport(file);
    }
  };

  const handleImport = async () => {
    if (!user || !firestore || !fileToImport) {
        toast({ variant: 'destructive', title: 'Error', description: 'No hay archivo para importar.' });
        return;
    }

    setIsImporting(true);
    toast({ title: 'Importando datos...', description: 'Por favor, no cierres esta ventana.' });

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const json = JSON.parse(e.target?.result as string);
            const batch = writeBatch(firestore);

            for (const collectionName of collectionsToBackup) {
                if(json[collectionName] && Array.isArray(json[collectionName])) {
                    for(const docData of json[collectionName]) {
                        if(docData.id) {
                            const docRef = doc(firestore, 'users', user.uid, collectionName, docData.id);
                            // We remove the id from the data object itself before setting it
                            const { id, ...dataToSet } = docData;
                            batch.set(docRef, dataToSet);
                        }
                    }
                }
            }

            await batch.commit();
            toast({ title: '¡Importación Completa!', description: 'Tus datos han sido restaurados desde la copia de seguridad.' });
        } catch (error: any) {
             console.error("Error importing data:", error);
             toast({ variant: 'destructive', title: 'Error al importar', description: `Hubo un problema al procesar el archivo: ${error.message}` });
        } finally {
            setIsImporting(false);
            setFileToImport(null);
             if(fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };
    reader.readAsText(fileToImport);
  };


  return (
    <div className="space-y-4">
      <Button onClick={handleExport} disabled={isExporting} className="w-full">
        {isExporting ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Exportando...</>
        ) : (
          <><Download className="mr-2 h-4 w-4" /> Exportar Mis Datos</>
        )}
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
            <Button variant="outline" onClick={handleImportClick} className="w-full" disabled={isImporting}>
                <Upload className="mr-2 h-4 w-4" /> Importar Datos
            </Button>
        </AlertDialogTrigger>
         {fileToImport && (
             <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Importación</AlertDialogTitle>
                <AlertDialogDescription>
                    Estás a punto de importar datos desde el archivo "{fileToImport.name}". Esta acción sobrescribirá los datos existentes con el mismo ID. ¿Estás seguro de que quieres continuar?
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setFileToImport(null)}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleImport} disabled={isImporting}>
                    {isImporting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Importando...</> : 'Sí, importar'}
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
         )}
      </AlertDialog>
     
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelected}
        className="hidden"
        accept="application/json"
      />
       <p className="text-xs text-muted-foreground text-center pt-2">
        Asegúrate de exportar tus datos actuales antes de importar una copia antigua para evitar la pérdida de información.
      </p>
    </div>
  );
}
