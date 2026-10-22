export const ROLES = {
  FACULTY: "faculty",
  CHAIRMAN: "chairman",
  OEC: "oec",
  QEC: "qec",
};

export const ROLE_OPTIONS = [
  {
    value: ROLES.FACULTY,
    label: "Faculty Member",
    description: "Maintain your own academic record and download your CV.",
  },
  {
    value: ROLES.CHAIRMAN,
    label: "Chairman / HoD",
    description: "Audit and review the faculty members of your department.",
  },
  {
    value: ROLES.OEC,
    label: "OEC Coordinator",
    description: "Verify institutional records across every department.",
  },
  {
    value: ROLES.QEC,
    label: "QEC Super Admin",
    description: "Control edit permissions and allocate portal roles.",
  },
];

export const ROLE_META = {
  [ROLES.FACULTY]: {
    label: "Faculty Member",
    shortLabel: "Faculty",
    colorPalette: "maroon",
    home: "/dashboard",
    description: "Maintain your academic record and download your CV.",
  },
  [ROLES.CHAIRMAN]: {
    label: "Chairman / HoD",
    shortLabel: "Chairman",
    colorPalette: "navy",
    home: "/chairman",
    description: "Audit and review every faculty member of your department.",
  },
  [ROLES.OEC]: {
    label: "OEC Coordinator",
    shortLabel: "OEC",
    colorPalette: "gold",
    home: "/oec",
    description: "Verify institutional records across all departments.",
  },
  [ROLES.QEC]: {
    label: "QEC Super Admin",
    shortLabel: "QEC",
    colorPalette: "maroon",
    home: "/admin",
    description: "Control edit permissions and allocate portal roles.",
  },
};

export const DEPARTMENTS = [
  "Computer Science (UBIT)",
  "Physics",
  "Chemistry",
  "Mathematics",
  "Biochemistry",
  "Karachi University Business School (KUBS)",
  "Commerce",
  "Public Administration",
  "English",
  "Economics",
  "International Relations",
  "Mass Communication",
];

export const DEGREE_LEVELS = [
  "Matriculation (O-Level)",
  "Intermediate (F.A / F.Sc)",
  "B.A / B.Sc / B.Com",
  "BS (4 Years)",
  "BS (5 Years)",
  "M.A / M.Sc / M.Com",
  "M.Phil",
  "Ph.D",
  "Post Doctorate",
];

export const GENDERS = ["Male", "Female", "Other"];

export const STORAGE_KEYS = {
  token: "uok_token",
  user: "uok_user",
};

export const CURRENT_YEAR = new Date().getFullYear();

export const APP_NAME = "Rank Management & Faculty Portal";
export const ORG_NAME = "University of Karachi";
export const ORG_SHORT = "UOK";
