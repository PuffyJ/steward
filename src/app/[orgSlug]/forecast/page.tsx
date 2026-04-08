export const dynamic = 'force-dynamic';

import { createServerSupabase } from '@/lib/supabase';
import { getOrgBySlug, getContacts, getDonationsByOrg } from '@/lib/queries';
import { ForecastView } from '@/components/forecast/ForecastView';

export default async function ForecastPage({ params }: { params: { orgSlug: string } }) {
  const supabase = await createServerSupabase();
  const org = await getOrgBySlug(supabase, params.orgSlug);
  const [contacts, donations] = await Promise.all([
    getContacts(supabase, org.id),
    getDonationsByOrg(supabase, org.id),
  ]);

  return (
    <ForecastView
      contacts={contacts}
      donations={donations}
      orgId={org.id}
      orgSlug={params.orgSlug}
      startingBalance={Number(org.starting_balance) || 0}
      monthlyExpenses={Number(org.monthly_expenses) || 0}
    />
  );
}
