const VendorCategory = require('../models/VendorCategory');
const Vendor = require('../models/Vendor');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

const listCategories = asyncHandler(async (_req, res) => {
  const categories = await VendorCategory.find().sort({ name: 1 });
  res.json(categories);
});

const createCategory = asyncHandler(async (req, res) => {
  const existing = await VendorCategory.findOne({ name: req.body.name });
  if (existing) throw new ApiError(409, 'A category with this name already exists');

  const category = await VendorCategory.create({
    name: req.body.name,
    description: req.body.description || ''
  });
  res.status(201).json(category);
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await VendorCategory.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name, description: req.body.description },
    { new: true, runValidators: true }
  );
  if (!category) throw new ApiError(404, 'Category not found');
  res.json(category);
});

const deleteCategory = asyncHandler(async (req, res) => {
  const vendorCount = await Vendor.countDocuments({ category: req.params.id });
  if (vendorCount > 0) {
    throw new ApiError(400, `Cannot delete — ${vendorCount} vendor(s) are using this category`);
  }

  const category = await VendorCategory.findByIdAndDelete(req.params.id);
  if (!category) throw new ApiError(404, 'Category not found');
  res.status(204).send();
});

module.exports = { listCategories, createCategory, updateCategory, deleteCategory };
