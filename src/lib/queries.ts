import { SupabaseClient } from '@supabase/supabase-js';
import type { Contact, Donation, Interaction, Membership, Organization, ContactFormData } from './types';

// ─── Organization ────────────────────────────────────────────────────────────

export async function getOrgBySlug(supabase: SupabaseClient, slug: string) {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', slug)
    .single();
  if (error) throw error;
  return data as Organization;
}

// ─── Memberships ─────────────────────────────────────────────────────────────

export async function getMemberships(supabase: SupabaseClient, orgId: string) {
  const { data, error } = await supabase
    .from('memberships')
    .select('*')
    .eq('org_id', orgId)
    .order('display_name');
  if (error) throw error;
  return data as Membership[];
}

export async function getCurrentMembership(supabase: SupabaseClient, orgId: string, userId: string) {
  const { data, error } = await supabase
    .from('memberships')
    .select('*')
    .eq('org_id', orgId)
    .eq('user_id', userId)
    .single();
  if (error) throw error;
  return data as Membership;
}

// ─── Contacts ────────────────────────────────────────────────────────────────

export async function getContacts(supabase: SupabaseClient, orgId: string) {
  const { data, error } = await supabase
    .from('contacts')
    .select(`
      *,
      steward:memberships!steward_id(id, display_name)
    `)
    .eq('org_id', orgId)
    .order('display_name');
  if (error) throw error;
  return data as (Contact & { steward: { id: string; display_name: string } | null })[];
}

export async function getContact(supabase: SupabaseClient, contactId: string) {
  const { data, error } = await supabase
    .from('contacts')
    .select(`
      *,
      steward:memberships!steward_id(id, display_name)
    `)
    .eq('id', contactId)
    .single();
  if (error) throw error;
  return data as Contact & { steward: { id: string; display_name: string } | null };
}

export async function createContact(supabase: SupabaseClient, orgId: string, data: Partial<ContactFormData>) {
  const { data: contact, error } = await supabase
    .from('contacts')
    .insert({ ...data, org_id: orgId })
    .select()
    .single();
  if (error) throw error;
  return contact as Contact;
}

export async function updateContact(supabase: SupabaseClient, contactId: string, updates: Partial<Contact>) {
  const { id, org_id, created_at, updated_at, ...cleanUpdates } = updates as any;
  const { data, error } = await supabase
    .from('contacts')
    .update(cleanUpdates)
    .eq('id', contactId)
    .select()
    .single();
  if (error) throw error;
  return data as Contact;
}

export async function deleteContact(supabase: SupabaseClient, contactId: string) {
  const { error } = await supabase
    .from('contacts')
    .delete()
    .eq('id', contactId);
  if (error) throw error;
}

export async function bulkCreateContacts(supabase: SupabaseClient, orgId: string, contacts: Partial<ContactFormData>[]) {
  const rows = contacts.map(c => ({ ...c, org_id: orgId }));
  const { data, error } = await supabase
    .from('contacts')
    .insert(rows)
    .select();
  if (error) throw error;
  return data as Contact[];
}

// ─── Interactions ────────────────────────────────────────────────────────────

export async function getInteractionsByContact(supabase: SupabaseClient, contactId: string) {
  const { data, error } = await supabase
    .from('interactions')
    .select(`
      *,
      logged_by_member:memberships!logged_by(display_name)
    `)
    .eq('contact_id', contactId)
    .order('date', { ascending: false });
  if (error) throw error;
  return data as (Interaction & { logged_by_member: { display_name: string } | null })[];
}

export async function getInteractions(supabase: SupabaseClient, orgId: string) {
  const { data, error } = await supabase
    .from('interactions')
    .select(`
      *,
      contact:contacts!contact_id(id, display_name),
      logged_by_member:memberships!logged_by(display_name)
    `)
    .eq('org_id', orgId)
    .order('date', { ascending: false });
  if (error) throw error;
  return data as (Interaction & {
    contact: { id: string; display_name: string } | null;
    logged_by_member: { display_name: string } | null;
  })[];
}

export async function createInteraction(
  supabase: SupabaseClient,
  orgId: string,
  data: {
    contact_id: string;
    date: string;
    type: string;
    summary: string;
    outcome: string;
    next_step?: string;
    follow_up_date?: string;
    logged_by: string;
  }
) {
  const { data: interaction, error } = await supabase
    .from('interactions')
    .insert({ ...data, org_id: orgId })
    .select()
    .single();
  if (error) throw error;

  // Auto-update contact's next action if provided
  if (data.next_step || data.follow_up_date) {
    const contactUpdate: any = {};
    if (data.next_step) contactUpdate.next_action = data.next_step;
    if (data.follow_up_date) contactUpdate.next_action_date = data.follow_up_date;
    await supabase
      .from('contacts')
      .update(contactUpdate)
      .eq('id', data.contact_id);
  }

  return interaction as Interaction;
}

// ─── Donations ────────────────────────────────────────────────────────────────

export async function getDonationsByContact(supabase: SupabaseClient, contactId: string) {
  const { data, error } = await supabase
    .from('donations')
    .select('*')
    .eq('contact_id', contactId)
    .order('date', { ascending: false });
  if (error) throw error;
  return data as Donation[];
}

export async function getDonationsByOrg(supabase: SupabaseClient, orgId: string) {
  const { data, error } = await supabase
    .from('donations')
    .select('*')
    .eq('org_id', orgId)
    .order('date', { ascending: false });
  if (error) throw error;
  return data as Donation[];
}
