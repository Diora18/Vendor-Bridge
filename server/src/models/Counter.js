const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    value: { type: Number, default: 0 },
    prefix: { type: String, required: true },
    year: { type: Number, required: true }
  },
  { timestamps: true }
);

counterSchema.index({ name: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Counter', counterSchema);

