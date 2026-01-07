'use client';
    
import {
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  CollectionReference,
  DocumentReference,
  SetOptions,
  doc,
  getDoc,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import {FirestorePermissionError} from '@/firebase/errors';
import { User, getAuth, onAuthStateChanged } from 'firebase/auth';

const ensureUserDocument = async (user: User) => {
  // Use getApp() and getFirestore() inside the function to ensure they are called on the client
  const { getApp, getFirestore } = await import('firebase/app');
  const firestore = getFirestore(getApp());

  const userRef = doc(firestore, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const userData = {
      id: user.uid,
      email: user.email,
      phoneNumber: user.phoneNumber,
      displayName: user.displayName,
      role: user.phoneNumber === '+573173980133' ? 'superuser' : null
    };
    try {
      await setDoc(userRef, userData, { merge: true });
    } catch (error) {
      console.error("Failed to create user document:", error);
       const contextualError = new FirestorePermissionError({
        path: userRef.path,
        operation: 'create',
        requestResourceData: userData,
      });
      errorEmitter.emit('permission-error', contextualError);
    }
  }
};


export function initializeAuthListener() {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
            ensureUserDocument(user);
        }
    });
    // Returning the unsubscribe function in case the caller wants to clean up
    return unsubscribe;
}


/**
 * Initiates a setDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
export function setDocumentNonBlocking(docRef: DocumentReference, data: any, options: SetOptions) {
  setDoc(docRef, data, options).catch(error => {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: docRef.path,
        operation: 'write', // or 'create'/'update' based on options
        requestResourceData: data,
      })
    )
  })
  // Execution continues immediately
}


/**
 * Initiates an addDoc operation for a collection reference.
 * Does NOT await the write operation internally.
 * Returns the Promise for the new doc ref, but typically not awaited by caller.
 */
export function addDocumentNonBlocking(colRef: CollectionReference, data: any) {
  const promise = addDoc(colRef, data)
    .catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: colRef.path,
          operation: 'create',
          requestResourceData: data,
        })
      )
    });
  return promise;
}


/**
 * Initiates an updateDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
export function updateDocumentNonBlocking(docRef: DocumentReference, data: any) {
  updateDoc(docRef, data)
    .catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: data,
        })
      )
    });
}


/**
 * Initiates a deleteDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
export function deleteDocumentNonBlocking(docRef: DocumentReference) {
  deleteDoc(docRef)
    .catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        })
      )
    });
}
