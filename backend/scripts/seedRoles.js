const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const User = require('../models/User');

const SEED_PASSWORD = 'Password';

const roleUsers = [
  { name: 'Admin User',         email: 'admin@sed.com',         role: 'Admin' },
  { name: 'Marketing Agent',    email: 'marketing@sed.com',     role: 'MarketingAgent' },
  { name: 'Student User',       email: 'student@sed.com',       role: 'Student' },
  { name: 'Instructor User',    email: 'instructor@sed.com',    role: 'Instructor' },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(SEED_PASSWORD, salt);

  const results = [];

  for (const u of roleUsers) {
    const existing = await User.findOne({ email: u.email });
    if (existing) {
      console.log(`[SKIP] ${u.role} already exists: ${u.email}`);
      results.push({ name: existing.name, email: existing.email, role: existing.role, id: existing._id.toString() });
      continue;
    }

    const created = await User.create({
      name: u.name,
      email: u.email,
      password: hashed,
      role: u.role,
      isVerified: true,
    });

    console.log(`[CREATED] ${created.role}: ${created.email} (${created._id})`);
    results.push({ name: created.name, email: created.email, role: created.role, id: created._id.toString() });
  }

  const lines = [
    '# Seeded Role Users',
    '',
    `> Password for all accounts: \`${SEED_PASSWORD}\``,
    '',
    '| Role | Name | Email | ID |',
    '|------|------|-------|----|',
    ...results.map(r => `| ${r.role} | ${r.name} | ${r.email} | \`${r.id}\` |`),
    '',
    `_Generated: ${new Date().toISOString()}_`,
  ];

  const outPath = path.resolve(__dirname, '../seeded-users.md');
  fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
  console.log(`\nUser list written to: ${outPath}`);

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
