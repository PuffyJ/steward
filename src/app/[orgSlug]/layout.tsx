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

  const membershipResult = await Promise.all([
    getCurrentMembership(supabase, org.id, user.id).catch(() => null),
    getMemberships(supabase, org.id),
  ]);

  const membership = membershipResult[0];
  const memberships = membershipResult[1];

  if (!membership) {
    redirect('/');
  }

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
