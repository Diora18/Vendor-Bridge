import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import PageHeader from '../../components/layout/PageHeader';
import { createUser } from '../../services/userService';

const UserCreatePage = () => {
	const navigate = useNavigate();
	const [form, setForm] = useState({
		name: '',
		email: '',
		phone: '',
		password: '',
		role: 'procurement_officer',
		status: 'active'
	});
	const [error, setError] = useState('');
	const [showPassword, setShowPassword] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');

		if (form.password && form.password.length < 6) {
			setError('Password must be at least 6 characters');
			return;
		}

		try {
			const payload = { ...form };
			if (!payload.password) payload.password = 'Password@123';
			await createUser(payload);
			navigate('/admin/users');
		} catch (err) {
			setError(err.response?.data?.message || 'Unable to create user');
		}
	};

	return (
		<section>
			<PageHeader
				title="Create User"
				subtitle="Add a team member and assign their role."
				actions={<Link to="/admin/users"><Button variant="secondary">Back to users</Button></Link>}
			/>

			<form className="panel form-grid" onSubmit={handleSubmit}>
				<Input label="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
				<Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
				<Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />

				<label className="field">
					<span>Password</span>
					<div style={{ display: 'flex', gap: 8 }}>
						<input
							type={showPassword ? 'text' : 'password'}
							value={form.password}
							onChange={(e) => setForm({ ...form, password: e.target.value })}
							placeholder="Leave blank for default (Password@123)"
							style={{ flex: 1, border: '1px solid #cbd5e1', borderRadius: 6, padding: '10px 12px' }}
						/>
						<button
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							style={{
								border: '1px solid #cbd5e1',
								borderRadius: 6,
								padding: '10px 12px',
								background: '#f8fafc',
								cursor: 'pointer',
								fontSize: 13,
								fontWeight: 600,
								color: '#475569',
								whiteSpace: 'nowrap'
							}}
						>
							{showPassword ? 'Hide' : 'Show'}
						</button>
					</div>
				</label>

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
				<Button type="submit">Create user</Button>
			</form>
		</section>
	);
};

export default UserCreatePage;
