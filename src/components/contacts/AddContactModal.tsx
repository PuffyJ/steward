'use client';

import { useState } from 'react';
import { Membership, STAGES, PRIORITIES, TIERS, CONTACT_TYPES } from '@/lib/types';
import { Modal } from '@/components/ui/Modal';

type Props = {
  memberships: Membership[];
  onSave: (data: any) => void;
  onClose: () => void;
  saving: boolean;
};

export function AddContactModal({ memberships, onSave, onClose, saving }: Props) {
  const [form, setForm] = useState({
    display_name: '', organization: '', category: 'Individual', contact_type: 'Donor',
    tier: 'Tier 3', capacity: 0, priority: 'C - Maintain', region: 'North America',
    email: '', steward: 'IMT General', stage: 'Qualification', ask_amount: 0, probability: 0.15,
    next_action: '', next_action_date: '', given_current_year: 0, notes: '',
  });

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Modal title="Add Contact" onClose={onClose}>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="form-label">Display Name *</label>
          <input className="form-input" value={form.display_name} onChange={e => set('display_name', e.target.value)} />
        </div>
        <div>
          <label className="form-label">Organization</label>
          <input className="form-input" value={form.organization} onChange={e => set('organization', e.target.value)} />
        </div>
        <div>
          <label className="form-label">Email</label>
          <input className="form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
        </div>
        <div>
          <label className="form-label">Category</label>
          <select className="form-input" value={form.category} onChange={e => set('category', e.target.value)}>
            <option>Individual</option><option>Organization</option>
          </select>
        </div>
        <div>
          <label className="form-label">Contact Type</label>
          <select className="form-input" value={form.contact_type} onChange={e => set('contact_type', e.target.value)}>
            {CONTACT_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Tier</label>
          <select className="form-input" value={form.tier} onChange={e => set('tier', e.target.value)}>
            {TIERS.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Priority</label>
          <select className="form-input" value={form.priority} onChange={e => set('priority', e.target.value)}>
            {PRIORITIES.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Region</label>
          <input className="form-input" value={form.region} onChange={e => set('region', e.target.value)} />
        </div>
        <div>
          <label className="form-label">Steward</label>
          <select className="form-input" value={form.steward} onChange={e => set('steward', e.target.value)}>
            <option value="">—</option>
            {[...memberships]
              .sort((a, b) => {
                if (a.display_name === 'IMT General') return 1;
                if (b.display_name === 'IMT General') return -1;
                return a.display_name.localeCompare(b.display_name);
              })
              .map(m => <option key={m.id} value={m.display_name}>{m.display_name}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Stage</label>
          <select className="form-input" value={form.stage} onChange={e => set('stage', e.target.value)}>
            {STAGES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Ask Amount</label>
          <input className="form-input" type="number" value={form.ask_amount} onChange={e => set('ask_amount', parseFloat(e.target.value) || 0)} />
        </div>
        <div>
          <label className="form-label">Probability</label>
          <input className="form-input" type="number" step="0.05" min="0" max="1" value={form.probability} onChange={e => set('probability', parseFloat(e.target.value) || 0)} />
        </div>
        <div>
          <label className="form-label">Capacity</label>
          <input className="form-input" type="number" value={form.capacity} onChange={e => set('capacity', parseFloat(e.target.value) || 0)} />
        </div>
        <div>
          <label className="form-label">Given This Year</label>
          <input className="form-input" type="number" value={form.given_current_year} onChange={e => set('given_current_year', parseFloat(e.target.value) || 0)} />
        </div>
        <div className="col-span-2">
          <label className="form-label">Next Action</label>
          <input className="form-input" value={form.next_action} onChange={e => set('next_action', e.target.value)} />
        </div>
        <div>
          <label className="form-label">Next Action Date</label>
          <input className="form-input" type="date" value={form.next_action_date} onChange={e => set('next_action_date', e.target.value)} />
        </div>
        <div className="col-span-2">
          <label className="form-label">Notes</label>
          <textarea className="form-input resize-y" rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} />
        </div>
      </div>
      <div className="flex gap-2.5 justify-end mt-5">
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" disabled={!form.display_name || saving} onClick={() => onSave(form)}>
          {saving ? 'Saving...' : 'Save Contact'}
        </button>
      </div>
    </Modal>
  );
}
