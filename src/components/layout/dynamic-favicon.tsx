'use client';

import { useEffect } from 'react';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import type { CompanyProfile } from '@/lib/types';
import { collection, query, limit } from 'firebase/firestore';

export function DynamicFavicon() {
  const { firestore, user } = useFirebase();

  // Assume the first company profile dictates the branding favicon.
  const companyProfileQuery = useMemoFirebase(
    () => (user ? query(collection(firestore, 'users', user.uid, 'companyProfiles'), limit(1)) : null),
    [firestore, user]
  );
  const { data: profiles } = useCollection<CompanyProfile>(companyProfileQuery);

  useEffect(() => {
    if (profiles && profiles.length > 0 && profiles[0].faviconUrl) {
      const faviconUrl = profiles[0].faviconUrl;

      // Clean up previous dynamic icons
      document.querySelectorAll('link[data-dynamic-favicon]').forEach(e => e.remove());

      // Add apple-touch-icon
      const appleIcon = document.createElement('link');
      appleIcon.rel = 'apple-touch-icon';
      appleIcon.href = faviconUrl;
      appleIcon.setAttribute('data-dynamic-favicon', 'true');
      document.head.appendChild(appleIcon);

      // Add standard favicon
      const standardIcon = document.createElement('link');
      standardIcon.rel = 'icon';
      standardIcon.type = 'image/png';
      standardIcon.href = faviconUrl;
      standardIcon.setAttribute('data-dynamic-favicon', 'true');
      document.head.appendChild(standardIcon);
    }
  }, [profiles]);

  return null; // This component doesn't render anything
}