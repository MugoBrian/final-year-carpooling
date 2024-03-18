/* temporary route to get all the user information*/
//import express from "express";
const express = require("express");
var router = express.Router();

const {
  allusersRoutes,
  userDetails,
  updateUserDetailsVehicles,
} = require("../Controllers/allusersRoutes.js");

router.get("/users", allusersRoutes);
router.get("/user/details", userDetails);
router.post("/user/updatedetails", updateUserDetailsVehicles);

module.exports = router;
