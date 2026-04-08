export const dynamic = 'force-dynamic';

import { createServerSupabase, createAuthSupabase } from '@/lib/supabase';
import { getOrgBySlug, getContact, getInteractionsByContact, getMemberships, getCurrentMembership, getDonationsByContact } from '@/lib/queries';
import { Contact360View } from '@/components/contacts/Contact360View';

export default async function ContactPage({ params }: { params: { orgSlug: string; id: string } }) {
  const supabase = await createServerSupabase();
  const authClient = await createAuthSupabase();
  const { data: { session } } = await authClient.auth.getSession();

  const org = await getOrgBySlug(supabase, params.orgSlug);
  const [contact, interactions, memberships, donations] = await Promise.all([
    getContact(supabase, params.id),
    getInteractionsByContact(supabase, params.id),
    getMemberships(supabase, org.id),
    getDonationsByContact(supabase, params.id),
  ]);

  const currentMembership = session?.user
    ? await getCurrentMembership(supabase, org.id, session.user.id).catch(() => memberships[0])
    : memberships[0];

  return (
    <Contact360View
      contact={contact}
      interactions={interactions}
      memberships={memberships}
      donations={donations}
      currentMembershipId={currentMembership?.id ?? ''}
      orgSlug={params.orgSlug}
      orgId={org.id}
    />
  );
}
