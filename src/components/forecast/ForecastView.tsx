'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Contact, Donation } from '@/lib/types';
import { formatCurrency, downloadCSV } from '@/lib/utils';
import { updateOrgSettings } from '@/app/[orgSlug]/forecast/actions';

type ContactRow = Contact & { steward: { id: string; display_name: string } | null };

type Props = {
  contacts: ContactRow[];
  donations: Donation[];
  orgId: string;
  orgSlug: string;
  startingBalance: number;
  monthlyExpenses: number;
};

export function ForecastView({ contacts, donations, orgId, orgSlug, startingBalance: initialBalance, monthlyExpenses: initialExpenses }: Props) {
  const [startingBalance, setStartingBalance] = useState(String(initialBalance || ''));
  const [monthlyExpenses, setMonthlyExpenses] = useState(String(initialExpenses || ''));
  const [saving, setSaving] = useState(false);

  // Build 12 months starting from current month
  const months = useMemo(() => {
    const result = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      result.push({ key, label, year: d.getFullYear(), month: d.getMonth() + 1 });
    }
    return result;
  }, []);

  const monthData = useMemo(() => {
    const expenses = parseFloat(monthlyExpenses) || 0;
    const balance = parseFloat(startingBalance) || 0;
    let running = balance;

    return months.map(m => {
      // Contacts with forecast_date in this month
      const expectedContacts = contacts.filter(c => {
        if (!c.forecast_date) return false;
        const fd = c.forecast_date.slice(0, 7); // YYYY-MM
        return fd === m.key;
      });
      const expectedAmount = expectedContacts.reduce((sum, c) => sum + (c.ask_amount || 0), 0);

      // Actual donations received in this month
      const actualDonations = donations.filter(d => d.date.slice(0, 7) === m.key);
      const actualAmount = actualDonations.reduce((sum, d) => sum + Number(d.amount), 0);

      const net = expectedAmount - expenses;
      running += net;

      return {
        ...m,
        expectedContacts,
        expectedAmount,
        actualAmount,
        expenses,
        net,
        runningBalance: running,
      };
    });
  }, [months, contacts, donations, startingBalance, monthlyExpenses]);

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await updateOrgSettings(orgId, orgSlug, parseFloat(startingBalance) || 0, parseFloat(monthlyExpenses) || 0);
    setSaving(false);
  }

  function handleExport() {
    const rows = monthData.map(m => ({
      'Month': m.label,
      'Expected Donations': m.expectedAmount,
      'Donors Expected': m.expectedContacts.length,
      'Actual Donations': m.actualAmount,
      'Monthly Expenses': m.expenses,
      'Net': m.net,
      'Running Balance': m.runningBalance,
    }));
    downloadCSV(rows, `steward-forecast-${new Date().toISOString().split('T')[0]}.csv`);
  }

  const totalExpected = monthData.reduce((sum, m) => sum + m.expectedAmount, 0);
  const totalActual = monthData.reduce((sum, m) => sum + m.actualAmount, 0);

  return (
    <div className="fade-in">
      <div className="flex justify-between items-start mb-7">
        <div>
          <h1 className="text-2xl font-bold font-serif">12-Month Forecast</h1>
          <p className="text-sm text-gray-500 mt-1">Based on contacts with forecast dates and ask amounts.</p>
        </div>
        <button onClick={handleExport} className="btn btn-ghost text-xs">Export CSV</button>
      </div>

      {/* Settings */}
      <form onSubmit={handleSaveSettings} className="card p-5 mb-7">
        <h3 className="font-bold text-sm mb-4">Financial Settings</h3>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="form-label">Starting Cash Balance</label>
            <input
              type="number"
              className="form-input w-44"
              value={startingBalance}
              onChange={e => setStartingBalance(e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <label className="form-label">Monthly Expenses</label>
            <input
              type="number"
              className="form-input w-44"
              value={monthlyExpenses}
              onChange={e => setMonthlyExpenses(e.target.value)}
              placeholder="0"
            />
          </div>
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? 'Saving…' : 'Save Settings'}
          </button>
        </div>
      </form>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-7">
        <div className="card p-5 border-l-[3px] border-l-forest-700">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Expected (12 mo)</div>
          <div className="text-2xl font-bold text-forest-700">{formatCurrency(totalExpected)}</div>
          <div className="text-xs text-gray-400 mt-0.5">{contacts.filter(c => c.forecast_date).length} contacts with forecast dates</div>
        </div>
        <div className="card p-5 border-l-[3px] border-l-blue-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Actual Received (12 mo)</div>
          <div className="text-2xl font-bold text-blue-700">{formatCurrency(totalActual)}</div>
          <div className="text-xs text-gray-400 mt-0.5">{donations.length} donations recorded</div>
        </div>
        <div className="card p-5 border-l-[3px] border-l-amber-500">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Ending Balance (12 mo)</div>
          <div className={`text-2xl font-bold ${monthData[11]?.runningBalance >= 0 ? 'text-forest-700' : 'text-red-600'}`}>
            {formatCurrency(monthData[11]?.runningBalance || 0)}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">After expenses</div>
        </div>
      </div>

      {/* Forecast table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header min-w-[140px]">Month</th>
                <th className="table-header">Expected Gifts</th>
                <th className="table-header">Donors</th>
                <th className="table-header">Actual Received</th>
                <th className="table-header">Expenses</th>
                <th className="table-header">Net</th>
                <th className="table-header">Running Balance</th>
              </tr>
            </thead>
            <tbody>
              {monthData.map(m => (
                <tr key={m.key} className="hover:bg-sand-50 group">
                  <td className="table-cell font-semibold">{m.label}</td>
                  <td className="table-cell tabular-nums text-forest-700 font-semibold">
                    {m.expectedAmount > 0 ? formatCurrency(m.expectedAmount) : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="table-cell">
                    {m.expectedContacts.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {m.expectedContacts.map(c => (
                          <Link
                            key={c.id}
                            href={`/${orgSlug}/contacts/${c.id}`}
                            className="text-xs bg-sand-200 text-gray-700 px-1.5 py-0.5 rounded hover:bg-forest-100 hover:text-forest-700 transition-colors"
                          >
                            {c.display_name}
                          </Link>
                        ))}
                      </div>
                    ) : <span className="text-gray-400 text-xs">—</span>}
                  </td>
                  <td className="table-cell tabular-nums text-blue-700">
                    {m.actualAmount > 0 ? formatCurrency(m.actualAmount) : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="table-cell tabular-nums text-gray-500">
                    {m.expenses > 0 ? formatCurrency(m.expenses) : <span className="text-gray-400">—</span>}
                  </td>
                  <td className={`table-cell tabular-nums font-semibold ${m.net >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                    {m.expenses > 0 || m.expectedAmount > 0 ? (m.net >= 0 ? '+' : '') + formatCurrency(m.net) : <span className="text-gray-400">—</span>}
                  </td>
                  <td className={`table-cell tabular-nums font-bold ${m.runningBalance >= 0 ? 'text-forest-700' : 'text-red-600'}`}>
                    {parseFloat(startingBalance) || parseFloat(monthlyExpenses) || m.expectedAmount > 0
                      ? formatCurrency(m.runningBalance)
                      : <span className="text-gray-400">—</span>}
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
