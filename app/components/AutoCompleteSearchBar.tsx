import React, { useCallback, useEffect, useRef, useState } from "react";

export interface SearchField {
  value: string;
  label: string;
  type?: 'text' | 'number';
  operator?: string;
}

export interface SearchResult {
  id: string;
  displayText: string;
  value?: string;
  name?: string;
  [key: string]: any;
}

interface AutocompleteSearchBarProps {
  searchFields: SearchField[];
  onSearch: (query: string) => Promise<SearchResult[]>;
  placeholder?: string;
  debounceMs?: number;
  maxResults?: number;
  onSelect?: (item: SearchResult) => void;
  onSubmit?: (query: string) => void;
  submitOnSelect?: boolean;
  className?: string;
}

const OPERATORS = {
  EQUALS: ":",
  CONTAINS: "~",
};

const getDefaultOperator = (field: SearchField): string => {
  if (field.operator) return field.operator;
  return field.type === 'number' ? OPERATORS.EQUALS : OPERATORS.CONTAINS;
};

export default function AutocompleteSearchBar({
  searchFields,
  onSearch,
  placeholder = "Tìm...",
  debounceMs = 350,
  maxResults = 8,
  onSelect,
  onSubmit,
  submitOnSelect = true,
  className = ""
}: AutocompleteSearchBarProps) {
  const [selectedField, setSelectedField] = useState<string>(searchFields[0]?.value ?? "");
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timerRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Close on outside click
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  // Debounced search
  const doSearch = useCallback(async (value: string, fieldVal: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const fieldObj = searchFields.find(f => f.value === fieldVal) ?? searchFields[0];
      const op = getDefaultOperator(fieldObj!);
      const query = `${fieldVal}${op}${trimmed}`;
      const res = await onSearch(query);
      setResults(res.slice(0, maxResults));
      setOpen(true);
    } catch (err: any) {
      console.error("search err", err);
      setError("Lỗi tìm kiếm");
      setResults([]);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }, [onSearch, searchFields, maxResults]);

  useEffect(() => {
    // debounce
    if (timerRef.current) window.clearTimeout(timerRef.current);
    if (!q.trim()) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      return;
    }
    timerRef.current = window.setTimeout(() => {
      doSearch(q, selectedField);
    }, debounceMs);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [q, selectedField, doSearch, debounceMs]);

  const handleSelectResult = (r: SearchResult) => {
    onSelect && onSelect(r);
    const val = r.value ?? r.name ?? r.displayText ?? r.id ?? "";
    if (submitOnSelect && onSubmit) {
      const fieldObj = searchFields.find(f => f.value === selectedField) ?? searchFields[0];
      const qStr = `${selectedField}${getDefaultOperator(fieldObj!)}${String(val)}`;
      onSubmit(qStr);
    }
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = q.trim();
      if (!trimmed) {
        onSubmit && onSubmit("");
        setOpen(false);
        return;
      }
      const fieldObj = searchFields.find(f => f.value === selectedField) ?? searchFields[0];
      const query = `${selectedField}${getDefaultOperator(fieldObj!)}${trimmed}`;
      onSubmit && onSubmit(query);
      setOpen(false);
    }
    if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const clear = () => {
    setQ("");
    setResults([]);
    setOpen(false);
    setError(null);
    onSubmit && onSubmit("");
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={`flex items-center gap-2 text-sm ${className}`}>
      {/* compact select */}
      <select
        aria-label="field"
        value={selectedField}
        onChange={(e) => setSelectedField(e.target.value)}
        className="h-8 px-2 rounded border border-gray-200 bg-white text-xs"
      >
        {searchFields.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
      </select>

      {/* compact input */}
      <div className="relative flex-1">
        <input
          ref={inputRef}
          type={searchFields.find(f => f.value === selectedField)?.type ?? 'text'}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full h-8 px-2 rounded border border-gray-200 text-sm"
          aria-autocomplete="list"
          aria-expanded={open}
          role="combobox"
        />

        {/* clear / loader */}
        <div className="absolute right-1 top-1.5 flex items-center gap-1">
          {loading ? (
            <div className="w-4 h-4 border-b-2 border-primary animate-spin rounded-full" />
          ) : q ? (
            <button onClick={clear} aria-label="clear" className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          ) : null}
        </div>

        {/* dropdown results (compact) */}
        {open && (results.length > 0 || error) && (
          <div className="absolute z-50 mt-1 left-0 right-0 bg-white border border-gray-200 rounded shadow max-h-48 overflow-auto text-xs">
            {error ? (
              <div className="p-2 text-red-600">{error}</div>
            ) : (
              results.map(r => (
                <div
                  key={r.id}
                  onClick={() => handleSelectResult(r)}
                  className="px-2 py-2 hover:bg-gray-50 cursor-pointer flex flex-col"
                >
                  <span className="font-medium">{r.displayText}</span>
                  <span className="text-gray-400">{r.value ?? r.id}</span>
                </div>
              ))
            )}
            {results.length === 0 && !error && (
              <div className="p-2 text-gray-500">Không tìm thấy</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
