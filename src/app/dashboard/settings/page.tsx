'use client';
import { CompanyProfileManager } from "@/components/settings/company-profile-manager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
       <div>
        <h1 className="font-headline text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">
          Gestiona los perfiles de tu empresa y otros ajustes de la aplicación.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Perfiles de Empresa</CardTitle>
          <CardDescription>
            Gestiona los perfiles de emisor para tus cuentas de cobro. Puedes tener múltiples perfiles (por ejemplo, uno para ti y otro para un socio o empresa).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CompanyProfileManager />
        </CardContent>
      </Card>
      
      {/* User profile settings can be added here in the future */}
    </div>
  );
}
