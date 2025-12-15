'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase, useUser } from '@/firebase';
import {
  getAuth,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
} from 'firebase/auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

export default function LoginPage() {
  const { auth } = useFirebase();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const [phoneNumber, setPhoneNumber] = useState('3173980133');
  const [code, setCode] = useState('231119');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if user is already logged in
  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);
  
  const setupRecaptcha = () => {
    if (!auth) return;
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: (response: any) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
      },
    });
  };

  const handleSendCode = async () => {
    if (!auth) {
      toast({ title: 'Error', description: 'Servicio de autenticación no disponible.', variant: 'destructive' });
      return;
    }
    
    // Add Colombian country code if not present
    const formattedPhoneNumber = phoneNumber.startsWith('+57') ? phoneNumber : `+57${phoneNumber}`;

    setIsLoading(true);
    setupRecaptcha();
    const appVerifier = window.recaptchaVerifier!;
    
    try {
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhoneNumber, appVerifier);
      window.confirmationResult = confirmationResult;
      setIsCodeSent(true);
      toast({ title: 'Código enviado', description: 'Revisa tus mensajes para el código de verificación.' });
    } catch (error: any) {
      console.error('Error sending SMS:', error);
      toast({ title: 'Error al enviar código', description: error.message, variant: 'destructive' });
      // Reset reCAPTCHA if it fails
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.render().then((widgetId) => {
          // @ts-ignore
          grecaptcha.reset(widgetId);
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
     if (!window.confirmationResult) {
      toast({ title: 'Error', description: 'Por favor, solicita un código primero.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      await window.confirmationResult.confirm(code);
      toast({ title: '¡Éxito!', description: 'Has iniciado sesión correctamente.' });
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Error verifying code:', error);
      toast({ title: 'Código incorrecto', description: 'El código de verificación no es válido.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };
  
  // While loading or if user exists (and redirect is in progress), show a loader or nothing
  if (isUserLoading || user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
       <div id="recaptcha-container"></div>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex items-center gap-2">
            <div className="p-2 bg-primary text-primary-foreground rounded-md">
              <Sparkles className="h-6 w-6" />
            </div>
            <h1 className="font-headline text-2xl font-bold">FinancioAI</h1>
          </div>
          <CardTitle className="text-2xl">
            {isCodeSent ? 'Verificar Código' : 'Iniciar Sesión'}
          </CardTitle>
          <CardDescription>
            {isCodeSent
              ? 'Introduce el código que enviamos a tu teléfono.'
              : 'Ingresa tu número para recibir un código de acceso.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {!isCodeSent ? (
            <div className="grid gap-2">
              <Label htmlFor="phone">Número de Teléfono</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="317 398 0133"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={isLoading}
              />
            </div>
          ) : (
            <div className="grid gap-2">
              <Label htmlFor="code">Código de Verificación</Label>
              <Input
                id="code"
                type="text"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={isLoading}
              />
            </div>
          )}
        </CardContent>
        <CardFooter>
          {!isCodeSent ? (
            <Button className="w-full" onClick={handleSendCode} disabled={isLoading}>
              {isLoading ? 'Enviando...' : 'Enviar Código'}
            </Button>
          ) : (
            <Button className="w-full" onClick={handleVerifyCode} disabled={isLoading}>
              {isLoading ? 'Verificando...' : 'Verificar e Ingresar'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </main>
  );
}
