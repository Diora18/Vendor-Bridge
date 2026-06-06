import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../utils/constants';
import Button from '../../components/common/Button';
import PageHeader from '../../components/layout/PageHeader';
import { listRFQs } from '../../services/rfqService';

const statusOptions = ['all', 'draft', 'sent', 'quotation_received', 'approval_pending', 'approved', 'rejected', 'po_generated'];

const RFQListPage = () => {
	const { user } = useAuth();
	const location = useLocation();
	const isVendor = user?.role === ROLES.VENDOR;
	const [rfqs, setRfqs] = useState([]);
	const [status, setStatus] = useState('all');
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		let active = true;

		const loadRFQs = async () => {
			setLoading(true);
			setError('');

			try {
				const params = {};
				if (status !== 'all') params.status = status;
				const data = await listRFQs(params);
				if (active) setRfqs(Array.isArray(data) ? data : []);
			} catch (err) {
				if (active) setError(err.response?.data?.message || 'Unable to load RFQs');
			} finally {
				if (active) setLoading(false);
			}
		};

		loadRFQs();

		return () => {
			active = false;
		};
	}, [status]);

	const canCreate = user && [ROLES.ADMIN, ROLES.PROCUREMENT_OFFICER].includes(user.role);
	const canSubmit = (rfq) => isVendor && ['sent', 'quotation_received'].includes(rfq.status);

	return (
		<section>
			<PageHeader
				title={isVendor ? 'Assigned RFQs' : 'RFQs'}
				subtitle={isVendor
					? 'View RFQs assigned to your company and submit quotations.'
					: 'Track draft, active, review, and approved procurement requests.'}
				actions={canCreate ? <Link to="/rfqs/new"><Button>Create RFQ</Button></Link> : null}
			/>

			{isVendor && location.pathname.startsWith('/vendor/rfqs') && (
				<div className="panel" style={{ marginBottom: 16 }}>
					<p style={{ margin: 0 }}>
						Sign in with the <strong>vendor company email</strong> (for example <code>acme@vendorbridge.local</code>) or the demo account <code>vendor@vendorbridge.local</code> linked to Acme Supplies.
					</p>
				</div>
			)}

			<div className="panel" style={{ marginBottom: 16 }}>
				<label className="field" style={{ width: 220, marginBottom: 0 }}>
					<span>Status filter</span>
					<select value={status} onChange={(event) => setStatus(event.target.value)}>
						{statusOptions.map((option) => (
							<option key={option} value={option}>{option === 'all' ? 'All statuses' : option.replace(/_/g, ' ')}</option>
						))}
					</select>
				</label>
			</div>

			{error && <div className="error">{error}</div>}

			<div className="table-placeholder" style={{ padding: 0 }}>
				<table className="data-table">
					<thead>
						<tr>
							<th>Title</th>
							<th>Deadline</th>
							<th>Items</th>
							<th>Status</th>
							{!isVendor && <th>Assigned vendors</th>}
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{loading ? (
							<tr>
								<td colSpan={isVendor ? 5 : 6}>Loading RFQs...</td>
							</tr>
						) : rfqs.length ? (
							rfqs.map((rfq) => (
								<tr key={rfq._id}>
									<td>
										<strong>{rfq.title}</strong>
										<div>{rfq.description || 'No description provided'}</div>
									</td>
									<td>{rfq.deadline ? new Date(rfq.deadline).toLocaleDateString() : 'No deadline'}</td>
									<td>{Array.isArray(rfq.items) ? rfq.items.length : 0}</td>
									<td><span className="badge badge-neutral">{rfq.status}</span></td>
									{!isVendor && <td>{Array.isArray(rfq.assignedVendors) ? rfq.assignedVendors.length : 0}</td>}
									<td>
										<div className="actions">
											<Link to={`/rfqs/${rfq._id}`}><Button variant="secondary">View</Button></Link>
											{canSubmit(rfq) && (
												<Link to={`/vendor/rfqs/${rfq._id}/submit-quotation`}><Button>Submit quotation</Button></Link>
											)}
										</div>
									</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan={isVendor ? 5 : 6}>
									{isVendor
										? 'No RFQs assigned to your vendor account yet. Ask the procurement officer to assign your company and send the RFQ.'
										: 'No RFQs found.'}
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</section>
	);
};

export default RFQListPage;
