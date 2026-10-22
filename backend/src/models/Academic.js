import mongoose from 'mongoose';

const degreeSectionSchema = new mongoose.Schema(
  {
    degreeLevel: { type: String, required: true },
    degreeTitle: { type: String, required: true },
    boardOrUniversity: { type: String, required: true },
    rollNumber: { type: String, default: '' },
    seatOrEnrolmentNo: { type: String, default: '' },
    passingYear: { type: Number, required: true },
    majorSubjects: { type: String, default: '' },
    obtainedMarks: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    percentage: { type: Number, required: true },
    cgpa: { type: Number, default: null },
    gradeOrDivision: { type: String, default: '' },
    documentUrl: { type: String, default: '' },
  },
  { _id: true, timestamps: true }
);

const academicSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    fatherName: { type: String, default: '' },
    cnicOrBForm: { type: String, default: '' },
    gender: { type: String, enum: ['Male', 'Female', 'Other', ''], default: '' },
    dateOfBirth: { type: Date, default: null },
    domicileDistrict: { type: String, default: '' },
    postalAddress: { type: String, default: '' },
    permanentAddress: { type: String, default: '' },
    qualifications: [degreeSectionSchema],
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Academic', academicSchema);