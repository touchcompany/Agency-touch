'use client';
import { AutomationClient } from '@/components/automation/automation-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AutomationPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Automatización de Cuentas</CardTitle>
        <CardDescription>
          Genera cuentas de cobro mensuales para tus clientes recurrentes con un solo clic.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AutomationClient />
      </CardContent>
    </Card>
  );
}
