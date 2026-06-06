const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    companyName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'VendorCategory', required: true },
    gstNumber: { type: String, trim: true },
    address: { type: String, trim: true },
    status: {
      type: String,
      enum: ['active', 'inactive', 'blacklisted'],
      default: 'active'
    },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vendor', vendorSchema);

