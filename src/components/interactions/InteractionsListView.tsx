'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Interaction, Membership, INTERACTION_TYPES, OUTCOMES, InteractionFilters } from '@/lib/types';
import { formatDate, outcomeColor } from '@/lib/utils';

type InteractionRow = Interaction & {
  contact: { id: string; display_name: string } | null;
  logged_by_member: { display_name: string } | null;
};

type Props = {
  interactions: InteractionRow[];
  memberships: Membership[];
  orgSlug: string;
};

export function InteractionsListView({ interactions, memberships, orgSlug }: Props) {
  const [filters, setFilters] = useState<InteractionFilters>({
    steward: '', outcome: '', type: '', dateFrom: '', dateTo: '',
  });

  const filtered = useMemo(() => {
    let list = [...interactions];
    if (filters.steward) list = list.filter(i => i.logged_by_member?.display_name === filters.steward);
    if (filters.outcome) list = list.filter(i => i.outcome === filters.outcome);
    if (filters.type) list = list.filter(i => i.type === filters.type);
    if (filters.dateFrom) list = list.filter(i => i.date >= filters.dateFrom);
    if (filters.dateTo) list = list.filter(i => i.date <= filters.dateTo);
    return list;
  }, [interactions, filters]);

  const hasFilters = filters.steward || filters.outcome || filters.type || filters.dateFrom || filters.dateTo;

  return (
    <div className="fade-in">
      <h1 className="text-2xl font-bold font-serif mb-1">Interactions</h1>
      <p className="text-sm text-gray-500 mb-5">{filtered.length} interactions logged</p>

      {/* Filters */}
      <div className="card px-4 py-3 mb-4 flex flex-wrap gap-2.5 items-center">
        <select className="form-input w-auto" value={filters.steward} onChange={e => setFilters(f => ({ ...f, steward: e.target.value }))}>
          <option value="">All Stewards</option>
          {memberships.map(m => <option key={m.id} value={m.display_name}>{m.display_name}</option>)}
        </select>
        <select className="form-input w-auto" value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}>
          <option value="">All Types</option>
          {INTERACTION_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
        <select className="form-input w-auto" value={filters.outcome} onChange={e => setFilters(f => ({ ...f, outcome: e.target.value }))}>
          <option value="">All Outcomes</option>
          {OUTCOMES.map(o => <option key={o}>{o}</option>)}
        </select>
        <input className="form-input w-auto" type="date" value={filters.dateFrom} onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))} />
        <span className="text-xs text-gray-400">to</span>
        <input className="form-input w-auto" type="date" value={filters.dateTo} onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))} />
        {hasFilters && (
          <button className="btn btn-ghost text-xs text-amber-700" onClick={() => setFilters({ steward: '', outcome: '', type: '', dateFrom: '', dateTo: '' })}>
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Date</th>
                <th className="table-header min-w-[160px]">Contact</th>
                <th className="table-header">Type</th>
                <th className="table-header min-w-[240px]">Summary</th>
                <th className="table-header">Outcome</th>
                <th className="table-header">Logged By</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="table-cell text-center text-gray-400 py-12">
                    {hasFilters ? 'No interactions match your filters.' : 'No interactions logged yet.'}
                  </td>
                </tr>
              )}
              {filtered.map(i => (
                <tr key={i.id} className="hover:bg-sand-50">
                  <td className="table-cell whitespace-nowrap">{formatDate(i.date)}</td>
                  <td className="table-cell font-semibold">
                    {i.contact ? (
                      <Link href={`/${orgSlug}/contacts/${i.contact.id}`} className="hover:text-forest-700 transition-colors">
                        {i.contact.display_name}
                      </Link>
                    ) : '—'}
                  </td>
                  <td className="table-cell">
                    <span className="badge bg-sand-200 text-gray-600">{i.type}</span>
                  </td>
                  <td className="table-cell text-gray-600 max-w-xs truncate">{i.summary}</td>
                  <td className="table-cell">
                    <span className={`badge border ${outcomeColor(i.outcome)}`}>{i.outcome}</span>
                  </td>
                  <td className="table-cell text-xs">{i.logged_by_member?.display_name || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
