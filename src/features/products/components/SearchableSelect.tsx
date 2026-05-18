import React, { useState, useEffect } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  showSearch?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Tìm...',
  showSearch = true,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  // Focus search on open
  useEffect(() => {
    if (open) {
      setSearch('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase()),
  );

  const selectedLabel = options.find((o) => o.value === value)?.label || placeholder;

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center space-x-2 bg-gray-100/50 dark:bg-[#0A0B10] rounded-xl p-1 pr-4 border border-transparent hover:border-gray-200 dark:hover:border-white/10 dark:border-white/5 transition h-11 cursor-pointer select-container`}
      >
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-3 whitespace-nowrap">
          {label}
        </span>
        <span className="text-gray-800 dark:text-gray-200 text-sm font-semibold py-1.5 px-2 truncate max-w-[160px] select-value">
          {selectedLabel}
        </span>
        <span
          className={`material-icons-round text-gray-400 text-[18px] transition-transform ${open ? 'rotate-180' : ''}`}
        >
          expand_more
        </span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute top-full left-0 mt-2 w-[280px] bg-white dark:bg-[#0A0B10] rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 z-50 overflow-hidden"
          style={{ animation: 'fadeIn 0.15s ease-out' }}
        >
          {/* Search input */}
          {showSearch && (
            <div className="p-3 border-b border-gray-100 dark:border-white/5">
              <div className="relative">
                <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[16px]">
                  search
                </span>
                <input
                  ref={inputRef}
                  className="w-full bg-gray-100/50 dark:bg-white/5 border-none rounded-xl text-sm py-2.5 pl-9 pr-3 focus:ring-2 focus:ring-primary placeholder:text-gray-400 dark:text-gray-300 outline-none"
                  placeholder={placeholder}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Options list */}
          <div className="max-h-[240px] overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <div className="px-4 py-6 text-center text-stone-400 text-sm">
                <span className="material-icons-round text-[24px] mb-1 block opacity-50">
                  search_off
                </span>
                Không tìm thấy
              </div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.value}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-all border-none cursor-pointer flex items-center gap-3 ${
                    opt.value === value
                      ? 'bg-primary/10 text-primary font-bold'
                      : 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 font-medium'
                  }`}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                >
                  {opt.value === value && (
                    <span className="material-icons-round text-primary text-[16px]">
                      check_circle
                    </span>
                  )}
                  <span className="truncate">{opt.label}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
