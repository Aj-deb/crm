require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { faker } = require("@faker-js/faker");

faker.locale = "en_IN";

const User = require("./models/User");
const Lead = require("./models/Lead");
const Customer = require("./models/Customer");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/crm_test";

// -----------------------------
// 🚀 Connect DB
// -----------------------------
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ DB Connection Error:", err);
    process.exit(1);
  }
};

// -----------------------------
// 🎲 Helpers
// -----------------------------
const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomBool = () => Math.random() < 0.5;

// Indian Names List
const indianNames = [
  "Aarav", "Vivaan", "Aditya", "Vihaan", "Krishna", "Kiaan",
  "Arjun", "Aryan", "Ishaan", "Rohan", "Kunal", "Kabir",

  "Ananya", "Aadhya", "Diya", "Saanvi", "Myra", "Ira",
  "Aarohi", "Kashish", "Niharika", "Prisha", "Navya", "Riya",

  "Simran Kaur", "Jaspreet Kaur", "Harpreet Singh", "Manish Sharma",
  "Rahul Verma", "Sagar Yadav", "Neha Gupta", "Karan Gill",
];

// Indian Companies
const indianCompanies = [
  "Tata Consultancy Services",
  "Infosys",
  "Wipro",
  "HCL Technologies",
  "Reliance Industries",
  "Adani Group",
  "Mahindra & Mahindra",
  "Maruti Suzuki",
  "HDFC Bank",
  "ICICI Bank",
  "Tech Mahindra",
];

// Indian Phone Number
const indianPhone = () =>
  `+91${faker.number.int({ min: 6000000000, max: 9999999999 })}`;

// Indian email (100% unique)
const indianEmail = (name) => {
  const clean = name.toLowerCase().replace(/ /g, ".");
  const timestamp = Date.now().toString().slice(-5);
  const rand = faker.number.int({ min: 100, max: 999 });
  return `${clean}.${timestamp}${rand}@gmail.com`;
};


// -----------------------------
// 🌱 Seeder
// -----------------------------
const seed = async () => {
  await connectDB();

  console.log("\n🧹 Clearing old data...");
  await User.deleteMany();
  await Lead.deleteMany();
  await Customer.deleteMany();

  // -----------------------------
  // 👤 1. Create Users
  // -----------------------------
  console.log("👥 Creating Indian Users...");

  const roles = ["admin", "manager", "sales", "support"];
  const passwordHash = await bcrypt.hash("123456", 10);

  const usersData = Array.from({ length: 40 }).map(() => {
    const name = randomFrom(indianNames);
    return {
      name,
      email: indianEmail(name),
      password: passwordHash,
      role: randomFrom(roles),
      status: randomBool() ? "active" : "inactive",
    };
  });

  const users = await User.insertMany(usersData);
  const activeUsers = users.filter((u) => u.status === "active");

  console.log(`➡️ ${users.length} Indian users created`);

  // -----------------------------
  // 📋 2. Create Leads
  // -----------------------------
  console.log("\n📋 Creating Indian Leads...");

  // Allowed by YOUR schema
  const sources = [
    "Website",
    "Referral",
    "Social Media",
    "Advertisement",
    "Email Campaign",
  ];

  const priorities = ["High", "Medium", "Low"];
  const ratings = ["Hot", "Warm", "Cold"];

  const leadsData = [];

  for (let i = 0; i < 500; i++) {
    const name = randomFrom(indianNames);
    const converted = Math.random() < 0.25;

    leadsData.push({
      name,
      email: indianEmail(name),
      phone: indianPhone(),
      company: randomFrom(indianCompanies),
      source: randomFrom(sources),
      priority: randomFrom(priorities),
      rating: randomFrom(ratings),
      score: faker.number.int({ min: 30, max: 90 }),
      status: converted ? "Converted" : "New",
      assignedTo: randomFrom(activeUsers)._id,
      createdBy: randomFrom(users)._id,
    });
  }

  const leads = await Lead.insertMany(leadsData);
  console.log(`➡️ ${leads.length} Indian leads created`);

  // -----------------------------
  // 💼 3. Create Customers
  // -----------------------------
  console.log("\n💼 Creating customers...");

  const convertedLeads = leads.filter((l) => l.status === "Converted");

  const customersData = convertedLeads.map((lead) => ({
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    company: lead.company,
    source: lead.source,
    createdFrom: lead._id,
  }));

  const customers = await Customer.insertMany(customersData);
  console.log(`➡️ ${customers.length} Indian customers created`);

  console.log("\n🎉 SEEDING COMPLETE WITH INDIAN DATA!");
  mongoose.connection.close();
};

// Run Seeder
seed().catch((err) => {
  console.error("❌ Seed Error:", err.message);
  mongoose.connection.close();
});
