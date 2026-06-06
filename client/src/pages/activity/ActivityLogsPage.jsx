import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import PageHeader from '../../components/layout/PageHeader';
import { listActivityLogs } from '../../services/activityLogService';
import { getEntityPath } from '../../utils/entityLinks';
const entityOptions = ['all', 'RFQ', 'Quotation', 'Approval', 'PurchaseOrder', 'Invoice', 'Vendor'];
const actionOptions = ['all', 'rfq.created', 'rfq.sent', 'quotation.submitted', 'approval.requested', 'approval.approved', 'approval.rejected', 'po.generated', 'invoice.generated'];

const formatAction = (action) => action?.replace(/\./g, ' ').replace(/_/g, ' ') || '-';

const ActivityLogsPage = () => {
	const [logs, setLogs] = useState([]);
	const [entityType, setEntityType] = useState('all');
	const [action, setAction] = useState('all');
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		let active = true;

		const loadLogs = async () => {
			setLoading(true);
			setError('');
			try {
				const params = { limit: 100 };
				if (entityType !== 'all') params.entityType = entityType;
				if (action !== 'all') params.action = action;
				const data = await listActivityLogs(params);
				if (active) setLogs(Array.isArray(data) ? data : []);
			} catch (err) {
				if (active) setError(err.response?.data?.message || 'Unable to load activity logs');
			} finally {
				if (active) setLoading(false);
			}
		};

		loadLogs();
		return () => { active = false; };
	}, [entityType, action]);

	return (
		<section>
			<PageHeader
				title="Activity Logs"
				subtitle="Audit trail of procurement actions across RFQs, quotations, approvals, POs, and invoices."
				actions={<Link to="/notifications"><Button variant="secondary">View notifications</Button></Link>}
			/>

			<div className="panel" style={{ marginBottom: 16 }}>
				<div className="actions" style={{ flexWrap: 'wrap' }}>
					<label className="field" style={{ width: 200, marginBottom: 0 }}>
						<span>Entity type</span>
						<select value={entityType} onChange={(event) => setEntityType(event.target.value)}>
							{entityOptions.map((option) => (
								<option key={option} value={option}>{option === 'all' ? 'All entities' : option}</option>
							))}
						</select>
					</label>
					<label className="field" style={{ width: 240, marginBottom: 0 }}>
						<span>Action</span>
						<select value={action} onChange={(event) => setAction(event.target.value)}>
							{actionOptions.map((option) => (
								<option key={option} value={option}>{option === 'all' ? 'All actions' : formatAction(option)}</option>
							))}
						</select>
					</label>
				</div>
			</div>

			{error && <div className="error">{error}</div>}

			<div className="table-placeholder" style={{ padding: 0 }}>
				<table className="data-table">
					<thead>
						<tr>
							<th>When</th>
							<th>User</th>
							<th>Action</th>
							<th>Entity</th>
							<th>Message</th>
							<th>Link</th>
						</tr>
					</thead>
					<tbody>
						{loading ? (
							<tr><td colSpan="6">Loading activity logs...</td></tr>
						) : logs.length ? (
							logs.map((log) => {
								const path = getEntityPath(log.entityType, log.entityId);
								return (
									<tr key={log._id}>
										<td>{log.createdAt ? new Date(log.createdAt).toLocaleString() : '-'}</td>
										<td>
											<strong>{log.userId?.name || 'System'}</strong>
											<div>{log.userId?.role?.replace(/_/g, ' ') || '-'}</div>
										</td>
										<td><span className="badge badge-neutral">{formatAction(log.action)}</span></td>
										<td>{log.entityType || '-'}</td>
										<td>{log.message}</td>
										<td>{path ? <Link to={path}><Button variant="secondary">Open</Button></Link> : '-'}</td>
									</tr>
								);
							})
						) : (
							<tr><td colSpan="6">No activity logs found. Actions will appear here as you use the procurement workflow.</td></tr>
						)}
					</tbody>
				</table>
			</div>
		</section>
	);
};

export default ActivityLogsPage;
