'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useFirebase, setDocumentNonBlocking, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import type { CompanySettings } from "@/lib/types";
import { Loader2 } from "lucide-react";


export function SettingsForm() {
    const { firestore, user } = useFirebase();
    const { toast } = useToast();
    
    const settingsRef = useMemoFirebase(
        () => (user ? doc(firestore, 'users', user.uid, 'settings', 'company') : null),
        [firestore, user]
    );
    const { data: initialSettings, isLoading } = useDoc<CompanySettings>(settingsRef);
    
    const [companyName, setCompanyName] = useState('');
    const [companyNit, setCompanyNit] = useState('');
    const [companyWhatsapp, setCompanyWhatsapp] = useState('');
    const [paymentDetails, setPaymentDetails] = useState('');
    const [logoUrl, setLogoUrl] = useState('/favicon.svg');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if(initialSettings) {
            setCompanyName(initialSettings.companyName || 'touch+');
            setCompanyNit(initialSettings.companyNit || '');
            setCompanyWhatsapp(initialSettings.companyWhatsapp || '');
            setPaymentDetails(initialSettings.paymentDetails || '');
            setLogoUrl(initialSettings.logoUrl || '/favicon.svg');
        }
    }, [initialSettings]);

    const handleLogoUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setLogoUrl(e.target?.result as string);
            };
            reader.readAsDataURL(file);
            // NOTE: In a real app, you'd upload to Firebase Storage and get a URL.
            // For now, we are using the base64 data URI which might be very long.
            toast({ title: 'Logo actualizado', description: 'El nuevo logo se ha cargado (localmente).' });
        }
    };

    const handleSaveChanges = () => {
        if (!settingsRef) {
            toast({ title: "Error", description: "No se puede guardar la configuración. Intenta de nuevo.", variant: 'destructive'});
            return;
        }

        const settingsData: CompanySettings = {
            id: 'company',
            companyName,
            companyNit,
            companyWhatsapp,
            paymentDetails,
            logoUrl
        };

        setDocumentNonBlocking(settingsRef, settingsData, { merge: true });

        toast({ title: "Configuración guardada", description: "Los cambios se han guardado exitosamente." });
    }
    
    if (isLoading) {
      return <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    return (
        <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); handleSaveChanges(); }}>
            <div className="space-y-2">
                <Label htmlFor="company-name">Nombre de la Empresa</Label>
                <Input
                    id="company-name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="company-nit">NIT de la Empresa</Label>
                <Input
                    id="company-nit"
                    value={companyNit}
                    onChange={(e) => setCompanyNit(e.target.value)}
                    placeholder="Escribe el NIT de tu empresa"
                />
            </div>
             <div className="space-y-2">
                <Label htmlFor="company-whatsapp">WhatsApp de la Empresa</Label>
                <Input
                    id="company-whatsapp"
                    value={companyWhatsapp}
                    onChange={(e) => setCompanyWhatsapp(e.target.value)}
                    placeholder="Ej: +57 300 123 4567"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="payment-details">Detalles de Pago</Label>
                <Textarea
                    id="payment-details"
                    placeholder="Introduce tu número de cuenta bancaria, Nequi, Daviplata, etc."
                    rows={4}
                    value={paymentDetails}
                    onChange={(e) => setPaymentDetails(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                    Esta información se mostrará en tus cuentas de cobro.
                </p>
            </div>

            <div className="space-y-2">
                <Label>Logo de la Empresa</Label>
                <div className="flex items-center gap-4">
                    <Image
                        src={logoUrl}
                        width={64}
                        height={64}
                        alt="Current company logo"
                        className="rounded-md border bg-muted object-contain"
                    />
                    <Button type="button" variant="outline" onClick={handleLogoUploadClick}>
                        <Upload className="mr-2 h-4 w-4" />
                        Subir Nuevo Logo
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                    />
                </div>
            </div>

            <div className="flex justify-end">
                <Button type="submit">Guardar Configuración</Button>
            </div>
        </form>
    );
}
