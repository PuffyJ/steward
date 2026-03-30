'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Contact, Membership, STAGES } from '@/lib/types';
import { formatCurrency, forecast, isOverdue, isThisWeek, stagePipelineColor } from '@/lib/utils';

type ContactRow = Contact & { steward: { id: string; display_name: string } | null };

type Props = {
  contacts: ContactRow[];
  memberships: Membership[];
  currentUserName: string;
  orgSlug: string;
};

export function DashboardView({ contacts, memberships, currentUserName, orgSlug }: Props) {
  const myContacts = useMemo(
    () => contacts.filter(c => c.steward?.display_name === currentUserName),
    [contacts, currentUserName]
  );

  const myActions = useMemo(
    () => myContacts
      .filter(c => isThisWeek(c.next_action_date))
      .sort((a, b) => (a.next_action_date || '').localeCompare(b.next_action_date || '')),
    [myContacts]
  );

  const overdueContacts = useMemo(
    () => myContacts
      .filter(c => isOverdue(c.next_action_date))
      .sort((a, b) => (a.next_action_date || '').localeCompare(b.next_action_date || '')),
    [myContacts]
  );

  const stageTotals = useMemo(
    () => STAGES.map(s => {
      const sc = contacts.filter(c => c.stage === s);
      return {
        stage: s,
        count: sc.length,
        ask: sc.reduce((a, c) => a + (c.ask_amount || 0), 0),
        forecast: sc.reduce((a, c) => a + forecast(c.ask_amount, c.probability), 0),
      };
    }),
    [contacts]
  );

  const totalForecast = contacts.reduce((a, c) => a + forecast(c.ask_amount, c.probability), 0);

  const stewardStats = useMemo(
    () => memberships.map(m => {
      const sc = contacts.filter(c => c.steward?.display_name === m.display_name);
      return {
        name: m.display_name,
        count: sc.length,
        pipeline: sc.reduce((a, c) => a + (c.ask_amount || 0), 0),
        forecast: sc.reduce((a, c) => a + forecast(c.ask_amount, c.probability), 0),
        priorityA: sc.filter(c => c.priority?.startsWith('A')).length,
        overdue: sc.filter(c => isOverdue(c.next_action_date)).length,
      };
    }).filter(s => s.count > 0),
    [contacts, memberships]
  );

  return (
    <div className="fade-in">
      <div className="mb-7">
        <h1 className="text-2xl font-bold font-serif">Good morning</h1>
        <p className="text-sm text-gray-500 mt-1">Here&apos;s what needs your attention this week.</p>
      </div>

      {/* Scorecard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {[
          { label: 'My Contacts', value: String(myContacts.length), sub: `of ${contacts.length} total` },
          { label: 'My Pipeline', value: formatCurrency(myContacts.reduce((a, c) => a + (c.ask_amount || 0), 0)), sub: 'ask amount' },
          { label: 'My Forecast', value: formatCurrency(myContacts.reduce((a, c) => a + forecast(c.ask_amount, c.probability), 0)), sub: 'weighted' },
          { label: 'Overdue', value: String(overdueContacts.length), sub: overdueContacts.length > 0 ? 'need attention' : 'all clear', alert: overdueContacts.length > 0 },
        ].map((s, i) => (
          <div key={i} className={`card p-5 border-l-[3px] ${s.alert ? 'border-l-amber-500' : 'border-l-forest-700'}`}>
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">{s.label}</div>
            <div className={`text-2xl font-bold ${s.alert ? 'text-amber-700' : 'text-forest-700'}`}>{s.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Actions + Overdue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-7">
        {/* My Actions This Week */}
        <div className="card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-sand-300 flex justify-between items-center">
            <h3 className="font-bold text-sm">My Actions This Week</h3>
            <span className="badge bg-emerald-50 text-emerald-700">{myActions.length}</span>
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-sand-200">
            {myActions.length === 0 && (
              <div className="p-5 text-sm text-gray-400">No actions due this week.</div>
            )}
            {myActions.map(c => (
              <Link key={c.id} href={`/${orgSlug}/contacts/${c.id}`} className="flex justify-between items-center px-5 py-3 hover:bg-sand-50 transition-colors">
                <div>
                  <div className="font-semibold text-sm">{c.display_name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{c.next_action}</div>
                </div>
                <div className="text-xs text-gray-400 whitespace-nowrap ml-4">{c.next_action_date}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Overdue */}
        <div className={`card overflow-hidden ${overdueContacts.length > 0 ? 'border-amber-300' : ''}`}>
          <div className={`px-5 py-3.5 border-b border-sand-300 flex justify-between items-center ${overdueContacts.length > 0 ? 'bg-amber-50' : ''}`}>
            <h3 className="font-bold text-sm">Overdue</h3>
            <span className={`badge ${overdueContacts.length > 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>{overdueContacts.length}</span>
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-sand-200">
            {overdueContacts.length === 0 && (
              <div className="p-5 text-sm text-gray-400">Nothing overdue. Nice work.</div>
            )}
            {overdueContacts.map(c => (
              <Link key={c.id} href={`/${orgSlug}/contacts/${c.id}`} className="flex justify-between items-center px-5 py-3 bg-amber-50/50 hover:bg-amber-50 transition-colors">
                <div>
                  <div className="font-semibold text-sm">{c.display_name}</div>
                  <div className="text-xs text-amber-700 mt-0.5">{c.next_action}</div>
                </div>
                <div className="text-xs text-amber-700 font-semibold whitespace-nowrap ml-4">{c.next_action_date}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Pipeline Summary */}
      <div className="card p-5 mb-7">
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-bold text-sm">Pipeline Summary</h3>
          <div className="text-sm">Total Forecast: <strong className="text-forest-700">{formatCurrency(totalForecast)}</strong></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {stageTotals.map(s => (
            <div key={s.stage} className={`p-4 bg-sand-50 rounded-lg border-l-[3px] ${stagePipelineColor(s.stage)}`}>
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">{s.stage}</div>
              <div className="text-xl font-bold text-forest-700">{s.count}</div>
              <div className="text-xs text-gray-500 mt-1">{formatCurrency(s.forecast)} forecast</div>
            </div>
          ))}
        </div>
      </div>

      {/* Team Overview */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-sand-300">
          <h3 className="font-bold text-sm">Team Overview</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Steward</th>
                <th className="table-header">Contacts</th>
                <th className="table-header">Pipeline $</th>
                <th className="table-header">Forecast $</th>
                <th className="table-header">Priority A</th>
                <th className="table-header">Overdue</th>
              </tr>
            </thead>
            <tbody>
              {stewardStats.map(s => (
                <tr key={s.name} className="hover:bg-sand-50">
                  <td className="table-cell font-semibold">{s.name}</td>
                  <td className="table-cell">{s.count}</td>
                  <td className="table-cell tabular-nums">{formatCurrency(s.pipeline)}</td>
                  <td className="table-cell tabular-nums">{formatCurrency(s.forecast)}</td>
                  <td className="table-cell">
                    <span className={`badge ${s.priorityA > 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>{s.priorityA}</span>
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${s.overdue > 0 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>{s.overdue}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
