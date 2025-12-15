'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import Image from "next/image";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";


export function SettingsForm() {
    const [companyName, setCompanyName] = useState('touch+');
    const [companyNit, setCompanyNit] = useState('');
    const [companyWhatsapp, setCompanyWhatsapp] = useState('');
    const [paymentDetails, setPaymentDetails] = useState('');
    const [logoUrl, setLogoUrl] = useState('/logo-placeholder.png');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

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
            toast({ title: 'Logo actualizado', description: 'El nuevo logo se ha cargado.' });
        }
    };

    const handleSaveChanges = () => {
        // Here you would typically save to a database (e.g., Firestore)
        console.log({
            companyName,
            companyNit,
            companyWhatsapp,
            paymentDetails,
            logoUrl
        });
        toast({ title: "Configuración guardada", description: "Los cambios se han guardado exitosamente." });
    }

    return (
        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
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
                    <Button variant="outline" onClick={handleLogoUploadClick}>
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
                <Button type="button" onClick={handleSaveChanges}>Guardar Configuración</Button>
            </div>
        </form>
    );
}
