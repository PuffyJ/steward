'use client';

import { useState } from 'react';
import { addSteward, removeMember } from './actions';

export function RemoveStewardButton({ membershipId, orgId, orgSlug }: { membershipId: string; orgId: string; orgSlug: string }) {
  const [removing, setRemoving] = useState(false);

  async function handleRemove() {
    if (!confirm('Remove this steward?')) return;
    setRemoving(true);
    await removeMember(membershipId, orgId, orgSlug);
  }

  return (
    <button
      onClick={handleRemove}
      disabled={removing}
      className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
    >
      {removing ? 'Removing…' : 'Remove'}
    </button>
  );
}

export function StewardForm({ orgId, orgSlug }: { orgId: string; orgSlug: string }) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    const result = await addSteward(orgId, orgSlug, name.trim());
    if (result.error) setError(result.error);
    else setName('');
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Sarah Chen"
            className="form-input w-full"
            required
          />
        </div>
        <button type="submit" disabled={saving} className="btn btn-primary">
          {saving ? 'Adding…' : 'Add Steward'}
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
