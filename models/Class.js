const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    groups: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },

        nextStudentCode: {
          type: Number,
          default: 1,
        },

        currentSessionId: {
          type: mongoose.Schema.Types.ObjectId,
          default: null,
        },

        students: [
          {
            code: {
              type: Number,
              required: true,
            },

            name: {
              type: String,
              required: true,
              trim: true,
            },

            phoneStudent: {
              type: String,
              trim: true,
            },

            phoneParent: {
              type: String,
              trim: true,
            },

            lastStatus: {
              type: String,
              enum: ["present", "absent"],
              default: null,
            },
            attendance: [
              {
                sessionId: {
                  type: mongoose.Schema.Types.ObjectId,
                  default: () => new mongoose.Types.ObjectId(),
                },

                date: {
                  type: Date,
                  required: true,
                },

                status: {
                  type: String,
                  enum: ["present", "absent"],
                  default: "absent",
                  required: true,
                },
              },
            ],

            exams: [
              {
                name: {
                  type: String,
                  required: true,
                  trim: true,
                },

                grade: {
                  type: Number,
                  required: true,
                  min: 0,
                },

                total: {
                  type: Number,
                  required: true,
                  min: 0,
                },
              },
            ],

            contacts: [
              {
                date: {
                  type: Date,
                  default: Date.now,
                },

                note: {
                  type: String,
                  trim: true,
                },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Class", classSchema);
