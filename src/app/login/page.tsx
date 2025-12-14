import { LoginForm } from '@/components/auth/login-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/40 p-4">
      <Card className="w-full max-w-md border-0 shadow-xl shadow-black/5">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex items-center gap-2">
            <div className='p-2 bg-primary text-primary-foreground rounded-md'>
                <Sparkles className="h-6 w-6" />
            </div>
            <h1 className="font-headline text-3xl font-bold text-foreground">FinancioAI</h1>
          </div>
          <CardTitle className="font-headline text-2xl">Bienvenido de Nuevo</CardTitle>
          <CardDescription>Ingresa tus credenciales para acceder a tu panel.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
