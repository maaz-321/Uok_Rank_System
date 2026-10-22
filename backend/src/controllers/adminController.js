import User from '../models/User.js';
import Academic from '../models/Academic.js';
import { sendEmail } from '../utils/sendEmail.js';
import { generateCVPdf } from '../utils/pdfGenerator.js';

// 1. Get All Registered Users
export const getFacultyList = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ name: 1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Backwards-compatible alias
export const getAllUsers = getFacultyList;

// 2. Get Single User Details
export const getUserDetailsForAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const academic = await Academic.findOne({ user: req.params.userId });
    res.json({ user, academic });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Toggle Edit Permission & Send Email Notification
export const toggleEditPermission = async (req, res) => {
  try {
    const { userId, allowEdit } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isEditAllowed = allowEdit;
    await user.save();

    // Send email notification for both lock and unlock
    const isUnlocked = allowEdit;
    const emailSubject = isUnlocked
      ? 'Profile Edit Permission Granted - University of Karachi'
      : 'Profile Edit Permission Revoked - University of Karachi';

    const emailHtml = `
      <div style="background-color: #eef1f5; padding: 30px 10px; font-family: 'Segoe UI', Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; border: 1px solid #e2e8f0;">
          <div style="background: linear-gradient(135deg, #6b0f0f 0%, #800000 55%, #9b1b1b 100%); padding: 25px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 20px;">UNIVERSITY OF KARACHI</h1>
            <p style="color: #f3d9d9; margin: 5px 0 0 0; font-size: 12px;">Rank Management Portal</p>
          </div>
          <div style="padding: 25px; color: #2d3748;">
            <p>Respected <b>${user.name}</b>,</p>
            <p>The Portal Administrator has <b>${isUnlocked ? 'unlocked' : 'locked'}</b> your profile for editing.</p>
            ${
              isUnlocked
                ? '<p>You can now update your personal and academic details on the portal.</p>'
                : '<p>You can no longer make changes to your profile until the admin grants permission again.</p>'
            }
            <p style="margin-top: 20px; color: #64748b; font-size: 12px;">This is an automated notification from University of Karachi - Rank Management Portal.</p>
          </div>
        </div>
      </div>
    `;

    await sendEmail({
      to: user.email,
      subject: emailSubject,
      html: emailHtml,
    }).catch((err) => console.log('UOK Toggle Email Error: ', err.message));

    res.json({
      message: `User edit permission successfully set to: ${allowEdit}`,
      isEditAllowed: user.isEditAllowed,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. CHANGE / MANAGE A USER PORTAL ROLE
export const updateUserRole = async (req, res) => {
  try {
    const { targetUserId, newRole } = req.body;
    const allowedRoles = ['faculty', 'chairman', 'oec', 'qec'];

    if (!allowedRoles.includes(newRole)) {
      return res.status(400).json({
        message: `Invalid role provided. Allowed roles: ${allowedRoles.join(', ')}`,
      });
    }

    const user = await User.findById(targetUserId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.role = newRole;
    await user.save();

    res.json({
      message: `User role successfully updated to ${newRole}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        department: user.department,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5. Download Faculty Resume/CV (Admin)
export const downloadFacultyResume = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const academicRecord = await Academic.findOne({ user: userId });
    if (!academicRecord) {
      return res.status(400).json({ message: 'Faculty has not submitted academic form yet.' });
    }

    const pdfBuffer = await generateCVPdf(user, academicRecord);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${user.name.replace(/\s+/g, '_')}_Resume.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};