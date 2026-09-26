/**
 * Central Institutional & Website Configuration Matrix
 * 
 * Changing values in this configuration directory will update:
 * 1. Website Name & Branding across Navbars, Footers, Modals, Login Page
 * 2. Website Logo & Icons
 * 3. Certificate Formats & Signatories (Web View & Printable PDF)
 * 4. PDF Formats (Fee Receipts, Admit Cards, Payslips, Financial Audits, Day Audit Reports)
 */

export const websiteConfig = {
  // Website & Institution Identification
  name: "Talent Computer Academy",
  shortName: "TCIT",
  suffix: "ERP",
  fullTitle: "Talent Computer Academy ERP",
  tagline: "Integrated Campus & Academic Management System",
  domain: "talent.edu",
  portalUrl: "https://portal.tcit.edu",

  // Contact & Address Details
  address: "Plot 42, Tech Park Avenue, Salt Lake Sector V, Kolkata, WB - 700091",
  supportEmail: "support@talent.edu",
  adminEmail: "admin@talent.edu",
  phone: "+91 (033) 2481-9920",
  gstin: "19AAACA1234F1Z9",
  accreditation: "ISO 9001:2015 Certified Educational Institute",

  // Website Logo Settings
  logo: {
    letter: "T",
    text: "TCIT Tech",
    tag: "Academy ERP",
    // Base SVG parameters for custom logo rendering
    primaryColor: "#2563eb", // Blue-600
    secondaryColor: "#4f46e5", // Indigo-600
    svgPath: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
    // Image logo URL fallback (if using a custom image file)
    imageUrl: "/logo.png"
  }
};

export const certificateConfig = {
  institutionName: "TALENT COMPUTER ACADEMY",
  certificateTitle: "CERTIFICATE OF ACHIEVEMENT",
  serialPrefix: "TCIT-CERT-",
  defaultCertType: "Course Completion",

  // Default Signatories
  signatory: {
    name: "Dr. A. K. Banerjee",
    title: "Academic Director & Head of Institution",
  },
  coSignatory: {
    name: "Dr. Rajesh Verma",
    title: "Director of Academic Affairs",
  },

  // Verification & Accreditation
  badgeText: "OFFICIAL VERIFIED CERTIFICATE",
  accreditationText: "ISO 9001:2015 Certified Educational Institution • Ministry of Skill Development Approved",
  verificationNote: "This certificate is digitally signed and verified via Talent Computer Academy ERP Database.",

  // Visual Certificate Theme Defaults
  theme: {
    borderColorPrimary: "#d97706",   // Amber-600
    borderColorSecondary: "#b45309", // Amber-700
    titleColor: "#92400e",           // Amber-800
    studentNameColor: "#1e1b4b",     // Indigo-950
    courseColor: "#4338ca",          // Indigo-700
    backgroundColor: "#fffbeb",      // Amber-50
  }
};

export const pdfConfig = {
  // Global PDF Header Branding
  headerTitle: "TALENT COMPUTER ACADEMY",
  headerSubtitle: "Official Institutional ERP Document",
  tagline: "Talent Computer Academy • Kolkata Campus",

  // Colors for @react-pdf document styling
  colors: {
    primary: "#1e3a8a",    // Blue-900
    accent: "#2563eb",     // Blue-600
    secondary: "#4f46e5",  // Indigo-600
    text: "#1e293b",       // Slate-800
    subtext: "#64748b",    // Slate-500
    border: "#e2e8f0",     // Slate-200
    badgeBg: "#eff6ff",    // Blue-50
  },

  // Default Document Footer Notice
  footerNotice: "Official Institutional Document • Generated via Talent Computer Academy ERP Portal",
  verificationDisclaimer: "This is a computer-generated official document. Verified by TCIT Administration. No physical signature required.",

  // Department-specific Contact Lines
  financeDesk: "TCIT Finance & Accounts Department",
  academicDesk: "TCIT Academic & Examination Cell",
  auditDesk: "TCIT Operations & Administrative Audit Cell"
};

// Export default umbrella config
export const siteConfig = {
  website: websiteConfig,
  certificate: certificateConfig,
  pdf: pdfConfig
};

export default siteConfig;
