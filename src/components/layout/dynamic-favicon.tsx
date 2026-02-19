'use client';

import { useEffect } from 'react';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import type { UserSettings } from '@/lib/types';
import { doc } from 'firebase/firestore';

export function DynamicFavicon() {
  const { firestore, user } = useFirebase();

  const settingsRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid, 'settings', 'main') : null),
    [firestore, user]
  );
  const { data: settings } = useDoc<UserSettings>(settingsRef);

  useEffect(() => {
    const iconUrl = settings?.appleTouchIconUrl;

    // First, remove any previously added dynamic apple-touch-icon
    const existingIcon = document.querySelector('link[data-dynamic-apple-icon]');
    if (existingIcon) {
      existingIcon.remove();
    }

    if (iconUrl) {
      // Add the new apple-touch-icon link element
      const appleIcon = document.createElement('link');
      appleIcon.rel = 'apple-touch-icon';
      appleIcon.href = iconUrl;
      // Add a data attribute to identify it for future removals
      appleIcon.setAttribute('data-dynamic-apple-icon', 'true');
      document.head.appendChild(appleIcon);
    }
  }, [settings]);

  return null; // This component doesn't render anything
}
