export const dynamic = 'force-dynamic';

import { createServerSupabase } from '@/lib/supabase';
import { getOrgBySlug, getInteractions, getMemberships } from '@/lib/queries';
import { InteractionsListView } from '@/components/interactions/InteractionsListView';

export default async function InteractionsPage({ params }: { params: { orgSlug: string } }) {
  const supabase = await createServerSupabase();
  const org = await getOrgBySlug(supabase, params.orgSlug);
  const [interactions, memberships] = await Promise.all([
    getInteractions(supabase, org.id),
    getMemberships(supabase, org.id),
  ]);

  return (
    <InteractionsListView
      interactions={interactions}
      memberships={memberships}
      orgSlug={params.orgSlug}
    />
  );
}
