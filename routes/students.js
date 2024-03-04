const express = require('express');
const data = require('../data/2024-spring-student-info.json');

const studentsRouter = express.Router();

// Helper function to get client info
const getClientInfo = (req) => ({
  IP: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
  deviceType: req.headers['user-agent'],
});

// GET / - Retrieve all student information
studentsRouter.get('/', (req, res) => {
  res.json({ ...getClientInfo(req), students: data });
});

// POST / - Retrieve information based on 'student-id'
studentsRouter.post('/', (req, res) => {
  const { student_id } = req.body;
  const clientInfo = getClientInfo(req);

  if (!student_id) {
    return res.status(400).json({ ...clientInfo, message: 'student_id is required' });
  }

  const studentInfo = data.find((student) => student.student_id === student_id);
  if (studentInfo) {
    res.json({ ...clientInfo, student: studentInfo });
  } else {
    res.status(404).json({ ...clientInfo, message: 'Student not found' });
  }
});

// POST /course - Retrieve student's info who has taken a specific course
studentsRouter.post('/course', (req, res) => {
  const { course_id } = req.body;
  const clientInfo = getClientInfo(req);

  const studentsWithCourse = data.filter((student) =>
    student.courses.some((course) => course.course_id === course_id)
  ).map((student) => student.student_id);

  if (studentsWithCourse.length > 0) {
    res.json({ ...clientInfo, students: studentsWithCourse });
  } else {
    res.status(404).json({ ...clientInfo, message: 'No students found for the given course' });
  }
});

// POST /sameclass/exceptCS548
studentsRouter.post('/sameclass/exceptCS548', (req, res) => {
    const { student_id } = req.body;
    const clientInfo = getClientInfo(req);
  
    if (!student_id) {
      return res.status(400).json({ ...clientInfo, message: 'student_id is required' });
    }
  
    const requestingStudent = data.find((s) => s.student_id === student_id);
  
    if (!requestingStudent) {
      return res.status(404).json({ ...clientInfo, message: 'Requesting student not found' });
    }
  
    const coursesTaken = requestingStudent.courses
      .filter((course) => course.course_id !== 'CS548')
      .map((course) => course.course_id);
  
    const studentsWithSharedCourses = data
      .filter((s) => 
        s.student_id !== student_id &&
        s.courses.some((course) => coursesTaken.includes(course.course_id))
      )
      .map((s) => s.student_id);
  
    if (studentsWithSharedCourses.length > 0) {
      res.json({ ...clientInfo, students: studentsWithSharedCourses });
    } else {
      res.status(404).json({ ...clientInfo, message: 'No students found with shared courses' });
    }
  });
  
  module.exports = studentsRouter;
  