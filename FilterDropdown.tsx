'use client';

import { useState, useRef, useEffect } from 'react';

type Props = {
  label: string;
  options: readonly string[];
  selected: string[];
  onToggle: (value: string) => void;
};

export function FilterDropdown({ label, options, selected, onToggle }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        className={`btn text-xs px-3 py-[7px] rounded-md border-[1.5px] font-medium ${
          selected.length
            ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
            : 'bg-white border-sand-400 text-gray-500'
        }`}
        onClick={() => setOpen(!open)}
      >
        {label} {selected.length > 0 && `(${selected.length})`} ▾
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-sand-300 rounded-lg p-1.5 z-50 min-w-[200px] shadow-lg">
          {options.map(o => (
            <label
              key={o}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded cursor-pointer text-xs hover:bg-sand-50"
            >
              <input
                type="checkbox"
                checked={selected.includes(o)}
                onChange={() => onToggle(o)}
                className="accent-forest-700"
              />
              {o}
            </label>
          ))}
          <div className="border-t border-sand-200 mt-1 pt-1">
            <button className="btn btn-ghost text-xs w-full" onClick={() => setOpen(false)}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
}
