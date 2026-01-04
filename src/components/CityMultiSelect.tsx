/**
 * CityMultiSelect.tsx
 * A searchable dropdown with checkboxes for selecting multiple cities
 */

import { useState, useRef, useEffect } from 'react';
import { LocationData } from '../utils/calc';

interface CityMultiSelectProps {
  cities: LocationData[];
  selectedNames: string[];
  onChange: (names: string[]) => void;
}

export default function CityMultiSelect({ cities, selectedNames, onChange }: CityMultiSelectProps) {
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

  // Filter cities based on search term
  const filteredCities = cities.filter(city =>
    city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (city.state && city.state.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleCity = (name: string) => {
    if (selectedNames.includes(name)) {
      // Remove city
      const newNames = selectedNames.filter(n => n !== name);
      onChange(newNames);
    } else {
      // Add city
      onChange([...selectedNames, name]);
    }
  };

  const selectAll = () => {
    onChange(cities.map(city => city.name));
  };

  const clearAll = () => {
    onChange([]);
  };

  const selectedCount = selectedNames.length;
  const displayText = selectedCount === 0
    ? 'Select cities...'
    : selectedCount === 1
    ? cities.find(c => c.name === selectedNames[0])?.name || '1 city selected'
    : `${selectedCount} cities selected`;

  return (
    <div className="multiselect-container" ref={dropdownRef}>
      <label htmlFor="city-multiselect">Select Cities</label>
      <div className="multiselect-input">
        <input
          id="city-multiselect"
          type="text"
          value={isOpen ? searchTerm : displayText}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Search cities..."
          className="multiselect-display"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="multiselect-toggle"
          aria-label={isOpen ? 'Close city selector' : 'Open city selector'}
        >
          {isOpen ? '▲' : '▼'}
        </button>
      </div>

      {isOpen && (
        <div className="multiselect-dropdown">
          <div className="multiselect-actions">
            <button type="button" onClick={selectAll} className="action-btn">
              Select All
            </button>
            <button type="button" onClick={clearAll} className="action-btn">
              Clear All
            </button>
          </div>

          <div className="multiselect-list">
            {filteredCities.length === 0 ? (
              <div className="no-results">No cities found</div>
            ) : (
              filteredCities.map(city => (
                <label key={city.name} className="multiselect-item">
                  <input
                    type="checkbox"
                    checked={selectedNames.includes(city.name)}
                    onChange={() => toggleCity(city.name)}
                    className="multiselect-checkbox"
                  />
                  <span className="multiselect-label">
                    {city.name}
                  </span>
                </label>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}