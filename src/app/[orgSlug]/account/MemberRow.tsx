'use client';

import { useState } from 'react';
import type { Membership } from '@/lib/types';
import { removeMember, updateMemberRole, resendInvite } from './actions';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  steward: 'Steward',
  viewer: 'Viewer',
};

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700',
  steward: 'bg-blue-100 text-blue-700',
  viewer: 'bg-gray-100 text-gray-600',
};

type Props = {
  membership: Membership;
  currentMembershipId: string;
  orgId: string;
  orgSlug: string;
  isAdmin: boolean;
  isLast: boolean;
};

export function MemberRow({ membership, currentMembershipId, orgId, orgSlug, isAdmin, isLast }: Props) {
  const [removing, setRemoving] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);
  const isSelf = membership.id === currentMembershipId;

  async function handleRemove() {
    if (!confirm(`Remove ${membership.display_name} from the team?`)) return;
    setRemoving(true);
    setError(null);
    const result = await removeMember(membership.id, orgId, orgSlug);
    if (result.error) {
      setError(result.error);
      setRemoving(false);
    }
  }

  async function handleRoleChange(newRole: string) {
    setError(null);
    const result = await updateMemberRole(membership.id, newRole, orgId, orgSlug);
    if (result.error) setError(result.error);
  }

  async function handleResendInvite() {
    setResending(true);
    setError(null);
    setResendSuccess(false);
    const result = await resendInvite(membership.id, orgId, orgSlug);
    setResending(false);
    if (result.error) {
      setError(result.error);
    } else {
      setResendSuccess(true);
    }
  }

  return (
    <div className={`flex items-center gap-4 px-5 py-3.5 ${!isLast ? 'border-b border-gray-100' : ''}`}>
      <div className="w-8 h-8 rounded-full bg-forest-100 text-forest-700 flex items-center justify-center text-sm font-semibold shrink-0">
        {membership.display_name[0]?.toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
          {membership.display_name}
          {isSelf && <span className="text-xs text-gray-400">(you)</span>}
        </div>
        {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
        {resendSuccess && <p className="text-xs text-green-600 mt-0.5">Invite sent</p>}
      </div>

      {isAdmin && !isSelf ? (
        <select
          defaultValue={membership.role}
          onChange={e => handleRoleChange(e.target.value)}
          className="text-xs border border-gray-200 rounded-md px-2 py-1 text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-forest-500"
        >
          <option value="admin">Admin</option>
          <option value="steward">Steward</option>
          <option value="viewer">Viewer</option>
        </select>
      ) : (
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ROLE_COLORS[membership.role]}`}>
          {ROLE_LABELS[membership.role]}
        </span>
      )}

      {isAdmin && !isSelf && (
        <div className="flex items-center gap-2">
          <button
            onClick={handleResendInvite}
            disabled={resending}
            className="text-xs text-gray-400 hover:text-forest-600 transition-colors disabled:opacity-40"
          >
            {resending ? '…' : 'Resend invite'}
          </button>
          <button
            onClick={handleRemove}
            disabled={removing}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40"
          >
            {removing ? '…' : 'Remove'}
          </button>
        </div>
      )}
    </div>
  );
}
