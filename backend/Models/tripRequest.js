const mongoose = require("mongoose");
const schema = mongoose.Schema;
const tripRequestSchema = new schema(
  {
    driver: {
      type: mongoose.ObjectId,
      require: true,
    },
    driverName: {
      type: String,
      require: false,
    },
    source: {
      type: Object,
      required: true,
    },
    destination: {
      type: Object,
      required: true,
    },
    pickUpPoints: {
      type: Array,
      required: false,
    },
    rider: {
      type: mongoose.ObjectId,
      require: true,
    },
    riderName: {
      type: String,
      require: false,
    },
    trip: {
      type: mongoose.ObjectId,
      require: true,
    },
    pickUpTime: {
      type: Date,
      required: false,
    },
    state: {
      type: String,
      default: "pending",
    },
    passengers_booked: {
      type: Number,
      require: true,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("tripRequest", tripRequestSchema);
