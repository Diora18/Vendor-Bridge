import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/common/Button';
import PageHeader from '../../components/layout/PageHeader';
import { getPurchaseOrder, sendPurchaseOrder } from '../../services/purchaseOrderService';
import { createInvoice, listInvoices } from '../../services/invoiceService';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency } from '../../utils/formatCurrency';
import { ROLES } from '../../utils/constants';

const PurchaseOrderDetailsPage = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { user } = useAuth();
	const [po, setPo] = useState(null);
	const [linkedInvoice, setLinkedInvoice] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [actionError, setActionError] = useState('');
	const [actionMessage, setActionMessage] = useState('');
	const [submitting, setSubmitting] = useState(false);

	const canManage = user && [ROLES.ADMIN, ROLES.PROCUREMENT_OFFICER].includes(user.role);

	useEffect(() => {
		let active = true;

		const load = async () => {
			setLoading(true);
			setError('');
			try {
				const [poData, invoiceData] = await Promise.all([
					getPurchaseOrder(id),
					listInvoices({ poId: id }).catch(() => [])
				]);
				if (!active) return;
				setPo(poData);
				const invoices = Array.isArray(invoiceData) ? invoiceData : [];
				setLinkedInvoice(invoices[0] || null);
			} catch (err) {
				if (active) setError(err.response?.data?.message || 'Unable to load purchase order');
			} finally {
				if (active) setLoading(false);
			}
		};

		load();
		return () => { active = false; };
	}, [id]);

	const handleSend = async () => {
		setActionError('');
		setActionMessage('');
		try {
			const data = await sendPurchaseOrder(id);
			setPo(data);
			setActionMessage('Purchase order marked as sent.');
		} catch (err) {
			setActionError(err.response?.data?.message || 'Unable to send purchase order');
		}
	};

	const handleGenerateInvoice = async () => {
		setActionError('');
		setActionMessage('');
		setSubmitting(true);
		try {
			const invoice = await createInvoice({ poId: id });
			setActionMessage(`Invoice ${invoice.invoiceNumber} generated.`);
			setTimeout(() => navigate(`/invoices/${invoice._id}`), 600);
		} catch (err) {
			setActionError(err.response?.data?.message || 'Unable to generate invoice');
		} finally {
			setSubmitting(false);
		}
	};

	if (loading) return <div className="empty-state">Loading purchase order...</div>;
	if (error || !po) return <div className="error">{error || 'Purchase order not found'}</div>;

	return (
		<section>
			<PageHeader
				title={`Purchase Order ${po.poNumber}`}
				subtitle="Official procurement document generated from an approved quotation."
				actions={
					<div className="actions">
						<Link to="/purchase-orders"><Button variant="secondary">Back to PO list</Button></Link>
						{canManage && po.status === 'generated' && <Button onClick={handleSend}>Send PO</Button>}
					</div>
				}
			/>

			{actionError && <div className="error">{actionError}</div>}
			{actionMessage && <div className="success">{actionMessage}</div>}

			<div className="metric-grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', marginBottom: 16 }}>
				<div className="metric"><span>Status</span><strong>{po.status}</strong></div>
				<div className="metric"><span>Vendor</span><strong style={{ fontSize: 18 }}>{po.vendorId?.companyName || '-'}</strong></div>
				<div className="metric"><span>RFQ</span><strong style={{ fontSize: 18 }}>{po.rfqId?.title || '-'}</strong></div>
				<div className="metric"><span>Total</span><strong style={{ fontSize: 18 }}>{formatCurrency(po.totalAmount)}</strong></div>
			</div>

			<div className="panel" style={{ marginBottom: 16 }}>
				<h2>Line items</h2>
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
						{(po.items || []).map((item, index) => (
							<tr key={index}>
								<td>{item.name}</td>
								<td>{item.quantity}</td>
								<td>{formatCurrency(item.unitPrice)}</td>
								<td>{formatCurrency(item.total)}</td>
							</tr>
						))}
					</tbody>
				</table>
				<p style={{ marginTop: 16 }}><strong>Subtotal:</strong> {formatCurrency(po.subtotal)}</p>
				<p><strong>Tax:</strong> {formatCurrency(po.taxAmount)}</p>
				<p><strong>Grand total:</strong> {formatCurrency(po.totalAmount)}</p>
			</div>

			<div className="panel workflow-banner">
				<h2 style={{ marginTop: 0 }}>Next step — Invoice</h2>
				{linkedInvoice ? (
					<>
						<p>Invoice <strong>{linkedInvoice.invoiceNumber}</strong> already exists for this purchase order.</p>
						<div className="actions" style={{ marginTop: 12 }}>
							<Link to={`/invoices/${linkedInvoice._id}`}><Button>View invoice</Button></Link>
							<Link to={`/invoices/${linkedInvoice._id}/print`}><Button variant="secondary">Print invoice</Button></Link>
						</div>
					</>
				) : canManage ? (
					<>
						<p>Generate an invoice from this purchase order. You can then download the PDF, print it, or email it to the vendor.</p>
						<div className="actions" style={{ marginTop: 12 }}>
							<Button disabled={submitting} onClick={handleGenerateInvoice}>
								{submitting ? 'Generating...' : 'Generate invoice'}
							</Button>
							<Link to="/invoices"><Button variant="secondary">Go to invoices</Button></Link>
						</div>
					</>
				) : (
					<p>Waiting for procurement to generate the invoice for this purchase order.</p>
				)}
			</div>
		</section>
	);
};

export default PurchaseOrderDetailsPage;
