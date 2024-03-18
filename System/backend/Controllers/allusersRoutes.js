//import  u from "../Models/user.js";
const User = require("../Models/user.js");
const allusersRoutes = (req, res) => {
  User.find().exec((err, ud) => {
    // if(err){
    //     res.status(400).json({
    //         error:"no user found"
    //     })
    // }
    res.json(ud);
  });
};

const userDetails = (req, res) => {
  User.findById(req.query.userId, (err, user) => {
    if (err) return res.status(500).end();
    return res.status(200).json({ user });
  });
};

const updateUserDetailsVehicles = async (req, res) => {
  try {
    // Validate user ID and request body

    const {
      userId,
      VehicleName,
      VehicleMake,
      VehicleModel,
      VehicleSeats,
      VehicleYear,
    } = req.body;

    const missingFields = [];
    const requiredFields = [
      "userId",
      "VehicleName",
      "VehicleMake",
      "VehicleModel",
      "VehicleSeats",
      "VehicleYear",
    ];

    for (const field of requiredFields) {
      if (!req.body[field]) {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      const message = `Error: Missing required vehicle details: \n\n ${missingFields.join(
        ", "
      )}`;
      return res.status(400).send({ message });
    } else {
      // Update user document
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            VehicleName,
            VehicleMake,
            VehicleModel,
            VehicleSeats,
            VehicleYear,
          },
        },
        {
          new: true,
        }
      ); // Return updated doc

      if (!updatedUser) {
        return res.status(404).send({ message: "Error: User not found" });
      } else {
        return res.status(200).send({
          message: "Vehicle details updated successfully",
          updatedUser,
        });
      }
    }
  } catch (error) {
    return res
      .status(500)
      .send({ message: "Error: updating user vehicle details" });
  }
};

module.exports = { allusersRoutes, userDetails, updateUserDetailsVehicles };
