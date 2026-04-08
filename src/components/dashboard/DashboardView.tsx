'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Contact, Donation, Interaction, Membership, STAGES } from '@/lib/types';
import { formatCurrency, isOverdue, stageColor } from '@/lib/utils';

type ContactRow = Contact & { steward: { id: string; display_name: string } | null };
type InteractionRow = Interaction & {
  contact: { id: string; display_name: string } | null;
  logged_by_member: { display_name: string } | null;
};

type Props = {
  contacts: ContactRow[];
  memberships: Membership[];
  recentInteractions: InteractionRow[];
  donations: Donation[];
  currentMembershipId: string;
  currentUserName: string;
  orgSlug: string;
  orgName: string;
};

function Funnel({ contacts, orgSlug, title }: { contacts: ContactRow[]; orgSlug: string; title: string }) {
  const maxCount = Math.max(...STAGES.map(s => contacts.filter(c => c.stage === s).length), 1);
  return (
    <div className="card p-5">
      <h3 className="font-bold text-sm mb-4">{title}</h3>
      <div className="space-y-2">
        {STAGES.map(s => {
          const sc = contacts.filter(c => c.stage === s);
          const pct = Math.max((sc.length / maxCount) * 100, sc.length > 0 ? 8 : 0);
          return (
            <div key={s}>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span className="truncate mr-2">{s}</span>
                <span className="tabular-nums shrink-0">{sc.length} · {formatCurrency(sc.reduce((a, c) => a + (c.ask_amount || 0), 0))}</span>
              </div>
              <div className="h-6 bg-sand-100 rounded overflow-hidden">
                <div
                  className="h-full rounded transition-all duration-500 flex items-center px-2"
                  style={{ width: `${pct}%`, background: stageBgColor(s) }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 pt-3 border-t border-sand-200 flex justify-between text-xs text-gray-500">
        <span>{contacts.filter(c => c.stage).length} in pipeline</span>
        <span className="font-semibold">{formatCurrency(contacts.reduce((a, c) => a + (c.ask_amount || 0), 0))}</span>
      </div>
    </div>
  );
}

function stageBgColor(stage: string): string {
  switch (stage) {
    case 'Needs Further Cultivation': return '#d1d5db';
    case 'Prayerful Discernment': return '#93c5fd';
    case 'Ready for Invitation': return '#fcd34d';
    case 'Strategic Connector': return '#c4b5fd';
    case 'Given': return '#6ee7b7';
    default: return '#e5e7eb';
  }
}

export function DashboardView({ contacts, memberships, recentInteractions, donations, currentMembershipId, currentUserName, orgSlug, orgName }: Props) {
  const [expandedSteward, setExpandedSteward] = useState<string | null>(null);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const myContacts = useMemo(
    () => contacts
      .filter(c => c.steward?.display_name === currentUserName)
      .sort((a, b) => (a.next_action_date || 'z').localeCompare(b.next_action_date || 'z')),
    [contacts, currentUserName]
  );

  const myActions = useMemo(
    () => myContacts
      .filter(c => c.next_action_date)
      .sort((a, b) => (a.next_action_date || '').localeCompare(b.next_action_date || '')),
    [myContacts]
  );

  const myOverdue = useMemo(() => myContacts.filter(c => isOverdue(c.next_action_date)), [myContacts]);

  const thisYear = new Date().getFullYear();
  const totalRaisedThisYear = useMemo(
    () => donations.filter(d => new Date(d.date).getFullYear() === thisYear).reduce((s, d) => s + Number(d.amount), 0),
    [donations, thisYear]
  );

  // ── Forecast Snapshot ──────────────────────────────────────────────────────
  const today = new Date();
  const in90 = new Date(today); in90.setDate(today.getDate() + 90);
  const todayStr = today.toISOString().slice(0, 10);
  const in90Str = in90.toISOString().slice(0, 10);
  const thisMonthKey = todayStr.slice(0, 7);

  const expected90 = useMemo(
    () => contacts
      .filter(c => c.forecast_date && c.forecast_date >= todayStr && c.forecast_date <= in90Str)
      .reduce((s, c) => s + (c.ask_amount || 0), 0),
    [contacts, todayStr, in90Str]
  );

  const receivedThisMonth = useMemo(
    () => donations
      .filter(d => d.date.slice(0, 7) === thisMonthKey)
      .reduce((s, d) => s + Number(d.amount), 0),
    [donations, thisMonthKey]
  );

  const upcomingGifts = useMemo(
    () => contacts
      .filter(c => c.forecast_date && c.forecast_date >= todayStr && c.forecast_date <= in90Str)
      .sort((a, b) => (a.forecast_date || '').localeCompare(b.forecast_date || '')),
    [contacts, todayStr, in90Str]
  );

  // ── Recent Activity (last 90 days) ─────────────────────────────────────────
  const cutoff = new Date(today); cutoff.setDate(today.getDate() - 90);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  const activityItems = useMemo(() => {
    const items: { date: string; title: string; sub: string; contactId?: string }[] = [];

    donations
      .filter(d => d.date >= cutoffStr)
      .forEach(d => {
        const contact = contacts.find(c => c.id === d.contact_id);
        items.push({
          date: d.date,
          title: `Gift recorded — ${contact?.display_name ?? 'Unknown'}`,
          sub: `${formatCurrency(Number(d.amount))} donation recorded`,
          contactId: d.contact_id,
        });
      });

    recentInteractions
      .filter(i => i.date >= cutoffStr)
      .forEach(i => {
        items.push({
          date: i.date,
          title: `Interaction logged — ${i.contact?.display_name ?? 'Unknown'}`,
          sub: i.summary || i.type || 'Interaction recorded',
          contactId: i.contact?.id,
        });
      });

    return items.sort((a, b) => b.date.localeCompare(a.date));
  }, [donations, recentInteractions, contacts, cutoffStr]);

  const stewardStats = useMemo(
    () => memberships
      .map(m => {
        const sc = contacts.filter(c => c.steward?.display_name === m.display_name);
        return {
          id: m.id,
          name: m.display_name,
          contacts: sc,
          pipeline: sc.reduce((a, c) => a + (c.ask_amount || 0), 0),
          overdue: sc.filter(c => isOverdue(c.next_action_date)).length,
        };
      })
      .filter(s => s.contacts.length > 0),
    [contacts, memberships]
  );

  return (
    <div className="fade-in">
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-serif">{greeting}{currentUserName ? `, ${currentUserName.split(' ')[0]}` : ''}</h1>
      </div>

      {/* Personal stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'My Contacts', value: String(myContacts.length), sub: `of ${contacts.length} total` },
          { label: 'My Pipeline', value: formatCurrency(myContacts.reduce((a, c) => a + (c.ask_amount || 0), 0)), sub: 'ask amount' },
          { label: 'My Overdue', value: String(myOverdue.length), sub: myOverdue.length > 0 ? 'need attention' : 'all clear', alert: myOverdue.length > 0 },
          { label: 'Raised This Year', value: formatCurrency(totalRaisedThisYear), sub: `${thisYear} org total` },
        ].map((s, i) => (
          <div key={i} className={`card p-5 border-l-[3px] ${s.alert ? 'border-l-amber-500' : 'border-l-forest-700'}`}>
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">{s.label}</div>
            <div className={`text-2xl font-bold ${s.alert ? 'text-amber-700' : 'text-forest-700'}`}>{s.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* My Contacts list + My Upcoming Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">

        {/* My Contacts */}
        <div className="card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-sand-300">
            <h3 className="font-bold text-sm">My Contacts</h3>
            <p className="text-xs text-gray-400 mt-0.5">{myContacts.length} assigned to you</p>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: '312px' }}>
            {myContacts.length === 0 && (
              <div className="p-5 text-sm text-gray-400">No contacts assigned to you yet.</div>
            )}
            {myContacts.map(c => (
              <Link
                key={c.id}
                href={`/${orgSlug}/contacts/${c.id}`}
                className="flex items-center justify-between px-5 py-3 border-b border-sand-100 last:border-0 hover:bg-sand-50 transition-colors"
              >
                <div className="flex-1 min-w-0 mr-3">
                  <div className="font-semibold text-sm truncate">{c.display_name}</div>
                  {c.next_action && (
                    <div className={`text-xs mt-0.5 truncate ${isOverdue(c.next_action_date) ? 'text-amber-600' : 'text-gray-400'}`}>
                      {isOverdue(c.next_action_date) ? '⚠ ' : ''}{c.next_action}
                      {c.next_action_date && <span className="ml-1">· {c.next_action_date}</span>}
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  {c.ask_amount && <div className="text-sm font-semibold text-forest-700 tabular-nums">{formatCurrency(c.ask_amount)}</div>}
                  {c.stage && <span className={`badge border text-xs mt-0.5 ${stageColor(c.stage)}`}>{c.stage}</span>}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* My Upcoming Actions */}
        <div className="card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-sand-300 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm">My Upcoming Actions</h3>
              <p className="text-xs text-gray-400 mt-0.5">Sorted by date</p>
            </div>
            {myOverdue.length > 0 && <span className="badge bg-amber-100 text-amber-700">{myOverdue.length} overdue</span>}
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: '312px' }}>
            {myActions.length === 0 && (
              <div className="p-5 text-sm text-gray-400">No upcoming actions.</div>
            )}
            {myActions.map(c => (
              <Link
                key={c.id}
                href={`/${orgSlug}/contacts/${c.id}`}
                className={`flex items-center justify-between px-5 py-3 border-b border-sand-100 last:border-0 transition-colors ${isOverdue(c.next_action_date) ? 'bg-amber-50/50 hover:bg-amber-50' : 'hover:bg-sand-50'}`}
              >
                <div className="flex-1 min-w-0 mr-3">
                  <div className="font-semibold text-sm truncate">{c.display_name}</div>
                  <div className={`text-xs mt-0.5 truncate ${isOverdue(c.next_action_date) ? 'text-amber-700' : 'text-gray-500'}`}>{c.next_action}</div>
                </div>
                <div className={`text-xs font-semibold whitespace-nowrap ${isOverdue(c.next_action_date) ? 'text-amber-700' : 'text-gray-400'}`}>
                  {isOverdue(c.next_action_date) ? '⚠ ' : ''}{c.next_action_date}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Org Overview Header + Stats */}
      <div className="mb-4">
        <h2 className="text-xl font-bold font-serif">{orgName} Overview</h2>
      </div>

      {/* Org-wide stats */}
      {(() => {
        const orgPipeline = contacts.reduce((a, c) => a + (c.ask_amount || 0), 0);
        const orgRaised = contacts.reduce((a, c) => a + (c.given_current_year || 0), 0);
        const notGiven = contacts.filter(c => !c.given_current_year || c.given_current_year === 0).length;
        return (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Contacts', value: String(contacts.length), sub: 'across all stewards' },
              { label: 'Total Pipeline', value: formatCurrency(orgPipeline), sub: 'total ask amounts' },
              { label: 'Raised This Year', value: formatCurrency(orgRaised), sub: `${thisYear} org total` },
              { label: 'Not Given Yet', value: String(notGiven), sub: 'contacts with no gift this year', alert: notGiven > 0 },
            ].map((s, i) => (
              <div key={i} className={`card p-5 border-l-[3px] ${s.alert ? 'border-l-amber-500' : 'border-l-forest-700'}`}>
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">{s.label}</div>
                <div className={`text-2xl font-bold ${s.alert ? 'text-amber-700' : 'text-forest-700'}`}>{s.value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Forecast Snapshot + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">

        {/* Forecast Snapshot */}
        <div className="card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-sand-300 flex justify-between items-center">
            <h3 className="font-bold text-sm">Forecast Snapshot</h3>
            <Link href={`/${orgSlug}/forecast`} className="text-xs text-forest-700 font-semibold hover:underline">
              View Full Forecast →
            </Link>
          </div>
          <div className="p-5 space-y-3">
            <div className="rounded-lg border border-sand-200 bg-sand-50 px-4 py-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Received This Month</div>
              <div className="text-2xl font-bold text-forest-700">{formatCurrency(receivedThisMonth)}</div>
            </div>
            <div className="rounded-lg border border-sand-200 bg-sand-50 px-4 py-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Expected Next 90 Days</div>
              <div className="text-2xl font-bold text-forest-700">{formatCurrency(expected90)}</div>
            </div>
            <div className="rounded-lg border border-sand-200 bg-sand-50 px-4 py-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Next Expected Gifts</div>
              {upcomingGifts.length === 0 ? (
                <span className="text-gray-400 text-sm">No gifts forecasted in the next 90 days</span>
              ) : (
                <div className="overflow-y-auto space-y-2" style={{ maxHeight: '140px' }}>
                  {upcomingGifts.map(c => (
                    <Link
                      key={c.id}
                      href={`/${orgSlug}/contacts/${c.id}`}
                      className="flex items-center justify-between hover:bg-sand-100 rounded px-1 py-0.5 -mx-1 transition-colors"
                    >
                      <span className="font-semibold text-sm text-forest-700 hover:underline">{c.display_name}</span>
                      <span className="text-xs text-gray-500 ml-2 shrink-0">
                        {new Date(c.forecast_date! + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        {c.ask_amount ? ` · ${formatCurrency(c.ask_amount)}` : ''}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-sand-300">
            <h3 className="font-bold text-sm">Recent Movement</h3>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: '360px' }}>
            {activityItems.length === 0 && (
              <div className="p-5 text-sm text-gray-400">No activity in the last 90 days.</div>
            )}
            {activityItems.map((item, i) => (
              <div key={i} className="flex items-start justify-between px-5 py-3.5 border-b border-sand-100 last:border-0">
                <div className="flex-1 min-w-0 mr-3">
                  {item.contactId ? (
                    <Link href={`/${orgSlug}/contacts/${item.contactId}`} className="font-semibold text-sm hover:underline block truncate">
                      {item.title}
                    </Link>
                  ) : (
                    <div className="font-semibold text-sm truncate">{item.title}</div>
                  )}
                  <div className="text-xs text-gray-500 mt-0.5 truncate">{item.sub}</div>
                </div>
                <div className="text-xs text-gray-400 whitespace-nowrap shrink-0">
                  {new Date(item.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Overview — expandable */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-sand-300">
          <h3 className="font-bold text-sm">Team</h3>
          <p className="text-xs text-gray-400 mt-0.5">Click a steward to see their contacts</p>
        </div>
        <div>
          {stewardStats.map(s => (
            <div key={s.id}>
              <button
                onClick={() => setExpandedSteward(expandedSteward === s.id ? null : s.id)}
                className="w-full flex items-center justify-between px-5 py-3.5 border-b border-sand-100 hover:bg-sand-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className={`text-xs transition-transform duration-200 ${expandedSteward === s.id ? 'rotate-90' : ''}`}>▶</span>
                  <span className="font-semibold text-sm">{s.name}</span>
                  <span className="text-xs text-gray-400">{s.contacts.length} contacts</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm tabular-nums text-forest-700 font-semibold">{formatCurrency(s.pipeline)}</span>
                  {s.overdue > 0 && <span className="badge bg-amber-100 text-amber-700">{s.overdue} overdue</span>}
                </div>
              </button>
              {expandedSteward === s.id && (
                <div className="bg-sand-50 border-b border-sand-200">
                  {s.contacts.map(c => (
                    <Link
                      key={c.id}
                      href={`/${orgSlug}/contacts/${c.id}`}
                      className="flex items-center justify-between pl-12 pr-5 py-2.5 border-b border-sand-100 last:border-0 hover:bg-sand-100 transition-colors"
                    >
                      <div className="flex-1 min-w-0 mr-3">
                        <span className="text-sm font-medium">{c.display_name}</span>
                        {c.next_action && (
                          <span className={`ml-2 text-xs ${isOverdue(c.next_action_date) ? 'text-amber-600' : 'text-gray-400'}`}>
                            · {c.next_action}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {c.stage && <span className={`badge border text-xs ${stageColor(c.stage)}`}>{c.stage}</span>}
                        {c.ask_amount && <span className="text-sm tabular-nums text-forest-700">{formatCurrency(c.ask_amount)}</span>}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          {stewardStats.length === 0 && (
            <div className="p-5 text-sm text-gray-400">No stewards with assigned contacts yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
