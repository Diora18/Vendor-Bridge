const VendorCategory = require('../models/VendorCategory');
const mongoose = require('mongoose');

const DEFAULT_CATEGORIES = [
  { name: 'IT & Software', description: 'Software development, IT services, SaaS products' },
  { name: 'Office Supplies', description: 'Stationery, furniture, office equipment' },
  { name: 'Raw Materials', description: 'Metals, chemicals, fabrics, and other raw inputs' },
  { name: 'Logistics & Transport', description: 'Freight, courier, warehousing services' },
  { name: 'Construction & Civil', description: 'Building materials, civil contractors, labour' },
  { name: 'Electrical & Electronics', description: 'Wiring, components, electronic devices' },
  { name: 'Packaging', description: 'Boxes, wraps, labels, and packaging materials' },
  { name: 'Printing & Stationery', description: 'Commercial printing, branding collateral' },
  { name: 'Catering & Food Services', description: 'Canteen, events, food supply' },
  { name: 'Maintenance & Facility', description: 'AMC, housekeeping, facility management' }
];

const seedCategories = async () => {
  const count = await VendorCategory.countDocuments();
  if (count === 0) {
    const docs = DEFAULT_CATEGORIES.map((cat) => ({ ...cat, isDefault: true }));
    await VendorCategory.insertMany(docs);
    console.log(`Seeded ${docs.length} default vendor categories`);
  }

  // Migrate existing vendors whose category is still a plain string (not a valid ObjectId)
  const Vendor = mongoose.models.Vendor || require('../models/Vendor');
  const allVendors = await Vendor.find().lean();
  const allCategories = await VendorCategory.find().lean();

  if (!allCategories.length) return;

  // Build a name → _id lookup (case-insensitive)
  const nameMap = {};
  allCategories.forEach((cat) => {
    nameMap[cat.name.toLowerCase()] = cat._id;
  });

  let migrated = 0;
  for (const vendor of allVendors) {
    const catVal = vendor.category;
    // Skip if already a valid ObjectId
    if (catVal && mongoose.Types.ObjectId.isValid(catVal) && String(catVal).length === 24) {
      // Check if the referenced category actually exists
      const exists = allCategories.some((c) => String(c._id) === String(catVal));
      if (exists) continue;
    }

    // Try to match by name, otherwise assign random
    let newCategoryId;
    if (typeof catVal === 'string') {
      newCategoryId = nameMap[catVal.toLowerCase()];
    }
    if (!newCategoryId) {
      newCategoryId = allCategories[Math.floor(Math.random() * allCategories.length)]._id;
    }

    await Vendor.updateOne({ _id: vendor._id }, { $set: { category: newCategoryId } });
    migrated++;
  }

  if (migrated > 0) {
    console.log(`Migrated ${migrated} vendor(s) to category ObjectId references`);
  }
};

module.exports = seedCategories;
