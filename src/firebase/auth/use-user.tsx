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
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import type { User as AppUser } from '@/lib/types';


export interface UserHookResult {
  user: User | null;
  appUser: AppUser | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export const UserContext = createContext<UserHookResult | undefined>(undefined);

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
      (firebaseUser) => {
        if(firebaseUser) {
           setUserState((prevState) => ({
                ...prevState,
                user: firebaseUser,
                isUserLoading: true, // Still loading appUser
            }));
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
  }, [auth]);

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
                 // The user document might not exist yet, we wait for it to be created
                 // non-blocking-updates.tsx will handle the creation
                 setUserState(prevState => ({
                    ...prevState,
                    appUser: null, // Explicitly set to null if doc doesn't exist
                    isUserLoading: false, // We've checked, so loading is done
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

    