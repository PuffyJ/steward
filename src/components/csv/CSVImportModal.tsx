'use client';

import { useState, useCallback } from 'react';
import Papa from 'papaparse';
import { Membership, IMPORTABLE_FIELDS } from '@/lib/types';

import { importContacts } from '@/app/actions';
import { Modal } from '@/components/ui/Modal';

type Props = {
  orgId: string;
  memberships: Membership[];
  onComplete: () => void;
  onClose: () => void;
};

type Step = 'upload' | 'map' | 'preview' | 'done';

export function CSVImportModal({ orgId, memberships, onComplete, onClose }: Props) {
  const [step, setStep] = useState<Step>('upload');
  const [csvData, setCsvData] = useState<Record<string, string>[]>([]);
  const [csvColumns, setCsvColumns] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; errors: { row: number; message: string }[] }>({ success: 0, errors: [] });
  const [defaultSteward, setDefaultSteward] = useState('');

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as Record<string, string>[];
        const columns = results.meta.fields || [];
        setCsvData(data);
        setCsvColumns(columns);

        // Auto-map columns by fuzzy matching
        const autoMap: Record<string, string> = {};
        IMPORTABLE_FIELDS.forEach(field => {
          const match = columns.find(col => {
            const colLower = col.toLowerCase().replace(/[^a-z0-9]/g, '');
            const fieldLower = field.label.toLowerCase().replace(/[^a-z0-9]/g, '');
            const keyLower = field.key.toLowerCase().replace(/_/g, '');
            return colLower === fieldLower || colLower === keyLower ||
              colLower.includes(fieldLower) || fieldLower.includes(colLower);
          });
          if (match) autoMap[field.key] = match;
        });
        setMapping(autoMap);
        setStep('map');
      },
      error: (err) => {
        console.error('CSV parse error:', err);
        alert('Failed to parse CSV file. Please check the format.');
      },
    });
  }, []);

  const handleMap = (fieldKey: string, csvCol: string) => {
    setMapping(m => {
      const newMap = { ...m };
      if (csvCol) newMap[fieldKey] = csvCol;
      else delete newMap[fieldKey];
      return newMap;
    });
  };

  const mappedPreview = csvData.slice(0, 5).map(row => {
    const mapped: Record<string, any> = {};
    Object.entries(mapping).forEach(([field, col]) => {
      mapped[field] = row[col] || '';
    });
    return mapped;
  });

  const handleImport = async () => {
    setImporting(true);

    try {
      const stewardMembership = defaultSteward
        ? memberships.find(m => m.display_name === defaultSteward)
        : null;

      const contacts = csvData.map(row => {
        const contact: Record<string, any> = {};
        Object.entries(mapping).forEach(([field, col]) => {
          let val: any = row[col];
          if (!val || val.trim() === '') {
            contact[field] = null;
            return;
          }
          // Type coercion
          if (['capacity', 'ask_amount', 'given_current_year'].includes(field)) {
            val = parseFloat(val.replace(/[,$]/g, '')) || null;
          } else if (field === 'probability') {
            val = parseFloat(val.replace(/[%]/g, ''));
            if (val && val > 1) val = val / 100; // Handle percentage format
            val = val || null;
          }
          contact[field] = val;
        });

        // Apply default steward if not mapped
        if (stewardMembership && !contact.steward_id) {
          contact.steward_id = stewardMembership.id;
        }

        return contact;
      }).filter(c => c.display_name); // Must have a name

      const result = await importContacts(orgId, contacts);
      setImportResult({ success: result.success, errors: result.errors });
    } catch (err: any) {
      console.error('Import error:', err);
      setImportResult({ success: 0, errors: [{ row: 0, message: err.message ?? 'Unknown error' }] });
    }

    setImporting(false);
    setStep('done');
  };

  return (
    <Modal title="Import Contacts from CSV" onClose={onClose}>
      {step === 'upload' && (
        <div>
          <div className="border-2 border-dashed border-sand-400 rounded-lg p-10 text-center">
            <div className="text-sm text-gray-500 mb-3">Drop a CSV or Excel-exported file here, or click to browse.</div>
            <input
              type="file"
              accept=".csv,.tsv,.txt"
              onChange={handleFile}
              className="form-input mx-auto max-w-xs"
            />
          </div>
          <div className="mt-4 text-xs text-gray-400">
            Your CSV should have column headers in the first row. The next step will let you map columns to Steward fields — any format works.
          </div>
        </div>
      )}

      {step === 'map' && (
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Found <strong>{csvData.length}</strong> rows and <strong>{csvColumns.length}</strong> columns. Map your CSV columns to Steward fields below.
          </p>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {IMPORTABLE_FIELDS.map(field => (
              <div key={field.key} className="flex items-center gap-3">
                <div className="w-40 text-sm font-medium shrink-0">
                  {field.label}
                  {'required' in field && field.required && <span className="text-red-500 ml-0.5">*</span>}
                </div>
                <span className="text-gray-400 text-xs">←</span>
                <select
                  className="form-input flex-1"
                  value={mapping[field.key] || ''}
                  onChange={e => handleMap(field.key, e.target.value)}
                >
                  <option value="">— skip —</option>
                  {csvColumns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-sand-300">
            <label className="form-label">Default Steward (for all imported contacts)</label>
            <select className="form-input" value={defaultSteward} onChange={e => setDefaultSteward(e.target.value)}>
              <option value="">— none —</option>
              {memberships.map(m => <option key={m.id} value={m.display_name}>{m.display_name}</option>)}
            </select>
          </div>

          <div className="flex gap-2.5 justify-end mt-5">
            <button className="btn btn-ghost" onClick={() => setStep('upload')}>Back</button>
            <button className="btn btn-primary" onClick={() => setStep('preview')} disabled={!mapping.display_name}>
              Preview →
            </button>
          </div>
        </div>
      )}

      {step === 'preview' && (
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Preview of the first {Math.min(5, csvData.length)} rows. Check that the data looks correct.
          </p>

          <div className="overflow-x-auto border border-sand-300 rounded-lg">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  {IMPORTABLE_FIELDS.filter(f => mapping[f.key]).map(f => (
                    <th key={f.key} className="table-header text-xs">{f.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mappedPreview.map((row, i) => (
                  <tr key={i}>
                    {IMPORTABLE_FIELDS.filter(f => mapping[f.key]).map(f => (
                      <td key={f.key} className="table-cell text-xs max-w-[150px] truncate">
                        {row[f.key] || '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 px-3 py-2 bg-sand-50 rounded-md text-xs text-gray-600">
            Ready to import <strong>{csvData.filter(r => r[mapping.display_name]).length}</strong> contacts.
            {defaultSteward && <span> Default steward: <strong>{defaultSteward}</strong></span>}
          </div>

          <div className="flex gap-2.5 justify-end mt-5">
            <button className="btn btn-ghost" onClick={() => setStep('map')}>Back</button>
            <button className="btn btn-primary" onClick={handleImport} disabled={importing}>
              {importing ? 'Importing...' : `Import ${csvData.filter(r => r[mapping.display_name]).length} Contacts`}
            </button>
          </div>
        </div>
      )}

      {step === 'done' && (
        <div className="text-center py-6">
          <div className="text-4xl mb-3">{importResult.errors.length === 0 ? '✓' : '⚠'}</div>
          <h3 className="font-bold text-lg mb-2">
            {importResult.errors.length === 0 ? 'Import Complete' : 'Import Finished with Errors'}
          </h3>
          <p className="text-sm text-gray-600 mb-1">
            <strong className="text-emerald-700">{importResult.success}</strong> contacts imported successfully.
          </p>
          {importResult.errors.length > 0 && (
            <div className="mt-2 text-left max-h-40 overflow-y-auto">
              <p className="text-sm text-amber-700 mb-1">{importResult.errors.length} rows failed:</p>
              {importResult.errors.map((e, i) => (
                <p key={i} className="text-xs text-red-600">{e.row > 0 ? `Row ${e.row}: ` : ''}{e.message}</p>
              ))}
            </div>
          )}
          <button className="btn btn-primary mt-5" onClick={onComplete}>Done</button>
        </div>
      )}
    </Modal>
  );
}
