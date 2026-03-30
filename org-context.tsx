'use client';

import { createContext, useContext, ReactNode } from 'react';
import type { Organization, Membership } from '@/lib/types';

type OrgContextType = {
  org: Organization;
  membership: Membership | null; // current user's membership
  memberships: Membership[]; // all org members (for steward dropdowns)
};

const OrgContext = createContext<OrgContextType | null>(null);

export function OrgProvider({
  children,
  org,
  membership,
  memberships,
}: {
  children: ReactNode;
  org: Organization;
  membership: Membership | null;
  memberships: Membership[];
}) {
  return (
    <OrgContext.Provider value={{ org, membership, memberships }}>
      {children}
    </OrgContext.Provider>
  );
}

export function useOrg() {
  const context = useContext(OrgContext);
  if (!context) throw new Error('useOrg must be used within OrgProvider');
  return context;
}
