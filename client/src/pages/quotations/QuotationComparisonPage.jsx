import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import PageHeader from '../../components/layout/PageHeader';
import { createApproval } from '../../services/approvalService';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../utils/constants';
import { getRFQ, getRFQComparison } from '../../services/rfqService';
import { listApprovers } from '../../services/userService';

const QuotationComparisonPage = () => {
	const { id } = useParams();
	const [rfq, setRfq] = useState(null);
	const [comparison, setComparison] = useState(null);
	const [users, setUsers] = useState([]);
	const [approverId, setApproverId] = useState('');
	const [selectedQuotationId, setSelectedQuotationId] = useState('');
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [actionError, setActionError] = useState('');
	const [actionMessage, setActionMessage] = useState('');
	const navigate = useNavigate();

	useEffect(() => {
		let active = true;

		const loadComparison = async () => {
			setLoading(true);
			setError('');

			try {
				const [rfqData, comparisonData, approverData] = await Promise.all([
					getRFQ(id),
					getRFQComparison(id),
					listApprovers()
				]);
				if (!active) return;
				setRfq(rfqData);
				setComparison(comparisonData);
				const managers = Array.isArray(approverData) ? approverData : [];
				setUsers(managers);
				setApproverId(managers[0]?._id || '');
				setSelectedQuotationId(comparisonData.recommendedQuotationId || comparisonData.lowestPriceQuotationId || comparisonData.quotations?.[0]?._id || '');
			} catch (err) {
				if (active) setError(err.response?.data?.message || 'Unable to load quotation comparison');
			} finally {
				if (active) setLoading(false);
			}
		};

		loadComparison();

		return () => {
			active = false;
		};
	}, [id]);

	const handleRequestApproval = async () => {
		setActionError('');
		setActionMessage('');

		if (!selectedQuotationId) return setActionError('Select a quotation to send for approval');
		if (!approverId) return setActionError('Select a manager approver');

		try {
			const data = await createApproval({
				rfqId: id,
				quotationId: selectedQuotationId,
				approverId
			});
			setActionMessage(`Approval requested with status ${data.status}`);
			// Navigate to the newly created approval so the approvals page shows it immediately
			navigate(`/approvals/${data._id}`);
		} catch (err) {
			setActionError(err.response?.data?.message || 'Unable to request approval');
		}
	};

	if (loading) {
		return <div className="empty-state">Loading quotation comparison...</div>;
	}

	if (error || !rfq || !comparison) {
		return <div className="error">{error || 'Quotation comparison unavailable'}</div>;
	}

	return (
		<section>
			<PageHeader
				title="Compare Quotations"
				subtitle={`Compare vendor responses for ${rfq.title}.`}
				actions={<Link to={`/rfqs/${id}`}><Button variant="secondary">Back to RFQ</Button></Link>}
			/>

			<div className="panel workflow-banner" style={{ marginBottom: 16 }}>
				<h2 style={{ marginTop: 0 }}>How approval works</h2>
				<ol style={{ margin: 0, paddingLeft: 20, color: '#5d6a7d' }}>
					<li><strong>Procurement Officer</strong> (you) picks the best quotation and sends it to a manager.</li>
					<li><strong>Manager</strong> logs in, opens Approvals, and clicks Approve or Reject.</li>
					<li>After approval, procurement generates the purchase order.</li>
				</ol>
			</div>

			{!comparison.quotations?.length && (
				<div className="error" style={{ marginBottom: 16 }}>
					No quotations submitted yet. Vendors must submit quotations before you can request approval.
				</div>
			)}

			<div className="panel" style={{ marginBottom: 16 }}>
				<strong>Recommended quotation:</strong>{' '}
				{comparison.lowestPriceQuotationId ? 'Lowest price option highlighted below' : 'No recommendation available yet'}
			</div>

			<div className="panel" style={{ marginBottom: 16 }}>
				{(() => {
					const { user } = useAuth();
					const canRequest = user && [ROLES.ADMIN, ROLES.PROCUREMENT_OFFICER].includes(user.role);
					if (!canRequest) return <p>Only the procurement officer can request approval. Managers review requests in the Approvals section.</p>;
					return <h2>Step 1 — Request manager approval</h2>;
				})()}
				<div className="metric-grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
					<label className="field">
						<span>Quotation</span>
						<select value={selectedQuotationId} onChange={(event) => setSelectedQuotationId(event.target.value)}>
							<option value="">Select a quotation</option>
							{comparison.quotations.map((quotation) => (
								<option key={quotation._id} value={quotation._id}>
									{quotation.vendorId?.companyName || quotation.vendorId?.name || quotation._id} - {quotation.totalAmount}
								</option>
							))}
						</select>
					</label>
					<label className="field">
						<span>Approver</span>
						<select value={approverId} onChange={(event) => setApproverId(event.target.value)}>
							<option value="">Select approver</option>
							{users.map((user) => (
								<option key={user._id} value={user._id}>
									{user.name} - {user.role}
								</option>
							))}
						</select>
					</label>
				</div>
				{!users.length && (
					<div className="error" style={{ marginTop: 12 }}>
						No manager accounts found. Use demo login <code>manager@vendorbridge.local</code> or ask admin to create a manager user.
					</div>
				)}
				{(() => {
					const { user } = useAuth();
					const canRequest = user && [ROLES.ADMIN, ROLES.PROCUREMENT_OFFICER].includes(user.role);
					if (!canRequest) return null;
					return (
						<div className="actions">
							<Button type="button" onClick={handleRequestApproval}>Request approval</Button>
						</div>
					);
				})()}
				{actionError && <div className="error" style={{ marginTop: 12 }}>{actionError}</div>}
				{actionMessage && <div className="success" style={{ marginTop: 12 }}>{actionMessage}</div>}
			</div>

			<div className="table-placeholder" style={{ padding: 0 }}>
				<table className="data-table">
					<thead>
						<tr>
							<th>Vendor</th>
							<th>Total amount</th>
							<th>Status</th>
							<th>Submitted at</th>
						</tr>
					</thead>
					<tbody>
						{comparison.quotations.length ? comparison.quotations.map((quotation) => (
							<tr key={quotation._id} className={quotation._id === comparison.lowestPriceQuotationId ? 'row-highlight' : ''}>
								<td>
									{quotation.vendorId?.companyName || quotation.vendorId?.name || 'Unknown vendor'}
									{quotation._id === comparison.lowestPriceQuotationId && <div><span className="badge badge-success">Lowest price</span></div>}
								</td>
								<td>{quotation.totalAmount ?? '-'}</td>
								<td>{quotation.status}</td>
								<td>{quotation.createdAt ? new Date(quotation.createdAt).toLocaleString() : '-'}</td>
							</tr>
						)) : (
							<tr>
								<td colSpan="4">No quotations submitted yet.</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</section>
	);
};

export default QuotationComparisonPage;

