const User = require("../Models/user.js");

exports.deleteuserbyid = (req, res) => {
  User.findByIdAndDelete(req.query.id)
    .then((deletedUser) => {
      return res.send(`Deleted user: ${deletedUser}`);
    })
    .catch((error) => {
      return res.send(`Error deleting user: ${error}`).status(400);
    });
};

exports.deleteuserbyname_email = (req, res) => {
  User.findOneAndDelete({
    name: req.body.name,
    lastname: req.body.lastname,
    email: req.body.email,
  })
    .then((deletedUser) => {
      res.send(`Deleted user: ${deletedUser}`);
    })
    .catch((error) => {
      res.send(`Error deleting user: ${error}`);
    });
};
