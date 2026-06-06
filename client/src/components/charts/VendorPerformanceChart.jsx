import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const VendorPerformanceChart = ({ data = [] }) => {
  const chartData = data
    .filter((vendor) => vendor.totalSpent > 0 || vendor.quotationCount > 0)
    .slice(0, 8)
    .map((vendor) => ({
      name: vendor.companyName?.length > 16 ? `${vendor.companyName.slice(0, 16)}…` : vendor.companyName,
      spent: vendor.totalSpent,
      quotations: vendor.quotationCount,
      winRate: vendor.winRate
    }));

  if (!chartData.length) {
    return <div className="chart-placeholder">No vendor performance data yet.</div>;
  }

  return (
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value, name) => [name === 'spent' ? `₹${Number(value).toLocaleString('en-IN')}` : value, name === 'spent' ? 'Total spent' : 'Quotations']} />
          <Bar dataKey="spent" fill="#1f6fb2" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VendorPerformanceChart;
