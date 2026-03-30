'use client';

import { useState } from 'react';
import { INTERACTION_TYPES, OUTCOMES } from '@/lib/types';
import { Modal } from '@/components/ui/Modal';

type Props = {
  contactName: string;
  onSave: (data: any) => void;
  onClose: () => void;
};

export function LogInteractionModal({ contactName, onSave, onClose }: Props) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    date: today,
    type: 'Phone Call',
    summary: '',
    outcome: 'Positive',
    next_step: '',
    follow_up_date: '',
  });
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <Modal title="Log Interaction" subtitle={`with ${contactName}`} onClose={onClose}>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="form-label">Date</label>
          <input className="form-input" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
        </div>
        <div>
          <label className="form-label">Type</label>
          <select className="form-input" value={form.type} onChange={e => set('type', e.target.value)}>
            {INTERACTION_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Outcome</label>
          <select className="form-input" value={form.outcome} onChange={e => set('outcome', e.target.value)}>
            {OUTCOMES.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Follow-Up Date</label>
          <input className="form-input" type="date" value={form.follow_up_date} onChange={e => set('follow_up_date', e.target.value)} />
        </div>
      </div>
      <div className="mt-3">
        <label className="form-label">Summary *</label>
        <textarea className="form-input resize-y" rows={3} value={form.summary} onChange={e => set('summary', e.target.value)} placeholder="What happened?" />
      </div>
      <div className="mt-3">
        <label className="form-label">Next Step</label>
        <input className="form-input" value={form.next_step} onChange={e => set('next_step', e.target.value)} placeholder="What needs to happen next?" />
      </div>
      {(form.next_step || form.follow_up_date) && (
        <div className="mt-3 px-3 py-2.5 bg-emerald-50 rounded-md text-xs text-emerald-700">
          This will automatically update the contact&apos;s next action and follow-up date.
        </div>
      )}
      <div className="flex gap-2.5 justify-end mt-5">
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" disabled={!form.summary || saving} onClick={handleSave}>
          {saving ? 'Logging...' : 'Log Interaction'}
        </button>
      </div>
    </Modal>
  );
}
