import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "./Input";
import Dropdown from "./Dropdown";

export interface SearchField {
  value: string;
  label: string;
  type?: 'text' | 'number';
  operator?: string; // Default operator for this field
}

export interface SearchResult {
  id: string;
  displayText: string;
  [key: string]: any;
}

interface AutocompleteSearchBarProps {
  searchFields: SearchField[];
  onSearch: (query: string) => Promise<SearchResult[]>;
  placeholder?: string;
  debounceMs?: number;
  maxResults?: number;
}

// Mapping for different operators
const OPERATORS = {
  EQUALS: ":",
  NOT_IN: "<>",
  NEGATION: "!",
  GREATER_THAN: ">",
  GREATER_THAN_OR_EQUAL: ">:",
  LESS_THAN: "<",
  LESS_THAN_OR_EQUAL: "<:",
  BETWEEN: "()",
  CONTAINS: "~"
};

// Default operators for different field types
const getDefaultOperator = (field: SearchField): string => {
  if (field.operator) return field.operator;

  switch (field.type) {
    case 'number':
      return OPERATORS.EQUALS;
    case 'text':
    default:
      return OPERATORS.CONTAINS;
  }
};

export function AutocompleteSearchBar({
                                        searchFields,
                                        onSearch,
                                        placeholder = "Nhập từ khóa tìm kiếm...",
                                        debounceMs = 500,
                                        maxResults = 10
                                      }: AutocompleteSearchBarProps) {
  const [selectedField, setSelectedField] = useState(searchFields[0]?.value || "");
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState("");

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback(async (query: string, fieldValue: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const selectedFieldObj = searchFields.find(f => f.value === fieldValue);
      const operator = getDefaultOperator(selectedFieldObj!);
      const searchQuery = `${fieldValue}${operator}${query.trim()}`;

      const results = await onSearch(searchQuery);
      setSearchResults(results.slice(0, maxResults));
      setShowDropdown(true);
    } catch (err: any) {
      setError("Không thể tìm kiếm");
      console.error("Search error:", err);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [onSearch, searchFields, maxResults]);

  // Handle search input change with debounce
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout only if there's a search value
    if (searchValue.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        debouncedSearch(searchValue, selectedField);
      }, debounceMs);
    } else {
      // Immediately clear results if search is empty
      setSearchResults([]);
      setShowDropdown(false);
      setIsLoading(false);
    }

    // Cleanup function
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchValue, selectedField, debouncedSearch, debounceMs]);

  const handleFieldChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedField(e.target.value);
    // Trigger new search with current value if exists
    if (searchValue.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleClear = () => {
    setSearchValue("");
    setSearchResults([]);
    setShowDropdown(false);
    setError("");
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    // For now, just close dropdown - user said they don't need click handling yet
    setShowDropdown(false);
    console.log("Selected result:", result);
  };

  const selectedFieldObj = searchFields.find(field => field.value === selectedField);
  const selectedFieldType = selectedFieldObj?.type || 'text';

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex gap-3 items-end">
        <div className="w-48">
          <Dropdown
            label="Tìm kiếm theo"
            value={selectedField}
            onChange={handleFieldChange}
            options={searchFields.map(field => ({
              value: field.value,
              label: field.label
            }))}
          />
        </div>

        <div className="flex-1 relative" ref={dropdownRef}>
          <Input
            ref={inputRef}
            label="Từ khóa"
            type={selectedFieldType}
            value={searchValue}
            onChange={handleSearchChange}
            placeholder={placeholder}
          />

          {/* Search Results Dropdown */}
          {showDropdown && (searchResults.length > 0 || isLoading || error) && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
              {isLoading && (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto"></div>
                  <span className="text-sm text-gray-600 mt-2">Đang tìm kiếm...</span>
                </div>
              )}

              {error && (
                <div className="p-3 text-sm text-red-600 border-b">
                  {error}
                </div>
              )}

              {!isLoading && !error && searchResults.length === 0 && searchValue.trim() && (
                <div className="p-3 text-sm text-gray-500 text-center">
                  Không tìm thấy kết quả nào
                </div>
              )}

              {!isLoading && searchResults.map((result) => (
                <div
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 text-sm"
                >
                  <div className="font-medium text-gray-900">
                    {result.displayText}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    ID: {result.id}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {searchValue && (
          <button
            onClick={handleClear}
            className="mb-2 px-3 py-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Xóa tìm kiếm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {searchValue && (
        <div className="mt-2 text-sm text-gray-600">
          Tìm <span className="font-medium">{selectedFieldObj?.label}</span>
          <span className="mx-1 font-mono text-blue-600">
            {getDefaultOperator(selectedFieldObj!)}
          </span>
          <span className="font-medium">"{searchValue}"</span>
          {searchResults.length > 0 && (
            <span className="ml-2 text-green-600">
              ({searchResults.length} kết quả)
            </span>
          )}
        </div>
      )}
    </div>
  );
}
