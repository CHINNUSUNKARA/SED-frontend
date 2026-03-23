const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  logoUrl: String,
  websiteUrl: String,
  description: String,
  bannerImageUrl: String,
  longDescription: String,
  hiringRoles: [String],
  contact: {
    email: String,
    phone: String
  }
}, { timestamps: true });

const Partner = mongoose.model('Partner', partnerSchema);

module.exports = Partner;