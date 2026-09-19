const Class = require("../models/Class");

const httpStatus = require("../utils/httpStatus");
const asyncWrapper = require("../middlewares/asyncWrapper");

const getStatistics = asyncWrapper(async (req, res, next) => {
  const classes = await Class.find();

  const now = new Date();

  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  let totalStudents = 0;
  let totalPresent = 0;
  let totalAbsent = 0;
  let totalAttendanceRecords = 0;
  let totalGroups = 0;

  const classesStatistics = classes.map((classData) => {
    let classTotalStudents = 0;
    let classPresentToday = 0;
    let classAbsentToday = 0;
    let classAttendanceRecords = 0;

    const groupsStatistics = classData.groups.map((group) => {
      let presentToday = 0;
      let absentToday = 0;

      for (const student of group.students) {
        totalStudents += 1;
        classTotalStudents += 1;

        const todayAttendance = student.attendance.filter(
          (record) => record.date >= startOfDay && record.date <= endOfDay,
        );

        for (const record of todayAttendance) {
          if (record.status === "present") {
            presentToday += 1;
            classPresentToday += 1;
            totalPresent += 1;
          }

          if (record.status === "absent") {
            absentToday += 1;
            classAbsentToday += 1;
            totalAbsent += 1;
          }

          totalAttendanceRecords += 1;
          classAttendanceRecords += 1;
        }
      }

      const totalGroupAttendance = presentToday + absentToday;

      const attendancePercentage =
        totalGroupAttendance > 0
          ? Number(((presentToday / totalGroupAttendance) * 100).toFixed(2))
          : 0;

      return {
        groupId: group._id,
        groupName: group.name,
        totalStudents: group.students.length,
        presentToday,
        absentToday,
        totalAttendanceRecords: totalGroupAttendance,
        attendancePercentage,
      };
    });

    totalGroups += groupsStatistics.length;

    const totalClassAttendance = classPresentToday + classAbsentToday;

    const attendancePercentage =
      totalClassAttendance > 0
        ? Number(((classPresentToday / totalClassAttendance) * 100).toFixed(2))
        : 0;

    return {
      classId: classData._id,
      className: classData.name,
      totalStudents: classTotalStudents,
      presentToday: classPresentToday,
      absentToday: classAbsentToday,
      totalAttendanceRecords: classAttendanceRecords,
      attendancePercentage,
      groups: groupsStatistics,
    };
  });

  const totalAttendance = totalPresent + totalAbsent;

  const attendancePercentage =
    totalAttendance > 0
      ? Number(((totalPresent / totalAttendance) * 100).toFixed(2))
      : 0;

  res.status(200).json({
    status: httpStatus.SUCCESS,

    statistics: {
      totalClasses: classes.length,
      totalGroups,
      totalStudents,

      totalPresent,
      totalAbsent,
      totalAttendanceRecords: totalAttendance,

      attendancePercentage,

      date: {
        start: startOfDay,
        end: endOfDay,
      },

      classes: classesStatistics,
    },
  });
});

module.exports = {
  getStatistics,
};
