'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Contact, Membership, STAGES, PRIORITIES, TIERS, CONTACT_TYPES, ContactFilters, Stage, Priority, Tier, ContactType } from '@/lib/types';
import { formatCurrency, forecast, isOverdue, priorityLabel, priorityColor, tierColor, stageColor, downloadCSV } from '@/lib/utils';
import { createClient } from '@/lib/supabase';
import { createContact } from '@/lib/queries';
import { AddContactModal } from './AddContactModal';
import { CSVImportModal } from '@/components/csv/CSVImportModal';
import { FilterDropdown } from '@/components/ui/FilterDropdown';

type ContactRow = Contact & { steward: { id: string; display_name: string } | null };

type Props = {
  initialContacts: ContactRow[];
  memberships: Membership[];
  orgSlug: string;
  orgId: string;
};

type SortCol = 'display_name' | 'contact_type' | 'tier' | 'priority' | 'steward' | 'stage' | 'ask_amount' | 'next_action_date';

export function ContactsListView({ initialContacts, memberships, orgSlug, orgId }: Props) {
  const router = useRouter();
  const [contacts, setContacts] = useState(initialContacts);
  const [filters, setFilters] = useState<ContactFilters>({
    search: '', steward: '', stage: [], priority: [], tier: [], contactType: [],
  });
  const [sortCol, setSortCol] = useState<SortCol>('display_name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [saving, setSaving] = useState(false);

  const toggleSort = useCallback((col: SortCol) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  }, [sortCol]);

  const toggleFilter = useCallback(<T extends string>(key: keyof ContactFilters, val: T) => {
    setFilters(f => {
      const arr = f[key] as string[];
      return { ...f, [key]: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val] };
    });
  }, []);

  const filtered = useMemo(() => {
    let list = [...contacts];
    if (filters.search) {
      const s = filters.search.toLowerCase();
      list = list.filter(c => c.display_name.toLowerCase().includes(s) || (c.organization || '').toLowerCase().includes(s));
    }
    if (filters.steward) list = list.filter(c => c.steward?.display_name === filters.steward);
    if (filters.stage.length) list = list.filter(c => c.stage && filters.stage.includes(c.stage));
    if (filters.priority.length) list = list.filter(c => c.priority && filters.priority.includes(c.priority));
    if (filters.tier.length) list = list.filter(c => c.tier && filters.tier.includes(c.tier));
    if (filters.contactType.length) list = list.filter(c => c.contact_type && filters.contactType.includes(c.contact_type));

    list.sort((a, b) => {
      let va: any, vb: any;
      if (sortCol === 'steward') {
        va = a.steward?.display_name?.toLowerCase() || '';
        vb = b.steward?.display_name?.toLowerCase() || '';
      } else {
        va = a[sortCol];
        vb = b[sortCol];
      }
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va == null) va = sortDir === 'asc' ? '\uffff' : '';
      if (vb == null) vb = sortDir === 'asc' ? '\uffff' : '';
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [contacts, filters, sortCol, sortDir]);

  const hasFilters = filters.search || filters.steward || filters.stage.length || filters.priority.length || filters.tier.length || filters.contactType.length;

  const handleAddContact = async (data: any) => {
    setSaving(true);
    try {
      const supabase = createClient();
      const stewardMembership = memberships.find(m => m.display_name === data.steward);
      const newContact = await createContact(supabase, orgId, {
        ...data,
        steward_id: stewardMembership?.id || null,
      });
      router.refresh();
      setShowAdd(false);
    } catch (err) {
      console.error('Failed to add contact:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    const rows = filtered.map(c => ({
      'Display Name': c.display_name,
      'Organization': c.organization || '',
      'Category': c.category || '',
      'Contact Type': c.contact_type || '',
      'Tier': c.tier || '',
      'Priority': c.priority || '',
      'Region': c.region || '',
      'Email': c.email || '',
      'Steward': c.steward?.display_name || '',
      'Stage': c.stage || '',
      'Ask Amount': c.ask_amount || '',
      'Probability': c.probability || '',
      'Forecast': forecast(c.ask_amount, c.probability),
      'Next Action': c.next_action || '',
      'Next Action Date': c.next_action_date || '',
      'Given This Year': c.given_current_year || '',
      'Capacity': c.capacity || '',
      'Notes': c.notes || '',
    }));
    downloadCSV(rows, `steward-contacts-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleImportComplete = () => {
    setShowImport(false);
    router.refresh();
  };

  const SortHeader = ({ col, label, className }: { col: SortCol; label: string; className?: string }) => (
    <th className={`table-header cursor-pointer select-none hover:text-gray-700 ${className || ''}`} onClick={() => toggleSort(col)}>
      {label} {sortCol === col ? (sortDir === 'asc' ? '↑' : '↓') : ''}
    </th>
  );

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold font-serif">Contacts</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} of {contacts.length} contacts</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-ghost text-xs" onClick={() => setShowImport(true)}>Import CSV</button>
          <button className="btn btn-ghost text-xs" onClick={handleExport}>Export CSV</button>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Contact</button>
        </div>
      </div>

      {/* Filters */}
      <div className="card px-4 py-3 mb-4 flex flex-wrap gap-2.5 items-center">
        <input
          type="text"
          placeholder="Search name or org..."
          value={filters.search}
          onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
          className="form-input w-48"
        />
        <select
          value={filters.steward}
          onChange={e => setFilters(f => ({ ...f, steward: e.target.value }))}
          className="form-input w-auto"
        >
          <option value="">All Stewards</option>
          {memberships.map(m => <option key={m.id} value={m.display_name}>{m.display_name}</option>)}
        </select>
        <FilterDropdown label="Stage" options={STAGES} selected={filters.stage} onToggle={v => toggleFilter('stage', v)} />
        <FilterDropdown label="Priority" options={PRIORITIES} selected={filters.priority} onToggle={v => toggleFilter('priority', v)} />
        <FilterDropdown label="Tier" options={TIERS} selected={filters.tier} onToggle={v => toggleFilter('tier', v)} />
        <FilterDropdown label="Type" options={CONTACT_TYPES} selected={filters.contactType} onToggle={v => toggleFilter('contactType', v)} />
        {hasFilters && (
          <button className="btn btn-ghost text-xs text-amber-700" onClick={() => setFilters({ search: '', steward: '', stage: [], priority: [], tier: [], contactType: [] })}>
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <SortHeader col="display_name" label="Name" className="min-w-[180px]" />
                <SortHeader col="contact_type" label="Type" />
                <SortHeader col="tier" label="Tier" />
                <SortHeader col="priority" label="Priority" />
                <SortHeader col="steward" label="Steward" />
                <SortHeader col="stage" label="Stage" />
                <SortHeader col="ask_amount" label="Ask $" />
                <th className="table-header">Forecast</th>
                <SortHeader col="next_action_date" label="Next Action" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="table-cell text-center text-gray-400 py-12">
                    {hasFilters ? 'No contacts match your filters.' : 'No contacts yet. Add your first contact to get started.'}
                  </td>
                </tr>
              )}
              {filtered.map(c => (
                <tr
                  key={c.id}
                  className={`cursor-pointer transition-colors ${isOverdue(c.next_action_date) ? 'bg-amber-50/50 hover:bg-amber-50' : 'hover:bg-sand-50'}`}
                >
                  <td className="table-cell font-semibold min-w-[180px]">
                    <Link href={`/${orgSlug}/contacts/${c.id}`} className="block">
                      {c.display_name}
                      {c.organization && <div className="text-xs text-gray-400 font-normal">{c.organization}</div>}
                    </Link>
                  </td>
                  <td className="table-cell">
                    <span className="badge bg-sand-200 text-gray-600">{c.contact_type}</span>
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${tierColor(c.tier)}`}>{c.tier}</span>
                  </td>
                  <td className={`table-cell ${priorityColor(c.priority)}`}>
                    {priorityLabel(c.priority)}
                  </td>
                  <td className="table-cell text-xs">{c.steward?.display_name || '—'}</td>
                  <td className="table-cell">
                    <span className={`badge border ${stageColor(c.stage)}`}>{c.stage}</span>
                  </td>
                  <td className="table-cell tabular-nums">{formatCurrency(c.ask_amount)}</td>
                  <td className="table-cell tabular-nums">{formatCurrency(forecast(c.ask_amount, c.probability))}</td>
                  <td className="table-cell whitespace-nowrap">
                    <div className={`text-xs ${isOverdue(c.next_action_date) ? 'text-amber-700 font-semibold' : 'text-gray-600'}`}>
                      {c.next_action_date || '—'}
                    </div>
                    <div className="text-xs text-gray-400 max-w-[160px] truncate">{c.next_action}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showAdd && (
        <AddContactModal
          memberships={memberships}
          onSave={handleAddContact}
          onClose={() => setShowAdd(false)}
          saving={saving}
        />
      )}
      {showImport && (
        <CSVImportModal
          orgId={orgId}
          memberships={memberships}
          onComplete={handleImportComplete}
          onClose={() => setShowImport(false)}
        />
      )}
    </div>
  );
}
