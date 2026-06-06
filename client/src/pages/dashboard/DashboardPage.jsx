import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Button from '../../components/common/Button';
import PageHeader from '../../components/layout/PageHeader';
import { getDashboardSummary, getRecentOrders, getSpendingChart } from '../../services/dashboardService';
import { listNotifications } from '../../services/notificationService';
import { useAuth } from '../../hooks/useAuth';

const fallbackSummary = {
  activeRfqs: 0,
  pendingApprovals: 0,
  invoices: 0,
  activeVendors: 0
};

const formatCurrency = (value) => {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value.toLocaleString('en-IN')}`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1e293b',
      border: 'none',
      borderRadius: 8,
      padding: '12px 16px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
    }}>
      <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 6, fontWeight: 600 }}>{label}</div>
      {payload.map((entry, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color, display: 'inline-block' }} />
          <span style={{ color: '#e2e8f0', fontSize: 13 }}>{entry.name}: </span>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>₹{entry.value.toLocaleString('en-IN')}</span>
        </div>
      ))}
    </div>
  );
};

const statusColors = {
  generated: { bg: '#e0f2fe', color: '#0369a1' },
  sent: { bg: '#dbeafe', color: '#1d4ed8' },
  acknowledged: { bg: '#fef3c7', color: '#92400e' },
  completed: { bg: '#dcfce7', color: '#166534' },
  cancelled: { bg: '#fde8e8', color: '#b42318' }
};

const DashboardPage = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(fallbackSummary);
  const [orders, setOrders] = useState([]);
  const [spending, setSpending] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    getDashboardSummary().then(setSummary).catch(() => setSummary(fallbackSummary));
    getRecentOrders().then((data) => setOrders(Array.isArray(data) ? data : [])).catch(() => setOrders([]));
    getSpendingChart().then((data) => setSpending(Array.isArray(data) ? data : [])).catch(() => setSpending([]));
    listNotifications()
      .then((data) => setUnreadCount(data.unreadCount || 0))
      .catch(() => setUnreadCount(0));
  }, []);

  const canViewLogs = user && ['admin', 'procurement_officer', 'manager'].includes(user.role);

  // Calculate spending totals for the summary banner
  const totalSpending = spending.reduce((sum, m) => sum + m.orders + m.invoices, 0);

  return (
    <section>
      <PageHeader
        title="Dashboard"
        subtitle="Monitor procurement activity and jump into active workflows."
        actions={
          <div className="actions">
            <Link to="/notifications"><Button variant="secondary">Notifications {unreadCount > 0 ? `(${unreadCount})` : ''}</Button></Link>
            {canViewLogs && <Link to="/activity-logs"><Button variant="secondary">Activity logs</Button></Link>}
          </div>
        }
      />

      {/* ── Metric Cards ── */}
      <div className="metric-grid">
        <div className="metric">
          <span>Active RFQs</span>
          <strong style={{ color: '#1d4ed8' }}>{summary.activeRfqs}</strong>
        </div>
        <div className="metric">
          <span>Pending approvals</span>
          <strong style={{ color: '#92400e' }}>{summary.pendingApprovals}</strong>
        </div>
        <div className="metric">
          <span>Invoices</span>
          <strong style={{ color: '#166534' }}>{summary.invoices}</strong>
        </div>
        <div className="metric">
          <span>Active vendors</span>
          <strong style={{ color: '#7c3aed' }}>{summary.activeVendors}</strong>
        </div>
      </div>

      {/* ── Spending Chart ── */}
      <div className="panel" style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2 style={{ margin: 0 }}>Spending Overview</h2>
            <p style={{ margin: '4px 0 0', fontSize: 13 }}>Last 6 months · Purchase Orders vs Invoices</p>
          </div>
          {totalSpending > 0 && (
            <div style={{
              background: 'linear-gradient(135deg, #eff6ff, #eef2ff)',
              borderRadius: 8,
              padding: '8px 16px',
              textAlign: 'right'
            }}>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total (6 mo)</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#1e293b' }}>{formatCurrency(totalSpending)}</div>
            </div>
          )}
        </div>

        <div style={{ width: '100%', height: 300 }}>
          {spending.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spending} barGap={4} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={formatCurrency}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={70}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.06)' }} />
                <Legend
                  wrapperStyle={{ fontSize: 13, fontWeight: 600 }}
                  iconType="circle"
                  iconSize={8}
                />
                <Bar dataKey="orders" name="Purchase Orders" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="invoices" name="Invoices" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'grid', placeItems: 'center', height: '100%', color: '#94a3b8', fontSize: 14 }}>
              No spending data yet. Create purchase orders to see trends here.
            </div>
          )}
        </div>
      </div>

      {/* ── Recent Orders Table ── */}
      <div className="panel" style={{ padding: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 18px' }}>
          <h2 style={{ margin: 0 }}>Recent Orders</h2>
          <Link to="/purchase-orders"><Button variant="secondary">View all</Button></Link>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>PO Number</th>
              <th>Vendor</th>
              <th>RFQ</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? orders.map((order) => {
              const sc = statusColors[order.status] || statusColors.generated;
              return (
                <tr key={order._id}>
                  <td>
                    <Link to={`/purchase-orders/${order._id}`} style={{ color: '#1d4ed8', fontWeight: 600 }}>
                      {order.poNumber}
                    </Link>
                  </td>
                  <td>
                    <strong>{order.vendorId?.companyName || '—'}</strong>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{order.vendorId?.name || ''}</div>
                  </td>
                  <td style={{ color: '#475569', fontSize: 13 }}>{order.rfqId?.title || '—'}</td>
                  <td style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                    ₹{(order.totalAmount || 0).toLocaleString('en-IN')}
                  </td>
                  <td>
                    <span
                      className="badge"
                      style={{ background: sc.bg, color: sc.color }}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td style={{ color: '#64748b', fontSize: 13, whiteSpace: 'nowrap' }}>
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: '#94a3b8', padding: 32 }}>
                  No purchase orders yet. Orders will appear here once created.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default DashboardPage;
