'use client';

import { useRef, useState } from 'react';
import { Upload, X, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import Papa from 'papaparse';
import { CONTACT_CSV_FIELDS, guessCsvMapping } from '@/lib/csvUtils';
import type { Contact } from '@/lib/prisma';

type Step = 'upload' | 'map' | 'confirm' | 'done';

interface ParsedRow {
  [header: string]: string;
}

interface ImportResult {
  imported: number;
  skipped: number;
  errors: { row: number; message: string }[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CsvImportModal({ isOpen, onClose, onSuccess }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>('upload');
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<ParsedRow[]>([]);
  const [mapping, setMapping] = useState<Record<string, keyof Contact | ''>>({});
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const reset = () => {
    setStep('upload');
    setCsvHeaders([]);
    setCsvRows([]);
    setMapping({});
    setResult(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleClose = () => { reset(); onClose(); };

  const handleFile = (file: File) => {
    Papa.parse<ParsedRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const guessed = guessCsvMapping(headers);
        const initial: Record<string, keyof Contact | ''> = {};
        for (const h of headers) initial[h] = guessed[h] || '';
        setCsvHeaders(headers);
        setCsvRows(results.data);
        setMapping(initial);
        setStep('map');
      },
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith('.csv')) handleFile(file);
  };

  const mappedRows = csvRows.map((row) => {
    const mapped: Record<string, string> = {};
    for (const [header, field] of Object.entries(mapping)) {
      if (field) mapped[field] = row[header] || '';
    }
    return mapped;
  });

  const validRows = mappedRows.filter((r) => r.name?.trim());
  const invalidCount = mappedRows.length - validRows.length;

  const handleImport = async () => {
    setImporting(true);
    try {
      const res = await fetch('/api/contacts/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: validRows }),
      });
      const data = await res.json();
      setResult(data);
      setStep('done');
      if (data.imported > 0) onSuccess();
    } finally {
      setImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Import Contacts from CSV</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
          {(['upload', 'map', 'confirm', 'done'] as Step[]).map((s, i, arr) => (
            <span key={s} className="flex items-center gap-2">
              <span className={`capitalize ${step === s ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''}`}>{s}</span>
              {i < arr.length - 1 && <ChevronRight className="w-3 h-3" />}
            </span>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Upload step */}
          {step === 'upload' && (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors cursor-pointer"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="w-10 h-10 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">Drop a CSV file here or click to browse</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Column headers will be auto-detected</p>
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
            </div>
          )}

          {/* Map step */}
          {step === 'map' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Map your CSV columns to CRM fields. <strong>{csvRows.length}</strong> rows found.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-2 pr-4 font-medium text-gray-700 dark:text-gray-300">CSV Column</th>
                      <th className="text-left py-2 font-medium text-gray-700 dark:text-gray-300">CRM Field</th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvHeaders.map((header) => (
                      <tr key={header} className="border-b border-gray-100 dark:border-gray-700">
                        <td className="py-2 pr-4 text-gray-600 dark:text-gray-400 font-mono text-xs">{header}</td>
                        <td className="py-2">
                          <select
                            value={mapping[header] || ''}
                            onChange={(e) => setMapping((m) => ({ ...m, [header]: e.target.value as keyof Contact | '' }))}
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          >
                            <option value="">— skip —</option>
                            {CONTACT_CSV_FIELDS.map((f) => (
                              <option key={f.key} value={f.key}>{f.label}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Preview */}
              {csvRows.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Preview (first 3 rows)</p>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded p-3 text-xs font-mono overflow-x-auto space-y-1">
                    {csvRows.slice(0, 3).map((row, i) => {
                      const preview = Object.entries(mapping)
                        .filter(([, f]) => f)
                        .map(([h, f]) => `${f}: ${row[h] || '—'}`)
                        .join(' · ');
                      return <div key={i} className="text-gray-600 dark:text-gray-400 truncate">{preview || '—'}</div>;
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Confirm step */}
          {step === 'confirm' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-indigo-900 dark:text-indigo-200">
                    Ready to import <strong>{validRows.length}</strong> contact{validRows.length !== 1 ? 's' : ''}
                  </p>
                  {invalidCount > 0 && (
                    <p className="text-xs text-indigo-700 dark:text-indigo-400 mt-1">
                      {invalidCount} row{invalidCount !== 1 ? 's' : ''} will be skipped (missing name)
                    </p>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Contacts with an email address that already exists in your CRM will be skipped as duplicates.
              </p>
            </div>
          )}

          {/* Done step */}
          {step === 'done' && result && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-green-900 dark:text-green-200">Import complete</p>
                  <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                    {result.imported} imported · {result.skipped} skipped (duplicate) · {result.errors.length} errors
                  </p>
                </div>
              </div>
              {result.errors.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Errors</p>
                  {result.errors.map((e) => (
                    <div key={e.row} className="flex items-start gap-2 text-xs text-red-700 dark:text-red-400">
                      <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      <span>Row {e.row}: {e.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 dark:border-gray-700">
          {step === 'upload' && (
            <button onClick={handleClose} className="text-gray-600 dark:text-gray-400 text-sm hover:text-gray-900 dark:hover:text-white transition-colors">
              Cancel
            </button>
          )}
          {step === 'map' && (
            <>
              <button onClick={() => setStep('upload')} className="text-gray-600 dark:text-gray-400 text-sm hover:text-gray-900 dark:hover:text-white transition-colors">
                Back
              </button>
              <button
                onClick={() => setStep('confirm')}
                disabled={!Object.values(mapping).some((v) => v === 'name')}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Review import
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
          {step === 'confirm' && (
            <>
              <button onClick={() => setStep('map')} className="text-gray-600 dark:text-gray-400 text-sm hover:text-gray-900 dark:hover:text-white transition-colors">
                Back
              </button>
              <button
                onClick={handleImport}
                disabled={importing || validRows.length === 0}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {importing ? 'Importing…' : `Import ${validRows.length} contact${validRows.length !== 1 ? 's' : ''}`}
              </button>
            </>
          )}
          {step === 'done' && (
            <div className="flex gap-3 ml-auto">
              <button
                onClick={() => { reset(); }}
                className="text-gray-600 dark:text-gray-400 text-sm hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Import another
              </button>
              <button
                onClick={handleClose}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
