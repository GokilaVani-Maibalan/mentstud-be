const validator = require("validator");
const mongoose = require("mongoose");

const schema = mongoose.Schema;

// mentor Schema
let mentorSchema = schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      validate: (value) => {
        return validator.isEmail(value);
      },
    },
    mobile: { type: String, default: "000-000-0000" },
    experience: { type: String, required: true },
    studentsAssigned: [
      { type: schema.Types.ObjectId, ref: "student", default: null },
    ],
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  {
    collection: "mentor",
    versionKey: false,
  }
);

//student Schema

let StudSchema = schema(
  {
    name: { type: String, required: true },
    batch: { type: String, required: true },
    course: { type: String, required: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      validate: (value) => validator.isEmail(value),
    },
    mentorAssigned: {
      type: schema.Types.ObjectId,
      ref: "mentor",
      default: null,
    },
    mobile: { type: String, default: "000-000-0000" },
    password: { type: String, required: true },
  },
  {
    collection: "student",
    versionKey: false,
  }
);

let student = mongoose.model("student", StudSchema);
let mentor = mongoose.model("mentor", mentorSchema);
module.exports = { mentor, student };
