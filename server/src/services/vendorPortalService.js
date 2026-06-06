const User = require('../models/User');
const { ROLES } = require('../utils/constants');

const DEFAULT_VENDOR_PASSWORD = 'Password@123';

const ensureVendorPortalUser = async (vendor) => {
  let user = await User.findOne({ email: vendor.email });
  let created = false;

  if (user) {
    user.role = ROLES.VENDOR;
    user.vendorId = vendor._id;
    user.status = 'active';
    if (!user.name) user.name = vendor.name;
    await user.save();
  } else {
    user = await User.create({
      name: vendor.name,
      email: vendor.email,
      password: DEFAULT_VENDOR_PASSWORD,
      role: ROLES.VENDOR,
      vendorId: vendor._id,
      status: 'active'
    });
    created = true;
  }

  return { user, created, defaultPassword: created ? DEFAULT_VENDOR_PASSWORD : null };
};

module.exports = { ensureVendorPortalUser, DEFAULT_VENDOR_PASSWORD };
