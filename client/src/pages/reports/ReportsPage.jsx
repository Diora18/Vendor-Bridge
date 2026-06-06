import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import PageHeader from '../../components/layout/PageHeader';
import MonthlyTrendChart from '../../components/charts/MonthlyTrendChart';
import SpendingChart from '../../components/charts/SpendingChart';
import { exportReport, getProcurementOverview, getSpendingSummary } from '../../services/reportService';
import { formatCurrency } from '../../utils/formatCurrency';

const ReportsPage = () => {
	const [overview, setOverview] = useState(null);
	const [spending, setSpending] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		let active = true;

		const load = async () => {
			setLoading(true);
			setError('');
			try {
				const [overviewData, spendingData] = await Promise.all([
					getProcurementOverview(),
					getSpendingSummary()
				]);
				if (!active) return;
				setOverview(overviewData);
				setSpending(spendingData);
			} catch (err) {
				if (active) setError(err.response?.data?.message || 'Unable to load reports');
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

	if (loading) return <div className="empty-state">Loading reports...</div>;

	return (
		<section>
			<PageHeader
				title="Reports & Analytics"
				subtitle="Procurement statistics, spending summaries, monthly trends, and vendor performance."
				actions={<Button variant="secondary" onClick={() => handleExport('spending')}>Export spending CSV</Button>}
			/>

			{error && <div className="error">{error}</div>}

			<div className="metric-grid" style={{ marginBottom: 16 }}>
				<div className="metric"><span>Total spent</span><strong>{formatCurrency(overview?.totalSpent)}</strong></div>
				<div className="metric"><span>Invoices</span><strong>{overview?.invoiceCount || 0}</strong></div>
				<div className="metric"><span>Purchase orders</span><strong>{overview?.poCount || 0}</strong></div>
				<div className="metric"><span>Quotations</span><strong>{overview?.quotationCount || 0}</strong></div>
			</div>

			<div className="module-grid" style={{ marginBottom: 16 }}>
				<div className="panel">
					<h2>Spending by invoice status</h2>
					<SpendingChart data={spending?.byStatus || []} />
				</div>
				<div className="panel">
					<h2>Monthly procurement trend</h2>
					<MonthlyTrendChart data={overview?.monthlyTrends || []} />
				</div>
			</div>

			<div className="module-grid" style={{ marginBottom: 16 }}>
				<div className="panel">
					<h2>RFQ status breakdown</h2>
					{(overview?.rfqByStatus || []).length ? (
						<ul className="report-list">
							{overview.rfqByStatus.map((item) => (
								<li key={item.status}><span>{item.status}</span><strong>{item.count}</strong></li>
							))}
						</ul>
					) : <p>No RFQ data yet.</p>}
				</div>
				<div className="panel">
					<h2>Approval status breakdown</h2>
					{(overview?.approvalByStatus || []).length ? (
						<ul className="report-list">
							{overview.approvalByStatus.map((item) => (
								<li key={item.status}><span>{item.status}</span><strong>{item.count}</strong></li>
							))}
						</ul>
					) : <p>No approval data yet.</p>}
				</div>
			</div>

			<div className="module-grid">
				<div className="panel">
					<h2>Spending summary</h2>
					<p>Track invoice spending grouped by status.</p>
					<div className="actions" style={{ marginTop: 12 }}>
						<Link to="/reports/spending"><Button>Open spending report</Button></Link>
						<Button variant="secondary" onClick={() => handleExport('spending')}>Export CSV</Button>
					</div>
				</div>
				<div className="panel">
					<h2>Vendor performance</h2>
					<p>Compare vendor ratings, quotations, win rate, and total spend.</p>
					<div className="actions" style={{ marginTop: 12 }}>
						<Link to="/reports/vendor-performance"><Button>Open vendor report</Button></Link>
						<Button variant="secondary" onClick={() => handleExport('vendors')}>Export CSV</Button>
					</div>
				</div>
			</div>
		</section>
	);
};

export default ReportsPage;
