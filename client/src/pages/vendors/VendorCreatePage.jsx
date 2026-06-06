import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import PageHeader from '../../components/layout/PageHeader';
import { createVendor } from '../../services/vendorService';
import { listCategories } from '../../services/vendorCategoryService';

const VendorCreatePage = () => {
	const navigate = useNavigate();
	const [form, setForm] = useState({
		name: '',
		companyName: '',
		email: '',
		phone: '',
		category: '',
		gstNumber: '',
		address: '',
		status: 'active'
	});
	const [categories, setCategories] = useState([]);
	const [error, setError] = useState('');
	const [portalInfo, setPortalInfo] = useState('');

	useEffect(() => {
		listCategories()
			.then((data) => setCategories(Array.isArray(data) ? data : []))
			.catch(() => setCategories([]));
	}, []);

	const handleSubmit = async (event) => {
		event.preventDefault();
		setError('');
		setPortalInfo('');

		try {
			const data = await createVendor(form);
			if (data.portalUser) {
				const passwordNote = data.portalUser.defaultPassword ? ` Temporary password: ${data.portalUser.defaultPassword}` : '';
				setPortalInfo(`Vendor portal login: ${data.portalUser.email}.${passwordNote}`);
				setTimeout(() => navigate('/vendors'), 2500);
				return;
			}
			navigate('/vendors');
		} catch (err) {
			setError(err.response?.data?.message || 'Unable to save vendor');
		}
	};

	return (
		<section>
			<PageHeader title="Create Vendor" subtitle="Add GST, contact, category, and status details." actions={<Link to="/vendors"><Button variant="secondary">Back to vendors</Button></Link>} />

			<form className="panel form-grid" onSubmit={handleSubmit}>
				<Input label="Contact person" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
				<Input label="Company name" value={form.companyName} onChange={(event) => setForm({ ...form, companyName: event.target.value })} required />
				<Input label="Email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
				<Input label="Phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
				<label className="field">
					<span>Category <span style={{ color: 'var(--color-danger, #ef4444)' }}>*</span></span>
					<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} required>
						<option value="">Select a category</option>
						{categories.map((cat) => (
							<option key={cat._id} value={cat._id}>{cat.name}</option>
						))}
					</select>
				</label>
				<Input label="GST number" value={form.gstNumber} onChange={(event) => setForm({ ...form, gstNumber: event.target.value })} />
				<label className="field">
					<span>Address</span>
					<textarea value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
				</label>
				<label className="field">
					<span>Status</span>
					<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
						<option value="active">Active</option>
						<option value="inactive">Inactive</option>
						<option value="blacklisted">Blacklisted</option>
					</select>
				</label>
				{error && <div className="error">{error}</div>}
				{portalInfo && <div className="success">{portalInfo}</div>}
				<Button type="submit">Save vendor</Button>
			</form>
		</section>
	);
};

export default VendorCreatePage;
