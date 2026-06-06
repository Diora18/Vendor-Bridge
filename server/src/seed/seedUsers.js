const connectDb = require('../config/db');
const mongoose = require('mongoose');
const User = require('../models/User');
const { ROLES } = require('../utils/constants');

const demoUsers = [
  { name: 'Admin User', email: 'admin@vendorbridge.local', role: ROLES.ADMIN },
  { name: 'Procurement Officer', email: 'procurement_officer@vendorbridge.local', role: ROLES.PROCUREMENT_OFFICER },
  { name: 'Manager Approver', email: 'manager@vendorbridge.local', role: ROLES.MANAGER },
  { name: 'Vendor User', email: 'vendor@vendorbridge.local', role: ROLES.VENDOR }
];

const seedUsers = async () => {
  try {
    await connectDb();

    for (const u of demoUsers) {
      const existing = await User.findOne({ email: u.email }).exec();
      if (existing) {
        // update fields and set new password (will be hashed in pre-save hook)
        existing.name = u.name || existing.name;
        existing.role = u.role || existing.role;
        existing.status = 'active';
        existing.password = 'Password@123';
        await existing.save();
        console.log(`Updated existing user: ${u.email} (${u.role})`);
      } else {
        const user = new User({ ...u, password: 'Password@123', status: 'active' });
        await user.save();
        console.log(`Created user: ${u.email} (${u.role})`);
      }
    }
    console.log('Demo users seeded. Password for all accounts: Password@123');

    // Ensure demo vendor records exist and attach to vendor user
    const Vendor = require('../models/Vendor');
    const VendorCategory = require('../models/VendorCategory');

    // Look up category IDs for demo vendors
    const allCategories = await VendorCategory.find().lean();
    const catByName = {};
    allCategories.forEach((c) => { catByName[c.name.toLowerCase()] = c._id; });
    const randomCat = () => allCategories[Math.floor(Math.random() * allCategories.length)]._id;

    const demoVendors = [
      { name: 'Acme Supplies', companyName: 'Acme Supplies Pvt Ltd', email: 'acme@vendorbridge.local', category: catByName['raw materials'] || randomCat() },
      { name: 'Global Traders', companyName: 'Global Traders LLC', email: 'global@vendorbridge.local', category: catByName['logistics & transport'] || randomCat() }
    ];

    const createdVendors = [];
    for (const v of demoVendors) {
      const existing = await Vendor.findOne({ email: v.email }).exec();
      if (existing) {
        createdVendors.push(existing);
        continue;
      }
      const vendor = new Vendor({ ...v, status: 'active' });
      await vendor.save();
      createdVendors.push(vendor);
      console.log(`Created vendor: ${vendor.companyName}`);
    }

    const { ensureVendorPortalUser } = require('../services/vendorPortalService');

    const allVendors = await Vendor.find().exec();
    for (const vendor of allVendors) {
      const portal = await ensureVendorPortalUser(vendor);
      console.log(`Vendor portal ready: ${portal.user.email} -> ${vendor.companyName}`);
    }

    // Keep generic demo vendor login linked to Acme for quick testing
    const vendorUser = await User.findOne({ email: 'vendor@vendorbridge.local' }).exec();
    if (vendorUser && createdVendors[0]) {
      vendorUser.vendorId = createdVendors[0]._id;
      vendorUser.role = ROLES.VENDOR;
      await vendorUser.save();
      console.log(`Demo shortcut: vendor@vendorbridge.local -> ${createdVendors[0].companyName}`);
    }
  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    mongoose.connection.close();
  }
};

seedUsers();

