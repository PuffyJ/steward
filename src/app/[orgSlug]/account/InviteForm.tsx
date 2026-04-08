'use client';

import { useState } from 'react';
import { inviteMember } from './actions';

type Steward = { id: string; display_name: string };
type Props = { orgId: string; orgSlug: string; stewards: Steward[] };

const NEW_PERSON = '__new__';

export function InviteForm({ orgId, orgSlug, stewards }: Props) {
  const [email, setEmail] = useState('');
  const [selected, setSelected] = useState(stewards[0]?.display_name ?? NEW_PERSON);
  const [customName, setCustomName] = useState('');
  const [role, setRole] = useState<'steward' | 'admin' | 'viewer'>('steward');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isNew = selected === NEW_PERSON;
  const displayName = isNew ? customName : selected;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!displayName.trim()) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    const result = await inviteMember(orgId, orgSlug, email, displayName.trim(), role);

    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(`Invite sent to ${email}`);
      setEmail('');
      setSelected(stewards[0]?.display_name ?? NEW_PERSON);
      setCustomName('');
      setRole('steward');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="name@example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Link to steward</label>
          <select
            value={selected}
            onChange={e => setSelected(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 bg-white"
          >
            {stewards.map(s => (
              <option key={s.id} value={s.display_name}>{s.display_name}</option>
            ))}
            <option value={NEW_PERSON}>— New person (not yet a steward) —</option>
          </select>
        </div>
      </div>

      {isNew && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Display name</label>
          <input
            type="text"
            value={customName}
            onChange={e => setCustomName(e.target.value)}
            required
            placeholder="Jane Smith"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent"
          />
        </div>
      )}

      <div className="flex items-end gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select
            value={role}
            onChange={e => setRole(e.target.value as typeof role)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 bg-white"
          >
            <option value="steward">Steward</option>
            <option value="admin">Admin</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-forest-700 text-white rounded-lg text-sm font-medium hover:bg-forest-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Sending…' : 'Send invite'}
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">{success}</p>}
    </form>
  );
}
