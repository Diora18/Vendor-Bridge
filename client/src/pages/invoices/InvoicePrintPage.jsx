import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from '../../components/common/Button';
import { getInvoice } from '../../services/invoiceService';
import { formatCurrency } from '../../utils/formatCurrency';

const InvoicePrintPage = () => {
	const { id } = useParams();
	const [invoice, setInvoice] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		let active = true;

		const load = async () => {
			try {
				const data = await getInvoice(id);
				if (active) setInvoice(data);
			} catch (err) {
				if (active) setError(err.response?.data?.message || 'Unable to load invoice');
			} finally {
				if (active) setLoading(false);
			}
		};

		load();
		return () => { active = false; };
	}, [id]);

	if (loading) return <div className="empty-state">Loading invoice...</div>;
	if (error || !invoice) return <div className="error">{error || 'Invoice not found'}</div>;

	const po = invoice.poId;
	const vendor = invoice.vendorId;

	return (
		<section className="print-page">
			<div className="no-print actions" style={{ marginBottom: 16 }}>
				<Link to={`/invoices/${id}`}><Button variant="secondary">Back to invoice</Button></Link>
				<Button onClick={() => window.print()}>Print</Button>
			</div>

			<div className="print-document panel">
				<h1>VendorBridge Invoice</h1>
				<p><strong>Invoice number:</strong> {invoice.invoiceNumber}</p>
				<p><strong>Date:</strong> {invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : '-'}</p>
				<p><strong>Status:</strong> {invoice.status}</p>

				<h2>Bill to</h2>
				<p><strong>{vendor?.companyName || vendor?.name}</strong></p>
				<p>{vendor?.email}</p>
				<p>{vendor?.phone}</p>
				<p>{vendor?.address}</p>

				<h2>Purchase order reference</h2>
				<p><strong>PO number:</strong> {po?.poNumber || '-'}</p>
				<p><strong>RFQ:</strong> {po?.rfqId?.title || '-'}</p>

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
						{(invoice.items || []).map((item, index) => (
							<tr key={index}>
								<td>{item.name}</td>
								<td>{item.quantity}</td>
								<td>{formatCurrency(item.unitPrice)}</td>
								<td>{formatCurrency(item.total)}</td>
							</tr>
						))}
					</tbody>
				</table>

				<p><strong>Subtotal:</strong> {formatCurrency(invoice.subtotal)}</p>
				<p><strong>Tax:</strong> {formatCurrency(invoice.taxAmount)}</p>
				<p><strong>Grand total:</strong> {formatCurrency(invoice.totalAmount)}</p>

				{invoice.emailSentAt && (
					<p style={{ marginTop: 24, color: '#5d6a7d' }}>
						Emailed to vendor on {new Date(invoice.emailSentAt).toLocaleString()}
					</p>
				)}
			</div>
		</section>
	);
};

export default InvoicePrintPage;
