import { redirect } from 'next/navigation';
import { createAuthSupabase } from '@/lib/supabase';
import { createServerSupabase } from '@/lib/supabase';

export default async function Home() {
  const authClient = await createAuthSupabase();
  const { data: { session } } = await authClient.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const user = session.user;
  // Find the user's first org membership with the org slug
  const supabase = await createServerSupabase();
  const { data: memberships } = await supabase
    .from('memberships')
    .select('org_id, organizations(slug)')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (!memberships) {
    redirect('/login');
  }

  const org = (Array.isArray(memberships.organizations) ? memberships.organizations[0] : memberships.organizations) as { slug: string } | null;
  if (!org) {
    redirect('/login');
  }

  redirect(`/${org.slug}/dashboard`);
}
