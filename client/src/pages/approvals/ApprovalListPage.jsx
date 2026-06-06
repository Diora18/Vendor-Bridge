import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import PageHeader from '../../components/layout/PageHeader';
import { useAuth } from '../../hooks/useAuth';
import { listApprovals } from '../../services/approvalService';
import { formatCurrency } from '../../utils/formatCurrency';
import { ROLES } from '../../utils/constants';

const statusOptions = ['all', 'pending', 'approved', 'rejected'];

const statusClass = (status) => {
  if (status === 'approved') return 'badge-success';
  if (status === 'rejected') return 'badge-danger';
  if (status === 'pending') return 'badge-warning';
  return 'badge-neutral';
};

const ApprovalListPage = () => {
	const { user } = useAuth();
	const [approvals, setApprovals] = useState([]);
	const [status, setStatus] = useState('all');
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	const isManager = user?.role === ROLES.MANAGER;
	const isProcurement = user?.role === ROLES.PROCUREMENT_OFFICER;
	const pendingCount = useMemo(() => approvals.filter((item) => item.status === 'pending').length, [approvals]);

	useEffect(() => {
		let active = true;

		const loadApprovals = async () => {
			setLoading(true);
			setError('');

			try {
				const params = {};
				if (status !== 'all') params.status = status;
				const data = await listApprovals(params);
				if (active) setApprovals(Array.isArray(data) ? data : []);
			} catch (err) {
				if (active) setError(err.response?.data?.message || 'Unable to load approvals');
			} finally {
				if (active) setLoading(false);
			}
		};

		loadApprovals();

		return () => {
			active = false;
		};
	}, [status]);

	return (
		<section>
			<PageHeader
				title="Approvals"
				subtitle={isManager
					? 'You are the approver. Open a pending request and click Approve or Reject.'
					: 'Track approval requests. Only managers can approve or reject.'}
			/>

			<div className="panel workflow-banner" style={{ marginBottom: 16 }}>
				{isManager ? (
					<p style={{ margin: 0 }}>
						<strong>Manager:</strong> When a procurement officer sends a quotation for approval, it appears here. Open it, review the vendor quotation, then click <strong>Approve quotation</strong> or <strong>Reject quotation</strong>.
					</p>
				) : isProcurement ? (
					<p style={{ margin: 0 }}>
						<strong>Procurement Officer:</strong> You do <em>not</em> approve here. After vendors submit quotations, go to <strong>RFQs → Compare quotations</strong> and click <strong>Request approval</strong>. Then the manager approves in this section.
					</p>
				) : (
					<p style={{ margin: 0 }}>View all approval requests across the procurement workflow.</p>
				)}
			</div>

			<div className="metric-grid" style={{ marginBottom: 16 }}>
				<div className="metric"><span>Total requests</span><strong>{approvals.length}</strong></div>
				<div className="metric"><span>Pending</span><strong>{pendingCount}</strong></div>
				<div className="metric"><span>Your role</span><strong style={{ fontSize: 18 }}>{user?.role?.replace(/_/g, ' ')}</strong></div>
			</div>

			<div className="panel" style={{ marginBottom: 16 }}>
				<label className="field" style={{ width: 220, marginBottom: 0 }}>
					<span>Status filter</span>
					<select value={status} onChange={(event) => setStatus(event.target.value)}>
						{statusOptions.map((option) => (
							<option key={option} value={option}>{option === 'all' ? 'All statuses' : option}</option>
						))}
					</select>
				</label>
			</div>

			{error && <div className="error">{error}</div>}

			<div className="table-placeholder" style={{ padding: 0 }}>
				<table className="data-table">
					<thead>
						<tr>
							<th>RFQ</th>
							<th>Vendor</th>
							<th>Amount</th>
							<th>Delivery</th>
							<th>Status</th>
							<th>Requested by</th>
							<th>Approver</th>
							<th>Action</th>
						</tr>
					</thead>
					<tbody>
						{loading ? (
							<tr><td colSpan="8">Loading approvals...</td></tr>
						) : approvals.length ? (
							approvals.map((approval) => (
								<tr key={approval._id}>
									<td>
										<strong>{approval.rfqId?.title || 'RFQ'}</strong>
										<div>{approval.rfqId?.description || 'No description'}</div>
									</td>
									<td>{approval.quotationId?.vendorId?.companyName || approval.quotationId?.vendorId?.name || '-'}</td>
									<td>{formatCurrency(approval.quotationId?.totalAmount)}</td>
									<td>{approval.quotationId?.deliveryTimeline || '-'}</td>
									<td><span className={`badge ${statusClass(approval.status)}`}>{approval.status}</span></td>
									<td>{approval.requestedBy?.name || '-'}</td>
									<td>{approval.approverId?.name || '-'}</td>
									<td>
										<div className="actions">
											<Link to={`/approvals/${approval._id}`}>
												<Button>{isManager && approval.status === 'pending' ? 'Approve / Reject' : 'Review'}</Button>
											</Link>
											<Link to={`/approvals/${approval._id}/print`}><Button variant="secondary">PDF</Button></Link>
										</div>
									</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan="8">
									{isManager
										? 'No approval requests assigned to you yet.'
										: 'No approvals yet. Compare quotations on an RFQ and request approval from a manager.'}
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</section>
	);
};

export default ApprovalListPage;
