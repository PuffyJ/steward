export const dynamic = 'force-dynamic';

import { createServerSupabase } from '@/lib/supabase';
import { getOrgBySlug, getContacts, getMemberships } from '@/lib/queries';
import { ContactsListView } from '@/components/contacts/ContactsListView';

export default async function ContactsPage({ params }: { params: { orgSlug: string } }) {
  const supabase = await createServerSupabase();
  const org = await getOrgBySlug(supabase, params.orgSlug);
  const [contacts, memberships] = await Promise.all([
    getContacts(supabase, org.id),
    getMemberships(supabase, org.id),
  ]);

  return (
    <ContactsListView
      initialContacts={contacts}
      memberships={memberships}
      orgSlug={params.orgSlug}
      orgId={org.id}
    />
  );
}
