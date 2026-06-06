import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from '../../components/common/Button';
import { getApproval } from '../../services/approvalService';
import { formatCurrency } from '../../utils/formatCurrency';

const ApprovalPrintPage = () => {
	const { id } = useParams();
	const [approval, setApproval] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		let active = true;

		const load = async () => {
			try {
				const data = await getApproval(id);
				if (active) setApproval(data);
			} catch (err) {
				if (active) setError(err.response?.data?.message || 'Unable to load approval summary');
			} finally {
				if (active) setLoading(false);
			}
		};

		load();
		return () => { active = false; };
	}, [id]);

	if (loading) return <div className="empty-state">Loading approval summary...</div>;
	if (error || !approval) return <div className="error">{error || 'Approval not found'}</div>;

	const quotation = approval.quotationId;
	const vendor = quotation?.vendorId;
	const rfq = approval.rfqId;

	return (
		<section className="print-page">
			<div className="no-print actions" style={{ marginBottom: 16 }}>
				<Link to={`/approvals/${id}`}><Button variant="secondary">Back to approval</Button></Link>
				<Button onClick={() => window.print()}>Print</Button>
			</div>

			<div className="print-document panel">
				<h1>VendorBridge Approval Summary</h1>
				<p>Approval ID: {approval._id}</p>
				<p>Status: <strong>{approval.status}</strong></p>

				<h2>RFQ</h2>
				<p><strong>{rfq?.title}</strong></p>
				<p>{rfq?.description}</p>
				<p>Deadline: {rfq?.deadline ? new Date(rfq.deadline).toLocaleDateString() : '-'}</p>

				<h2>Selected vendor quotation</h2>
				<p>Vendor: {vendor?.companyName || vendor?.name}</p>
				<p>Email: {vendor?.email}</p>
				<p>Delivery: {quotation?.deliveryTimeline}</p>
				<p>Notes: {quotation?.notes || 'None'}</p>

				<table className="data-table">
					<thead>
						<tr>
							<th>Item</th>
							<th>Qty</th>
							<th>Unit price</th>
							<th>Total</th>
						</tr>
					</thead>
					<tbody>
						{(quotation?.items || []).map((item, index) => (
							<tr key={index}>
								<td>{item.name}</td>
								<td>{item.quantity}</td>
								<td>{formatCurrency(item.unitPrice)}</td>
								<td>{formatCurrency(item.total)}</td>
							</tr>
						))}
					</tbody>
				</table>

				<p><strong>Grand total:</strong> {formatCurrency(quotation?.totalAmount)}</p>

				<h2>Approval workflow</h2>
				<p>Requested by: {approval.requestedBy?.name} ({approval.requestedBy?.email})</p>
				<p>Assigned approver: {approval.approverId?.name} ({approval.approverId?.email})</p>
				<p>Final remarks: {approval.remarks || 'None'}</p>

				<h3>Timeline</h3>
				{(approval.timeline || []).map((entry, index) => (
					<p key={index}>
						{entry.status} {entry.userId?.name ? `by ${entry.userId.name}` : ''}
						{entry.remarks ? ` — ${entry.remarks}` : ''}
					</p>
				))}
			</div>
		</section>
	);
};

export default ApprovalPrintPage;
