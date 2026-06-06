import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import PageHeader from '../../components/layout/PageHeader';
import VendorPerformanceChart from '../../components/charts/VendorPerformanceChart';
import { exportReport, getVendorPerformance } from '../../services/reportService';
import { formatCurrency } from '../../utils/formatCurrency';

const VendorPerformancePage = () => {
	const [vendors, setVendors] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		let active = true;

		const load = async () => {
			setLoading(true);
			setError('');
			try {
				const data = await getVendorPerformance();
				if (active) setVendors(Array.isArray(data) ? data : []);
			} catch (err) {
				if (active) setError(err.response?.data?.message || 'Unable to load vendor performance');
			} finally {
				if (active) setLoading(false);
			}
		};

		load();
		return () => { active = false; };
	}, []);

	const handleExport = async () => {
		try {
			await exportReport('vendors');
		} catch (err) {
			setError(err.response?.data?.message || 'Unable to export vendor report');
		}
	};

	if (loading) return <div className="empty-state">Loading vendor performance...</div>;

	const topVendor = vendors[0];

	return (
		<section>
			<PageHeader
				title="Vendor Performance"
				subtitle="Compare vendor rating, quotations submitted, win rate, and total spend."
				actions={
					<div className="actions">
						<Link to="/reports"><Button variant="secondary">Back to reports</Button></Link>
						<Button onClick={handleExport}>Export CSV</Button>
					</div>
				}
			/>

			{error && <div className="error">{error}</div>}

			<div className="metric-grid" style={{ marginBottom: 16 }}>
				<div className="metric"><span>Total vendors</span><strong>{vendors.length}</strong></div>
				<div className="metric"><span>Top vendor by spend</span><strong style={{ fontSize: 18 }}>{topVendor?.companyName || '-'}</strong></div>
				<div className="metric"><span>Top vendor spend</span><strong>{formatCurrency(topVendor?.totalSpent)}</strong></div>
			</div>

			<div className="panel" style={{ marginBottom: 16 }}>
				<h2>Spending by vendor</h2>
				<VendorPerformanceChart data={vendors} />
			</div>

			<div className="table-placeholder" style={{ padding: 0 }}>
				<table className="data-table">
					<thead>
						<tr>
							<th>Vendor</th>
							<th>Category</th>
							<th>Rating</th>
							<th>Quotations</th>
							<th>Selected</th>
							<th>Win rate</th>
							<th>POs</th>
							<th>Invoices</th>
							<th>Total spent</th>
						</tr>
					</thead>
					<tbody>
						{vendors.length ? vendors.map((vendor) => (
							<tr key={vendor._id}>
								<td>
									<strong>{vendor.companyName}</strong>
									<div>{vendor.email}</div>
								</td>
								<td>{vendor.category}</td>
								<td>{typeof vendor.rating === 'number' ? vendor.rating.toFixed(1) : '0.0'}</td>
								<td>{vendor.quotationCount}</td>
								<td>{vendor.selectedCount}</td>
								<td>{vendor.winRate}%</td>
								<td>{vendor.poCount}</td>
								<td>{vendor.invoiceCount}</td>
								<td>{formatCurrency(vendor.totalSpent)}</td>
							</tr>
						)) : (
							<tr><td colSpan="9">No vendor performance data yet.</td></tr>
						)}
					</tbody>
				</table>
			</div>
		</section>
	);
};

export default VendorPerformancePage;
