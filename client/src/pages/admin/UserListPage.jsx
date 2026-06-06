import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import PageHeader from '../../components/layout/PageHeader';
import { listUsers, deleteUser } from '../../services/userService';

const ROLE_LABELS = {
	admin: { text: 'Admin', bg: '#ede9fe', color: '#6d28d9' },
	procurement_officer: { text: 'Procurement', bg: '#dbeafe', color: '#1d4ed8' },
	manager: { text: 'Manager', bg: '#fef3c7', color: '#92400e' },
	vendor: { text: 'Vendor', bg: '#dcfce7', color: '#166534' }
};

const STATUS_COLORS = {
	active: { bg: '#dcfce7', color: '#166534' },
	inactive: { bg: '#f1f5f9', color: '#64748b' }
};

const UserListPage = () => {
	const [users, setUsers] = useState([]);
	const [search, setSearch] = useState('');
	const [roleFilter, setRoleFilter] = useState('all');
	const [statusFilter, setStatusFilter] = useState('all');
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	const loadUsers = async () => {
		setLoading(true);
		setError('');
		try {
			const data = await listUsers();
			setUsers(Array.isArray(data) ? data : []);
		} catch (err) {
			setError(err.response?.data?.message || 'Unable to load users');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => { loadUsers(); }, []);

	const handleDelete = async (user) => {
		if (!window.confirm(`Delete user "${user.name}" (${user.email})? This cannot be undone.`)) return;
		try {
			await deleteUser(user._id);
			setUsers((prev) => prev.filter((u) => u._id !== user._id));
		} catch (err) {
			setError(err.response?.data?.message || 'Unable to delete user');
		}
	};

	const filtered = users.filter((u) => {
		if (roleFilter !== 'all' && u.role !== roleFilter) return false;
		if (statusFilter !== 'all' && u.status !== statusFilter) return false;
		if (search.trim()) {
			const q = search.toLowerCase();
			return u.name?.toLowerCase().includes(q)
				|| u.email?.toLowerCase().includes(q)
				|| u.role?.toLowerCase().includes(q);
		}
		return true;
	});

	return (
		<section>
			<PageHeader
				title="Users"
				subtitle="Manage admin, procurement, vendor, and manager accounts."
				actions={<Link to="/admin/users/new"><Button>Create user</Button></Link>}
			/>

			{/* Filters */}
			<div className="panel" style={{ marginBottom: 16 }}>
				<div className="actions" style={{ flexWrap: 'wrap' }}>
					<label className="field" style={{ flex: '1 1 260px', marginBottom: 0 }}>
						<span>Search</span>
						<input
							className="search"
							placeholder="Search by name, email, or role"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</label>
					<label className="field" style={{ width: 180, marginBottom: 0 }}>
						<span>Role</span>
						<select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
							<option value="all">All roles</option>
							<option value="admin">Admin</option>
							<option value="procurement_officer">Procurement Officer</option>
							<option value="manager">Manager</option>
							<option value="vendor">Vendor</option>
						</select>
					</label>
					<label className="field" style={{ width: 160, marginBottom: 0 }}>
						<span>Status</span>
						<select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
							<option value="all">All statuses</option>
							<option value="active">Active</option>
							<option value="inactive">Inactive</option>
						</select>
					</label>
				</div>
			</div>

			{error && <div className="error">{error}</div>}

			{/* Stats row */}
			<div className="metric-grid" style={{ marginBottom: 16 }}>
				<div className="metric">
					<span>Total users</span>
					<strong>{users.length}</strong>
				</div>
				<div className="metric">
					<span>Active</span>
					<strong style={{ color: '#166534' }}>{users.filter((u) => u.status === 'active').length}</strong>
				</div>
				<div className="metric">
					<span>Admins</span>
					<strong style={{ color: '#6d28d9' }}>{users.filter((u) => u.role === 'admin').length}</strong>
				</div>
				<div className="metric">
					<span>Vendors</span>
					<strong style={{ color: '#1d4ed8' }}>{users.filter((u) => u.role === 'vendor').length}</strong>
				</div>
			</div>

			{/* Table */}
			<div className="table-placeholder" style={{ padding: 0 }}>
				<table className="data-table">
					<thead>
						<tr>
							<th>User</th>
							<th>Email</th>
							<th>Role</th>
							<th>Status</th>
							<th>Joined</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{loading ? (
							<tr><td colSpan="6">Loading users...</td></tr>
						) : filtered.length ? filtered.map((user) => {
							const rl = ROLE_LABELS[user.role] || { text: user.role, bg: '#f1f5f9', color: '#475569' };
							const sc = STATUS_COLORS[user.status] || STATUS_COLORS.inactive;
							return (
								<tr key={user._id}>
									<td>
										<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
											<div style={{
												width: 36,
												height: 36,
												borderRadius: '50%',
												background: `linear-gradient(135deg, ${rl.bg}, ${rl.color}22)`,
												display: 'grid',
												placeItems: 'center',
												fontWeight: 800,
												fontSize: 14,
												color: rl.color,
												flexShrink: 0
											}}>
												{user.name?.charAt(0).toUpperCase() || '?'}
											</div>
											<div>
												<strong>{user.name}</strong>
												{user.phone && <div style={{ fontSize: 12, color: '#64748b' }}>{user.phone}</div>}
											</div>
										</div>
									</td>
									<td style={{ color: '#475569' }}>{user.email}</td>
									<td>
										<span className="badge" style={{ background: rl.bg, color: rl.color }}>{rl.text}</span>
									</td>
									<td>
										<span className="badge" style={{ background: sc.bg, color: sc.color }}>{user.status}</span>
									</td>
									<td style={{ color: '#64748b', fontSize: 13, whiteSpace: 'nowrap' }}>
										{user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
									</td>
									<td>
										<div className="actions">
											<Link to={`/admin/users/${user._id}/edit`}>
												<Button variant="secondary">Edit</Button>
											</Link>
											<Button variant="danger" onClick={() => handleDelete(user)}>Delete</Button>
										</div>
									</td>
								</tr>
							);
						}) : (
							<tr><td colSpan="6" style={{ textAlign: 'center', color: '#94a3b8', padding: 32 }}>No users found.</td></tr>
						)}
					</tbody>
				</table>
			</div>
		</section>
	);
};

export default UserListPage;
