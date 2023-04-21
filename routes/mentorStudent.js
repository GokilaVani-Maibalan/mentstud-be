// const express = require('express');
const router = require("express").Router();
const mongoose = require("mongoose");
// const objId = mongoose.Types.ObjectId;
const { dbUrl } = require("../common/dbConfig");

mongoose.connect(dbUrl);

const { mentor, student } = require("../schemas/userSchema");

//Assign student to mentor and vice versa

router.post("/", async (req, res) => {
  try {
    let mentorData = await mentor.findById(req.body.mentorId);
    let temp_studentsAssigned = [];

    await req.body.studentsArray.forEach(async (stud_item) => {
      const temp_stud = await student.findById(stud_item);

      if (temp_stud) {
        if (!mentorData.studentsAssigned.includes(stud_item)) {
          temp_stud.mentorAssigned = req.body.mentorId;
          temp_studentsAssigned.push(stud_item);
          await temp_stud.save();
          mentorData.studentsAssigned = [
            ...mentorData.studentsAssigned,
            ...temp_studentsAssigned,
          ];
          await mentorData.save();
        }
      }
    });

    res.status(200).send({
      mentorData,
      message: "Student and Mentor Assigned Succesfully!",
    });
  } catch (error) {
    res.status(500).send({ error, message: "Internal Server Error" });
  }
});

//student with no Mentor

router.get("/noment", async (req, res) => {
  try {
    let studentData = await student.find({ mentorAssigned: null });

    res.status(200).send({
      studentData,
      message: "Student Data Fetched!",
    });
  } catch (error) {
    res.status(500).send({ error, message: "Internal Server Error" });
  }
});

//Modify mentor to student and show OldMentor data
router.put("/:id", async (req, res) => {
  try {
    //student data
    let studentData = await student.find({ _id: req.params.id });
    const oldMentorId = studentData[0].mentorAssigned;

    //oldeMentor data
    let oldMentorData = await mentor.find(oldMentorId);
    let students = oldMentorData[0].studentsAssigned;
    if (students.includes(studentData[0].id)) {
      students.pop(studentData[0].id);
      oldMentorData[0].studentsAssigned = students;
    }

    //assigning new mentor to student
    studentData[0].mentorAssigned = req.body.mentorId;
    studentData[0].save();
    oldMentorData[0].save();

    //new mentor data
    let newMentorData = await mentor.findById(req.body.mentorId);

    if (!newMentorData.studentsAssigned.includes({ _id: req.params.id })) {
      newMentorData.studentsAssigned = [
        ...newMentorData.studentsAssigned,
        req.params.id,
      ];
    }

    newMentorData.save();

    res.status(200).send({
      studentData,
      oldMentorData,
      newMentorData,
      message: "Successful",
    });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

module.exports = router;
