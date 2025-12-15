'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase, useUser } from '@/firebase';
import {
  RecaptchaVerifier,
  ConfirmationResult,
  signInWithPhoneNumber,
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

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const setupRecaptcha = () => {
    if (!auth) return null;
    // Cleanup previous verifier if it exists
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
    }
    const recaptchaContainer = document.getElementById('recaptcha-container');
    if (!recaptchaContainer) return null;

    // Ensure the container is empty before rendering
    recaptchaContainer.innerHTML = '';


    const verifier = new RecaptchaVerifier(auth, recaptchaContainer, {
      size: 'invisible',
      callback: (response: any) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
        // This callback is usually executed automatically for invisible reCAPTCHA.
      },
    });
    return verifier;
  };

  const handleSendCode = async () => {
    if (!auth) {
      toast({ title: 'Error', description: 'Servicio de autenticación no disponible.', variant: 'destructive' });
      return;
    }
    
    const formattedPhoneNumber = phoneNumber.startsWith('+57') ? phoneNumber : `+57${phoneNumber}`;

    setIsLoading(true);
    const appVerifier = setupRecaptcha();
    
    if (!appVerifier) {
        toast({ title: 'Error', description: 'No se pudo configurar el verificador de reCAPTCHA.', variant: 'destructive' });
        setIsLoading(false);
        return;
    }
    
    try {
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhoneNumber, appVerifier);
      window.confirmationResult = confirmationResult;
      setIsCodeSent(true);
      toast({ title: 'Código enviado', description: 'Revisa tus mensajes para el código de verificación.' });
    } catch (error: any) {
      console.error('Error sending SMS:', error);
      // This will display the "auth/operation-not-allowed" error to the user
      toast({ title: 'Error al enviar código', description: error.message, variant: 'destructive' });
      // Reset reCAPTCHA on failure
      appVerifier.render().then((widgetId) => {
        // @ts-ignore
        if (window.grecaptcha) {
          // @ts-ignore
          grecaptcha.reset(widgetId);
        }
      }).catch(console.error);

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
  
  if (isUserLoading || (!isUserLoading && user)) {
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
            <h1 className="font-headline text-2xl font-bold">touch+</h1>
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
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Enviar Código'}
            </Button>
          ) : (
            <Button className="w-full" onClick={handleVerifyCode} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Verificar e Ingresar'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </main>
  );
}
