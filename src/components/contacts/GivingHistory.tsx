'use client';

import { Donation } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { deleteDonation } from '@/app/actions';

type Props = {
  donations: Donation[];
  contactId: string;
  orgId: string;
};

export function GivingHistory({ donations, contactId, orgId }: Props) {
  const totalGiven = donations.reduce((sum, d) => sum + Number(d.amount), 0);

  async function handleDelete(id: string) {
    if (!confirm('Remove this donation?')) return;
    await deleteDonation(id, contactId);
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-sand-300">
        <h3 className="font-bold text-sm">Giving History</h3>
        <span className="text-sm font-semibold text-forest-700">{formatCurrency(totalGiven)} total</span>
      </div>

      {/* Donation list */}
      {donations.length === 0 ? (
        <p className="text-sm text-gray-400 mb-4">No donations recorded yet.</p>
      ) : (
        <div className="space-y-1.5 mb-4">
          {donations.map(d => (
            <div key={d.id} className="flex items-center justify-between text-sm py-1.5 border-b border-sand-100 last:border-0">
              <div className="flex gap-3 items-center">
                <span className="text-gray-500 tabular-nums w-24">{formatDate(d.date)}</span>
                <span className="font-semibold text-forest-700 tabular-nums">{formatCurrency(d.amount)}</span>
                {d.notes && <span className="text-gray-400 text-xs truncate max-w-[180px]">{d.notes}</span>}
              </div>
              <button
                onClick={() => handleDelete(d.id)}
                className="text-xs text-gray-300 hover:text-red-500 transition-colors ml-2"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
