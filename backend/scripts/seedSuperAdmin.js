import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../src/models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const createQECSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const email = 'qec@uok.edu.pk';

    await User.deleteOne({ email }); // Reset previous QEC account if exists

    const hashedPassword = await bcrypt.hash('UOK_QecSecret2026!', 10);

    const qecAdmin = await User.create({
      name: 'Quality Enhancement Cell (QEC Head)',
      email,
      password: hashedPassword,
      department: 'Central Administration',
      role: 'qec',
      isEditAllowed: true,
    });

    console.log(`✅ QEC Central Super Admin Initialized: ${qecAdmin.email}`);
    process.exit(0);
  } catch (error) {
    console.error(`❌ Seeding error: ${error.message}`);
    process.exit(1);
  }
};

createQECSuperAdmin();