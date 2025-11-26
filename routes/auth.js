const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getProfile } = require("../controllers/auth");
const auth = require("../middleware/auth");


router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", auth, getProfile);

module.exports = router;
