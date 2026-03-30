'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Contact, Interaction, Membership, STAGES, PRIORITIES, TIERS, CONTACT_TYPES } from '@/lib/types';
import { formatCurrency, formatPercent, forecast, isOverdue, formatDate, stageColor, priorityColor, outcomeColor } from '@/lib/utils';
import { createClient } from '@/lib/supabase';
import { updateContact, createInteraction } from '@/lib/queries';
import { LogInteractionModal } from '@/components/interactions/LogInteractionModal';

type ContactRow = Contact & { steward: { id: string; display_name: string } | null };
type InteractionRow = Interaction & { logged_by_member: { display_name: string } | null };

type Props = {
  contact: ContactRow;
  interactions: InteractionRow[];
  memberships: Membership[];
  currentMembershipId: string;
  orgSlug: string;
  orgId: string;
};

export function Contact360View({ contact, interactions, memberships, currentMembershipId, orgSlug, orgId }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({ ...contact, steward_name: contact.steward?.display_name || '' });
  const [saving, setSaving] = useState(false);
  const [showLog, setShowLog] = useState(false);

  useEffect(() => {
    setForm({ ...contact, steward_name: contact.steward?.display_name || '' });
    setEditing(false);
  }, [contact]);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      const stewardMembership = memberships.find(m => m.display_name === form.steward_name);
      await updateContact(supabase, contact.id, {
        display_name: form.display_name,
        organization: form.organization,
        category: form.category,
        contact_type: form.contact_type,
        tier: form.tier,
        capacity: form.capacity ? parseFloat(form.capacity) : null,
        priority: form.priority,
        region: form.region,
        email: form.email,
        steward_id: stewardMembership?.id || null,
        stage: form.stage,
        ask_amount: form.ask_amount ? parseFloat(form.ask_amount) : null,
        probability: form.probability ? parseFloat(form.probability) : null,
        next_action: form.next_action,
        next_action_date: form.next_action_date || null,
        given_current_year: form.given_current_year ? parseFloat(form.given_current_year) : null,
        notes: form.notes,
      });
      setEditing(false);
      router.refresh();
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleLogInteraction = async (data: any) => {
    try {
      const supabase = createClient();
      await createInteraction(supabase, orgId, {
        contact_id: contact.id,
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

  const Field = ({ label, field, type = 'text', options }: { label: string; field: string; type?: string; options?: readonly string[] }) => (
    <div className="mb-3">
      <label className="form-label">{label}</label>
      {editing ? (
        options ? (
          <select className="form-input" value={form[field] || ''} onChange={e => set(field, e.target.value)}>
            <option value="">—</option>
            {options.map(o => <option key={o}>{o}</option>)}
          </select>
        ) : type === 'textarea' ? (
          <textarea className="form-input resize-y" rows={3} value={form[field] || ''} onChange={e => set(field, e.target.value)} />
        ) : (
          <input className="form-input" type={type} value={form[field] ?? ''} onChange={e => set(field, e.target.value)} />
        )
      ) : (
        <div className="text-sm font-medium min-h-[20px]">
          {field === 'probability' ? formatPercent(contact[field as keyof Contact] as number) :
           ['ask_amount', 'capacity', 'given_current_year'].includes(field) ? formatCurrency(contact[field as keyof Contact] as number) :
           (contact[field as keyof Contact] as string) || '—'}
        </div>
      )}
    </div>
  );

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
        <Link href={`/${orgSlug}/contacts`} className="btn btn-ghost text-xs">← Back</Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold font-serif">{contact.display_name}</h1>
          {contact.organization && <p className="text-sm text-gray-500">{contact.organization}</p>}
        </div>
        <div className="flex gap-2">
          <button className="btn btn-primary" onClick={() => setShowLog(true)}>Log Interaction</button>
          {editing ? (
            <>
              <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
              <button className="btn btn-secondary" onClick={() => { setForm({ ...contact, steward_name: contact.steward?.display_name || '' }); setEditing(false); }}>Cancel</button>
            </>
          ) : (
            <button className="btn btn-secondary" onClick={() => setEditing(true)}>Edit</button>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className="card px-5 py-4 mb-5 flex flex-wrap gap-6 items-start">
        <div>
          <div className="form-label">Stage</div>
          <span className={`badge border text-sm mt-1 ${stageColor(contact.stage)}`}>{contact.stage}</span>
        </div>
        <div>
          <div className="form-label">Priority</div>
          <div className={`text-sm font-semibold mt-1 ${priorityColor(contact.priority)}`}>{contact.priority}</div>
        </div>
        <div>
          <div className="form-label">Ask</div>
          <div className="text-base font-bold text-forest-700 mt-1">{formatCurrency(contact.ask_amount)}</div>
        </div>
        <div>
          <div className="form-label">Probability</div>
          <div className="text-base font-bold text-forest-700 mt-1">{formatPercent(contact.probability)}</div>
        </div>
        <div>
          <div className="form-label">Forecast</div>
          <div className="text-base font-bold text-forest-700 mt-1">{formatCurrency(forecast(contact.ask_amount, contact.probability))}</div>
        </div>
        <div className="ml-auto">
          <div className={`form-label ${isOverdue(contact.next_action_date) ? 'text-amber-700' : ''}`}>Next Action</div>
          <div className={`text-sm font-semibold mt-1 ${isOverdue(contact.next_action_date) ? 'text-amber-700' : ''}`}>{contact.next_action || '—'}</div>
          <div className={`text-xs mt-0.5 ${isOverdue(contact.next_action_date) ? 'text-amber-700' : 'text-gray-500'}`}>
            Due: {contact.next_action_date || '—'} {isOverdue(contact.next_action_date) && '⚠ Overdue'}
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-5">
        {/* Left: Details */}
        <div className="card p-5">
          <h3 className="font-bold text-sm mb-4 pb-2.5 border-b border-sand-300">Contact Details</h3>
          <Field label="Category" field="category" options={['Individual', 'Organization']} />
          <Field label="Contact Type" field="contact_type" options={CONTACT_TYPES} />
          <Field label="Tier" field="tier" options={TIERS} />
          <Field label="Region" field="region" />
          <Field label="Email" field="email" type="email" />
          <div className="mb-3">
            <label className="form-label">Steward</label>
            {editing ? (
              <select className="form-input" value={form.steward_name || ''} onChange={e => set('steward_name', e.target.value)}>
                <option value="">—</option>
                {memberships.map(m => <option key={m.id} value={m.display_name}>{m.display_name}</option>)}
              </select>
            ) : (
              <div className="text-sm font-medium">{contact.steward?.display_name || '—'}</div>
            )}
          </div>

          <div className="border-t border-sand-300 mt-2 pt-3">
            <Field label="Capacity" field="capacity" type="number" />
            <Field label="Given This Year" field="given_current_year" type="number" />
            <div className="mb-3">
              <label className="form-label">Capacity Gap</label>
              <div className={`text-sm font-medium ${((contact.capacity || 0) - (contact.given_current_year || 0)) > 0 ? 'text-emerald-700' : 'text-gray-500'}`}>
                {formatCurrency((contact.capacity || 0) - (contact.given_current_year || 0))} remaining
              </div>
            </div>
          </div>

          <div className="border-t border-sand-300 mt-2 pt-3">
            <Field label="Stage" field="stage" options={STAGES} />
            <Field label="Ask Amount" field="ask_amount" type="number" />
            <Field label="Probability" field="probability" type="number" />
            <Field label="Next Action" field="next_action" />
            <Field label="Next Action Date" field="next_action_date" type="date" />
          </div>

          <div className="border-t border-sand-300 mt-2 pt-3">
            <Field label="Notes" field="notes" type="textarea" />
          </div>
        </div>

        {/* Right: Interactions */}
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
