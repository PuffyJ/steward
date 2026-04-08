import { notFound, redirect } from 'next/navigation';
import { createServerSupabase, createAuthSupabase } from '@/lib/supabase';
import { getOrgBySlug, getMemberships, getCurrentMembership } from '@/lib/queries';
import { OrgProvider } from '@/lib/org-context';
import { OrgNav } from '@/components/ui/OrgNav';

export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { orgSlug: string };
}) {
  const authClient = await createAuthSupabase();
  const { data: { session } } = await authClient.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const user = session.user;

  const supabase = await createServerSupabase();

  let org;
  try {
    org = await getOrgBySlug(supabase, params.orgSlug);
  } catch {
    notFound();
  }

  let membership;
  try {
    membership = await getCurrentMembership(supabase, org.id, user.id);
  } catch {
    // User is not a member of this org
    redirect('/');
  }

  const memberships = await getMemberships(supabase, org.id);

  return (
    <OrgProvider org={org} membership={membership} memberships={memberships}>
      <OrgNav
        orgSlug={params.orgSlug}
        orgName={org.name}
        userName={membership.display_name}
      />
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </OrgProvider>
  );
}
