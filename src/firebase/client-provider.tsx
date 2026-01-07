'use client';

import React, { useMemo, type ReactNode, useEffect } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { initializeAuthListener } from './non-blocking-updates';
import { AuthProvider } from './auth/use-user';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    return initializeFirebase();
  }, []);

  useEffect(() => {
    const unsubscribe = initializeAuthListener();
    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, []);


  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
        <AuthProvider>
            {children}
        </AuthProvider>
    </FirebaseProvider>
  );
}
