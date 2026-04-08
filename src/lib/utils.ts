import { Stage, Priority, Outcome } from './types';

// ─── Formatting ──────────────────────────────────────────────────────────────

export function formatCurrency(n: number | null | undefined): string {
  if (n == null) return '—';
  return '$' + Math.round(n).toLocaleString();
}

export function formatPercent(n: number | null | undefined): string {
  if (n == null) return '—';
  return Math.round(n * 100) + '%';
}

export function forecast(ask: number | null | undefined, prob: number | null | undefined): number {
  return (ask || 0) * (prob || 0);
}

// ─── Date Helpers ────────────────────────────────────────────────────────────

export function today(): string {
  return new Date().toISOString().split('T')[0];
}

export function isOverdue(date: string | null | undefined): boolean {
  if (!date) return false;
  return date < today();
}

export function isThisWeek(date: string | null | undefined): boolean {
  if (!date) return false;
  const t = today();
  const weekEnd = new Date();
  weekEnd.setDate(weekEnd.getDate() + 7);
  const weekEndStr = weekEnd.toISOString().split('T')[0];
  return date >= t && date <= weekEndStr;
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return '—';
  return new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ─── Color Helpers ───────────────────────────────────────────────────────────

export function tierColor(tier: string | null): string {
  switch (tier) {
    case 'Tier 1': return 'bg-forest-700 text-white';
    case 'Tier 2': return 'bg-forest-600 text-white';
    case 'Tier 3': return 'bg-forest-400 text-white';
    default: return 'bg-gray-200 text-gray-600';
  }
}

export function priorityLabel(p: string | null): string {
  if (!p) return '—';
  return p.charAt(0);
}

export function priorityColor(p: string | null): string {
  if (p?.startsWith('A')) return 'text-amber-700 font-bold';
  if (p?.startsWith('B')) return 'text-gray-600 font-semibold';
  return 'text-gray-400';
}

export function stageColor(stage: string | null): string {
  switch (stage) {
    case 'Needs Further Cultivation': return 'border-gray-400 bg-gray-50 text-gray-600';
    case 'Prayerful Discernment': return 'border-blue-400 bg-blue-50 text-blue-700';
    case 'Ready for Invitation': return 'border-amber-500 bg-amber-50 text-amber-700';
    case 'Strategic Connector': return 'border-purple-500 bg-purple-50 text-purple-700';
    case 'Given': return 'border-forest-700 bg-forest-50 text-forest-700';
    default: return 'border-gray-300 bg-gray-50 text-gray-500';
  }
}

export function outcomeColor(outcome: string | null): string {
  switch (outcome) {
    case 'Positive': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Neutral': return 'bg-gray-50 text-gray-600 border-gray-200';
    case 'Needs Follow-Up': return 'bg-amber-50 text-amber-700 border-amber-200';
    default: return 'bg-gray-50 text-gray-500 border-gray-200';
  }
}

// ─── Stage pipeline color (for summary bars) ─────────────────────────────────

export function stagePipelineColor(stage: Stage): string {
  const colors: Record<Stage, string> = {
    'Needs Further Cultivation': 'border-l-gray-400',
    'Prayerful Discernment': 'border-l-blue-400',
    'Ready for Invitation': 'border-l-amber-500',
    'Strategic Connector': 'border-l-purple-500',
    'Given': 'border-l-forest-700',
  };
  return colors[stage] || 'border-l-gray-300';
}

// ─── CSV Export Helper ───────────────────────────────────────────────────────

export function downloadCSV(data: Record<string, any>[], filename: string) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row =>
      headers.map(h => {
        const val = row[h];
        if (val == null) return '';
        const str = String(val);
        // Escape quotes and wrap if contains comma/quote/newline
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
      }).join(',')
    ),
  ];
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
