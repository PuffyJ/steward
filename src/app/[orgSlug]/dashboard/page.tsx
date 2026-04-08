export const dynamic = 'force-dynamic';

import { createServerSupabase, createAuthSupabase } from '@/lib/supabase';
import { getOrgBySlug, getContacts, getMemberships, getCurrentMembership, getInteractions, getDonationsByOrg } from '@/lib/queries';
import { DashboardView } from '@/components/dashboard/DashboardView';

export default async function DashboardPage({ params }: { params: { orgSlug: string } }) {
  const supabase = await createServerSupabase();
  const authClient = await createAuthSupabase();
  const { data: { session } } = await authClient.auth.getSession();

  const org = await getOrgBySlug(supabase, params.orgSlug);
  const [contacts, memberships, recentInteractions, donations] = await Promise.all([
    getContacts(supabase, org.id),
    getMemberships(supabase, org.id),
    getInteractions(supabase, org.id),
    getDonationsByOrg(supabase, org.id),
  ]);

  const currentMembership = session?.user
    ? await getCurrentMembership(supabase, org.id, session.user.id).catch(() => memberships[0])
    : memberships[0];

  return (
    <DashboardView
      contacts={contacts}
      memberships={memberships}
      recentInteractions={recentInteractions}
      donations={donations}
      currentMembershipId={currentMembership?.id ?? ''}
      currentUserName={currentMembership?.display_name ?? ''}
      orgSlug={params.orgSlug}
      orgName={org.name}
    />
  );
}
