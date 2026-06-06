const Vendor = require('../models/Vendor');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { buildRegexQuery } = require('../utils/buildQuery');
const { createActivityLog } = require('../services/activityLogService');
const { ensureVendorPortalUser } = require('../services/vendorPortalService');

const createVendor = asyncHandler(async (req, res) => {
  const vendor = await Vendor.create({ ...req.body, createdBy: req.user._id });
  const portal = await ensureVendorPortalUser(vendor);
  await createActivityLog({ userId: req.user._id, action: 'vendor.created', entityType: 'Vendor', entityId: vendor._id, message: `Vendor ${vendor.companyName} created` });
  res.status(201).json({
    ...vendor.toObject(),
    portalUser: {
      email: portal.user.email,
      created: portal.created,
      defaultPassword: portal.defaultPassword
    }
  });
});

const listVendors = asyncHandler(async (req, res) => {
  const query = { ...buildRegexQuery(['name', 'companyName', 'email'], req.query.search) };
  if (req.query.status) query.status = req.query.status;
  if (req.query.category) query.category = req.query.category;
  const vendors = await Vendor.find(query).populate('category').sort({ createdAt: -1 });
  res.json(vendors);
});

const getVendor = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.params.id).populate('category');
  if (!vendor) throw new ApiError(404, 'Vendor not found');
  res.json(vendor);
});

const updateVendor = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!vendor) throw new ApiError(404, 'Vendor not found');
  if (req.body.email) await ensureVendorPortalUser(vendor);
  await createActivityLog({ userId: req.user._id, action: 'vendor.updated', entityType: 'Vendor', entityId: vendor._id, message: `Vendor ${vendor.companyName} updated` });
  res.json(vendor);
});

const deleteVendor = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findByIdAndDelete(req.params.id);
  if (!vendor) throw new ApiError(404, 'Vendor not found');
  await createActivityLog({ userId: req.user._id, action: 'vendor.deleted', entityType: 'Vendor', entityId: vendor._id, message: `Vendor ${vendor.companyName} deleted` });
  res.status(204).send();
});

module.exports = { createVendor, listVendors, getVendor, updateVendor, deleteVendor };

