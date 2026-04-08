import { createServerSupabase, createAuthSupabase } from '@/lib/supabase';
import { getMemberships, getCurrentMembership } from '@/lib/queries';
import { getOrgBySlug } from '@/lib/queries';
import { notFound } from 'next/navigation';
import { InviteForm } from './InviteForm';
import { MemberRow } from './MemberRow';
import { StewardForm, RemoveStewardButton } from './StewardForm';

export default async function AccountPage({ params }: { params: { orgSlug: string } }) {
  const authClient = await createAuthSupabase();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return null;

  const supabase = await createServerSupabase();

  let org;
  try {
    org = await getOrgBySlug(supabase, params.orgSlug);
  } catch {
    notFound();
  }

  const [currentMembership, memberships] = await Promise.all([
    getCurrentMembership(supabase, org.id, user.id),
    getMemberships(supabase, org.id),
  ]);

  const isAdmin = currentMembership.role === 'admin';
  const authMembers = memberships.filter((m: any) => m.user_id != null);
  const nameOnlyStewards = memberships.filter((m: any) => m.user_id == null);

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Account</h1>

      <section className="mb-10">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Stewards</h2>
        <p className="text-sm text-gray-500 mb-3">People you can assign to contacts as their relationship manager.</p>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-4">
          {nameOnlyStewards.length === 0 && (
            <div className="px-5 py-4 text-sm text-gray-400">No stewards added yet.</div>
          )}
          {nameOnlyStewards.map((m: any, i: number) => (
            <div key={m.id} className={`flex items-center justify-between px-5 py-3.5 ${i < nameOnlyStewards.length - 1 ? 'border-b border-gray-100' : ''}`}>
              <span className="text-sm font-medium text-gray-900">{m.display_name}</span>
              {isAdmin && (
                <RemoveStewardButton membershipId={m.id} orgId={org.id} orgSlug={params.orgSlug} />
              )}
            </div>
          ))}
        </div>
        {isAdmin && (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <StewardForm orgId={org.id} orgSlug={params.orgSlug} />
          </div>
        )}
      </section>

      <section className="mb-10">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Team</h2>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {authMembers.map((m: any, i: number) => (
            <MemberRow
              key={m.id}
              membership={m}
              currentMembershipId={currentMembership.id}
              orgId={org.id}
              orgSlug={params.orgSlug}
              isAdmin={isAdmin}
              isLast={i === authMembers.length - 1}
            />
          ))}
        </div>
      </section>

      {isAdmin && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Invite someone</h2>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <InviteForm orgId={org.id} orgSlug={params.orgSlug} stewards={nameOnlyStewards} />
          </div>
        </section>
      )}
    </div>
  );
}
