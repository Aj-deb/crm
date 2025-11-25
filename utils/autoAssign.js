const User = require("../models/User");

async function autoAssignUser() {
  const employees = await User.find({ role: "employee" });

  if (!employees || employees.length === 0) {
    throw new Error("No employees available for auto assignment");
  }

  const randomIndex = Math.floor(Math.random() * employees.length);
  return employees[randomIndex]._id;
}

module.exports = { autoAssignUser };
