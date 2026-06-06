import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#1f6fb2', '#0f7b4d', '#9a6700', '#b42318', '#65758b'];

const SpendingChart = ({ data = [] }) => {
  if (!data.length) {
    return <div className="chart-placeholder">No spending data yet. Generate invoices to see this chart.</div>;
  }

  const chartData = data.map((item) => ({
    name: item.status,
    value: item.total,
    count: item.count
  }));

  return (
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
            {chartData.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Amount']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SpendingChart;
