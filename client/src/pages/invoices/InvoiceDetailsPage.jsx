import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import PageHeader from '../../components/layout/PageHeader';
import { emailInvoice, getInvoice, getInvoicePdfUrl } from '../../services/invoiceService';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency } from '../../utils/formatCurrency';
import { ROLES } from '../../utils/constants';

const statusClass = (status) => {
  if (status === 'emailed' || status === 'paid') return 'badge-success';
  if (status === 'cancelled') return 'badge-danger';
  return 'badge-neutral';
};

const InvoiceDetailsPage = () => {
	const { id } = useParams();
	const { user } = useAuth();
	const [invoice, setInvoice] = useState(null);
	const [emailTo, setEmailTo] = useState('');
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
				const data = await getInvoice(id);
				if (!active) return;
				setInvoice(data);
				setEmailTo(data.vendorId?.email || '');
			} catch (err) {
				if (active) setError(err.response?.data?.message || 'Unable to load invoice');
			} finally {
				if (active) setLoading(false);
			}
		};

		load();
		return () => { active = false; };
	}, [id]);

	const handleDownloadPdf = async () => {
		try {
			const url = await getInvoicePdfUrl(id);
			window.open(url, '_blank', 'noopener,noreferrer');
		} catch (err) {
			setActionError(err.response?.data?.message || 'Unable to download PDF');
		}
	};

	const handleEmail = async () => {
		setActionError('');
		setActionMessage('');
		setSubmitting(true);
		try {
			const result = await emailInvoice(id, { to: emailTo });
			setInvoice(result.invoice);
			setActionMessage(result.message || `Invoice emailed to ${emailTo}`);
		} catch (err) {
			setActionError(err.response?.data?.message || 'Unable to email invoice');
		} finally {
			setSubmitting(false);
		}
	};

	if (loading) return <div className="empty-state">Loading invoice...</div>;
	if (error || !invoice) return <div className="error">{error || 'Invoice not found'}</div>;

	const po = invoice.poId;
	const vendor = invoice.vendorId;

	return (
		<section>
			<PageHeader
				title={`Invoice ${invoice.invoiceNumber}`}
				subtitle="Review invoice totals, download PDF, print, or email to the vendor."
				actions={
					<div className="actions">
						<Link to="/invoices"><Button variant="secondary">Back to invoices</Button></Link>
						<Link to={`/invoices/${id}/print`}><Button variant="secondary">Print</Button></Link>
						<Button onClick={handleDownloadPdf}>Download PDF</Button>
					</div>
				}
			/>

			{actionError && <div className="error">{actionError}</div>}
			{actionMessage && <div className="success">{actionMessage}</div>}

			<div className="metric-grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', marginBottom: 16 }}>
				<div className="metric"><span>Status</span><strong><span className={`badge ${statusClass(invoice.status)}`}>{invoice.status}</span></strong></div>
				<div className="metric"><span>Purchase order</span><strong style={{ fontSize: 18 }}>{po?.poNumber || '-'}</strong></div>
				<div className="metric"><span>Vendor</span><strong style={{ fontSize: 18 }}>{vendor?.companyName || '-'}</strong></div>
				<div className="metric"><span>Total</span><strong style={{ fontSize: 18 }}>{formatCurrency(invoice.totalAmount)}</strong></div>
			</div>

			<div className="module-grid">
				<div className="panel">
					<h2>Vendor details</h2>
					<p><strong>Company:</strong> {vendor?.companyName || vendor?.name || '-'}</p>
					<p><strong>Email:</strong> {vendor?.email || '-'}</p>
					<p><strong>Phone:</strong> {vendor?.phone || '-'}</p>
					<p><strong>RFQ:</strong> {po?.rfqId?.title || '-'}</p>
				</div>

				<div className="panel">
					<h2>Invoice metadata</h2>
					<p><strong>Created:</strong> {invoice.createdAt ? new Date(invoice.createdAt).toLocaleString() : '-'}</p>
					<p><strong>Created by:</strong> {invoice.createdBy?.name || '-'}</p>
					<p><strong>Email sent:</strong> {invoice.emailSentAt ? new Date(invoice.emailSentAt).toLocaleString() : 'Not yet'}</p>
				</div>
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
				<p style={{ marginTop: 16 }}><strong>Subtotal:</strong> {formatCurrency(invoice.subtotal)}</p>
				<p><strong>Tax:</strong> {formatCurrency(invoice.taxAmount)}</p>
				<p><strong>Grand total:</strong> {formatCurrency(invoice.totalAmount)}</p>
			</div>

			{canManage && (
				<div className="panel">
					<h2>Email invoice to vendor</h2>
					<p>Send the invoice PDF to the vendor contact email. Configure <code>EMAIL_USER</code> and <code>EMAIL_PASS</code> in <code>server/.env</code> (Gmail App Password recommended).</p>
					<Input label="Recipient email" type="email" value={emailTo} onChange={(event) => setEmailTo(event.target.value)} />
					<div className="actions" style={{ marginTop: 12 }}>
						<Button disabled={submitting || !emailTo} onClick={handleEmail}>
							{submitting ? 'Sending...' : 'Send invoice email'}
						</Button>
					</div>
				</div>
			)}
		</section>
	);
};

export default InvoiceDetailsPage;
