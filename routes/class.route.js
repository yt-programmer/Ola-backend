const express = require("express");
const { body, param } = require("express-validator");

const {
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
  markPresent,
  endAttendanceSession,
  IsSessionActive,

  addExam,
  addParentContact,
} = require("../controllers/class.controller");

const verifyToken = require("../middlewares/verifyToken");
const validationResultMiddleware = require("../middlewares/validationResultMiddleware");

const router = express.Router();

router.use(verifyToken);

router.post(
  "/",
  [body("name").trim().notEmpty().withMessage("Class name is required")],
  validationResultMiddleware,
  createClass,
);

router.get("/", getClasses);

router.get(
  "/:classId",
  [param("classId").notEmpty().isMongoId().withMessage("Invalid class ID")],
  validationResultMiddleware,
  getClass,
);

router.patch(
  "/:classId",
  [
    param("classId").notEmpty().isMongoId().withMessage("Invalid class ID"),

    body("name").trim().notEmpty().withMessage("Class name is required"),
  ],
  validationResultMiddleware,
  updateClass,
);

router.delete(
  "/:classId",
  [param("classId").notEmpty().isMongoId().withMessage("Invalid class ID")],
  validationResultMiddleware,
  deleteClass,
);

router.post(
  "/:classId/groups",
  [
    param("classId").notEmpty().isMongoId().withMessage("Invalid class ID"),

    body("name").trim().notEmpty().withMessage("Group name is required"),
  ],
  validationResultMiddleware,
  addGroup,
);

router.get(
  "/:classId/groups",
  [param("classId").notEmpty().isMongoId().withMessage("Invalid class ID")],
  validationResultMiddleware,
  getGroups,
);

router.get(
  "/:classId/groups/:groupId",
  [
    param("classId").notEmpty().isMongoId().withMessage("Invalid class ID"),

    param("groupId").notEmpty().isMongoId().withMessage("Invalid group ID"),
  ],
  validationResultMiddleware,
  getGroup,
);

router.patch(
  "/:classId/groups/:groupId",
  [
    param("classId").notEmpty().isMongoId().withMessage("Invalid class ID"),

    param("groupId").notEmpty().isMongoId().withMessage("Invalid group ID"),

    body("name").trim().notEmpty().withMessage("Group name is required"),
  ],
  validationResultMiddleware,
  updateGroup,
);

router.delete(
  "/:classId/groups/:groupId",
  [
    param("classId").notEmpty().isMongoId().withMessage("Invalid class ID"),

    param("groupId").notEmpty().isMongoId().withMessage("Invalid group ID"),
  ],
  validationResultMiddleware,
  deleteGroup,
);

router.post(
  "/:classId/groups/:groupId/students",
  [
    param("classId").notEmpty().isMongoId().withMessage("Invalid class ID"),

    param("groupId").notEmpty().isMongoId().withMessage("Invalid group ID"),

    body("name").trim().notEmpty().withMessage("Student name is required"),

    body("phoneStudent")
      .notEmpty()
      .isLength({ min: 11, max: 11 })
      .withMessage("Student phone must be 11 digits"),

    body("phoneParent")
      .notEmpty()
      .isLength({ min: 11, max: 11 })
      .withMessage("Parent phone must be 11 digits"),
  ],
  validationResultMiddleware,
  addStudent,
);

router.get(
  "/:classId/groups/:groupId/students",
  [
    param("classId").notEmpty().isMongoId().withMessage("Invalid class ID"),

    param("groupId").notEmpty().isMongoId().withMessage("Invalid group ID"),
  ],
  validationResultMiddleware,
  getStudents,
);

router.get(
  "/:classId/groups/:groupId/students/:code",
  [
    param("classId").notEmpty().isMongoId().withMessage("Invalid class ID"),

    param("groupId").notEmpty().isMongoId().withMessage("Invalid group ID"),

    param("code")
      .notEmpty()
      .isInt({ min: 1 })
      .withMessage("Student code must be a positive number"),
  ],
  validationResultMiddleware,
  getStudent,
);

router.patch(
  "/:classId/groups/:groupId/students/:code",
  [
    param("classId").notEmpty().isMongoId().withMessage("Invalid class ID"),

    param("groupId").notEmpty().isMongoId().withMessage("Invalid group ID"),

    param("code")
      .notEmpty()
      .isInt({ min: 1 })
      .withMessage("Student code must be a positive number"),

    body("name").trim().notEmpty().withMessage("Student name is required"),

    body("phoneStudent")
      .notEmpty()
      .isLength({ min: 11, max: 11 })
      .withMessage("Student phone must be 11 digits"),

    body("phoneParent")
      .notEmpty()
      .isLength({ min: 11, max: 11 })
      .withMessage("Parent phone must be 11 digits"),
  ],
  validationResultMiddleware,
  updateStudent,
);

router.delete(
  "/:classId/groups/:groupId/students/:code",
  [
    param("classId").notEmpty().isMongoId().withMessage("Invalid class ID"),

    param("groupId").notEmpty().isMongoId().withMessage("Invalid group ID"),

    param("code")
      .notEmpty()
      .isInt({ min: 1 })
      .withMessage("Student code must be a positive number"),
  ],
  validationResultMiddleware,
  deleteStudent,
);

router.post(
  "/:classId/groups/:groupId/attendance/start",
  [
    param("classId").notEmpty().isMongoId().withMessage("Invalid class ID"),

    param("groupId").notEmpty().isMongoId().withMessage("Invalid group ID"),
  ],
  validationResultMiddleware,
  startAttendanceSession,
);

router.get(
  "/:classId/groups/:groupId/attendance/status",
  [
    param("classId").notEmpty().isMongoId().withMessage("Invalid class ID"),

    param("groupId").notEmpty().isMongoId().withMessage("Invalid group ID"),
  ],
  validationResultMiddleware,
  IsSessionActive,
);

router.post(
  "/:classId/groups/:groupId/students/:code/attendance/present",
  [
    param("classId").notEmpty().isMongoId().withMessage("Invalid class ID"),

    param("groupId").notEmpty().isMongoId().withMessage("Invalid group ID"),

    param("code")
      .notEmpty()
      .isInt({ min: 1 })
      .withMessage("Student code must be a positive number"),
  ],
  validationResultMiddleware,
  markPresent,
);

router.post(
  "/:classId/groups/:groupId/attendance/end",
  [
    param("classId").notEmpty().isMongoId().withMessage("Invalid class ID"),

    param("groupId").notEmpty().isMongoId().withMessage("Invalid group ID"),
  ],
  validationResultMiddleware,
  endAttendanceSession,
);

router.post(
  "/:classId/groups/:groupId/students/:code/exams",
  [
    param("classId").notEmpty().isMongoId().withMessage("Invalid class ID"),

    param("groupId").notEmpty().isMongoId().withMessage("Invalid group ID"),

    param("code")
      .notEmpty()
      .isInt({ min: 1 })
      .withMessage("Student code must be a positive number"),

    body("name").trim().notEmpty().withMessage("Exam name is required"),

    body("grade").isNumeric().withMessage("Grade must be a number"),

    body("total").isNumeric().withMessage("Total must be a number"),
  ],
  validationResultMiddleware,
  addExam,
);

router.post(
  "/:classId/groups/:groupId/students/:code/contacts",
  [
    param("classId").notEmpty().isMongoId().withMessage("Invalid class ID"),

    param("groupId").notEmpty().isMongoId().withMessage("Invalid group ID"),

    param("code")
      .notEmpty()
      .isInt({ min: 1 })
      .withMessage("Student code must be a positive number"),
  ],
  validationResultMiddleware,
  addParentContact,
);

module.exports = router;
