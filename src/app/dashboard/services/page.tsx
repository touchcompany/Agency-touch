'use client';
import { AddServiceSheet } from '@/components/services/add-service-sheet';
import { ServicesTable } from '@/components/services/services-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ServicesPage() {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="font-headline">Servicios</CardTitle>
        <AddServiceSheet />
      </CardHeader>
      <CardContent>
        <ServicesTable />
      </CardContent>
    </Card>
  );
}

    