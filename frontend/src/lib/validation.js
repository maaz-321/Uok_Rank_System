import { z } from "zod";
import { DEGREE_LEVELS, DEPARTMENTS, GENDERS } from "./constants";

const email = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Enter a valid email address")
  .max(160, "Email is too long");

const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be 72 characters or less");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Enter your full name and academic title")
      .max(120, "Name is too long"),
    email,
    password,
    confirmPassword: z.string().min(1, "Confirm your password"),
    department: z
      .string()
      .refine((value) => DEPARTMENTS.includes(value), "Select your department"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const qualificationSchema = z.object({
  degreeLevel: z
    .string()
    .refine((value) => DEGREE_LEVELS.includes(value), "Select a degree level"),
  degreeTitle: z.string().trim().min(2, "Degree title is required"),
  boardOrUniversity: z.string().trim().min(2, "Board / University is required"),
  rollNumber: z.string().trim().optional().default(""),
  seatOrEnrolmentNo: z.string().trim().optional().default(""),
  passingYear: z.coerce
    .number({ message: "Passing year is required" })
    .int("Passing year must be a whole number")
    .min(1950, "Year looks too old")
    .max(new Date().getFullYear() + 1, "Year cannot be in the future"),
  majorSubjects: z.string().trim().optional().default(""),
  obtainedMarks: z.coerce
    .number({ message: "Obtained marks are required" })
    .min(0, "Marks cannot be negative"),
  totalMarks: z.coerce
    .number({ message: "Total marks are required" })
    .positive("Total marks must be greater than zero"),
  cgpa: z.coerce.number().min(0, "CGPA cannot be negative").max(10, "CGPA max is 10").optional().or(z.literal("")),
  gradeOrDivision: z.string().trim().optional().default(""),
});

export const academicSchema = z.object({
  fatherName: z.string().trim().min(2, "Father name is required"),
  cnicOrBForm: z
    .string()
    .trim()
    .min(5, "CNIC / B-Form number is required")
    .max(20, "CNIC / B-Form number looks invalid"),
  gender: z
    .string()
    .refine((value) => GENDERS.includes(value), "Select a gender"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  domicileDistrict: z.string().trim().min(2, "Domicile district is required"),
  postalAddress: z.string().trim().min(5, "Postal address is required"),
  permanentAddress: z.string().trim().min(5, "Permanent address is required"),
  qualifications: z.array(qualificationSchema).min(1, "Add at least one qualification"),
});

export const ROLE_ENUM = z.enum(["faculty", "chairman", "oec", "qec"]);

export const passwordRules =
  "Use at least 8 characters with a mix of letters, numbers and symbols.";
