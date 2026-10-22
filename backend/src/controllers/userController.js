import User from '../models/User.js';
import Academic from '../models/Academic.js';
import cloudinary from '../config/cloudinary.js';
import { generateCVPdf } from '../utils/pdfGenerator.js';

// @desc    Update Personal Profile (Name, Phone, Image)
// @route   PUT /api/user/profile
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.isEditAllowed) {
      return res.status(403).json({ message: 'Editing is locked by Admin. You cannot edit profile.' });
    }

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: 'user_profiles' });
      user.profilePicture = result.secure_url;
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.address = req.body.address || user.address;

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Save or Update Complete Academic Web Form Data
// @route   POST /api/user/academic
export const saveOrUpdateAcademic = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Lock Check
    if (!user.isEditAllowed) {
      return res.status(403).json({
        message: 'Academic profile is locked by Admin. Ask Admin for permission to edit.',
      });
    }

    const {
      fatherName,
      cnicOrBForm,
      gender,
      dateOfBirth,
      domicileDistrict,
      postalAddress,
      permanentAddress,
      qualifications,
    } = req.body;

    let academicRecord = await Academic.findOne({ user: req.user._id });

    if (academicRecord) {
      // Update existing record
      academicRecord.fatherName = fatherName ?? academicRecord.fatherName;
      academicRecord.cnicOrBForm = cnicOrBForm ?? academicRecord.cnicOrBForm;
      academicRecord.gender = gender ?? academicRecord.gender;
      academicRecord.dateOfBirth = dateOfBirth ?? academicRecord.dateOfBirth;
      academicRecord.domicileDistrict = domicileDistrict ?? academicRecord.domicileDistrict;
      academicRecord.postalAddress = postalAddress ?? academicRecord.postalAddress;
      academicRecord.permanentAddress = permanentAddress ?? academicRecord.permanentAddress;
      academicRecord.qualifications = qualifications ?? academicRecord.qualifications;

      await academicRecord.save();
      return res.json({ message: 'Academic details updated successfully', academicRecord });
    } else {
      // Create new record
      academicRecord = await Academic.create({
        user: req.user._id,
        fatherName,
        cnicOrBForm,
        gender,
        dateOfBirth,
        domicileDistrict,
        postalAddress,
        permanentAddress,
        qualifications: qualifications || [],
      });
      return res.status(201).json({ message: 'Academic details saved successfully', academicRecord });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Current Logged-In User's Academic Record
// @route   GET /api/user/academic
export const getMyAcademicData = async (req, res) => {
  try {
    const academicRecord = await Academic.findOne({ user: req.user._id });
    if (!academicRecord) {
      return res.status(404).json({ message: 'No academic record found. Please submit the form.' });
    }
    res.json(academicRecord);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Download Dynamic PDF Resume / CV
// @route   GET /api/user/download-cv
export const downloadAcademicResume = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const academicRecord = await Academic.findOne({ user: req.user._id });

    if (!academicRecord) {
      return res.status(400).json({ message: 'Please submit your academic form before downloading CV.' });
    }

    const pdfBuffer = await generateCVPdf(user, academicRecord);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${user.name.replace(/\s+/g, '_')}_Resume.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};