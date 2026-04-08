'use server';

import { createServerSupabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function updateOrgSettings(
  orgId: string,
  orgSlug: string,
  startingBalance: number,
  monthlyExpenses: number
): Promise<void> {
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from('organizations')
    .update({ starting_balance: startingBalance, monthly_expenses: monthlyExpenses })
    .eq('id', orgId);
  if (error) throw new Error(error.message);
  revalidatePath(`/${orgSlug}/forecast`, 'page');
}
