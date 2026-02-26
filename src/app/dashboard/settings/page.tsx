'use client';
import { CompanyProfileManager } from "@/components/settings/company-profile-manager";
import { DataExportManager } from "@/components/settings/data-export-manager";
import { UserDataManager } from "@/components/settings/user-data-manager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrandingManager } from "@/components/settings/branding-manager";
import { TeamManagement } from "@/components/settings/team-management";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/firebase";

export default function SettingsPage() {
  const { appUser } = useUser();
  const isSuperuser = appUser?.role === 'superuser';

  return (
    <div className="space-y-8">
       <div>
        <h1 className="font-headline text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">
          Gestiona tu empresa, equipo y datos personales.
        </p>
      </div>

      <Tabs defaultValue="company" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="company">Empresa</TabsTrigger>
          <TabsTrigger value="profile">Mi Perfil</TabsTrigger>
          {isSuperuser && <TabsTrigger value="team">Equipo</TabsTrigger>}
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="backup">Copia de Seguridad</TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Perfiles de Empresa</CardTitle>
              <CardDescription>
                Gestiona los perfiles de emisor para tus cuentas de cobro.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CompanyProfileManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Perfil de Usuario</CardTitle>
              <CardDescription>
                Actualiza tu información personal y de seguridad.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserDataManager />
            </CardContent>
          </Card>
        </TabsContent>

        {isSuperuser && (
          <TabsContent value="team">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Gestión de Equipo</CardTitle>
                <CardDescription>
                  Administra los roles y accesos de tus colaboradores.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TeamManagement />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Branding General</CardTitle>
              <CardDescription>
                Configura el ícono de la aplicación para dispositivos Apple.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BrandingManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Gestión de Datos</CardTitle>
              <CardDescription>
                Exporta tus datos o restaura una copia de seguridad.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataExportManager />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
