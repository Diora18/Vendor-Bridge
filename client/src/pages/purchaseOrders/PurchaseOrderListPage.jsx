import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import PageHeader from '../../components/layout/PageHeader';
import { listPurchaseOrders } from '../../services/purchaseOrderService';
import { formatCurrency } from '../../utils/formatCurrency';

const PurchaseOrderListPage = () => {
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		let active = true;

		const load = async () => {
			setLoading(true);
			setError('');
			try {
				const data = await listPurchaseOrders();
				if (active) setOrders(Array.isArray(data) ? data : []);
			} catch (err) {
				if (active) setError(err.response?.data?.message || 'Unable to load purchase orders');
			} finally {
				if (active) setLoading(false);
			}
		};

		load();
		return () => { active = false; };
	}, []);

	return (
		<section>
			<PageHeader
				title="Purchase Orders"
				subtitle="Purchase orders generated from approved quotations."
				actions={<Link to="/approvals"><Button variant="secondary">View approvals</Button></Link>}
			/>

			{error && <div className="error">{error}</div>}

			<div className="table-placeholder" style={{ padding: 0 }}>
				<table className="data-table">
					<thead>
						<tr>
							<th>PO number</th>
							<th>RFQ</th>
							<th>Vendor</th>
							<th>Total</th>
							<th>Status</th>
							<th>Created</th>
							<th>Action</th>
						</tr>
					</thead>
					<tbody>
						{loading ? (
							<tr><td colSpan="7">Loading purchase orders...</td></tr>
						) : orders.length ? (
							orders.map((po) => (
								<tr key={po._id}>
									<td><strong>{po.poNumber}</strong></td>
									<td>{po.rfqId?.title || '-'}</td>
									<td>{po.vendorId?.companyName || po.vendorId?.name || '-'}</td>
									<td>{formatCurrency(po.totalAmount)}</td>
									<td><span className="badge badge-neutral">{po.status}</span></td>
									<td>{po.createdAt ? new Date(po.createdAt).toLocaleDateString() : '-'}</td>
									<td><Link to={`/purchase-orders/${po._id}`}><Button variant="secondary">Open</Button></Link></td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan="7">No purchase orders yet. Approve a quotation first, then generate a PO from the approval page.</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</section>
	);
};

export default PurchaseOrderListPage;
