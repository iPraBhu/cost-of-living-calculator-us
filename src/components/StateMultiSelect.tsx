/**
 * StateMultiSelect.tsx
 * A searchable dropdown with checkboxes for selecting multiple states
 */

import { useState, useRef, useEffect } from 'react';
import { StateData } from '../utils/calc';

interface StateMultiSelectProps {
  states: StateData[];
  selectedCodes: string[];
  onChange: (codes: string[]) => void;
}

export default function StateMultiSelect({ states, selectedCodes, onChange }: StateMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Filter states based on search term
  const filteredStates = states.filter(state =>
    state.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    state.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleState = (code: string) => {
    if (selectedCodes.includes(code)) {
      // Remove state
      const newCodes = selectedCodes.filter(c => c !== code);
      onChange(newCodes);
    } else {
      // Add state
      onChange([...selectedCodes, code]);
    }
  };

  const selectedNames = selectedCodes
    .map(code => states.find(s => s.code === code)?.name)
    .filter(Boolean)
    .join(', ');

  return (
    <div className="state-multi-select" ref={dropdownRef}>
      <label htmlFor="state-select-button">Select States (minimum 2)</label>
      <button
        id="state-select-button"
        type="button"
        className="select-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {selectedCodes.length === 0 ? 'Select states...' : `${selectedCodes.length} states selected`}
      </button>

      {selectedNames && (
        <div className="selected-states-display">
          {selectedNames}
        </div>
      )}

      {isOpen && (
        <div className="dropdown-panel">
          <input
            type="text"
            className="search-input"
            placeholder="Search states..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search states"
          />

          <div className="states-list" role="listbox">
            {filteredStates.map(state => (
              <label key={state.code} className="state-option">
                <input
                  type="checkbox"
                  checked={selectedCodes.includes(state.code)}
                  onChange={() => toggleState(state.code)}
                  aria-label={`Select ${state.name}`}
                />
                <span>{state.name} ({state.code})</span>
              </label>
            ))}
            {filteredStates.length === 0 && (
              <div className="no-results">No states found</div>
            )}
          </div>

          <button
            type="button"
            className="done-button"
            onClick={() => setIsOpen(false)}
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
