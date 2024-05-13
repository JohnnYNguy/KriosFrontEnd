import React from 'react';
import { Line } from 'react-chartjs-2';
import { ChartData, ChartOptions } from 'chart.js';

// Define the props specifically for a line chart
interface LineChartProps {
  data: ChartData<'line'>;  // Specify 'line' to match the expected ChartData type
  options: ChartOptions<'line'>;
}

const LineChart: React.FC<LineChartProps> = ({ data, options }) => {
  return <Line data={data} options={options} />;
};

export default LineChart;