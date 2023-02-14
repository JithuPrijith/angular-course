const router = require("express").Router();
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/signup", (req, res) => {
  bcrypt.hash(req.body.password, 10).then((hash) => {
    const user = new User({
      email: req.body.email,
      password: hash,
    });
    user
      .save()
      .then((result) => {
        res.status(200).json({
          message: "user created successfully",
          result: result,
        });
      })
      .catch((err) => {
        res.status(500).json({
          error: err,
        });
      });
  });
});

router.post("/login", (req, res) => {
  let fetchedUser;
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res
          .status(404)
          .json({ message: "user not found or Auth failed" });
      }
      fetchedUser = user;
      return bcrypt.compare(req.body.password, user.password);
    })
    .then((result) => {
      if (!result) {
        return res
          .status(404)
          .json({ message: "user not found or Auth failed" });
      }
      const token = jwt.sign(
        { email: fetchedUser.email, userId: fetchedUser._id },
        "this is super key",
        { expiresIn: "1h" }
      );
      res.status(200).json({ token: token, expiresIn : 3600, userId : fetchedUser._id });
    })
    .catch((err) => {
      return res.status(404).json({ message: "user not found or Auth failed" });
    });
});

module.exports = router;
