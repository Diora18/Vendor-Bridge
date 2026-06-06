import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import PageHeader from '../../components/layout/PageHeader';
import { approveRequest, getApproval, getApprovalPdfUrl, rejectRequest } from '../../services/approvalService';
import { createPurchaseOrder } from '../../services/purchaseOrderService';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency } from '../../utils/formatCurrency';
import { ROLES } from '../../utils/constants';

const statusClass = (status) => {
	if (status === 'approved') return 'badge-success';
	if (status === 'rejected') return 'badge-danger';
	if (status === 'pending') return 'badge-warning';
	return 'badge-neutral';
};

const ApprovalDetailsPage = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { user } = useAuth();
	const [approval, setApproval] = useState(null);
	const [remarks, setRemarks] = useState('');
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [actionError, setActionError] = useState('');
	const [actionMessage, setActionMessage] = useState('');
	const [submitting, setSubmitting] = useState(false);

	const loadApproval = async () => {
		setLoading(true);
		setError('');
		try {
			const data = await getApproval(id);
			setApproval(data);
			setRemarks(data.remarks || '');
		} catch (err) {
			setError(err.response?.data?.message || 'Unable to load approval');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadApproval();
	}, [id]);

	const quotation = approval?.quotationId;
	const vendor = quotation?.vendorId;
	const rfq = approval?.rfqId;
	const isPending = approval?.status === 'pending';
	const isApproved = approval?.status === 'approved';
	const isAssignedApprover = user && approval && String(approval.approverId?._id || approval.approverId) === String(user.id || user._id);
	const canDecide = isPending && user && ([ROLES.ADMIN].includes(user.role) || (user.role === ROLES.MANAGER && isAssignedApprover));
	const canGeneratePo = isApproved && user && [ROLES.ADMIN, ROLES.PROCUREMENT_OFFICER].includes(user.role);

	const handleAction = async (action) => {
		setActionError('');
		setActionMessage('');
		setSubmitting(true);

		try {
			const handler = action === 'approve' ? approveRequest : rejectRequest;
			const data = await handler(id, { remarks });
			setApproval(data);
			setActionMessage(action === 'approve' ? 'Quotation approved successfully.' : 'Quotation rejected.');
		} catch (err) {
			setActionError(err.response?.data?.message || `Unable to ${action} approval`);
		} finally {
			setSubmitting(false);
		}
	};

	const handleDownloadPdf = async () => {
		try {
			const url = await getApprovalPdfUrl(id);
			window.open(url, '_blank', 'noopener,noreferrer');
		} catch (err) {
			setActionError(err.response?.data?.message || 'Unable to generate approval PDF');
		}
	};

	const handleGeneratePo = async () => {
		setActionError('');
		setActionMessage('');
		setSubmitting(true);

		try {
			const po = await createPurchaseOrder({ approvalId: id });
			setActionMessage(`Purchase order ${po.poNumber} generated.`);
			setTimeout(() => navigate(`/purchase-orders/${po._id}`), 800);
		} catch (err) {
			setActionError(err.response?.data?.message || 'Unable to generate purchase order');
		} finally {
			setSubmitting(false);
		}
	};

	if (loading) return <div className="empty-state">Loading approval...</div>;
	if (error || !approval) return <div className="error">{error || 'Approval not found'}</div>;

	return (
		<section>
			<PageHeader
				title="Approval Review"
				subtitle={`Review submitted quotation for ${rfq?.title || 'RFQ'} before manager decision.`}
				actions={
					<div className="actions">
						<Link to="/approvals"><Button variant="secondary">Back to approvals</Button></Link>
						<Link to={`/approvals/${id}/print`}><Button variant="secondary">Print summary</Button></Link>
						<Button onClick={handleDownloadPdf}>Download PDF</Button>
					</div>
				}
			/>

			{actionError && <div className="error">{actionError}</div>}
			{actionMessage && <div className="success">{actionMessage}</div>}

			<div className="metric-grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', marginBottom: 16 }}>
				<div className="metric"><span>Status</span><strong><span className={`badge ${statusClass(approval.status)}`}>{approval.status}</span></strong></div>
				<div className="metric"><span>Requested by</span><strong style={{ fontSize: 18 }}>{approval.requestedBy?.name || '-'}</strong></div>
				<div className="metric"><span>Assigned approver</span><strong style={{ fontSize: 18 }}>{approval.approverId?.name || '-'}</strong></div>
				<div className="metric"><span>Total amount</span><strong style={{ fontSize: 18 }}>{formatCurrency(quotation?.totalAmount)}</strong></div>
			</div>

			<div className="module-grid">
				<div className="panel">
					<h2>RFQ details</h2>
					<p><strong>Title:</strong> {rfq?.title || '-'}</p>
					<p><strong>Description:</strong> {rfq?.description || '-'}</p>
					<p><strong>Deadline:</strong> {rfq?.deadline ? new Date(rfq.deadline).toLocaleDateString() : '-'}</p>
					<p><strong>RFQ status:</strong> {rfq?.status || '-'}</p>
				</div>

				<div className="panel">
					<h2>Vendor quotation</h2>
					<p><strong>Vendor:</strong> {vendor?.companyName || vendor?.name || '-'}</p>
					<p><strong>Contact:</strong> {vendor?.email || '-'}</p>
					<p><strong>Delivery timeline:</strong> {quotation?.deliveryTimeline || '-'}</p>
					<p><strong>Notes:</strong> {quotation?.notes || 'None'}</p>
					<p><strong>Quotation status:</strong> {quotation?.status || '-'}</p>
				</div>
			</div>

			<div className="panel" style={{ marginBottom: 16 }}>
				<h2>Quotation line items</h2>
				<div className="table-placeholder" style={{ padding: 0 }}>
					<table className="data-table">
						<thead>
							<tr>
								<th>Item</th>
								<th>Quantity</th>
								<th>Unit price</th>
								<th>Total</th>
							</tr>
						</thead>
						<tbody>
							{Array.isArray(quotation?.items) && quotation.items.length ? quotation.items.map((item, index) => (
								<tr key={`${item.name}-${index}`}>
									<td>{item.name}</td>
									<td>{item.quantity}</td>
									<td>{formatCurrency(item.unitPrice)}</td>
									<td>{formatCurrency(item.total)}</td>
								</tr>
							)) : (
								<tr><td colSpan="4">No line items available.</td></tr>
							)}
						</tbody>
					</table>
				</div>
				<div style={{ marginTop: 16 }}>
					<p><strong>Subtotal:</strong> {formatCurrency(quotation?.subtotal)}</p>
					<p><strong>Tax:</strong> {formatCurrency(quotation?.taxAmount)}</p>
					<p><strong>Grand total:</strong> {formatCurrency(quotation?.totalAmount)}</p>
				</div>
			</div>

			<div className="module-grid">
				<div className="panel">
					<h2>Manager decision</h2>
					{isPending ? (
						<>
							<p>Only <strong>{approval.approverId?.name || 'the assigned approver'}</strong> can approve or reject this quotation.</p>
							<Input label="Approval remarks" value={remarks} onChange={(event) => setRemarks(event.target.value)} />
							{canDecide ? (
								<div className="actions" style={{ marginTop: 12 }}>
									<Button disabled={submitting} onClick={() => handleAction('approve')}>Approve quotation</Button>
									<Button variant="secondary" disabled={submitting} onClick={() => handleAction('reject')}>Reject quotation</Button>
								</div>
							) : (
								<p style={{ marginTop: 12 }}>
									{user?.role === ROLES.MANAGER
										? 'This approval is assigned to another manager.'
										: 'Waiting for the assigned manager to approve or reject.'}
								</p>
							)}
						</>
					) : (
						<p>Decision recorded: <strong>{approval.status}</strong>{approval.remarks ? ` — ${approval.remarks}` : ''}</p>
					)}
				</div>

				<div className="panel">
					<h2>After approval</h2>
					{isApproved ? (
						<>
							<p>The quotation is approved. The procurement officer can now generate a purchase order.</p>
							{canGeneratePo && (
								<div className="actions" style={{ marginTop: 12 }}>
									<Button disabled={submitting} onClick={handleGeneratePo}>Generate purchase order</Button>
									<Link to="/purchase-orders"><Button variant="secondary">View all POs</Button></Link>
								</div>
							)}
						</>
					) : approval.status === 'rejected' ? (
						<p>This quotation was rejected. The procurement officer can compare other quotations and submit a new approval request.</p>
					) : (
						<p>Once approved, the next step is purchase order generation, then invoice creation.</p>
					)}
				</div>
			</div>

			<div className="panel">
				<h2>Approval timeline</h2>
				{Array.isArray(approval.timeline) && approval.timeline.length ? approval.timeline.map((entry, index) => (
					<div key={`${entry.status}-${index}`} style={{ marginBottom: 10 }}>
						<strong className={`badge ${statusClass(entry.status)}`}>{entry.status}</strong>
						{' '}
						{entry.userId?.name ? `by ${entry.userId.name}` : ''}
						{entry.at ? ` on ${new Date(entry.at).toLocaleString()}` : ''}
						{entry.remarks ? ` — ${entry.remarks}` : ''}
					</div>
				)) : <p>No timeline available.</p>}
			</div>
		</section>
	);
};

export default ApprovalDetailsPage;
