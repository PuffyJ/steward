'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Contact, Donation, Interaction, Membership, TIERS, CONTACT_TYPES } from '@/lib/types';
import { formatCurrency, formatDate, outcomeColor } from '@/lib/utils';
import { updateContactAction, logInteractionAction, addDonation, deleteDonation } from '@/app/actions';
import { LogInteractionModal } from '@/components/interactions/LogInteractionModal';

type ContactRow = Contact & { steward: { id: string; display_name: string } | null };
type InteractionRow = Interaction & { logged_by_member: { display_name: string } | null };

type Props = {
  contact: ContactRow;
  interactions: InteractionRow[];
  memberships: Membership[];
  donations: Donation[];
  currentMembershipId: string;
  orgSlug: string;
  orgId: string;
};

// Fiscal year = calendar year (Jan 1 – Dec 31)
function giftYear(dateStr: string): number {
  return new Date(dateStr + 'T00:00:00').getFullYear();
}

export function Contact360View({ contact, interactions, memberships, donations, currentMembershipId, orgSlug, orgId }: Props) {
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  const [editing, setEditing] = useState(false);
  const sortedMemberships = [...memberships].sort((a, b) => {
    if (a.display_name === 'IMT General') return 1;
    if (b.display_name === 'IMT General') return -1;
    return a.display_name.localeCompare(b.display_name);
  });

  const [form, setForm] = useState<any>({ ...contact, steward_name: contact.steward?.display_name || 'IMT General' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showLog, setShowLog] = useState(false);

  // Giving state
  const today = new Date().toISOString().split('T')[0];
  const [giftDate, setGiftDate] = useState(today);
  const [giftAmount, setGiftAmount] = useState('');
  const [giftNotes, setGiftNotes] = useState('');
  const [giftSaving, setGiftSaving] = useState(false);
  const [giftError, setGiftError] = useState<string | null>(null);
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set([currentYear]));

  useEffect(() => {
    setForm({ ...contact, steward_name: contact.steward?.display_name || 'IMT General' });
    setEditing(false);
  }, [contact]);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const toggleYear = (year: number) => {
    setExpandedYears(prev => {
      const next = new Set(prev);
      if (next.has(year)) next.delete(year);
      else next.add(year);
      return next;
    });
  };

  // Derived giving values
  const thisYearTotal = donations
    .filter(d => giftYear(d.date) === currentYear)
    .reduce((sum, d) => sum + Number(d.amount), 0);
  const remaining = (contact.ask_amount || 0) - thisYearTotal;

  const donationsByYear = donations.reduce((acc, d) => {
    const y = giftYear(d.date);
    if (!acc[y]) acc[y] = [];
    acc[y].push(d);
    return acc;
  }, {} as Record<number, Donation[]>);
  const sortedYears = Object.keys(donationsByYear).map(Number).sort((a, b) => b - a);

  const save = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const stewardMembership = memberships.find(m => m.display_name === form.steward_name);
      await updateContactAction(contact.id, {
        display_name: form.display_name,
        organization: form.organization,
        category: form.category,
        contact_type: form.contact_type,
        tier: form.tier,
        capacity: form.capacity ? parseFloat(form.capacity) : null,
        priority: form.priority,
        region: form.region,
        phone: form.phone,
        email: form.email,
        steward_id: stewardMembership?.id || null,
        stage: form.stage,
        ask_amount: form.ask_amount ? parseFloat(form.ask_amount) : null,
        forecast_date: form.forecast_date || null,
        next_action: form.next_action,
        next_action_date: form.next_action_date || null,
        given_current_year: form.given_current_year ? parseFloat(form.given_current_year) : null,
        notes: form.notes,
      });
      setEditing(false);
      router.refresh();
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogInteraction = async (data: any) => {
    try {
      await logInteractionAction(orgId, contact.id, {
        date: data.date,
        type: data.type,
        summary: data.summary,
        outcome: data.outcome,
        next_step: data.next_step || undefined,
        follow_up_date: data.follow_up_date || undefined,
        logged_by: currentMembershipId,
      });
      setShowLog(false);
      router.refresh();
    } catch (err) {
      console.error('Failed to log interaction:', err);
    }
  };

  const handleAddGift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftAmount || !giftDate) return;
    setGiftSaving(true);
    setGiftError(null);
    try {
      await addDonation(orgId, contact.id, giftDate, parseFloat(giftAmount), giftNotes);
      // Auto-expand the year of the new gift
      const addedYear = giftYear(giftDate);
      setExpandedYears(prev => new Set([...prev, addedYear]));
      setGiftAmount('');
      setGiftNotes('');
      setGiftDate(today);
      router.refresh();
    } catch (err: any) {
      setGiftError(err?.message || 'Failed to record gift.');
    } finally {
      setGiftSaving(false);
    }
  };

  const handleDeleteGift = async (id: string) => {
    if (!confirm('Remove this gift?')) return;
    await deleteDonation(id, contact.id);
    router.refresh();
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
        <Link href={`/${orgSlug}/contacts`} className="btn btn-ghost text-xs">← Back</Link>
        <div className="flex-1">
          {editing ? (
            <div className="space-y-1.5">
              <input
                className="form-input text-xl font-bold font-serif w-full"
                value={form.display_name || ''}
                onChange={e => set('display_name', e.target.value)}
                placeholder="Contact name"
              />
              <input
                className="form-input text-sm w-full"
                value={form.organization || ''}
                onChange={e => set('organization', e.target.value)}
                placeholder="Organization (optional)"
              />
              <div className="flex flex-wrap gap-2 pt-1">
                <select className="form-input" value={form.contact_type || ''} onChange={e => set('contact_type', e.target.value)}>
                  <option value="">—</option>
                  {CONTACT_TYPES.map(o => <option key={o}>{o}</option>)}
                </select>
                <select className="form-input" value={form.tier || ''} onChange={e => set('tier', e.target.value)}>
                  <option value="">—</option>
                  {TIERS.map(o => <option key={o}>{o}</option>)}
                </select>
                <select className="form-input" value={form.steward_name || ''} onChange={e => set('steward_name', e.target.value)}>
                  <option value="">—</option>
                  {sortedMemberships.map(m => <option key={m.id} value={m.display_name}>{m.display_name}</option>)}
                </select>
                <input className="form-input" type="tel" value={form.phone || ''} onChange={e => set('phone', e.target.value)} placeholder="Phone" />
                <input className="form-input" type="email" value={form.email || ''} onChange={e => set('email', e.target.value)} placeholder="Email" />
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold font-serif">{contact.display_name}</h1>
              {contact.organization && <p className="text-sm text-gray-500">{contact.organization}</p>}
              <p className="text-base font-bold text-gray-700 mt-0.5">
                {[contact.contact_type, contact.tier, contact.steward?.display_name ? `Steward: ${contact.steward.display_name}` : null].filter(Boolean).join(' · ')}
              </p>
              {(contact.phone || contact.email) && (
                <p className="text-sm text-gray-500 mt-0.5">
                  {[contact.phone, contact.email].filter(Boolean).join('  ·  ')}
                </p>
              )}
            </>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="btn btn-primary" onClick={() => setShowLog(true)}>Log Interaction</button>
          {editing ? (
            <>
              {saveError && <span className="text-xs text-red-600 max-w-[200px]">{saveError}</span>}
              <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
              <button className="btn btn-secondary" onClick={() => { setForm({ ...contact, steward_name: contact.steward?.display_name || '' }); setEditing(false); setSaveError(null); }}>Cancel</button>
            </>
          ) : (
            <button className="btn btn-secondary" onClick={() => setEditing(true)}>Edit</button>
          )}
        </div>
      </div>

      {/* Two-column content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Left column */}
        <div className="space-y-5">

          {/* Giving — metric cards + history */}
          <div className="card p-5">
            <h3 className="font-bold text-sm mb-3 pb-2.5 border-b border-sand-300">Giving</h3>

            {/* Three metric cards */}
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <div className="form-label">Ask Amount</div>
                {editing ? (
                  <input className="form-input mt-1 w-full" type="number" value={form.ask_amount ?? ''} onChange={e => set('ask_amount', e.target.value)} />
                ) : (
                  <div className="text-base font-bold text-forest-700 mt-1">{formatCurrency(contact.ask_amount)}</div>
                )}
              </div>
              <div>
                <div className="form-label">This Year</div>
                <div className="text-base font-bold text-forest-700 mt-1">{formatCurrency(thisYearTotal)}</div>
              </div>
              <div>
                <div className="form-label">Remaining</div>
                <div className={`text-base font-bold mt-1 ${remaining > 0 ? 'text-amber-700' : 'text-forest-700'}`}>
                  {formatCurrency(remaining)}
                </div>
              </div>
            </div>

            {/* Forecast date */}
            <div className="mb-4 text-sm text-gray-500 flex items-center gap-2">
              <span className="form-label mb-0">Forecast Date</span>
              {editing ? (
                <input className="form-input" type="date" value={form.forecast_date || ''} onChange={e => set('forecast_date', e.target.value)} />
              ) : (
                <span className="font-medium text-gray-700">{contact.forecast_date || '—'}</span>
              )}
            </div>

            {/* Year accordion */}
            {sortedYears.length > 0 ? (
              <div className="border-t border-sand-200 pt-1">
                {sortedYears.map(year => {
                  const yearGifts = donationsByYear[year].sort((a, b) => b.date.localeCompare(a.date));
                  const yearTotal = yearGifts.reduce((sum, d) => sum + Number(d.amount), 0);
                  const isCurrent = year === currentYear;
                  const isExpanded = expandedYears.has(year);
                  return (
                    <div key={year}>
                      <button
                        type="button"
                        onClick={() => toggleYear(year)}
                        className="w-full flex items-center justify-between py-2 px-1 hover:bg-sand-50 rounded transition-colors text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`text-xs transition-transform duration-150 inline-block ${isExpanded ? 'rotate-90' : ''} ${isCurrent ? 'text-gray-500' : 'text-gray-300'}`}>▶</span>
                          <span className={`text-sm font-semibold ${isCurrent ? 'text-gray-800' : 'text-gray-400'}`}>{year}</span>
                          <span className="text-xs text-gray-400">{yearGifts.length} gift{yearGifts.length !== 1 ? 's' : ''}</span>
                        </div>
                        <span className={`text-sm font-semibold tabular-nums ${isCurrent ? 'text-forest-700' : 'text-gray-400'}`}>
                          {formatCurrency(yearTotal)}
                        </span>
                      </button>
                      {isExpanded && (
                        <div className="mb-1">
                          {yearGifts.map(d => (
                            <div key={d.id} className="flex items-center justify-between pl-8 pr-1 py-1.5 border-b border-sand-100 last:border-0">
                              <div className="flex gap-3 items-center min-w-0">
                                <span className="text-sm text-gray-500 tabular-nums shrink-0 w-24">{formatDate(d.date)}</span>
                                {d.notes && <span className="text-xs text-gray-400 truncate">{d.notes}</span>}
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <span className="text-sm font-medium tabular-nums">{formatCurrency(d.amount)}</span>
                                <button type="button" onClick={() => handleDeleteGift(d.id)} className="text-xs text-gray-300 hover:text-red-500 transition-colors">×</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-400 border-t border-sand-200 pt-3">No gifts recorded yet.</p>
            )}
          </div>

          {/* Record gift — separate card */}
          <div className="card p-5">
            <h3 className="font-bold text-sm mb-3">Record Gift</h3>
            <form onSubmit={handleAddGift} className="flex flex-wrap gap-2 items-end">
              <div>
                <label className="form-label">Date</label>
                <input type="date" className="form-input" value={giftDate} onChange={e => setGiftDate(e.target.value)} required />
              </div>
              <div>
                <label className="form-label">Amount</label>
                <input type="number" className="form-input w-28" placeholder="0" value={giftAmount} onChange={e => setGiftAmount(e.target.value)} min="0" step="any" required />
              </div>
              <div className="flex-1 min-w-[120px]">
                <label className="form-label">Notes (optional)</label>
                <input type="text" className="form-input" placeholder="e.g. Annual gift" value={giftNotes} onChange={e => setGiftNotes(e.target.value)} />
              </div>
              <button type="submit" disabled={giftSaving} className="btn btn-primary">{giftSaving ? 'Recording…' : 'Record Gift'}</button>
            </form>
            {giftError && <p className="text-xs text-red-600 mt-2">{giftError}</p>}
          </div>

          {/* Relationship Summary */}
          <div className="card p-5">
            <h3 className="font-bold text-sm mb-3 pb-2.5 border-b border-sand-300">Relationship Summary</h3>
            {editing ? (
              <textarea
                className="form-input resize-none w-full"
                rows={8}
                value={form.notes || ''}
                onChange={e => set('notes', e.target.value)}
                placeholder="Add notes about this contact…"
              />
            ) : (
              <p className="text-sm text-gray-700 whitespace-pre-wrap min-h-[120px]">
                {contact.notes || <span className="text-gray-400">Notes and insights about the relationship</span>}
              </p>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">

          {/* Next Move */}
          <div className="card p-5">
            <h3 className="font-bold text-sm mb-3 pb-2.5 border-b border-sand-300">Next Move</h3>
            <div className="space-y-3">
              <div>
                <div className="form-label">Next Action</div>
                {editing ? (
                  <input className="form-input mt-1 w-full" value={form.next_action || ''} onChange={e => set('next_action', e.target.value)} placeholder="Next action…" />
                ) : (
                  <div className="text-sm font-medium mt-1">{contact.next_action || '—'}</div>
                )}
              </div>
              <div>
                <div className="form-label">Due Date</div>
                {editing ? (
                  <input className="form-input mt-1" type="date" value={form.next_action_date || ''} onChange={e => set('next_action_date', e.target.value)} />
                ) : (
                  <div className="text-sm font-medium mt-1">{contact.next_action_date || '—'}</div>
                )}
              </div>
            </div>
          </div>

          {/* Interactions */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-sm">Interaction History ({interactions.length})</h3>
              <button className="btn btn-primary text-xs" onClick={() => setShowLog(true)}>+ Log Interaction</button>
            </div>
            {interactions.length === 0 && (
              <div className="card p-10 text-center">
                <p className="text-sm text-gray-400 mb-3">No interactions logged yet.</p>
                <button className="btn btn-primary" onClick={() => setShowLog(true)}>Log First Interaction</button>
              </div>
            )}
            <div className="space-y-2.5">
              {interactions.map(i => (
                <div key={i.id} className="card p-4 slide-in">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex gap-2">
                      <span className="badge bg-sand-200 text-gray-600">{i.type}</span>
                      <span className={`badge border ${outcomeColor(i.outcome)}`}>{i.outcome}</span>
                    </div>
                    <span className="text-xs text-gray-500">{formatDate(i.date)}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-gray-700">{i.summary}</p>
                  {i.next_step && (
                    <div className="mt-2.5 px-3 py-2 bg-sand-50 rounded-md text-xs">
                      <strong>Next:</strong> {i.next_step}
                      {i.follow_up_date && <span className="text-gray-500"> · Follow up: {formatDate(i.follow_up_date)}</span>}
                    </div>
                  )}
                  <div className="text-xs text-gray-400 mt-1.5">Logged by {i.logged_by_member?.display_name || '—'}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Log Modal */}
      {showLog && (
        <LogInteractionModal
          contactName={contact.display_name}
          onSave={handleLogInteraction}
          onClose={() => setShowLog(false)}
        />
      )}
    </div>
  );
}
