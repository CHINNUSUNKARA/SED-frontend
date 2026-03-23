const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    general: {
        platformName: { type: String, default: 'SED - Scholastic A Edu. Depot' },
        supportEmail: { type: String, default: 'support@sed-edu.com' },
        maintenanceMode: { type: Boolean, default: false },
        publicRegistration: { type: Boolean, default: true }
    },
    notifications: {
        emailAlerts: { type: Boolean, default: true },
        newStudentNotify: { type: Boolean, default: true },
        instructorAppNotify: { type: Boolean, default: true },
        marketingEmails: { type: Boolean, default: false }
    },
    security: {
        twoFactorAuth: { type: Boolean, default: true },
        minPasswordLength: { type: String, default: '8' },
        sessionTimeout: { type: String, default: '30' }
    },
    billing: {
        currency: { type: String, default: 'INR' },
        taxRate: { type: String, default: '18' },
        invoicePrefix: { type: String, default: 'SED-INV-' }
    }
}, { timestamps: true });

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function () {
    const settings = await this.findOne();
    if (settings) return settings;
    return await this.create({});
};

module.exports = mongoose.model('Settings', settingsSchema);
