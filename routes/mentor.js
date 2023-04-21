var express = require("express");
var router = express.Router();
const mongoose = require("mongoose");
const { dbUrl } = require("../common/dbConfig");
const { mentor, student } = require("../schemas/userSchema");
const {
  hashPassword,
  hashCompare,
  createToken,
  validate,
} = require("../common/auth");
mongoose.connect(dbUrl);
// Get mentors

router.get("/", validate, async function (req, res, next) {
  try {
    let users = await mentor.find({}, { password: 0 });
    res.status(200).send({
      users,
      message: "Data Fetched",
    });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

//login

router.post("/login", async function (req, res, next) {
  try {
    let user = await mentor.findOne({ email: req.body.email });

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

// signup

router.post("/signup", async function (req, res) {
  try {
    let user = await mentor.findOne({ email: req.body.email });

    if (!user) {
      let hashedPassword = await hashPassword(req.body.password);
      req.body.password = hashedPassword;
      let user = await mentor.create(req.body);
      res.status(200).send({
        message: "SignUp Successful",
      });
    } else {
      res.status(400).send({ message: "User Already Exists" });
    }
  } catch (error) {
    res.status(500).send({ message: "Internal Error" });
  }
});

//show all students of a mentor
router.get("/studdata", async function (req, res) {
  try {
    let user = await mentor
      .findById(req.body.id)
      .populate("studentsAssigned", "name");

    res.status(200).send({
      user,
      message: "Student data Fetched",
    });
  } catch (error) {
    res.status(500).send({ message: "Internal Error" });
  }
});

//delete

router.delete("/:id", async function (req, res) {
  try {
    let user = await mentor.findOne({ _id: req.params.id });

    if (user) {
      let user = await mentor.deleteOne({ _id: req.params.id });

      res.status(200).send({
        message: "Delete Successful",
      });
    } else {
      res.status(400).send({ message: "User Doesnot Exists" });
    }
  } catch (error) {
    res.status(500).send({ message: "Internal Error" });
  }
});

module.exports = router;
