const Student = require("../models/Student");

const createDemoStudents = async (req, res) => {
  try {
    const students = [
      {
        enrollmentNumber: "24AI1001",
        name: "Rahul Sharma",
        email: "rahul@medicaps.ac.in",
        department: "AI",
        semester: 3,
        classSection: "A",
        isActive: true,
      },
      {
        enrollmentNumber: "24AI1002",
        name: "Aman Verma",
        email: "aman@medicaps.ac.in",
        department: "AI",
        semester: 3,
        classSection: "A",
        isActive: true,
      },
      {
        enrollmentNumber: "24AI1003",
        name: "Rohit Yadav",
        email: "rohit@medicaps.ac.in",
        department: "AI",
        semester: 3,
        classSection: "B",
        isActive: true,
      },
    ];

    await Student.deleteMany({});

    const createdStudents = await Student.insertMany(students);

    res.status(201).json({
      message: "Demo students created successfully",
      students: createdStudents,
    });
  } catch (error) {
    console.error("Create students error:", error);

    res.status(500).json({
      message: "Failed to create students",
      error: error.message,
    });
  }
};

const getStudentByEnrollment = async (req, res) => {
    try {
        const { enrollmentNumber } = req.params;

        if (!enrollmentNumber) {
            return res.status(400).json({
                message: "Enrollment number is required",
            });
        }

        const student = await Student.findOne({
            enrollmentNumber: enrollmentNumber.toUpperCase(),
            isActive: true,
        }).select("-__v");

        if (!student) {
            return res.status(404).json({
                message: "Student not found in college records",
            });
        }

        res.json({
            message: "Student record found",
            student: {
                enrollmentNumber: student.enrollmentNumber,
                name: student.name,
                email: student.email,
                department: student.department,
                semester: student.semester,
                classSection: student.classSection,
            },
        });
    } catch (error) {
        console.error("Student lookup error:", error);

        res.status(500).json({
            message: "Failed to verify student",
        });
    }
};


module.exports = {
    createDemoStudents,
    getStudentByEnrollment,
};