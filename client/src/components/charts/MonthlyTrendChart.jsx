import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const MonthlyTrendChart = ({ data = [] }) => {
  if (!data.length) {
    return <div className="chart-placeholder">No monthly trend data yet. Generate invoices to see trends.</div>;
  }

  return (
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Spending']} />
          <Line type="monotone" dataKey="total" stroke="#1f6fb2" strokeWidth={3} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyTrendChart;
