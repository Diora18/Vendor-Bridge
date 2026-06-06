import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { getRFQ } from '../../services/rfqService';
import { submitQuotation } from '../../services/quotationService';

const QuotationSubmissionPage = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [rfq, setRfq] = useState(null);
	const [totalAmount, setTotalAmount] = useState('');
	const [deliveryTimeline, setDeliveryTimeline] = useState('');
	const [notes, setNotes] = useState('');
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');

	useEffect(() => {
		let active = true;
		const load = async () => {
			setLoading(true);
			try {
				const data = await getRFQ(id);
				if (!active) return;
				setRfq(data);
			} catch (err) {
				if (!active) return;
				setError(err.response?.data?.message || 'Unable to load RFQ');
			} finally {
				if (active) setLoading(false);
			}
		};
		load();
		return () => { active = false; };
	}, [id]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setSuccess('');
		if (!totalAmount || !deliveryTimeline) return setError('Total amount and delivery timeline are required');

		try {
			// Build items with unitPrice and total from RFQ items and entered totalAmount
			const baseItems = Array.isArray(rfq.items) ? rfq.items : [];
			const totalQuantity = baseItems.reduce((s, it) => s + Number(it.quantity || 0), 0) || 1;
			const unitPrice = Number(totalAmount) / totalQuantity;
			const items = baseItems.map((it) => ({
				name: it.name,
				quantity: it.quantity,
				unitPrice: Number(unitPrice.toFixed(2)),
				total: Number((unitPrice * Number(it.quantity || 0)).toFixed(2))
			}));

			const payload = {
				items,
				subtotal: Number(totalAmount),
				totalAmount: Number(totalAmount),
				deliveryTimeline,
				notes
			};
			const data = await submitQuotation(id, payload);
			setSuccess('Quotation submitted successfully');
			setTimeout(() => navigate(`/rfqs/${id}`), 1000);
		} catch (err) {
			setError(err.response?.data?.message || 'Unable to submit quotation');
		}
	};

	if (loading) return <div className="empty-state">Loading RFQ...</div>;
	if (error) return <div className="error">{error}</div>;

	return (
		<section>
			<PageHeader title="Submit Quotation" subtitle={`Submit quotation for ${rfq?.title || ''}`} />

			<form className="panel" onSubmit={handleSubmit}>
				<div style={{ marginBottom: 12 }}>
					<strong>RFQ items</strong>
					{Array.isArray(rfq.items) && rfq.items.length ? (
						<ul>
							{rfq.items.map((it, idx) => <li key={idx}>{it.name} — {it.quantity} {it.unit || 'pcs'}</li>)}
						</ul>
					) : <p>No items listed.</p>}
				</div>

				<Input label="Total amount" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} />
				<Input label="Delivery timeline" value={deliveryTimeline} onChange={(e) => setDeliveryTimeline(e.target.value)} placeholder="e.g., 7 days" />
				<label className="field">
					<span>Notes</span>
					<textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} />
				</label>

				<div className="actions">
					<Button type="submit">Submit quotation</Button>
					<Button variant="secondary" type="button" onClick={() => navigate(-1)}>Cancel</Button>
				</div>

				{error && <div className="error" style={{ marginTop: 12 }}>{error}</div>}
				{success && <div className="success" style={{ marginTop: 12 }}>{success}</div>}
			</form>
		</section>
	);
};

export default QuotationSubmissionPage;

