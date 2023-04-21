var express = require("express");
var router = express.Router();
const mongoose = require("mongoose");
const { dbUrl } = require("../common/dbConfig");
const { student, mentor } = require("../schemas/userSchema");
const {
  hashPassword,
  hashCompare,
  createToken,
  validate,
} = require("../common/auth");

mongoose.connect(dbUrl);

// get all students
router.get("/", validate, async function (req, res) {
  try {
    let users = await student.find({}, { password: 0 });
    res.status(200).send({
      users,
      message: "Success",
    });
  } catch (error) {
    res.status(500).send({ message: "Interal Server Error" });
  }
});

//login student
router.post("/login", async function (req, res, next) {
  try {
    let user = await student.findOne({ email: req.body.email });
    console.log(user);
    if (user) {
      // verify password
      if (hashCompare(req.body.password, user.password)) {
        //create token
        let token = await createToken({
          name: user.name,
          email: user.email,
          id: user._id,
        });
        res.status(200).send({
          message: "User Signup Successful",
          token,
        });
      } else {
        res.status(402).send({ message: "Invalid Credentials" });
      }
    } else {
      res.status(400).send({ message: "User Doesnot Exists!" });
    }
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      error,
    });
  }
});

//signup student
router.post("/signup", async function (req, res) {
  try {
    let user = await student.findOne({ email: req.body.email });

    if (!user) {
      let hashedPassword = await hashPassword(req.body.password);
      req.body.password = hashedPassword;
      let user = await student.create(req.body);
      res.status(200).send({
        message: "Signup Successful",
      });
    } else {
      res.status(400).send({ message: "User already Exists!" });
    }
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.delete("/:id", async function (req, res) {
  try {
    let user = await student.findOne({ _id: req.params.id });

    if (user) {
      let user = await student.deleteOne({ _id: req.params.id });
      res.status(200).send({ message: "Delete Successful" });
    } else {
      res.status(400).send({ message: "User Not Found" });
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
