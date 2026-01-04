/**
 * ComparableSalaryChart.tsx
 * Bar chart visualization of comparable salaries using Chart.js
 */

import { useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { ComparisonRow, formatCurrency } from '../utils/calc';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ComparableSalaryChartProps {
  data: ComparisonRow[];
  baselineCode: string;
}

export default function ComparableSalaryChart({ data, baselineCode }: ComparableSalaryChartProps) {
  const chartRef = useRef(null);

  // Prepare chart data
  const labels = data.map(row => row.name);
  const salaries = data.map(row => row.comparableOverall);
  
  // Highlight baseline state with different color
  const backgroundColors = data.map(row =>
    row.code === baselineCode ? 'rgba(54, 162, 235, 0.8)' : 'rgba(75, 192, 192, 0.6)'
  );
  const borderColors = data.map(row =>
    row.code === baselineCode ? 'rgba(54, 162, 235, 1)' : 'rgba(75, 192, 192, 1)'
  );

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Comparable Salary',
        data: salaries,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Comparable Salary Comparison',
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return formatCurrency(context.parsed.y);
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return formatCurrency(value);
          },
        },
      },
    },
  };

  return (
    <div className="chart-container">
      <Bar ref={chartRef} data={chartData} options={options} />
    </div>
  );
}
