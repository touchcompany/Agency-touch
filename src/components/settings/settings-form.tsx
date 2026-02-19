'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useFirebase, setDocumentNonBlocking, addDocumentNonBlocking } from "@/firebase";
import { doc, collection } from "firebase/firestore";
import type { CompanyProfile } from "@/lib/types";
import { Separator } from "../ui/separator";

interface CompanyProfileFormProps {
  profile?: CompanyProfile;
  onSave: () => void;
}

export function CompanyProfileForm({ profile, onSave }: CompanyProfileFormProps) {
    const { firestore, user } = useFirebase();
    const { toast } = useToast();
    
    const [profileName, setProfileName] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [companyNit, setCompanyNit] = useState('');
    const [companyWhatsapp, setCompanyWhatsapp] = useState('');
    const [paymentDetails, setPaymentDetails] = useState('');
    const [logoUrl, setLogoUrl] = useState('/favicon.svg');
    const [companyAddress, setCompanyAddress] = useState('');
    const [companyEmail, setCompanyEmail] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if(profile) {
            setProfileName(profile.profileName || '');
            setCompanyName(profile.companyName || '');
            setCompanyNit(profile.companyNit || '');
            setCompanyWhatsapp(profile.companyWhatsapp || '');
            setPaymentDetails(profile.paymentDetails || '');
            setLogoUrl(profile.logoUrl || '/favicon.svg');
            setCompanyAddress(profile.companyAddress || '');
            setCompanyEmail(profile.companyEmail || '');
        } else {
            // Reset form for new profile
            setProfileName('');
            setCompanyName('');
            setCompanyNit('');
            setCompanyWhatsapp('');
            setPaymentDetails('');
            setLogoUrl('/favicon.svg');
            setCompanyAddress('');
            setCompanyEmail('');
        }
    }, [profile]);

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
            toast({ title: 'Logo actualizado', description: 'El nuevo logo se ha cargado (localmente).' });
        }
    };

    const handleSaveChanges = () => {
        if (!user || !firestore) {
            toast({ title: "Error", description: "No se puede guardar la configuración. Intenta de nuevo.", variant: 'destructive'});
            return;
        }
         if (!profileName || !companyName || !companyNit) {
            toast({ title: "Campos requeridos", description: "El nombre del perfil, nombre de la empresa y NIT son obligatorios.", variant: 'destructive' });
            return;
        }

        const profileData = {
            userId: user.uid,
            profileName,
            companyName,
            companyNit,
            companyWhatsapp,
            paymentDetails,
            logoUrl,
            companyAddress,
            companyEmail
        };

        if (profile?.id) {
            const profileRef = doc(firestore, 'users', user.uid, 'companyProfiles', profile.id);
            setDocumentNonBlocking(profileRef, profileData, { merge: true });
            toast({ title: "Perfil actualizado", description: "Los cambios se han guardado exitosamente." });
        } else {
            const profilesRef = collection(firestore, 'users', user.uid, 'companyProfiles');
            addDocumentNonBlocking(profilesRef, profileData);
            toast({ title: "Perfil creado", description: "El nuevo perfil de empresa ha sido creado." });
        }
        onSave();
    }

    return (
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSaveChanges(); }}>
             <div className="space-y-2">
                <Label htmlFor="profile-name">Nombre del Perfil</Label>
                <Input
                    id="profile-name"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Ej: Mi Empresa, Perfil Hermana"
                />
                 <p className="text-sm text-muted-foreground">
                    Un nombre para identificar este perfil en la aplicación.
                </p>
            </div>
            <div className="space-y-2">
                <Label htmlFor="company-name">Nombre de la Empresa o Persona</Label>
                <Input
                    id="company-name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Nombre que aparecerá en la factura"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="company-nit">NIT o Cédula</Label>
                <Input
                    id="company-nit"
                    value={companyNit}
                    onChange={(e) => setCompanyNit(e.target.value)}
                    placeholder="Escribe el NIT o Cédula"
                />
            </div>
             <div className="space-y-2">
                <Label htmlFor="company-whatsapp">WhatsApp de Contacto</Label>
                <Input
                    id="company-whatsapp"
                    value={companyWhatsapp}
                    onChange={(e) => setCompanyWhatsapp(e.target.value)}
                    placeholder="Ej: +57 300 123 4567"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="company-email">Correo de Contacto</Label>
                <Input
                    id="company-email"
                    type="email"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    placeholder="Ej: contacto@empresa.com"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="company-address">Dirección</Label>
                <Input
                    id="company-address"
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    placeholder="Ej: Calle 123 # 45 - 67, Bogotá"
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
            
            <Separator />
            
            <div className="space-y-4">
                 <Label>Logo</Label>
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
                        Subir Logo
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

            <div className="flex justify-end pt-4">
                <Button type="submit">Guardar Perfil</Button>
            </div>
        </form>
    );
}
