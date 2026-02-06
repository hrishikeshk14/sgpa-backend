const mongoose = require("mongoose");

const SubjectSchema = new mongoose.Schema({
    type: String,          // weighted | direct
    s1: Number,
    s2: Number,
    le: Number,
    marks: Number,
    credits: Number,
    gradePoint: Number
});

const RecordSchema = new mongoose.Schema({
    studentId: String,
    semester: String,
    sgpa: Number,
    subjects: [SubjectSchema]
}, { timestamps: true });


module.exports = mongoose.model("Record", RecordSchema);
