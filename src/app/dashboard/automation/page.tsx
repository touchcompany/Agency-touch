'use client';
import { AutomationClient } from '@/components/automation/automation-client';
import { CollaboratorAutomationClient } from '@/components/automation/collaborator-automation-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


export default function AutomationPage() {
  return (
    <Tabs defaultValue="invoices">
        <div className="flex items-center justify-between mb-6">
            <div>
                <h1 className="font-headline text-3xl font-bold">Automatización</h1>
                <p className="text-muted-foreground">
                Gestiona la generación recurrente de cuentas de cobro y pagos.
                </p>
            </div>
            <TabsList>
                <TabsTrigger value="invoices">Cuentas de Cobro</TabsTrigger>
                <TabsTrigger value="payments">Pagos a Colaboradores</TabsTrigger>
            </TabsList>
        </div>

        <TabsContent value="invoices">
            <Card>
            <CardHeader>
                <CardTitle className="font-headline">Cuentas de Cobro Mensuales</CardTitle>
                <CardDescription>
                Genera cuentas de cobro para tus clientes recurrentes con un solo clic.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <AutomationClient />
            </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="payments">
            <Card>
            <CardHeader>
                <CardTitle className="font-headline">Pagos Mensuales a Colaboradores</CardTitle>
                <CardDescription>
                Genera los registros de egresos para los pagos recurrentes a tus colaboradores.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <CollaboratorAutomationClient />
            </CardContent>
            </Card>
        </TabsContent>
    </Tabs>
  );
}
