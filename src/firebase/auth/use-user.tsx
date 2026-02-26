'use client';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { useFirebase } from '@/firebase/provider';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import type { User as AppUser } from '@/lib/types';

export interface UserHookResult {
  user: User | null;
  appUser: AppUser | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export const UserContext = createContext<UserHookResult | undefined>(undefined);

/**
 * Convierte valores undefined a null para compatibilidad con Firestore.
 */
const safeValue = (val: any) => (val === undefined || val === null) ? null : val;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { auth, firestore } = useFirebase();
  const [userState, setUserState] = useState<UserHookResult>({
    user: null,
    appUser: null,
    isUserLoading: true,
    userError: null,
  });

  useEffect(() => {
    if (!auth) {
      setUserState({
        user: null,
        appUser: null,
        isUserLoading: false,
        userError: new Error('Auth service not available.'),
      });
      return;
    }
    
    const unsubscribeAuth = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        if(firebaseUser) {
           setUserState((prevState) => ({
                ...prevState,
                user: firebaseUser,
                isUserLoading: true,
            }));

           // Auto-creación de perfil si no existe (robusto contra undefined)
           if (firestore) {
             const userRef = doc(firestore, 'users', firebaseUser.uid);
             const userSnap = await getDoc(userRef);
             if (!userSnap.exists()) {
               await setDoc(userRef, {
                 id: firebaseUser.uid,
                 email: safeValue(firebaseUser.email),
                 phoneNumber: safeValue(firebaseUser.phoneNumber),
                 displayName: safeValue(firebaseUser.displayName),
                 role: 'superuser', // El primer usuario que se registre será superusuario
                 createdAt: new Date().toISOString(),
               });
             }
           }
        } else {
            setUserState({ user: null, appUser: null, isUserLoading: false, userError: null });
        }
      },
      (error) => {
        console.error('onAuthStateChanged error:', error);
        setUserState({
          user: null,
          appUser: null,
          isUserLoading: false,
          userError: error,
        });
      }
    );
     return () => unsubscribeAuth();
  }, [auth, firestore]);

  useEffect(() => {
     if(userState.user && firestore) {
        const userDocRef = doc(firestore, 'users', userState.user.uid);
        
        const unsubscribeFirestore = onSnapshot(userDocRef, (doc) => {
             if (doc.exists()) {
                setUserState(prevState => ({
                    ...prevState,
                    appUser: doc.data() as AppUser,
                    isUserLoading: false,
                }));
            } else {
                 setUserState(prevState => ({
                    ...prevState,
                    appUser: null,
                    isUserLoading: false,
                }));
            }
        }, (error) => {
             console.error("Error fetching user document:", error);
             setUserState(prevState => ({
                ...prevState,
                appUser: null,
                isUserLoading: false,
                userError: error,
            }));
        });
        
        return () => unsubscribeFirestore();
     }
  }, [userState.user, firestore]);

  return (
    <UserContext.Provider value={userState}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserHookResult => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within an AuthProvider');
  }
  return context;
};
