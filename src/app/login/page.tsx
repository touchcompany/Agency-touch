'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase, useUser } from '@/firebase';
import {
  RecaptchaVerifier,
  ConfirmationResult,
  signInWithPhoneNumber,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
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
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M15.5 10.2c.3-.2.6-.4.8-.7 1-1.2.9-3.3-.6-4.2-1.8-1-4.1.2-4.8 2.1 0 0 0 0 0 0-.2.4-.4.8-.5 1.2h5.1z"/><path d="M9.1 14c-.3.2-.6.4-.8.7-1 1.2-.9 3.3.6 4.2 1.8 1 4.1-.2 4.8-2.1.2-.4.4-.8.5-1.2H9.1z"/><path d="M12 12h-1M12 12v-1"/><path d="m4.9 10.2-.3 1.2c-.3 1 .1 2.1.8 2.8.8.7 1.9.8 2.9.4l.3-.2"/><path d="m19.1 13.8.3-1.2c.3-1-.1-2.1-.8-2.8-.8-.7-1.9-.8-2.9-.4l-.3.2"/><path d="M12 19.3V21c0 .6.4 1 1 1h2c.6 0 1-.4 1-1v-1.7"/><path d="M12 4.7V3c0-.6-.4-1-1-1H9c-.6 0-1 .4-1 1v1.7"/><path d="M18.4 6.2c.8.8.9 2.2.3 3.1l-1.4 2.1"/><path d="M5.6 17.8c-.8-.8-.9-2.2-.3-3.1l1.4-2.1"/></svg>
);


export default function LoginPage() {
  const { auth } = useFirebase();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  // Phone state
  const [phoneNumber, setPhoneNumber] = useState('+573173980133');
  const [code, setCode] = useState('231119');
  const [isCodeSent, setIsCodeSent] = useState(false);

  // Email state
  const [email, setEmail] = useState('ia@touch.com.co');
  const [password, setPassword] = useState('programador');
  const [isSignUp, setIsSignUp] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  // Phone Auth handlers
  const setupRecaptcha = () => {
    if (!auth) return null;
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
    }
    const recaptchaContainer = document.getElementById('recaptcha-container');
    if (!recaptchaContainer) return null;
    recaptchaContainer.innerHTML = '';
    
    return new RecaptchaVerifier(auth, recaptchaContainer, {
      size: 'invisible',
      callback: (response: any) => {},
    });
  };

  const handleSendCode = async () => {
    if (!auth) {
      toast({ title: 'Error', description: 'Servicio de autenticación no disponible.', variant: 'destructive' });
      return;
    }
    const formattedPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber : `+57${phoneNumber}`;
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
      toast({ title: 'Error al enviar código', description: error.message, variant: 'destructive' });
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

  // Google Auth handler
  const handleGoogleSignIn = async () => {
    if (!auth) return;
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({ title: '¡Éxito!', description: 'Has iniciado sesión con Google.' });
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
      toast({ title: 'Error de Google', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  // Email/Password handler
  const handleEmailAuth = async () => {
    if (!auth || !email || !password) {
      toast({ title: 'Error', description: 'Correo y contraseña son requeridos.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast({ title: 'Cuenta Creada', description: '¡Bienvenido! Has creado tu cuenta.' });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: '¡Éxito!', description: 'Has iniciado sesión.' });
      }
      router.push('/dashboard');
    } catch (error: any) {
       console.error("Error with email/password auth:", error);
       toast({ title: 'Error de Autenticación', description: error.message, variant: 'destructive' });
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
          <div className="mx-auto mb-4 flex items-center justify-center gap-2">
            <Image src="/favicon.svg" alt="touch logo" width={32} height={32} />
            <h1 className="font-headline text-2xl font-bold">touch</h1>
          </div>
          <CardTitle className="text-2xl">
            {isCodeSent ? 'Verificar Código' : 'Iniciar Sesión'}
          </CardTitle>
          <CardDescription>
            Elige tu método de acceso preferido.
          </CardDescription>
        </CardHeader>
        
        <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email">Correo</TabsTrigger>
                <TabsTrigger value="phone">Teléfono</TabsTrigger>
            </TabsList>
            
            <TabsContent value="email" className="px-1">
                <CardContent className="grid gap-4 pt-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Correo</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="tu@correo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Contraseña</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <div className="flex w-full gap-2">
                        <Button variant="outline" className="w-full" onClick={() => setIsSignUp(false) && handleEmailAuth()} disabled={isLoading}>
                           {isLoading && !isSignUp ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                           Ingresar
                        </Button>
                        <Button className="w-full" onClick={() => setIsSignUp(true) && handleEmailAuth()} disabled={isLoading}>
                           {isLoading && isSignUp ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                           Registrarse
                        </Button>
                    </div>
                     <div className="relative w-full">
                        <Separator />
                        <span className="absolute left-1/2 -translate-x-1/2 top-[-10px] bg-card px-2 text-xs text-muted-foreground">O</span>
                    </div>
                     <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
                        <GoogleIcon className="mr-2 h-4 w-4" />
                        Ingresar con Google
                    </Button>
                </CardFooter>
            </TabsContent>

            <TabsContent value="phone" className="px-1">
                <CardContent className="grid gap-4 pt-4">
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
            </TabsContent>
        </Tabs>

      </Card>
    </main>
  );
}

    