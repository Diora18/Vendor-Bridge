import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import PageHeader from '../../components/layout/PageHeader';
import { getUser, updateUser } from '../../services/userService';

const UserEditPage = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [form, setForm] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');

	useEffect(() => {
		setLoading(true);
		getUser(id)
			.then((data) => {
				setForm({
					name: data.name || '',
					email: data.email || '',
					phone: data.phone || '',
					role: data.role || 'procurement_officer',
					status: data.status || 'active'
				});
			})
			.catch((err) => setError(err.response?.data?.message || 'Unable to load user'))
			.finally(() => setLoading(false));
	}, [id]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setSuccess('');

		try {
			await updateUser(id, form);
			setSuccess('User updated successfully');
			setTimeout(() => navigate('/admin/users'), 1200);
		} catch (err) {
			setError(err.response?.data?.message || 'Unable to update user');
		}
	};

	if (loading) return <div className="empty-state">Loading user...</div>;
	if (!form) return <div className="error">{error || 'User not found'}</div>;

	return (
		<section>
			<PageHeader
				title="Edit User"
				subtitle="Update user profile, role, and account status."
				actions={<Link to="/admin/users"><Button variant="secondary">Back to users</Button></Link>}
			/>

			<form className="panel form-grid" onSubmit={handleSubmit}>
				<Input label="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
				<Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
				<Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />

				<label className="field">
					<span>Role</span>
					<select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
						<option value="admin">Admin</option>
						<option value="procurement_officer">Procurement Officer</option>
						<option value="manager">Manager</option>
						<option value="vendor">Vendor</option>
					</select>
				</label>

				<label className="field">
					<span>Status</span>
					<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
						<option value="active">Active</option>
						<option value="inactive">Inactive</option>
					</select>
				</label>

				{/* Role info */}
				<div style={{
					background: '#f8fafc',
					border: '1px solid #e2e8f0',
					borderRadius: 8,
					padding: 14,
					fontSize: 13,
					color: '#475569',
					lineHeight: 1.6
				}}>
					<strong style={{ display: 'block', marginBottom: 4, color: '#1e293b' }}>Role permissions</strong>
					{form.role === 'admin' && 'Full access — manage users, vendors, RFQs, approvals, reports, and all settings.'}
					{form.role === 'procurement_officer' && 'Create and manage RFQs, vendors, purchase orders, and invoices.'}
					{form.role === 'manager' && 'Review and approve/reject quotations and purchase orders.'}
					{form.role === 'vendor' && 'View assigned RFQs, submit quotations, and track purchase orders.'}
				</div>

				{error && <div className="error">{error}</div>}
				{success && <div className="success">{success}</div>}
				<Button type="submit">Update user</Button>
			</form>
		</section>
	);
};

export default UserEditPage;
