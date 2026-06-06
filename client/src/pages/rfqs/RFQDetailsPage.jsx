import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../utils/constants';
import Button from '../../components/common/Button';
import PageHeader from '../../components/layout/PageHeader';
import { getRFQ, sendRFQ } from '../../services/rfqService';

const RFQDetailsPage = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { user } = useAuth();
	const [rfq, setRfq] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [actionError, setActionError] = useState('');

	useEffect(() => {
		let active = true;

		const loadRFQ = async () => {
			setLoading(true);
			setError('');

			try {
				const data = await getRFQ(id);
				if (active) setRfq(data);
			} catch (err) {
				if (active) setError(err.response?.data?.message || 'Unable to load RFQ');
			} finally {
				if (active) setLoading(false);
			}
		};

		loadRFQ();

		return () => {
			active = false;
		};
	}, [id]);

	const handleSend = async () => {
		setActionError('');

		try {
			const data = await sendRFQ(id);
			setRfq(data);
		} catch (err) {
			setActionError(err.response?.data?.message || 'Unable to send RFQ');
		}
	};

	if (loading) {
		return <div className="empty-state">Loading RFQ details...</div>;
	}

	if (error || !rfq) {
		return <div className="error">{error || 'RFQ not found'}</div>;
	}

	const isProc = user && [ROLES.ADMIN, ROLES.PROCUREMENT_OFFICER].includes(user.role);
	const isVendor = user?.role === ROLES.VENDOR;
	const isAssignedVendor = isVendor && user?.vendorId && (rfq.assignedVendors || []).some(
		(vendor) => String(vendor._id || vendor) === String(user.vendorId)
	);
	const canSubmitQuotation = isAssignedVendor && ['sent', 'quotation_received'].includes(rfq.status);

	return (
		<section>
			<PageHeader
				title={rfq.title}
				subtitle={rfq.description || 'Review items, assigned vendors, quotations, and status history.'}
				actions={
					<div className="actions">
						{isProc && <Link to={`/rfqs/${id}/assign-vendors`}><Button variant="secondary">Assign vendors</Button></Link>}
						{isProc && <Link to={`/rfqs/${id}/compare`}><Button variant="secondary">Compare quotations</Button></Link>}
						{isProc && !['sent', 'quotation_received', 'approval_pending', 'approved', 'po_generated'].includes(rfq.status) && (
							<Button onClick={handleSend}>Send RFQ</Button>
						)}
						{canSubmitQuotation && (
							<Link to={`/vendor/rfqs/${id}/submit-quotation`}><Button>Submit quotation</Button></Link>
						)}
					</div>
				}
			/>

			{actionError && <div className="error">{actionError}</div>}

			{isVendor && !isAssignedVendor && (
				<div className="error" style={{ marginBottom: 16 }}>
					This RFQ is not assigned to your vendor account. Sign in with the portal email for the vendor company that was selected.
				</div>
			)}

			{isVendor && isAssignedVendor && !['sent', 'quotation_received'].includes(rfq.status) && (
				<div className="panel" style={{ marginBottom: 16 }}>
					Waiting for the procurement officer to send this RFQ before you can submit a quotation.
				</div>
			)}

			{isProc && ['quotation_received', 'approval_pending'].includes(rfq.status) && (
				<div className="panel workflow-banner" style={{ marginBottom: 16, borderColor: '#1f6fb2' }}>
					<h2 style={{ marginTop: 0 }}>Quotations received — next step</h2>
					<p style={{ marginBottom: 12 }}>
						As the <strong>Procurement Officer</strong>, compare vendor quotations and send the selected one to a <strong>Manager</strong> for approval. Managers approve or reject — you do not approve yourself.
					</p>
					<div className="actions">
						<Link to={`/rfqs/${id}/compare`}><Button>Compare quotations & request approval</Button></Link>
						{rfq.status === 'approval_pending' && <Link to="/approvals"><Button variant="secondary">View approval status</Button></Link>}
					</div>
				</div>
			)}

			<div className="metric-grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
				<div className="metric"><span>Status</span><strong style={{ fontSize: 22 }}>{rfq.status}</strong></div>
				<div className="metric"><span>Deadline</span><strong style={{ fontSize: 22 }}>{rfq.deadline ? new Date(rfq.deadline).toLocaleDateString() : '-'}</strong></div>
				<div className="metric"><span>Assigned vendors</span><strong style={{ fontSize: 22 }}>{Array.isArray(rfq.assignedVendors) ? rfq.assignedVendors.length : 0}</strong></div>
			</div>

			<div className="panel" style={{ marginBottom: 16 }}>
				<h2>Items</h2>
				{Array.isArray(rfq.items) && rfq.items.length ? (
					<div className="table-placeholder" style={{ padding: 0 }}>
						<table className="data-table">
							<thead>
								<tr>
									<th>Name</th>
									<th>Description</th>
									<th>Quantity</th>
									<th>Unit</th>
								</tr>
							</thead>
							<tbody>
								{rfq.items.map((item, index) => (
									<tr key={`${item.name}-${index}`}>
										<td>{item.name}</td>
										<td>{item.description || '-'}</td>
										<td>{item.quantity}</td>
										<td>{item.unit || 'pcs'}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				) : (
					<p>No items added yet.</p>
				)}
			</div>

			<div className="module-grid">
				<div className="panel">
					<h2>Assigned vendors</h2>
					{Array.isArray(rfq.assignedVendors) && rfq.assignedVendors.length ? (
						rfq.assignedVendors.map((vendor) => (
							<p key={vendor._id}>{vendor.companyName || vendor.name}</p>
						))
					) : (
						<p>No vendors assigned yet.</p>
					)}
				</div>
				<div className="panel">
					<h2>Attachments</h2>
					{Array.isArray(rfq.attachments) && rfq.attachments.length ? (
						rfq.attachments.map((file) => <p key={file.path}>{file.filename}</p>)
					) : (
						<p>No attachments uploaded.</p>
					)}
				</div>
			</div>
		</section>
	);
};

export default RFQDetailsPage;

