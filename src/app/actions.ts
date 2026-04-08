'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/lib/supabase';
import type { Contact, ContactFormData } from '@/lib/types';

export async function importContacts(
  orgId: string,
  contacts: Partial<ContactFormData>[]
): Promise<{ success: number; errors: { row: number; message: string }[] }> {
  const supabase = await createServerSupabase();
  let success = 0;
  const errors: { row: number; message: string }[] = [];

  // Insert one at a time so a single bad row doesn't kill the whole batch
  for (let i = 0; i < contacts.length; i++) {
    const { error } = await supabase
      .from('contacts')
      .insert({ ...contacts[i], org_id: orgId });

    if (error) {
      errors.push({ row: i + 1, message: error.message });
    } else {
      success++;
    }
  }

  return { success, errors };
}

export async function updateContactAction(
  contactId: string,
  updates: Partial<Contact>
): Promise<void> {
  const supabase = await createServerSupabase();
  const { id, org_id, created_at, updated_at, ...cleanUpdates } = updates as any;
  const { error } = await supabase
    .from('contacts')
    .update(cleanUpdates)
    .eq('id', contactId);
  if (error) throw new Error(error.message);
  revalidatePath('/[orgSlug]/contacts', 'layout');
  revalidatePath('/[orgSlug]/interactions', 'page');
  revalidatePath('/[orgSlug]/dashboard', 'page');
  revalidatePath('/[orgSlug]/forecast', 'page');
}
export async function logInteractionAction(
  orgId: string,
  contactId: string,
  data: {
    date: string;
    type: string;
    summary: string;
    outcome: string;
    next_step?: string;
    follow_up_date?: string;
    logged_by: string;
  }
): Promise<void> {
  const supabase = await createServerSupabase();

  const { error } = await supabase
    .from('interactions')
    .insert({ ...data, org_id: orgId, contact_id: contactId });

  if (error) throw new Error(error.message);

  // Auto-update contact's next action if provided
  if (data.next_step || data.follow_up_date) {
    const contactUpdate: any = {};
    if (data.next_step) contactUpdate.next_action = data.next_step;
    if (data.follow_up_date) contactUpdate.next_action_date = data.follow_up_date;
    await supabase.from('contacts').update(contactUpdate).eq('id', contactId);
  }

  revalidatePath('/[orgSlug]/contacts', 'layout');
  revalidatePath('/[orgSlug]/interactions', 'page');
  revalidatePath('/[orgSlug]/dashboard', 'page');
  revalidatePath('/[orgSlug]/forecast', 'page');
}

export async function addDonation(
  orgId: string,
  contactId: string,
  date: string,
  amount: number,
  notes: string
): Promise<void> {
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from('donations')
    .insert({ org_id: orgId, contact_id: contactId, date, amount, notes: notes || null });
  if (error) throw new Error(error.message);

  // Sync given_current_year to sum of donations in current calendar year
  const year = new Date().getFullYear();
  const { data: yearDonations } = await supabase
    .from('donations')
    .select('amount')
    .eq('contact_id', contactId)
    .gte('date', `${year}-01-01`)
    .lte('date', `${year}-12-31`);
  const total = (yearDonations || []).reduce((sum, d) => sum + Number(d.amount), 0);
  await supabase.from('contacts').update({ given_current_year: total }).eq('id', contactId);

  revalidatePath('/[orgSlug]/contacts', 'layout');
  revalidatePath('/[orgSlug]/dashboard', 'page');
  revalidatePath('/[orgSlug]/forecast', 'page');
}

export async function deleteDonation(
  donationId: string,
  contactId: string
): Promise<void> {
  const supabase = await createServerSupabase();
  const { error } = await supabase.from('donations').delete().eq('id', donationId);
  if (error) throw new Error(error.message);

  // Re-sync given_current_year
  const year = new Date().getFullYear();
  const { data: yearDonations } = await supabase
    .from('donations')
    .select('amount')
    .eq('contact_id', contactId)
    .gte('date', `${year}-01-01`)
    .lte('date', `${year}-12-31`);
  const total = (yearDonations || []).reduce((sum, d) => sum + Number(d.amount), 0);
  await supabase.from('contacts').update({ given_current_year: total }).eq('id', contactId);

  revalidatePath('/[orgSlug]/contacts', 'layout');
  revalidatePath('/[orgSlug]/dashboard', 'page');
  revalidatePath('/[orgSlug]/forecast', 'page');
}
