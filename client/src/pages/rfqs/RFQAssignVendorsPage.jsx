import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/common/Button';
import PageHeader from '../../components/layout/PageHeader';
import { assignRFQVendors, getRFQ } from '../../services/rfqService';
import { listVendors } from '../../services/vendorService';
import { listCategories } from '../../services/vendorCategoryService';

const RFQAssignVendorsPage = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [rfq, setRfq] = useState(null);
	const [vendors, setVendors] = useState([]);
	const [categories, setCategories] = useState([]);
	const [selectedVendorIds, setSelectedVendorIds] = useState([]);
	const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		let active = true;

		const loadData = async () => {
			setLoading(true);
			setError('');

			try {
				const [rfqData, vendorData, categoryData] = await Promise.all([
					getRFQ(id),
					listVendors(),
					listCategories()
				]);
				if (!active) return;
				setRfq(rfqData);
				setVendors(Array.isArray(vendorData) ? vendorData : []);
				setCategories(Array.isArray(categoryData) ? categoryData : []);
				setSelectedVendorIds((rfqData.assignedVendors || []).map((vendor) => vendor._id || vendor));
			} catch (err) {
				if (active) setError(err.response?.data?.message || 'Unable to load RFQ assignment data');
			} finally {
				if (active) setLoading(false);
			}
		};

		loadData();

		return () => {
			active = false;
		};
	}, [id]);

	// Map category ID → vendor IDs for quick lookup
	const vendorsByCategory = useMemo(() => {
		const map = {};
		vendors.forEach((v) => {
			const catId = v.category?._id || v.category;
			if (!catId) return;
			if (!map[catId]) map[catId] = [];
			map[catId].push(v._id);
		});
		return map;
	}, [vendors]);

	const toggleVendor = (vendorId) => {
		setSelectedVendorIds((current) => (
			current.includes(vendorId)
				? current.filter((idValue) => idValue !== vendorId)
				: [...current, vendorId]
		));
	};

	const toggleCategory = (categoryId) => {
		const vendorIdsInCategory = vendorsByCategory[categoryId] || [];
		if (!vendorIdsInCategory.length) return;

		const isSelected = selectedCategoryIds.includes(categoryId);

		if (isSelected) {
			// Deselect category → remove all its vendors
			setSelectedCategoryIds((current) => current.filter((cid) => cid !== categoryId));
			setSelectedVendorIds((current) => current.filter((vid) => !vendorIdsInCategory.includes(vid)));
		} else {
			// Select category → add all its vendors
			setSelectedCategoryIds((current) => [...current, categoryId]);
			setSelectedVendorIds((current) => {
				const combined = new Set([...current, ...vendorIdsInCategory]);
				return [...combined];
			});
		}
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		setError('');

		try {
			await assignRFQVendors(id, { vendorIds: selectedVendorIds });
			navigate(`/rfqs/${id}`);
		} catch (err) {
			setError(err.response?.data?.message || 'Unable to assign vendors');
		}
	};

	const vendorCountLabel = useMemo(() => `${selectedVendorIds.length} selected`, [selectedVendorIds]);

	// Group vendors by category for display
	const groupedVendors = useMemo(() => {
		const groups = [];
		const catMap = {};

		vendors.forEach((v) => {
			const catId = v.category?._id || v.category || 'uncategorized';
			const catName = v.category?.name || 'Uncategorized';
			if (!catMap[catId]) {
				catMap[catId] = { categoryId: catId, categoryName: catName, vendors: [] };
				groups.push(catMap[catId]);
			}
			catMap[catId].vendors.push(v);
		});

		groups.sort((a, b) => a.categoryName.localeCompare(b.categoryName));
		return groups;
	}, [vendors]);

	if (loading) {
		return <div className="empty-state">Loading assignment data...</div>;
	}

	if (error || !rfq) {
		return <div className="error">{error || 'RFQ not found'}</div>;
	}

	return (
		<section>
			<PageHeader
				title="Assign Vendors"
				subtitle={`Choose vendors who should receive ${rfq.title}.`}
				actions={<Link to={`/rfqs/${id}`}><Button variant="secondary">Back to RFQ</Button></Link>}
			/>

			<form className="panel" onSubmit={handleSubmit}>
				{/* Category quick-select chips */}
				<div style={{ marginBottom: 20 }}>
					<div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
						Select by category
					</div>
					<div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
						{categories.map((cat) => {
							const isActive = selectedCategoryIds.includes(cat._id);
							const count = (vendorsByCategory[cat._id] || []).length;
							return (
								<button
									key={cat._id}
									type="button"
									onClick={() => toggleCategory(cat._id)}
									style={{
										display: 'inline-flex',
										alignItems: 'center',
										gap: 6,
										padding: '6px 14px',
										borderRadius: 20,
										border: isActive ? '2px solid var(--color-primary, #6366f1)' : '2px solid var(--color-border, #e2e8f0)',
										background: isActive ? 'var(--color-primary, #6366f1)' : 'transparent',
										color: isActive ? '#fff' : 'inherit',
										cursor: count > 0 ? 'pointer' : 'not-allowed',
										opacity: count > 0 ? 1 : 0.4,
										fontSize: 13,
										fontWeight: 500,
										transition: 'all 0.2s ease'
									}}
									disabled={count === 0}
								>
									{cat.name}
									<span style={{
										background: isActive ? 'rgba(255,255,255,0.25)' : 'var(--color-surface, #f1f5f9)',
										borderRadius: 10,
										padding: '1px 7px',
										fontSize: 11,
										fontWeight: 600
									}}>
										{count}
									</span>
								</button>
							);
						})}
					</div>
				</div>

				<div className="actions" style={{ justifyContent: 'space-between', marginBottom: 16 }}>
					<strong>{vendorCountLabel}</strong>
					<Button type="submit">Save assignment</Button>
				</div>

				{/* Vendors grouped by category */}
				<div style={{ display: 'grid', gap: 20 }}>
					{groupedVendors.length ? groupedVendors.map((group) => (
						<div key={group.categoryId}>
							<div style={{
								fontSize: 12,
								fontWeight: 700,
								textTransform: 'uppercase',
								letterSpacing: '0.06em',
								opacity: 0.55,
								marginBottom: 8,
								paddingBottom: 6,
								borderBottom: '1px solid var(--color-border, #e2e8f0)'
							}}>
								{group.categoryName} ({group.vendors.length})
							</div>
							<div style={{ display: 'grid', gap: 8 }}>
								{group.vendors.map((vendor) => (
									<label key={vendor._id} className="panel" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, cursor: 'pointer' }}>
										<input
											type="checkbox"
											checked={selectedVendorIds.includes(vendor._id)}
											onChange={() => toggleVendor(vendor._id)}
										/>
										<span style={{ flex: 1 }}>
											<strong>{vendor.companyName}</strong>
											<div style={{ fontSize: 13, opacity: 0.7 }}>{vendor.name} · {vendor.email}</div>
										</span>
										<span className="badge badge-neutral" style={{ fontSize: 11 }}>{vendor.status}</span>
									</label>
								))}
							</div>
						</div>
					)) : <p>No vendors available.</p>}
				</div>

				{error && <div className="error" style={{ marginTop: 12 }}>{error}</div>}
			</form>
		</section>
	);
};

export default RFQAssignVendorsPage;
