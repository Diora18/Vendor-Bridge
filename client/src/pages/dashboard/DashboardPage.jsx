import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import PageHeader from '../../components/layout/PageHeader';
import { getDashboardSummary, getRecentActivity } from '../../services/dashboardService';
import { listNotifications } from '../../services/notificationService';
import { getEntityPath } from '../../utils/entityLinks';
import { useAuth } from '../../hooks/useAuth';

const fallbackSummary = {
  activeRfqs: 0,
  pendingApprovals: 0,
  invoices: 0,
  activeVendors: 0
};

const DashboardPage = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(fallbackSummary);
  const [activity, setActivity] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    getDashboardSummary().then(setSummary).catch(() => setSummary(fallbackSummary));
    getRecentActivity().then(setActivity).catch(() => setActivity([]));
    listNotifications()
      .then((data) => setUnreadCount(data.unreadCount || 0))
      .catch(() => setUnreadCount(0));
  }, []);

  const canViewLogs = user && ['admin', 'procurement_officer', 'manager'].includes(user.role);

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
      <div className="metric-grid">
        <div className="metric"><span>Active RFQs</span><strong>{summary.activeRfqs}</strong></div>
        <div className="metric"><span>Pending approvals</span><strong>{summary.pendingApprovals}</strong></div>
        <div className="metric"><span>Invoices</span><strong>{summary.invoices}</strong></div>
        <div className="metric"><span>Active vendors</span><strong>{summary.activeVendors}</strong></div>
      </div>
      <div className="panel">
        <h2>Recent activity</h2>
        {activity.length ? activity.map((item) => {
          const path = getEntityPath(item.entityType, item.entityId);
          return (
            <div key={item._id} className="activity-row">
              <div>
                <strong>{item.message}</strong>
                <div style={{ color: '#5d6a7d', fontSize: 14 }}>
                  {item.userId?.name || 'System'} · {item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}
                </div>
              </div>
              {path && <Link to={path}><Button variant="secondary">Open</Button></Link>}
            </div>
          );
        }) : <p>No activity yet.</p>}
      </div>
    </section>
  );
};

export default DashboardPage;
