const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  tagline: String,
  description: String,
  features: [String]
}, { timestamps: true });

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;