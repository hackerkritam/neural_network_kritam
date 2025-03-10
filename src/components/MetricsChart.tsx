import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { TrainingMetrics } from '../types/neural';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface MetricsChartProps {
  metrics: TrainingMetrics[];
}

export const MetricsChart: React.FC<MetricsChartProps> = ({ metrics }) => {
  const data = {
    labels: metrics.map(m => m.epoch.toString()),
    datasets: [
      {
        label: 'Training Loss',
        data: metrics.map(m => m.loss),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
      },
      {
        label: 'Validation Loss',
        data: metrics.map(m => m.validationLoss),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
      },
      {
        label: 'Accuracy',
        data: metrics.map(m => m.accuracy),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Training Metrics',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <Line data={data} options={options} />
    </div>
  );
};