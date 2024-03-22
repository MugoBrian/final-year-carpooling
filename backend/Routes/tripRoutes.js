const express = require("express");
const { isSignedIn } = require("../Controllers/authenticate");

var router = express.Router();
const {
  drive,
  ride,
  cancelTrip,
  tripDone,
  tripHistory,
  activeTrip,
  isDriver,
  trips,
  requestRide,
  driveRequests,
  rideRequests,
  updateRequest,
} = require("../Controllers/trip.js");

router.post("/trip/drive", isSignedIn, drive); // Swagger Api done
router.post("/trip/ride", isSignedIn, ride);
router.post("/trip/request", isSignedIn, requestRide); //Swagger Api done
router.delete("/trip", isSignedIn, cancelTrip); // Swagger Api pending
router.post("/trip/done", isSignedIn, tripDone); // Swagger Api pending
router.get("/trip/history", isSignedIn, tripHistory); // Swagger Api pending
router.get("/trip/isdriver", isSignedIn, isDriver);
router.get("/trip/activetrip", isSignedIn, activeTrip);
router.post("/trips/", isSignedIn, trips);
router.post("/drive/requests/", isSignedIn, driveRequests);
router.post("/ride/requests/", isSignedIn, rideRequests);
router.post("/update/request/", isSignedIn, updateRequest);
module.exports = router;
