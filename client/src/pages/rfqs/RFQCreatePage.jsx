import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import PageHeader from '../../components/layout/PageHeader';
import { createRFQ } from '../../services/rfqService';

const emptyItem = { name: '', description: '', quantity: 1, unit: 'pcs' };

const RFQCreatePage = () => {
	const navigate = useNavigate();
	const [form, setForm] = useState({ title: '', description: '', deadline: '', items: [emptyItem], attachments: [] });
	const [error, setError] = useState('');

	const updateItem = (index, field, value) => {
		const nextItems = [...form.items];
		nextItems[index] = { ...nextItems[index], [field]: value };
		setForm({ ...form, items: nextItems });
	};

	const addItem = () => setForm({ ...form, items: [...form.items, { ...emptyItem }] });

	const removeItem = (index) => {
		const nextItems = form.items.filter((_, itemIndex) => itemIndex !== index);
		setForm({ ...form, items: nextItems.length ? nextItems : [emptyItem] });
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		setError('');

		try {
			const payload = new FormData();
			payload.append('title', form.title);
			payload.append('description', form.description);
			payload.append('deadline', form.deadline);
			payload.append('items', JSON.stringify(form.items.map((item) => ({ ...item, quantity: Number(item.quantity) }))));
			form.attachments.forEach((file) => payload.append('attachments', file));

			await createRFQ(payload);
			navigate('/rfqs');
		} catch (err) {
			setError(err.response?.data?.message || 'Unable to save RFQ');
		}
	};

	return (
		<section>
			<PageHeader title="Create RFQ" subtitle="Add items, quantities, attachments, deadline, and vendors." actions={<Link to="/rfqs"><Button variant="secondary">Back to RFQs</Button></Link>} />

			<form className="panel form-grid" onSubmit={handleSubmit}>
				<Input label="Title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
				<label className="field">
					<span>Description</span>
					<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
				</label>
				<Input label="Deadline" type="date" value={form.deadline} onChange={(event) => setForm({ ...form, deadline: event.target.value })} required />

				<div className="panel" style={{ padding: 0, border: 'none', boxShadow: 'none' }}>
					<div className="actions" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
						<h2 style={{ margin: 0 }}>Items</h2>
						<Button type="button" variant="secondary" onClick={addItem}>Add item</Button>
					</div>
					<div style={{ display: 'grid', gap: 14 }}>
						{form.items.map((item, index) => (
							<div key={index} className="panel" style={{ padding: 16 }}>
								<div className="actions" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
									<strong>Item {index + 1}</strong>
									{form.items.length > 1 && (
										<Button type="button" variant="secondary" onClick={() => removeItem(index)}>Remove</Button>
									)}
								</div>
								<Input label="Item name" value={item.name} onChange={(event) => updateItem(index, 'name', event.target.value)} required />
								<label className="field">
									<span>Description</span>
									<textarea value={item.description} onChange={(event) => updateItem(index, 'description', event.target.value)} />
								</label>
								<div className="metric-grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
									<Input label="Quantity" type="number" min="1" value={item.quantity} onChange={(event) => updateItem(index, 'quantity', event.target.value)} required />
									<Input label="Unit" value={item.unit} onChange={(event) => updateItem(index, 'unit', event.target.value)} />
								</div>
							</div>
						))}
					</div>
				</div>

				<label className="field">
					<span>Attachments</span>
					<input type="file" multiple accept=".pdf,.png,.jpg,.jpeg" onChange={(event) => setForm({ ...form, attachments: Array.from(event.target.files || []) })} />
				</label>

				{error && <div className="error">{error}</div>}
				<Button type="submit">Save RFQ</Button>
			</form>
		</section>
	);
};

export default RFQCreatePage;

