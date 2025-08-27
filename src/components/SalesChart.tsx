import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

interface SalesChartProps {
  type: 'bar' | 'line' | 'pie' | 'area';
  data: ChartData[];
  title?: string;
  xKey?: string;
  yKey?: string;
  colors?: string[];
  height?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const SalesChart: React.FC<SalesChartProps> = ({
  type,
  data,
  title,
  xKey = 'name',
  yKey = 'value',
  colors = COLORS,
  height = 300,
  showGrid = true,
  showTooltip = true,
  showLegend = false
}) => {
  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xKey} />
            <YAxis />
            {showTooltip && <Tooltip />}
            <Bar dataKey={yKey} fill={colors[0]} />
          </BarChart>
        );

      case 'line':
        return (
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xKey} />
            <YAxis />
            {showTooltip && <Tooltip />}
            <Line type="monotone" dataKey={yKey} stroke={colors[0]} strokeWidth={2} />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xKey} />
            <YAxis />
            {showTooltip && <Tooltip />}
            <Area type="monotone" dataKey={yKey} stroke={colors[0]} fill={colors[0]} fillOpacity={0.3} />
          </AreaChart>
        );

      case 'pie':
        return (
          <PieChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            {showTooltip && <Tooltip />}
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey={yKey}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
          </PieChart>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;
