const Class = require("../models/Class");
const mongoose = require("mongoose");

const httpStatus = require("../utils/httpStatus");
const AppError = require("../utils/appError");
const asyncWrapper = require("../middlewares/asyncWrapper");

// =========================
// Classes
// =========================

const createClass = asyncWrapper(async (req, res, next) => {
  const { name } = req.body;

  const newClass = await Class.create({
    name: name.trim(),
    groups: [],
  });

  res.status(201).json({
    status: httpStatus.SUCCESS,
    class: newClass,
  });
});

const getClasses = asyncWrapper(async (req, res, next) => {
  const classes = await Class.find().sort({
    createdAt: -1,
  });

  res.status(200).json({
    status: httpStatus.SUCCESS,
    classes,
  });
});

const getClass = asyncWrapper(async (req, res, next) => {
  const classData = await Class.findById(req.params.classId);

  if (!classData) {
    return next(new AppError("Class not found", 404, httpStatus.FAIL));
  }

  const classObject = classData.toObject();

  const groups = classObject.groups.map((group) => {
    const students = group.students.map((student) => {
      const attendance = [...student.attendance].sort(
        (a, b) => new Date(b.date) - new Date(a.date),
      );

      const previousAttendance = attendance[0] || null;

      const attended = attendance.filter(
        (record) => record.status === "present",
      ).length;

      const total = attendance.length;

      const attendanceRate =
        total > 0 ? Number(((attended / total) * 100).toFixed(2)) : 0;

      return {
        ...student,
        attendanceRate,
        absentPreviousLesson: previousAttendance?.status === "absent",
      };
    });

    return {
      ...group,
      students,
    };
  });

  res.status(200).json({
    status: httpStatus.SUCCESS,
    class: {
      ...classObject,
      groups,
    },
  });
});

const updateClass = asyncWrapper(async (req, res, next) => {
  const { name } = req.body;

  const classData = await Class.findById(req.params.classId);

  if (!classData) {
    return next(new AppError("Class not found", 404, httpStatus.FAIL));
  }

  if (name && name.trim()) {
    const duplicate = await Class.findOne({
      name: name.trim(),
      _id: { $ne: classData._id },
    });

    if (duplicate) {
      return next(
        new AppError(
          "Another class already has this name",
          400,
          httpStatus.FAIL,
        ),
      );
    }

    classData.name = name.trim();
  }

  await classData.save();

  res.status(200).json({
    status: httpStatus.SUCCESS,
    class: classData,
  });
});

const deleteClass = asyncWrapper(async (req, res, next) => {
  const classData = await Class.findByIdAndDelete(req.params.classId);

  if (!classData) {
    return next(new AppError("Class not found", 404, httpStatus.FAIL));
  }

  res.status(200).json({
    status: httpStatus.SUCCESS,
    message: "Class deleted successfully",
  });
});

// =========================
// Groups
// =========================

const addGroup = asyncWrapper(async (req, res, next) => {
  const { name } = req.body;

  const classData = await Class.findById(req.params.classId);

  if (!classData) {
    return next(new AppError("Class not found", 404, httpStatus.FAIL));
  }

  const groupName = name.trim();

  const duplicate = classData.groups.find(
    (group) => group.name.toLowerCase() === groupName.toLowerCase(),
  );

  if (duplicate) {
    return next(
      new AppError("Another group already has this name", 400, httpStatus.FAIL),
    );
  }

  classData.groups.push({
    name: groupName,
    nextStudentCode: 1,
    currentSessionId: null,
    students: [],
  });

  await classData.save();

  const group = classData.groups[classData.groups.length - 1];

  res.status(201).json({
    status: httpStatus.SUCCESS,
    group,
  });
});

const getGroups = asyncWrapper(async (req, res, next) => {
  const classData = await Class.findById(req.params.classId);

  if (!classData) {
    return next(new AppError("Class not found", 404, httpStatus.FAIL));
  }

  res.status(200).json({
    status: httpStatus.SUCCESS,
    groups: classData.groups,
  });
});

const getGroup = asyncWrapper(async (req, res, next) => {
  const classData = await Class.findById(req.params.classId);

  if (!classData) {
    return next(new AppError("Class not found", 404, httpStatus.FAIL));
  }

  const group = classData.groups.id(req.params.groupId);

  if (!group) {
    return next(new AppError("Group not found", 404, httpStatus.FAIL));
  }

  const students = group.students.map((student) => {
    const attendance = [...student.attendance].sort(
      (a, b) => new Date(b.date) - new Date(a.date),
    );

    const previousAttendance = attendance[0] || null;

    const attended = attendance.filter(
      (record) => record.status === "present",
    ).length;

    const total = attendance.length;

    const attendanceRate =
      total > 0 ? Number(((attended / total) * 100).toFixed(2)) : 0;

    return {
      ...student.toObject(),
      attendanceRate,
      absentPreviousLesson: previousAttendance?.status === "absent",
    };
  });

  res.status(200).json({
    status: httpStatus.SUCCESS,
    group: {
      ...group.toObject(),
      students,
    },
  });
});

const updateGroup = asyncWrapper(async (req, res, next) => {
  const { name } = req.body;

  const classData = await Class.findById(req.params.classId);

  if (!classData) {
    return next(new AppError("Class not found", 404, httpStatus.FAIL));
  }

  const group = classData.groups.id(req.params.groupId);

  if (!group) {
    return next(new AppError("Group not found", 404, httpStatus.FAIL));
  }

  if (name !== undefined) {
    const groupName = name.trim();

    if (!groupName) {
      return next(
        new AppError("Group name cannot be empty", 400, httpStatus.FAIL),
      );
    }

    const duplicate = classData.groups.find(
      (item) =>
        item._id.toString() !== group._id.toString() &&
        item.name.toLowerCase() === groupName.toLowerCase(),
    );

    if (duplicate) {
      return next(
        new AppError(
          "Another group already has this name",
          400,
          httpStatus.FAIL,
        ),
      );
    }

    group.name = groupName;
  }

  await classData.save();

  res.status(200).json({
    status: httpStatus.SUCCESS,
    group,
  });
});

const deleteGroup = asyncWrapper(async (req, res, next) => {
  const classData = await Class.findById(req.params.classId);

  if (!classData) {
    return next(new AppError("Class not found", 404, httpStatus.FAIL));
  }

  const group = classData.groups.id(req.params.groupId);

  if (!group) {
    return next(new AppError("Group not found", 404, httpStatus.FAIL));
  }

  if (group.currentSessionId) {
    return next(
      new AppError(
        "Cannot delete a group while attendance session is active",
        400,
        httpStatus.FAIL,
      ),
    );
  }

  group.deleteOne();

  await classData.save();

  res.status(200).json({
    status: httpStatus.SUCCESS,
    message: "Group deleted successfully",
  });
});

// =========================
// Students
// =========================

const addStudent = asyncWrapper(async (req, res, next) => {
  const { name, phoneStudent, phoneParent } = req.body;

  const classData = await Class.findById(req.params.classId);

  if (!classData) {
    return next(new AppError("Class not found", 404, httpStatus.FAIL));
  }

  const group = classData.groups.id(req.params.groupId);

  if (!group) {
    return next(new AppError("Group not found", 404, httpStatus.FAIL));
  }

  const studentCode = group.nextStudentCode;

  group.students.push({
    code: studentCode,
    name: name.trim(),
    phoneStudent: phoneStudent?.trim() || "",
    phoneParent: phoneParent?.trim() || "",
    attendance: [],
    exams: [],
    contacts: [],
  });
  group.nextStudentCode += 1;

  await classData.save();

  const student = group.students[group.students.length - 1];

  res.status(201).json({
    status: httpStatus.SUCCESS,
    student,
  });
});

const getStudents = asyncWrapper(async (req, res, next) => {
  const classData = await Class.findById(req.params.classId);

  if (!classData) {
    return next(new AppError("Class not found", 404, httpStatus.FAIL));
  }

  const group = classData.groups.id(req.params.groupId);

  if (!group) {
    return next(new AppError("Group not found", 404, httpStatus.FAIL));
  }

  const students = group.students.map((student) => {
    const attendance = [...student.attendance].sort(
      (a, b) => new Date(b.date) - new Date(a.date),
    );

    const previousAttendance = attendance[0] || null;

    const attended = attendance.filter(
      (record) => record.status === "present",
    ).length;

    const total = attendance.length;

    const attendanceRate =
      total > 0 ? Number(((attended / total) * 100).toFixed(2)) : 0;

    return {
      ...student.toObject(),
      attendanceRate,
      absentPreviousLesson: previousAttendance?.status === "absent",
    };
  });

  res.status(200).json({
    status: httpStatus.SUCCESS,
    students,
  });
});

const getStudent = asyncWrapper(async (req, res, next) => {
  const classData = await Class.findById(req.params.classId);

  if (!classData) {
    return next(new AppError("Class not found", 404, httpStatus.FAIL));
  }

  const group = classData.groups.id(req.params.groupId);

  if (!group) {
    return next(new AppError("Group not found", 404, httpStatus.FAIL));
  }

  const code = Number(req.params.code);

  const student = group.students.find((student) => student.code === code);

  if (!student) {
    return next(new AppError("Student not found", 404, httpStatus.FAIL));
  }

  const attendance = [...student.attendance].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );

  const attended = attendance.filter(
    (record) => record.status === "present",
  ).length;

  const total = attendance.length;

  const attendanceRate =
    total > 0 ? Number(((attended / total) * 100).toFixed(2)) : 0;

  res.status(200).json({
    status: httpStatus.SUCCESS,
    student: {
      ...student.toObject(),
      attendanceRate,
      absentPreviousLesson: attendance[0]?.status === "absent",
    },
  });
});

const updateStudent = asyncWrapper(async (req, res, next) => {
  const { name, phoneStudent, phoneParent } = req.body;

  const classData = await Class.findById(req.params.classId);

  if (!classData) {
    return next(new AppError("Class not found", 404, httpStatus.FAIL));
  }

  const group = classData.groups.id(req.params.groupId);

  if (!group) {
    return next(new AppError("Group not found", 404, httpStatus.FAIL));
  }

  const code = Number(req.params.code);

  const student = group.students.find((student) => student.code === code);

  if (!student) {
    return next(new AppError("Student not found", 404, httpStatus.FAIL));
  }

  if (name !== undefined) {
    if (!name.trim()) {
      return next(
        new AppError("Student name cannot be empty", 400, httpStatus.FAIL),
      );
    }

    student.name = name.trim();
  }

  if (phoneStudent !== undefined) {
    student.phoneStudent = phoneStudent.trim();
  }

  if (phoneParent !== undefined) {
    student.phoneParent = phoneParent.trim();
  }

  await classData.save();

  res.status(200).json({
    status: httpStatus.SUCCESS,
    student,
  });
});

const deleteStudent = asyncWrapper(async (req, res, next) => {
  const classData = await Class.findById(req.params.classId);

  if (!classData) {
    return next(new AppError("Class not found", 404, httpStatus.FAIL));
  }

  const group = classData.groups.id(req.params.groupId);

  if (!group) {
    return next(new AppError("Group not found", 404, httpStatus.FAIL));
  }

  const code = Number(req.params.code);

  const student = group.students.find((student) => student.code === code);

  if (!student) {
    return next(new AppError("Student not found", 404, httpStatus.FAIL));
  }

  student.deleteOne();

  await classData.save();

  res.status(200).json({
    status: httpStatus.SUCCESS,
    message: "Student deleted successfully",
  });
});

// =========================
// Attendance
// =========================

const startAttendanceSession = asyncWrapper(async (req, res, next) => {
  const classData = await Class.findById(req.params.classId);

  if (!classData) {
    return next(new AppError("Class not found", 404, httpStatus.FAIL));
  }

  const group = classData.groups.id(req.params.groupId);

  if (!group) {
    return next(new AppError("Group not found", 404, httpStatus.FAIL));
  }

  if (group.currentSessionId) {
    return next(
      new AppError(
        "Attendance session is already active",
        400,
        httpStatus.FAIL,
      ),
    );
  }

  const sessionId = new mongoose.Types.ObjectId();
  const attendanceDate = new Date();

  for (const student of group.students) {
    student.attendance.push({
      sessionId,
      date: attendanceDate,
      status: "absent",
    });

    student.lastStatus = "absent";
  }

  group.currentSessionId = sessionId;

  await classData.save();

  res.status(201).json({
    status: httpStatus.SUCCESS,
    message: "Attendance session started successfully",
    sessionId,
    date: attendanceDate,
  });
});

const IsSessionActive = asyncWrapper(async (req, res, next) => {
  const classData = await Class.findById(req.params.classId);

  if (!classData) {
    return next(new AppError("Class not found", 404, httpStatus.FAIL));
  }

  const group = classData.groups.id(req.params.groupId);

  if (!group) {
    return next(new AppError("Group not found", 404, httpStatus.FAIL));
  }

  res.status(200).json({
    status: httpStatus.SUCCESS,
    active: Boolean(group.currentSessionId),
    sessionId: group.currentSessionId,
  });
});

const markPresent = asyncWrapper(async (req, res, next) => {
  const classData = await Class.findById(req.params.classId);

  if (!classData) {
    return next(new AppError("Class not found", 404, httpStatus.FAIL));
  }

  const group = classData.groups.id(req.params.groupId);

  if (!group) {
    return next(new AppError("Group not found", 404, httpStatus.FAIL));
  }

  if (!group.currentSessionId) {
    return next(
      new AppError("No attendance session is active", 400, httpStatus.FAIL),
    );
  }

  const code = Number(req.params.code);

  const student = group.students.find((student) => student.code === code);

  if (!student) {
    return next(new AppError("Student not found", 404, httpStatus.FAIL));
  }

  const attendance = student.attendance.find(
    (record) =>
      record.sessionId.toString() === group.currentSessionId.toString(),
  );

  if (!attendance) {
    return next(
      new AppError(
        "Attendance record not found for current session",
        400,
        httpStatus.FAIL,
      ),
    );
  }

  attendance.status = "present";
  attendance.date = new Date();

  student.lastStatus = "present";

  await classData.save();

  res.status(200).json({
    status: httpStatus.SUCCESS,
    message: "Student marked as present",
    student,
  });
});

const endAttendanceSession = asyncWrapper(async (req, res, next) => {
  const classData = await Class.findById(req.params.classId);

  if (!classData) {
    return next(new AppError("Class not found", 404, httpStatus.FAIL));
  }

  const group = classData.groups.id(req.params.groupId);

  if (!group) {
    return next(new AppError("Group not found", 404, httpStatus.FAIL));
  }

  if (!group.currentSessionId) {
    return next(
      new AppError("No attendance session is active", 400, httpStatus.FAIL),
    );
  }

  const endedSessionId = group.currentSessionId;

  group.currentSessionId = null;

  await classData.save();

  res.status(200).json({
    status: httpStatus.SUCCESS,
    message: "Attendance session ended successfully",
    sessionId: endedSessionId,
  });
});

// =========================
// Exams
// =========================

const addExam = asyncWrapper(async (req, res, next) => {
  const { name, grade, total } = req.body;

  if (!name || name.trim() === "") {
    return next(new AppError("Exam name is required", 400, httpStatus.FAIL));
  }

  if (grade === undefined || total === undefined) {
    return next(
      new AppError("Grade and total are required", 400, httpStatus.FAIL),
    );
  }

  const numericGrade = Number(grade);
  const numericTotal = Number(total);

  if (Number.isNaN(numericGrade) || Number.isNaN(numericTotal)) {
    return next(
      new AppError("Grade and total must be numbers", 400, httpStatus.FAIL),
    );
  }

  if (numericGrade < 0 || numericTotal < 0) {
    return next(
      new AppError("Grade and total cannot be negative", 400, httpStatus.FAIL),
    );
  }

  if (numericGrade > numericTotal) {
    return next(
      new AppError("Grade cannot be greater than total", 400, httpStatus.FAIL),
    );
  }

  const classData = await Class.findById(req.params.classId);

  if (!classData) {
    return next(new AppError("Class not found", 404, httpStatus.FAIL));
  }

  const group = classData.groups.id(req.params.groupId);

  if (!group) {
    return next(new AppError("Group not found", 404, httpStatus.FAIL));
  }

  const code = Number(req.params.code);

  const student = group.students.find((student) => student.code === code);

  if (!student) {
    return next(new AppError("Student not found", 404, httpStatus.FAIL));
  }

  student.exams.push({
    name: name.trim(),
    grade: numericGrade,
    total: numericTotal,
  });

  await classData.save();

  res.status(201).json({
    status: httpStatus.SUCCESS,
    exam: student.exams[student.exams.length - 1],
  });
});

// =========================
// Parent Contacts
// =========================

const addParentContact = asyncWrapper(async (req, res, next) => {
  const { note, date } = req.body;

  const classData = await Class.findById(req.params.classId);

  if (!classData) {
    return next(new AppError("Class not found", 404, httpStatus.FAIL));
  }

  const group = classData.groups.id(req.params.groupId);

  if (!group) {
    return next(new AppError("Group not found", 404, httpStatus.FAIL));
  }

  const code = Number(req.params.code);

  const student = group.students.find((student) => student.code === code);

  if (!student) {
    return next(new AppError("Student not found", 404, httpStatus.FAIL));
  }

  let contactDate = new Date();

  if (date) {
    contactDate = new Date(date);

    if (Number.isNaN(contactDate.getTime())) {
      return next(new AppError("Invalid date", 400, httpStatus.FAIL));
    }
  }

  student.contacts.push({
    date: contactDate,
    note: note?.trim() || "",
  });

  await classData.save();

  res.status(201).json({
    status: httpStatus.SUCCESS,
    contact: student.contacts[student.contacts.length - 1],
    studentInfo: {
      code: student.code,
      name: student.name,
      phoneStudent: student.phoneStudent,
      phoneParent: student.phoneParent,
    },
  });
});

// =========================
// Exports
// =========================

module.exports = {
  createClass,
  getClasses,
  getClass,
  updateClass,
  deleteClass,

  addGroup,
  getGroups,
  getGroup,
  updateGroup,
  deleteGroup,

  addStudent,
  getStudents,
  getStudent,
  updateStudent,
  deleteStudent,

  startAttendanceSession,
  IsSessionActive,
  markPresent,
  endAttendanceSession,

  addExam,
  addParentContact,
};
