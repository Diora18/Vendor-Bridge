import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import PageHeader from '../../components/layout/PageHeader';
import { useAuth } from '../../hooks/useAuth';
import { createInvoice, listInvoices } from '../../services/invoiceService';
import { listPurchaseOrders } from '../../services/purchaseOrderService';
import { formatCurrency } from '../../utils/formatCurrency';
import { ROLES } from '../../utils/constants';

const statusOptions = ['all', 'generated', 'emailed', 'paid', 'cancelled'];

const statusClass = (status) => {
  if (status === 'emailed') return 'badge-success';
  if (status === 'paid') return 'badge-success';
  if (status === 'cancelled') return 'badge-danger';
  return 'badge-neutral';
};

const InvoiceListPage = () => {
	const navigate = useNavigate();
	const { user } = useAuth();
	const [invoices, setInvoices] = useState([]);
	const [purchaseOrders, setPurchaseOrders] = useState([]);
	const [status, setStatus] = useState('all');
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [actionError, setActionError] = useState('');
	const [generatingPoId, setGeneratingPoId] = useState('');

	const canManage = user && [ROLES.ADMIN, ROLES.PROCUREMENT_OFFICER].includes(user.role);
	const isVendor = user?.role === ROLES.VENDOR;

	const invoicedPoIds = useMemo(
		() => new Set(invoices.map((invoice) => String(invoice.poId?._id || invoice.poId))),
		[invoices]
	);

	const posReadyForInvoice = useMemo(
		() => purchaseOrders.filter((po) => !invoicedPoIds.has(String(po._id))),
		[purchaseOrders, invoicedPoIds]
	);

	const loadData = async () => {
		setLoading(true);
		setError('');
		try {
			const params = {};
			if (status !== 'all') params.status = status;
			const invoiceData = await listInvoices(params);
			setInvoices(Array.isArray(invoiceData) ? invoiceData : []);

			if (canManage) {
				const poData = await listPurchaseOrders();
				setPurchaseOrders(Array.isArray(poData) ? poData : []);
			}
		} catch (err) {
			setError(err.response?.data?.message || 'Unable to load invoices');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadData();
	}, [status, canManage]);

	const handleGenerate = async (poId) => {
		setActionError('');
		setGeneratingPoId(poId);
		try {
			const invoice = await createInvoice({ poId });
			navigate(`/invoices/${invoice._id}`);
		} catch (err) {
			setActionError(err.response?.data?.message || 'Unable to generate invoice');
		} finally {
			setGeneratingPoId('');
		}
	};

	return (
		<section>
			<PageHeader
				title="Invoices"
				subtitle={isVendor
					? 'Invoices issued for your purchase orders.'
					: 'Generate invoices from purchase orders, then download, print, or email them.'}
			/>

			<div className="panel workflow-banner" style={{ marginBottom: 16 }}>
				<p style={{ margin: 0 }}>
					<strong>Workflow:</strong> Approved quotation → Purchase order → <strong>Invoice</strong> → Print or email to vendor.
				</p>
			</div>

			{canManage && posReadyForInvoice.length > 0 && (
				<div className="panel" style={{ marginBottom: 16 }}>
					<h2 style={{ marginTop: 0 }}>Purchase orders ready for invoicing</h2>
					<div className="table-placeholder" style={{ padding: 0 }}>
						<table className="data-table">
							<thead>
								<tr>
									<th>PO number</th>
									<th>Vendor</th>
									<th>Total</th>
									<th>Status</th>
									<th>Action</th>
								</tr>
							</thead>
							<tbody>
								{posReadyForInvoice.map((po) => (
									<tr key={po._id}>
										<td><strong>{po.poNumber}</strong></td>
										<td>{po.vendorId?.companyName || '-'}</td>
										<td>{formatCurrency(po.totalAmount)}</td>
										<td><span className="badge badge-neutral">{po.status}</span></td>
										<td>
											<Button
												disabled={generatingPoId === po._id}
												onClick={() => handleGenerate(po._id)}
											>
												{generatingPoId === po._id ? 'Generating...' : 'Generate invoice'}
											</Button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}

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
			{actionError && <div className="error">{actionError}</div>}

			<div className="table-placeholder" style={{ padding: 0 }}>
				<table className="data-table">
					<thead>
						<tr>
							<th>Invoice #</th>
							<th>PO</th>
							<th>Vendor</th>
							<th>Total</th>
							<th>Status</th>
							<th>Created</th>
							<th>Action</th>
						</tr>
					</thead>
					<tbody>
						{loading ? (
							<tr><td colSpan="7">Loading invoices...</td></tr>
						) : invoices.length ? (
							invoices.map((invoice) => (
								<tr key={invoice._id}>
									<td><strong>{invoice.invoiceNumber}</strong></td>
									<td>{invoice.poId?.poNumber || '-'}</td>
									<td>{invoice.vendorId?.companyName || invoice.vendorId?.name || '-'}</td>
									<td>{formatCurrency(invoice.totalAmount)}</td>
									<td><span className={`badge ${statusClass(invoice.status)}`}>{invoice.status}</span></td>
									<td>{invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : '-'}</td>
									<td>
										<div className="actions">
											<Link to={`/invoices/${invoice._id}`}><Button variant="secondary">Open</Button></Link>
											<Link to={`/invoices/${invoice._id}/print`}><Button>Print</Button></Link>
										</div>
									</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan="7">
									{canManage
										? 'No invoices yet. Generate one from a purchase order above.'
										: 'No invoices found for your vendor account.'}
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</section>
	);
};

export default InvoiceListPage;
