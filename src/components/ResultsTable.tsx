/**
 * ResultsTable.tsx
 * Display comparison results in a table format
 */

import { ComparisonRow, formatCurrency } from '../utils/calc';

interface ResultsTableProps {
  data: ComparisonRow[];
  baselineCode: string;
}

export default function ResultsTable({ data, baselineCode }: ResultsTableProps) {
  return (
    <div className="results-table-container">
      <table className="results-table">
        <thead>
          <tr>
            <th>State</th>
            <th>Overall Index</th>
            <th>Housing</th>
            <th>Utilities</th>
            <th>Groceries</th>
            <th>Transportation</th>
            <th>Healthcare</th>
            <th>Miscellaneous</th>
            <th>Comparable Salary</th>
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
                <td>{row.indices.overall}</td>
                <td>{row.indices.housing}</td>
                <td>{row.indices.utilities}</td>
                <td>{row.indices.groceries}</td>
                <td>{row.indices.transportation}</td>
                <td>{row.indices.healthcare}</td>
                <td>{row.indices.miscellaneous}</td>
                <td className="comparable-salary">
                  {formatCurrency(row.comparableOverall)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
