// Importing all the necessary modules
const express = require("express");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const router = express.Router();
const jwt = require("jsonwebtoken");

const JWT_SECRET = "ThisisthesignatureforJWTToken";

// ROUTE 1: Creating a user using POST: "/api/auth/createuser". No login required
router.post(
  "/createuser",

  // Checking for errors.
  [
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password must be atleast 8 characters").isLength({
      min: 8,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req); // Taking errors.

    // If errors are present, displaying errors.
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Else creating user.
    try {
      // Check whether with the same email already exists,
      let user = await User.findOne({ email: req.body.email.toLowerCase() });
      console.log(user);
      if (user) {
        return res
          .status(400)
          .json({ error: "User with this email already exists !" });
      }

      // If user doen't exist, create new user.
      // Hashing and securing the password.
      const salt = await bcrypt.genSalt(10);
      const securedPass = await bcrypt.hash(req.body.password, salt);
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: securedPass,
      });

      const data = {
        user: {
          id: user.id,
        },
      };

      // Give an authentication token to the user.
      const authToken = jwt.sign(data, JWT_SECRET);

      console.log("New account created !");
      console.log(authToken);
      //   res.json(user);
      res.json({ authToken });
    } catch (err) {
      // If some error occured
      console.error(err.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

// ROUTE 2: Authenticate a user using POST: "/api/auth/login". No login required
router.post(
  "/login",

  // Checking for errors.
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password must be atleast 8 characters").isLength({
      min: 8,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req); // Taking errors.

    // If errors are present, displaying errors.
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(400).json("Please login with correct credentials");
      }

      const comparePass = await bcrypt.compare(password, user.password); // Compares the current password hash with the database password hash and gives true of false.
      if (!comparePass) {
        return res.status(400).json("Please login with correct credentials");
      }

      // If everything matches
      data = {
        user: {
          id: user.id,
        },
      };

      const authToken = jwt.sign(data, JWT_SECRET);

      console.log("Account Matched");
      console.log(authToken);
      res.json({ authToken });
    } catch (err) {
      // If some error occured
      console.error(err.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

module.exports = router;
