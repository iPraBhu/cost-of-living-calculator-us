/**
 * App.tsx
 * Main application component
 */

import { useState, useEffect } from 'react';
import dataset from './data/combined_coli.json';
import StateMultiSelect from './components/StateMultiSelect';
import CityMultiSelect from './components/CityMultiSelect';
import ResultsTable from './components/ResultsTable';
import EconomicIndicatorsTable from './components/EconomicIndicatorsTable';
import ComparableSalaryChart from './components/ComparableSalaryChart';
import { generateComparisonData, LocationData, StateData, ComparisonRow } from './utils/calc';
import { parseQueryParams, generateShareUrl, copyToClipboard } from './utils/queryState';
import './styles.css';

function App() {
  // Get all location data
  const allStates = dataset.states as LocationData[];
  const allCities = dataset.cities as LocationData[];
  const validStateCodes = allStates.map(s => s.code!);

  // Add location type state
  const [locationType, setLocationType] = useState<'state' | 'city'>('state');

  // Initialize state from URL params or defaults
  const initialParams = parseQueryParams(validStateCodes); // Use state codes for initial parsing
  
  const [selectedCodes, setSelectedCodes] = useState<string[]>(
    initialParams?.states || ['CA', 'TX']
  );
  const [income, setIncome] = useState<number>(
    initialParams?.income || 100000
  );
  const [baselineCode, setBaselineCode] = useState<string>(
    initialParams?.base || selectedCodes[0] || 'CA'
  );
  const [shareMessage, setShareMessage] = useState<string>('');

  // Update location type from URL params
  useEffect(() => {
    if (initialParams?.type) {
      setLocationType(initialParams.type);
    }
  }, []);

  // Get current location data based on type
  const currentLocations = locationType === 'state' ? allStates : allCities;

  // Ensure baseline is always in selected locations
  useEffect(() => {
    if (!selectedCodes.includes(baselineCode) && selectedCodes.length > 0) {
      setBaselineCode(selectedCodes[0]);
    }
  }, [selectedCodes, baselineCode]);

  // Reset selections when switching location type
  useEffect(() => {
    const defaultSelections = locationType === 'state' 
      ? ['CA', 'TX'] 
      : ['New York, NY', 'Los Angeles, CA'];
    setSelectedCodes(defaultSelections);
    setBaselineCode(defaultSelections[0]);
  }, [locationType]);

  // Get selected location data
  const selectedLocations = currentLocations.filter(l => 
    selectedCodes.includes(l.code || l.name)
  );

  // Compute comparison data
  const comparisonData: ComparisonRow[] = selectedCodes.length >= 2
    ? generateComparisonData(selectedLocations, baselineCode, income)
    : [];

  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setIncome(value);
    } else if (e.target.value === '') {
      setIncome(0);
    }
  };

  const handleShare = async () => {
    const url = generateShareUrl(selectedCodes, income, baselineCode, locationType);
    try {
      await copyToClipboard(url);
      setShareMessage('Link copied to clipboard!');
      setTimeout(() => setShareMessage(''), 3000);
    } catch (error) {
      setShareMessage('Failed to copy link');
      setTimeout(() => setShareMessage(''), 3000);
    }
  };

  const showWarning = selectedCodes.length < 2;

  return (
    <div className="app">
      <header className="app-header">
        <h1>US Cost of Living Comparator</h1>
        <p className="subtitle">Compare cost of living across US states and cities, calculate comparable salaries</p>
        <p className="data-source">
          Data source: {dataset.meta.source} | Last updated: {dataset.meta.lastUpdated}
        </p>
      </header>

      <main className="app-main">
        <section className="controls-section">
          <h2>Configuration</h2>
          
          <div className="control-group">
            <label>Location Type</label>
            <div className="location-type-toggle">
              <button 
                className={`toggle-btn ${locationType === 'state' ? 'active' : ''}`}
                onClick={() => setLocationType('state')}
              >
                States
              </button>
              <button 
                className={`toggle-btn ${locationType === 'city' ? 'active' : ''}`}
                onClick={() => setLocationType('city')}
              >
                Cities
              </button>
            </div>
          </div>
          
          <div className="control-group">
            {locationType === 'state' ? (
              <StateMultiSelect
                states={allStates as StateData[]}
                selectedCodes={selectedCodes}
                onChange={setSelectedCodes}
              />
            ) : (
              <CityMultiSelect
                cities={allCities}
                selectedNames={selectedCodes}
                onChange={setSelectedCodes}
              />
            )}
          </div>

          {showWarning && (
            <div className="warning-message">
              ⚠️ Please select at least 2 {locationType === 'state' ? 'states' : 'cities'} to compare
            </div>
          )}

          <div className="control-group">
            <label htmlFor="baseline-select">Baseline {locationType === 'state' ? 'State' : 'City'}</label>
            <select
              id="baseline-select"
              value={baselineCode}
              onChange={(e) => setBaselineCode(e.target.value)}
              disabled={selectedCodes.length === 0}
              aria-label={`Select baseline ${locationType}`}
            >
              {selectedLocations.map(location => (
                <option key={location.code || location.name} value={location.code || location.name}>
                  {location.name}
                </option>
              ))}
            </select>
            <small>The baseline state is the reference point for salary comparisons</small>
          </div>

          <div className="control-group">
            <label htmlFor="income-input">Annual Income (in baseline state)</label>
            <input
              id="income-input"
              type="number"
              min="0"
              step="1000"
              value={income}
              onChange={handleIncomeChange}
              aria-label="Annual income"
            />
            <small>Enter your annual income in the baseline state</small>
          </div>

          <div className="control-group">
            <button
              className="share-button"
              onClick={handleShare}
              disabled={selectedCodes.length < 2}
              aria-label="Share comparison"
            >
              📋 Share Link
            </button>
            {shareMessage && <span className="share-message">{shareMessage}</span>}
          </div>
        </section>

        {!showWarning && comparisonData.length > 0 && (
          <>
            <section className="results-section">
              <h2>Results</h2>
              <p className="results-explanation">
                The "Comparable Salary" shows how much you would need to earn in each {locationType} 
                to maintain the same standard of living as earning ${income.toLocaleString()} 
                in {selectedLocations.find(l => (l.code || l.name) === baselineCode)?.name}.
              </p>
              <ResultsTable data={comparisonData} baselineCode={baselineCode} />
            </section>

            <section className="economic-indicators-section">
              <h2>Economic Indicators</h2>
              <p className="indicators-explanation">
                {locationType === 'state' 
                  ? 'Additional economic factors that affect take-home pay and quality of life. Tax rates are for top marginal brackets. Property tax rates are average effective rates.'
                  : 'Additional economic indicators for cities. Purchasing Power Index shows relative buying power. Cost + Rent Index combines housing and overall costs.'
                }
              </p>
              <EconomicIndicatorsTable 
                data={comparisonData} 
                baselineCode={baselineCode} 
                locationType={locationType}
              />
            </section>

            <section className="chart-section">
              <h2>Visualization</h2>
              <ComparableSalaryChart data={comparisonData} baselineCode={baselineCode} />
            </section>
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>
          Note: All indices are relative to the national average (100). 
          This is sample data for demonstration purposes. 
          Replace with real cost of living data before production use.
        </p>
      </footer>
    </div>
  );
}

export default App;
