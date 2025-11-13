require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const faker = require("@faker-js/faker").faker;

const User = require("./models/User");
const Lead = require("./models/Lead");
const Customer = require("./models/Customer");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/crm_test";

const connectDB = async () => {
  await mongoose.connect(MONGO_URI);
  console.log("✅ MongoDB connected");
};

// 🧩 Random helper functions
const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomBool = () => Math.random() < 0.5;

// 🎯 Main Seeder
const seedData = async () => {
  await connectDB();
  console.log("🧹 Cleaning old data...");
  await Promise.all([
    User.deleteMany(),
    Lead.deleteMany(),
    Customer.deleteMany(),
  ]);

  // 🧠 Step 1: Users
  console.log("👥 Creating users...");
  const roles = ["admin", "manager", "sales", "support"];
  const userList = [];

  const passwordHash = await bcrypt.hash("123456", 10);

  for (let i = 0; i < 40; i++) {
    userList.push({
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      password: passwordHash,
      role: randomFrom(roles),
      status: randomBool() ? "active" : "inactive",
    });
  }

  const users = await User.insertMany(userList);
  console.log(`✅ ${users.length} users created`);

  // 🧩 Step 2: Leads
  console.log("📋 Creating leads...");
  const sources = [
    "Website",
    "Referral",
    "Social Media",
    "Advertisement",
    "Email Campaign",
  ];
  const priorities = ["High", "Medium", "Low"];
  const ratings = ["Hot", "Warm", "Cold"];

  const leadsList = [];

  for (let i = 0; i < 500; i++) {
    const assignedTo = randomFrom(users.filter((u) => u.status === "active"));
    const isConverted = Math.random() < 0.25; // 25% conversion chance

    leadsList.push({
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      phone: faker.phone.number(),
      company: faker.company.name(),
      source: randomFrom(sources),
      priority: randomFrom(priorities),
      rating: randomFrom(ratings),
      score: faker.number.int({ min: 30, max: 90 }),
      status: isConverted ? "Converted" : "New",
      assignedTo: assignedTo._id,
      createdBy: randomFrom(users)._id,
    });
  }

  const leads = await Lead.insertMany(leadsList);
  console.log(`✅ ${leads.length} leads created`);

  // 🧩 Step 3: Customers
  console.log("💼 Creating customers...");
  const convertedLeads = leads.filter((l) => l.status === "Converted");
  const customersList = [];

  for (let i = 0; i < convertedLeads.length; i++) {
    const lead = convertedLeads[i];
    customersList.push({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      source: lead.source,
      createdFrom: lead._id,
    });
  }

  const customers = await Customer.insertMany(customersList);
  console.log(`✅ ${customers.length} customers created`);

  console.log("🎉 Seeding complete!");
  mongoose.connection.close();
};

seedData().catch((err) => {
  console.error("❌ Seed error:", err);
  mongoose.connection.close();
});
