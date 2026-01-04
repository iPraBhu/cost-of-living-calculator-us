/**
 * EconomicIndicatorsTable.tsx
 * Display additional economic indicators (taxes, income, unemployment)
 */

import { ComparisonRow, formatCurrency } from '../utils/calc';

interface EconomicIndicatorsTableProps {
  data: ComparisonRow[];
  baselineCode: string;
  locationType: 'state' | 'city';
}

export default function EconomicIndicatorsTable({ data, baselineCode, locationType }: EconomicIndicatorsTableProps) {
  // Check if we have tax data (only for states)
  const hasTaxData = data.some(row => row.additionalData.taxes);

  return (
    <div className="economic-indicators-container">
      <table className="economic-indicators-table">
        <thead>
          <tr>
            <th>{locationType === 'state' ? 'State' : 'City'}</th>
            {hasTaxData ? (
              <>
                <th>Income Tax Rate</th>
                <th>Property Tax Rate</th>
                <th>Sales Tax Rate</th>
                <th>Median Income</th>
                <th>Unemployment Rate</th>
              </>
            ) : (
              <>
                <th>Purchasing Power Index</th>
                <th>Cost + Rent Index</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map(row => {
            const isBaseline = row.code === baselineCode;
            return (
              <tr key={row.code} className={isBaseline ? 'baseline-row' : ''}>
                <td>
                  <strong>{row.name}</strong>
                  {isBaseline && <span className="baseline-badge">Baseline</span>}
                </td>
                {hasTaxData ? (
                  <>
                    <td>{row.additionalData.taxes?.incomeTax || 'N/A'}%</td>
                    <td>{row.additionalData.taxes?.propertyTax || 'N/A'}%</td>
                    <td>{row.additionalData.taxes?.salesTax || 'N/A'}%</td>
                    <td className="median-income">
                      {row.additionalData.medianIncome ? formatCurrency(row.additionalData.medianIncome) : 'N/A'}
                    </td>
                    <td>{row.additionalData.unemploymentRate || 'N/A'}%</td>
                  </>
                ) : (
                  <>
                    <td>{row.additionalData.purchasingPower || 'N/A'}</td>
                    <td>{row.additionalData.costPlusRent || 'N/A'}</td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}