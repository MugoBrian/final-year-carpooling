const express = require("express");
const { check, validationResult } = require("express-validator");
// const distance = require('distance-matrix-api')
//const distance = require('google-distance-matrix')

var router = express.Router();
const {
  signOut,
  signUp,
  signIn,
  isSignedIn,
  deleteUser,
} = require("../Controllers/authenticate.js");

router.post(
  "/signup",
  [
    check("name", "name should be atleast 2 characters long").isLength({
      min: 2,
    }),
    check("email", "name should be atleast 5 characters long").isEmail(),
    check("password", "Should be atleast 3 char").isLength({ min: 3 }),
  ],
  signUp
);

router.post(
  "/signin",
  [
    check("email", "name should be atleast 5 characters long").isEmail(),
    check("password", "Should be atleast 3 char").isLength({ min: 3 }),
  ],
  signIn
);

router.delete("/delete", isSignedIn, deleteUser);
router.get("/signout", signOut);

module.exports = router;
