import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/common/Button';
import PageHeader from '../../components/layout/PageHeader';
import { assignRFQVendors, getRFQ } from '../../services/rfqService';
import { listVendors } from '../../services/vendorService';

const RFQAssignVendorsPage = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [rfq, setRfq] = useState(null);
	const [vendors, setVendors] = useState([]);
	const [selectedVendorIds, setSelectedVendorIds] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		let active = true;

		const loadData = async () => {
			setLoading(true);
			setError('');

			try {
				const [rfqData, vendorData] = await Promise.all([getRFQ(id), listVendors()]);
				if (!active) return;
				setRfq(rfqData);
				setVendors(Array.isArray(vendorData) ? vendorData : []);
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

	const toggleVendor = (vendorId) => {
		setSelectedVendorIds((current) => (
			current.includes(vendorId)
				? current.filter((idValue) => idValue !== vendorId)
				: [...current, vendorId]
		));
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
				<div className="actions" style={{ justifyContent: 'space-between', marginBottom: 16 }}>
					<strong>{vendorCountLabel}</strong>
					<Button type="submit">Save assignment</Button>
				</div>

				<div style={{ display: 'grid', gap: 12 }}>
					{vendors.length ? vendors.map((vendor) => (
						<label key={vendor._id} className="panel" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16 }}>
							<input
								type="checkbox"
								checked={selectedVendorIds.includes(vendor._id)}
								onChange={() => toggleVendor(vendor._id)}
							/>
							<span>
								<strong>{vendor.companyName}</strong>
								<div>{vendor.name} - {vendor.category}</div>
							</span>
						</label>
					)) : <p>No vendors available.</p>}
				</div>

				{error && <div className="error" style={{ marginTop: 12 }}>{error}</div>}
			</form>
		</section>
	);
};

export default RFQAssignVendorsPage;

