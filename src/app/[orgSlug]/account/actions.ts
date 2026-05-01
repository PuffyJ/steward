'use server';

import { createClient } from '@supabase/supabase-js';
import { createServerSupabase, createAuthSupabase } from '@/lib/supabase';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

async function assertAdmin(orgId: string) {
  const authClient = await createAuthSupabase();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const supabase = await createServerSupabase();
  const { data: membership } = await supabase
    .from('memberships')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', user.id)
    .single();

  if (membership?.role !== 'admin') throw new Error('Only admins can manage team members');
}

export async function inviteMember(
  orgId: string,
  orgSlug: string,
  email: string,
  displayName: string,
  role: 'admin' | 'steward' | 'viewer'
): Promise<{ error?: string }> {
  try {
    await assertAdmin(orgId);

    const headersList = headers();
    const origin = process.env.NEXT_PUBLIC_APP_URL || headersList.get('origin') || 'http://localhost:3000';

    const adminClient = getAdminClient();
    const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
      email,
      { redirectTo: `${origin}/auth/callback` }
    );

    if (inviteError) return { error: inviteError.message };

    const supabase = await createServerSupabase();

    // If a name-only steward with this display name already exists, upgrade it
    // instead of creating a duplicate — preserves all contact assignments
    const { data: existing } = await supabase
      .from('memberships')
      .select('id')
      .eq('org_id', orgId)
      .eq('display_name', displayName)
      .is('user_id', null)
      .single();

    let membershipError;
    if (existing) {
      ({ error: membershipError } = await supabase
        .from('memberships')
        .update({ user_id: inviteData.user.id, role })
        .eq('id', existing.id));
    } else {
      ({ error: membershipError } = await supabase
        .from('memberships')
        .insert({ org_id: orgId, user_id: inviteData.user.id, role, display_name: displayName }));
    }

    if (membershipError) return { error: membershipError.message };

    revalidatePath(`/${orgSlug}/account`);
    return {};
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function removeMember(
  membershipId: string,
  orgId: string,
  orgSlug: string
): Promise<{ error?: string }> {
  try {
    await assertAdmin(orgId);

    const adminClient = getAdminClient();
    await adminClient.from('contacts').update({ steward_id: null }).eq('steward_id', membershipId);
    await adminClient.from('interactions').update({ logged_by: null }).eq('logged_by', membershipId);

    const supabase = await createServerSupabase();
    const { error } = await supabase
      .from('memberships')
      .delete()
      .eq('id', membershipId);

    if (error) return { error: error.message };

    revalidatePath(`/${orgSlug}`, 'layout');
    return {};
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function resendInvite(
  membershipId: string,
  orgId: string,
  orgSlug: string
): Promise<{ error?: string }> {
  try {
    await assertAdmin(orgId);

    const supabase = await createServerSupabase();
    const { data: membership, error: membershipError } = await supabase
      .from('memberships')
      .select('user_id')
      .eq('id', membershipId)
      .single();

    if (membershipError || !membership?.user_id) return { error: 'Membership not found' };

    const headersList = headers();
    const origin = process.env.NEXT_PUBLIC_APP_URL || headersList.get('origin') || 'http://localhost:3000';

    const adminClient = getAdminClient();
    const { data: userData, error: userError } = await adminClient.auth.admin.getUserById(membership.user_id);
    if (userError || !userData?.user?.email) return { error: 'Could not find user account' };

    const { error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
      userData.user.email,
      { redirectTo: `${origin}/auth/callback` }
    );

    if (inviteError) return { error: inviteError.message };

    revalidatePath(`/${orgSlug}/account`);
    return {};
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function addSteward(
  orgId: string,
  orgSlug: string,
  displayName: string
): Promise<{ error?: string }> {
  try {
    await assertAdmin(orgId);

    const supabase = await createServerSupabase();
    const { error } = await supabase
      .from('memberships')
      .insert({ org_id: orgId, user_id: null, role: 'steward', display_name: displayName });

    if (error) return { error: error.message };

    revalidatePath(`/${orgSlug}`, 'layout');
    return {};
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function updateMemberRole(
  membershipId: string,
  newRole: string,
  orgId: string,
  orgSlug: string
): Promise<{ error?: string }> {
  try {
    await assertAdmin(orgId);

    const supabase = await createServerSupabase();
    const { error } = await supabase
      .from('memberships')
      .update({ role: newRole })
      .eq('id', membershipId);

    if (error) return { error: error.message };

    revalidatePath(`/${orgSlug}/account`);
    return {};
  } catch (e: any) {
    return { error: e.message };
  }
}
