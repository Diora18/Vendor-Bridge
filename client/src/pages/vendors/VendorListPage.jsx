import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import PageHeader from '../../components/layout/PageHeader';
import { listVendors } from '../../services/vendorService';

const statusOptions = ['all', 'active', 'inactive', 'blacklisted'];

const VendorListPage = () => {
	const [vendors, setVendors] = useState([]);
	const [search, setSearch] = useState('');
	const [status, setStatus] = useState('all');
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		const controller = new AbortController();

		const loadVendors = async () => {
			setLoading(true);
			setError('');

			try {
				const params = {};
				if (search.trim()) params.search = search.trim();
				if (status !== 'all') params.status = status;

				const data = await listVendors(params, { signal: controller.signal });
				setVendors(Array.isArray(data) ? data : []);
			} catch (err) {
				if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
					setError(err.response?.data?.message || 'Unable to load vendors');
				}
			} finally {
				setLoading(false);
			}
		};

		loadVendors();

		return () => controller.abort();
	}, [search, status]);

	return (
		<section>
			<PageHeader
				title="Vendors"
				subtitle="Register, search, filter, and manage vendor records."
				actions={<Link to="/vendors/new"><Button>Create vendor</Button></Link>}
			/>

			<div className="panel" style={{ marginBottom: 16 }}>
				<div className="actions" style={{ flexWrap: 'wrap' }}>
					<label className="field" style={{ flex: '1 1 260px', marginBottom: 0 }}>
						<span>Search</span>
						<input
							className="search"
							placeholder="Search vendor name, company, email, or category"
							value={search}
							onChange={(event) => setSearch(event.target.value)}
						/>
					</label>
					<label className="field" style={{ width: 180, marginBottom: 0 }}>
						<span>Status</span>
						<select value={status} onChange={(event) => setStatus(event.target.value)}>
							{statusOptions.map((option) => (
								<option key={option} value={option}>{option === 'all' ? 'All statuses' : option}</option>
							))}
						</select>
					</label>
				</div>
			</div>

			{error && <div className="error">{error}</div>}

			<div className="table-placeholder" style={{ padding: 0 }}>
				<table className="data-table">
					<thead>
						<tr>
							<th>Company</th>
							<th>Contact</th>
							<th>Category</th>
							<th>Status</th>
							<th>Rating</th>
						</tr>
					</thead>
					<tbody>
						{loading ? (
							<tr>
								<td colSpan="5">Loading vendors...</td>
							</tr>
						) : vendors.length ? (
							vendors.map((vendor) => (
								<tr key={vendor._id}>
									<td>
										<strong>{vendor.companyName}</strong>
										<div>{vendor.name}</div>
									</td>
									<td>
										<div>{vendor.email}</div>
										<div>{vendor.phone || 'No phone provided'}</div>
									</td>
									<td>{vendor.category}</td>
									<td><span className={`badge badge-neutral`}>{vendor.status}</span></td>
									<td>{typeof vendor.rating === 'number' ? vendor.rating.toFixed(1) : '0.0'}</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan="5">No vendors found.</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</section>
	);
};

export default VendorListPage;

