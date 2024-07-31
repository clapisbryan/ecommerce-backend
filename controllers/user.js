const bcrypt = require("bcrypt");
const User = require("../models/User.js");
const auth = require("../auth.js");
const { errorHandler } = auth;

module.exports.registerUser = (req, res) => {
  if (!req.body.email.includes("@")) {
    return res.status(400).send({ message: "Email Invalid" });
  } else if (req.body.mobileNo.length !== 11) {
    return res.status(400).send({ message: "Mobile number invalid" });
  } else if (req.body.password.length < 8) {
    return res
      .status(400)
      .send({ message: "Password must be atleast 8 characters" });
  } else {
    let newUser = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      mobileNo: req.body.mobileNo,
      password: bcrypt.hashSync(req.body.password, 10),
    });

    return newUser
      .save()
      .then((result) =>
        res.status(201).send({ message: "Registered Successfully" })
      )
      .catch((error) => errorHandler(error, req, res));
  }
};

module.exports.loginUser = (req, res) => {
  return User.findOne({ email: req.body.email })
    .then((result) => {
      if (!req.body.email.includes("@")) {
        return res.status(400).send({ error: "Invalid Email" });
      } else if (result == null) {
        return res.send({ error: "No Email Found" });
      } else {
        const isPasswordCorrect = bcrypt.compareSync(
          req.body.password,
          result.password
        );

        if (isPasswordCorrect) {
          return res.send({ access: auth.createAccessToken(result) });
        } else {
          return res.send({ error: "Email and password do not match" });
        }
      }
    })
    .catch((error) => errorHandler(error, req, res));
};

module.exports.showUserDetails = (req, res) => {
  const userId = req.user.id;

  return User.findById(userId)
    .then(user => {
      if (!user) {
        res.status(404).send({ error: 'User not found' });
      }
      user.password = undefined;
      return res.status(200).send({ user });
    })
    .catch(err => res.status(500).send({ error: 'Failed to fetch user profile', details: err }));
};
module.exports.updateUser = async (req, res) => {
  console.log("reqBody", req.body);
  const { id } = req.user

  if (!req.body.email.includes("@")) {
    return res.status(400).send({ message: "Email Invalid" });
  } else if (req.body.mobileNo.length !== 11) {
    return res.status(400).send({ message: "Mobile number invalid" });
  } else {
    return await User.findByIdAndUpdate(id, {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      mobileNo: req.body.mobileNo
    }, { new: true })
      .then(result => {
        if (result) {
          return res.status(200).send({ message: "Successfully updated", user: result });
        } else {
          return res.status(404).send({ message: "User not found" });
        }
      })
      .catch((error) => errorHandler(error, req, res));
  }


}

module.exports.updateAdmin = async (req, res) => {
  let adminUserId = req.user.id; //user id after generated token
  let userId = req.params.id; // Get userId from url

  return await User.findById(adminUserId) // use find function/method for specific user id
    .then((result) => {
      // result handle a data of user
      if (!result || !result.isAdmin) {
        // check if a result doesn't have a data and if result has a isAdmin not true
        return res.status(403).send({ message: "Unauthorized" });
      }

      return User.findById(userId) // use find function/method for specific user to change a isAdmin property from false to true
        .then((result) => {
          if (!result) {
            return res.status(404).send({
              error: "Failed to Find",
              details: {},
            });
          } else if (result.isAdmin) {
            return res.status(201).send({ message: "Admin already" });
          } else {
            result.isAdmin = true;
            result.save().then(() => res.status(200).send({ updatedUser: result }));
          }
        })
        .catch((error) => errorHandler(error, req, res));
    })
    .catch((error) => errorHandler(error, req, res));
};

module.exports.updatePassword = (req, res) => {
  const { newPassword } = req.body;
  const { id } = req.user; // Extracting user ID from the authorization header
  console.log("newPassword", newPassword);
  console.log("id", id);

  // Hashing the new password
  bcrypt
    .hash(newPassword, 10)
    .then((hashedPassword) => {
      // Updating the user's password in the database
      return User.findByIdAndUpdate(id, { password: hashedPassword });
    })
    .then(() => {
      // Sending a success response
      res.status(200).send({ message: "Password reset successfully" });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send({ message: "Internal server error" });
    });
};
