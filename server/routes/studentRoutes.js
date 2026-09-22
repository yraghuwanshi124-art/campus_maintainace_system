const express = require("express");

const {
    createDemoStudents,
    getStudentByEnrollment,
} = require("../controllers/studentController");

const router = express.Router();

router.post("/create-demo", createDemoStudents);
router.get("/:enrollmentNumber", getStudentByEnrollment);

module.exports = router;