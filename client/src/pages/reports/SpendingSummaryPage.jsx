import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import PageHeader from '../../components/layout/PageHeader';
import MonthlyTrendChart from '../../components/charts/MonthlyTrendChart';
import SpendingChart from '../../components/charts/SpendingChart';
import { exportReport, getMonthlyTrends, getSpendingSummary } from '../../services/reportService';
import { formatCurrency } from '../../utils/formatCurrency';

const SpendingSummaryPage = () => {
	const [spending, setSpending] = useState(null);
	const [monthly, setMonthly] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		let active = true;

		const load = async () => {
			setLoading(true);
			setError('');
			try {
				const [spendingData, monthlyData] = await Promise.all([
					getSpendingSummary(),
					getMonthlyTrends()
				]);
				if (!active) return;
				setSpending(spendingData);
				setMonthly(Array.isArray(monthlyData) ? monthlyData : []);
			} catch (err) {
				if (active) setError(err.response?.data?.message || 'Unable to load spending summary');
			} finally {
				if (active) setLoading(false);
			}
		};

		load();
		return () => { active = false; };
	}, []);

	const handleExport = async (type) => {
		try {
			await exportReport(type);
		} catch (err) {
			setError(err.response?.data?.message || 'Unable to export report');
		}
	};

	if (loading) return <div className="empty-state">Loading spending summary...</div>;

	return (
		<section>
			<PageHeader
				title="Spending Summary"
				subtitle="Track invoice and procurement spending by status and month."
				actions={
					<div className="actions">
						<Link to="/reports"><Button variant="secondary">Back to reports</Button></Link>
						<Button onClick={() => handleExport('spending')}>Export CSV</Button>
					</div>
				}
			/>

			{error && <div className="error">{error}</div>}

			<div className="metric-grid" style={{ marginBottom: 16 }}>
				<div className="metric"><span>Total spent</span><strong>{formatCurrency(spending?.totals?.totalSpent)}</strong></div>
				<div className="metric"><span>Invoices</span><strong>{spending?.totals?.invoiceCount || 0}</strong></div>
				<div className="metric"><span>Average invoice</span><strong>{formatCurrency(spending?.totals?.avgInvoice)}</strong></div>
			</div>

			<div className="module-grid" style={{ marginBottom: 16 }}>
				<div className="panel">
					<h2>Spending by status</h2>
					<SpendingChart data={spending?.byStatus || []} />
				</div>
				<div className="panel">
					<h2>Monthly trend</h2>
					<MonthlyTrendChart data={monthly} />
					<div className="actions" style={{ marginTop: 12 }}>
						<Button variant="secondary" onClick={() => handleExport('monthly')}>Export monthly CSV</Button>
					</div>
				</div>
			</div>

			<div className="table-placeholder" style={{ padding: 0 }}>
				<table className="data-table">
					<thead>
						<tr>
							<th>Invoice status</th>
							<th>Count</th>
							<th>Total amount</th>
						</tr>
					</thead>
					<tbody>
						{(spending?.byStatus || []).length ? spending.byStatus.map((row) => (
							<tr key={row.status}>
								<td><span className="badge badge-neutral">{row.status}</span></td>
								<td>{row.count}</td>
								<td>{formatCurrency(row.total)}</td>
							</tr>
						)) : (
							<tr><td colSpan="3">No invoice spending data yet.</td></tr>
						)}
					</tbody>
				</table>
			</div>
		</section>
	);
};

export default SpendingSummaryPage;
