import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import PageHeader from '../../components/layout/PageHeader';
import { listNotifications, markAllNotificationsRead, markNotificationRead } from '../../services/notificationService';
import { getEntityPath } from '../../utils/entityLinks';
import { useAuth } from '../../hooks/useAuth';

const typeClass = (type) => {
  if (type === 'approval') return 'badge-warning';
  if (type === 'invoice' || type === 'purchase_order') return 'badge-success';
  if (type === 'rfq' || type === 'quotation') return 'badge-neutral';
  return 'badge-neutral';
};

const NotificationsPage = () => {
	const { user } = useAuth();
	const navigate = useNavigate();
	const [notifications, setNotifications] = useState([]);
	const [unreadCount, setUnreadCount] = useState(0);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	const loadNotifications = async () => {
		setLoading(true);
		setError('');
		try {
			const data = await listNotifications();
			setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
			setUnreadCount(data.unreadCount || 0);
		} catch (err) {
			setError(err.response?.data?.message || 'Unable to load notifications');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadNotifications();
	}, []);

	const handleMarkAllRead = async () => {
		try {
			await markAllNotificationsRead();
			await loadNotifications();
		} catch (err) {
			setError(err.response?.data?.message || 'Unable to mark notifications as read');
		}
	};

	const handleOpen = async (notification) => {
		try {
			if (!notification.isRead) {
				await markNotificationRead(notification._id);
			}
			const path = getEntityPath(notification.entityType, notification.entityId);
			if (path) navigate(path);
			else await loadNotifications();
		} catch (err) {
			setError(err.response?.data?.message || 'Unable to open notification');
		}
	};

	return (
		<section>
			<PageHeader
				title="Notifications"
				subtitle="RFQ alerts, approval updates, purchase orders, and invoice notifications."
				actions={
					unreadCount > 0 ? <Button variant="secondary" onClick={handleMarkAllRead}>Mark all read</Button> : null
				}
			/>

			<div className="metric-grid" style={{ marginBottom: 16 }}>
				<div className="metric"><span>Total</span><strong>{notifications.length}</strong></div>
				<div className="metric"><span>Unread</span><strong>{unreadCount}</strong></div>
			</div>

			{error && <div className="error">{error}</div>}

			<div className="notification-list">
				{loading ? (
					<div className="empty-state">Loading notifications...</div>
				) : notifications.length ? (
					notifications.map((notification) => (
						<div
							key={notification._id}
							className={`panel notification-item ${notification.isRead ? 'notification-read' : 'notification-unread'}`}
						>
							<div className="actions" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
								<div>
									<div className="actions" style={{ marginBottom: 8 }}>
										<span className={`badge ${typeClass(notification.type)}`}>{notification.type || 'info'}</span>
										{!notification.isRead && <span className="badge badge-warning">Unread</span>}
									</div>
									<strong>{notification.title}</strong>
									<p style={{ margin: '8px 0', color: '#5d6a7d' }}>{notification.message}</p>
									<small>{notification.createdAt ? new Date(notification.createdAt).toLocaleString() : ''}</small>
								</div>
								<Button variant="secondary" onClick={() => handleOpen(notification)}>Open</Button>
							</div>
						</div>
					))
				) : (
					<div className="panel">
						<p>No notifications yet. They appear when RFQs are sent, quotations are submitted, approvals are requested, or POs/invoices are generated.</p>
					</div>
				)}
			</div>

			{user && ['admin', 'procurement_officer', 'manager'].includes(user.role) && (
				<div className="panel" style={{ marginTop: 16 }}>
					<p style={{ margin: 0 }}>Need the full audit trail? <Link to="/activity-logs">View activity logs</Link></p>
				</div>
			)}
		</section>
	);
};

export default NotificationsPage;
