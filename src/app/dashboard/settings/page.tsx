'use client';
import { CompanyProfileManager } from "@/components/settings/company-profile-manager";
import { DataExportManager } from "@/components/settings/data-export-manager";
import { UserDataManager } from "@/components/settings/user-data-manager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
       <div>
        <h1 className="font-headline text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">
          Gestiona los perfiles de tu empresa, datos de usuario y copias de seguridad.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Perfiles de Empresa</CardTitle>
                <CardDescription>
                  Gestiona los perfiles de emisor para tus cuentas de cobro. Puedes tener múltiples perfiles.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CompanyProfileManager />
              </CardContent>
            </Card>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Perfil de Usuario</CardTitle>
              <CardDescription>
                Actualiza tu información personal.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserDataManager />
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle className="font-headline">Gestión de Datos</CardTitle>
              <CardDescription>
                Exporta todos tus datos como una copia de seguridad en formato JSON.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataExportManager />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
