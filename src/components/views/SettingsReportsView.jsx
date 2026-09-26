import React, { useState, useEffect } from 'react';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { Settings, ShieldCheck, Download, RefreshCw, Database, FileText, CheckCircle2, Save, RotateCcw, Building2, Upload, Image as ImageIcon, FileSpreadsheet } from 'lucide-react';
import PDFDownloadButton from '../pdf/PDFDownloadButton';
import DayAuditReportPDF from '../pdf/DayAuditReportPDF';
import SiteLogo from '../common/SiteLogo';
import pdfLibService from '../../services/pdfLibService';
import { initialStudents, initialTransactions, initialFaculty } from '../../data/mockData';
import * as XLSX from 'xlsx';

export default function SettingsReportsView({ students = [], transactions = [], faculty = [] }) {
  const { websiteConfig, updateWebsiteConfig, resetSiteConfig } = useSiteConfig();

  const [formData, setFormData] = useState({
    name: websiteConfig.name || '',
    shortName: websiteConfig.shortName || '',
    logoLetter: websiteConfig.logo?.letter || '',
    logoImageUrl: websiteConfig.logo?.imageUrl || '/logo.png',
    gstin: websiteConfig.gstin || '',
    address: websiteConfig.address || '',
    supportEmail: websiteConfig.supportEmail || '',
    phone: websiteConfig.phone || '',
    domain: websiteConfig.domain || ''
  });

  const [savedMessage, setSavedMessage] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    setFormData({
      name: websiteConfig.name || '',
      shortName: websiteConfig.shortName || '',
      logoLetter: websiteConfig.logo?.letter || '',
      logoImageUrl: websiteConfig.logo?.imageUrl || '/logo.png',
      gstin: websiteConfig.gstin || '',
      address: websiteConfig.address || '',
      supportEmail: websiteConfig.supportEmail || '',
      phone: websiteConfig.phone || '',
      domain: websiteConfig.domain || ''
    });
  }, [websiteConfig]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, logoImageUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateWebsiteConfig({
      ...formData,
      logo: {
        imageUrl: formData.logoImageUrl,
        letter: formData.logoLetter
      }
    });
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  const handleReset = () => {
    setShowResetConfirm(true);
  };

  const handleConfirmReset = () => {
    resetSiteConfig();
    setShowResetConfirm(false);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  const handleExportCSV = () => {
    const studentList = students && students.length > 0 ? students : initialStudents;
    const headers = [
      'Roll Number',
      'Student Name',
      'Course Enrolled',
      'Assigned Batch',
      'Lab',
      'Total Fee (INR)',
      'Paid Fee (INR)',
      'Pending Fee (INR)',
      'Status',
      'Attendance Rate',
      'Phone Number',
      'Email Address',
      'Admission Date'
    ];

    const escapeCSV = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = studentList.map((s) => [
      s.id || s.rollNo || '',
      s.name || '',
      s.course || '',
      s.batch || '',
      s.lab || '',
      s.totalFee || 0,
      s.paidFee || 0,
      s.pendingFee || 0,
      s.status || 'Active',
      s.attendance ? `${s.attendance}%` : 'N/A',
      s.phone || '',
      s.email || '',
      s.joinedDate || s.admissionDate || ''
    ]);

    const csvContent =
      '\uFEFF' +
      [headers.map(escapeCSV).join(','), ...rows.map((row) => row.map(escapeCSV).join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `TCIT_Student_Roster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportXLSX = () => {
    const transactionList = transactions && transactions.length > 0 ? transactions : initialTransactions;

    const excelData = transactionList.map((t) => ({
      'Receipt Number': t.id || t.receiptNo || 'RCP-000',
      'Student Roll ID': t.studentId || '',
      'Student Name': t.studentName || '',
      'Course': t.course || '',
      'Payment Amount (INR)': t.amount || t.paidAmount || 0,
      'Payment Date': t.date || t.timestamp || new Date().toISOString().slice(0, 10),
      'Payment Method': t.mode || t.paymentMethod || 'Online Transfer',
      'Transaction Status': t.status || 'Completed'
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    worksheet['!cols'] = [
      { wch: 18 },
      { wch: 16 },
      { wch: 22 },
      { wch: 22 },
      { wch: 20 },
      { wch: 15 },
      { wch: 18 },
      { wch: 16 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Fee Collection Audit');

    XLSX.writeFile(workbook, `TCIT_Fee_Collection_Audit_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleBackupDatabase = () => {
    const studentList = students && students.length > 0 ? students : initialStudents;
    const transactionList = transactions && transactions.length > 0 ? transactions : initialTransactions;
    const facultyList = faculty && faculty.length > 0 ? faculty : initialFaculty;

    const backupData = {
      institution: websiteConfig,
      exportedAt: new Date().toISOString(),
      version: '3.0.0',
      database: {
        students: studentList,
        transactions: transactionList,
        faculty: facultyList
      }
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `TCIT_ERP_Database_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            Settings & Institutional Configuration <Settings className="w-5 h-5 text-blue-600" />
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure institute name, image logo, campus address, tax parameters & website-wide settings in real-time
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleBackupDatabase}
            className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-900 transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Database className="w-4 h-4" />
            <span>Backup Data Archive</span>
          </button>
        </div>
      </div>

      {savedMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Institutional Configuration & Logo updated successfully! Changes applied across all pages, navigation, receipts & PDFs.</span>
        </div>
      )}

      {/* Inline Reset Confirmation Banner */}
      {showResetConfirm && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl px-5 py-3.5 shadow-sm">
          <div>
            <p className="text-sm font-bold">Reset all site branding to defaults?</p>
            <p className="text-xs text-rose-600 mt-0.5">This will clear all custom logos, institute names, and addresses back to factory defaults.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowResetConfirm(false)}
              className="px-3 py-1.5 rounded-lg bg-white border border-rose-200 text-rose-700 text-xs font-semibold hover:bg-rose-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmReset}
              className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors cursor-pointer"
            >
              Yes, Reset All
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Dynamic Site Branding Form */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              Website & Institution Branding
            </h2>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Live Real-Time Sync
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Image Logo Uploader Section */}
            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {formData.logoImageUrl ? (
                  <img 
                    src={formData.logoImageUrl} 
                    alt="Logo Preview" 
                    className="w-14 h-14 object-cover rounded-2xl border-2 border-indigo-500/40 shadow-md shrink-0 bg-white"
                  />
                ) : (
                  <SiteLogo imageClassName="w-14 h-14 object-cover rounded-2xl border-2 border-indigo-500/40 shadow-md shrink-0" className="w-14 h-14 text-2xl" />
                )}
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    Website Image Logo <ImageIcon className="w-4 h-4 text-indigo-600" />
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Upload custom PNG/JPG image logo or provide image URL</p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer transition-colors flex items-center gap-1.5 shadow-sm">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Image</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    className="hidden" 
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-8">
                <label className="font-semibold text-slate-700 block mb-1">
                  Logo Image URL (Direct Link)
                </label>
                <input 
                  type="text" 
                  name="logoImageUrl" 
                  value={formData.logoImageUrl} 
                  onChange={handleChange}
                  placeholder="/logo.png or https://example.com/logo.png"
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 outline-none focus:bg-white focus:border-blue-500 font-mono text-[11px]" 
                />
              </div>

              <div className="sm:col-span-4">
                <label className="font-semibold text-slate-700 block mb-1">
                  Logo Letter (Fallback)
                </label>
                <input 
                  type="text" 
                  name="logoLetter" 
                  maxLength={2}
                  value={formData.logoLetter} 
                  onChange={handleChange}
                  placeholder="e.g. T"
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 outline-none focus:bg-white focus:border-blue-500 font-bold uppercase text-center" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-8">
                <label className="font-semibold text-slate-700 block mb-1">
                  Academy Full Name <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange}
                  required 
                  placeholder="e.g. Talent Computer Academy"
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 outline-none focus:bg-white focus:border-blue-500 font-medium" 
                />
              </div>

              <div className="sm:col-span-4">
                <label className="font-semibold text-slate-700 block mb-1">
                  Short Name / Abbr
                </label>
                <input 
                  type="text" 
                  name="shortName" 
                  value={formData.shortName} 
                  onChange={handleChange}
                  placeholder="e.g. TCIT"
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 outline-none focus:bg-white focus:border-blue-500 font-medium" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-12">
                <label className="font-semibold text-slate-700 block mb-1">
                  GST / Tax Registration Number
                </label>
                <input 
                  type="text" 
                  name="gstin" 
                  value={formData.gstin} 
                  onChange={handleChange}
                  placeholder="e.g. 19AAACA1234F1Z9"
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 outline-none focus:bg-white focus:border-blue-500 font-mono" 
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Campus Address
              </label>
              <input 
                type="text" 
                name="address" 
                value={formData.address} 
                onChange={handleChange}
                placeholder="Plot 42, Tech Park Avenue, Salt Lake Sector V, Kolkata"
                className="w-full h-10 px-3 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 outline-none focus:bg-white focus:border-blue-500 font-medium" 
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Support Email
                </label>
                <input 
                  type="email" 
                  name="supportEmail" 
                  value={formData.supportEmail} 
                  onChange={handleChange}
                  placeholder="support@talent.edu"
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 outline-none focus:bg-white focus:border-blue-500 font-medium" 
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Contact Phone
                </label>
                <input 
                  type="text" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange}
                  placeholder="+91 (033) 2481-9920"
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 outline-none focus:bg-white focus:border-blue-500 font-medium" 
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Reset Defaults</span>
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save & Apply Image Logo</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Export Reports & pdf-lib Templates */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Demo PDF Template Manager Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-amber-600" />
                pdf-lib Demo Template Manager
              </span>
              <span className="text-[10px] font-mono bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md font-bold">
                pdf-lib v1.17.1
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Upload sample demo PDF files. <code className="bg-slate-100 px-1 font-mono text-slate-800">pdf-lib</code> will open and edit your uploaded document to dynamically add student data, fee amounts & logos.
            </p>

            <div className="space-y-3 pt-1">
              {/* Certificate Template Upload */}
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-amber-950">Demo Certificate PDF Template</span>
                  <span className="text-[10px] font-bold text-amber-800">
                    {pdfLibService.getTemplate('certificate') ? '✓ Custom Uploaded' : 'Default Canvas'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex-1 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs cursor-pointer transition-colors text-center shadow-xs flex items-center justify-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Certificate PDF</span>
                    <input 
                      type="file" 
                      accept="application/pdf" 
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            pdfLibService.saveTemplate('certificate', reader.result);
                            alert('Demo Certificate PDF template uploaded successfully!');
                          };
                          reader.readAsDataURL(file);
                        }
                      }} 
                      className="hidden" 
                    />
                  </label>
                  <button
                    type="button"
                    onClick={async () => {
                      const bytes = await pdfLibService.generateCertificate({
                        studentName: 'Demo Student Name',
                        course: 'Advanced Computer Science',
                        institutionName: websiteConfig.name,
                        logoUrl: websiteConfig.logo?.imageUrl || '/logo.png'
                      });
                      pdfLibService.previewPdfBytes(bytes);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-white font-semibold text-xs hover:bg-slate-900"
                  >
                    Test PDF
                  </button>
                </div>
              </div>

              {/* Receipt Template Upload */}
              <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-teal-950">Demo Fee Receipt PDF Template</span>
                  <span className="text-[10px] font-bold text-teal-800">
                    {pdfLibService.getTemplate('receipt') ? '✓ Custom Uploaded' : 'Default Canvas'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex-1 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs cursor-pointer transition-colors text-center shadow-xs flex items-center justify-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Receipt PDF</span>
                    <input 
                      type="file" 
                      accept="application/pdf" 
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            pdfLibService.saveTemplate('receipt', reader.result);
                            alert('Demo Fee Receipt PDF template uploaded successfully!');
                          };
                          reader.readAsDataURL(file);
                        }
                      }} 
                      className="hidden" 
                    />
                  </label>
                  <button
                    type="button"
                    onClick={async () => {
                      const bytes = await pdfLibService.generateReceipt({
                        studentName: 'Demo Student',
                        amount: 25000,
                        institutionName: websiteConfig.name,
                        address: websiteConfig.address,
                        logoUrl: websiteConfig.logo?.imageUrl || '/logo.png'
                      });
                      pdfLibService.previewPdfBytes(bytes);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-white font-semibold text-xs hover:bg-slate-900"
                  >
                    Test PDF
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-4">
            <h2 className="text-base font-bold text-slate-900">Export Reports & Audit Logs</h2>
            <div className="space-y-3">
              <button 
                onClick={handleExportCSV}
                className="w-full p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left text-xs font-semibold text-slate-800 flex items-center justify-between transition-colors cursor-pointer"
              >
                <div>
                  <span className="block font-bold text-slate-900">Export Complete Student Roster (CSV)</span>
                  <span className="text-[11px] text-slate-500 font-normal">Downloads active student directory, course fees & attendance records</span>
                </div>
                <Download className="w-4 h-4 text-slate-400 shrink-0" />
              </button>
              <button 
                onClick={handleExportXLSX}
                className="w-full p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left text-xs font-semibold text-slate-800 flex items-center justify-between transition-colors cursor-pointer"
              >
                <div>
                  <span className="block font-bold text-slate-900">Export Monthly Fee Collection Audit (XLSX)</span>
                  <span className="text-[11px] text-slate-500 font-normal">Formatted Excel ledger with payment modes, dates & receipt numbers</span>
                </div>
                <Download className="w-4 h-4 text-slate-400 shrink-0" />
              </button>
              <div className="w-full p-1 bg-slate-50 border border-slate-200 rounded-xl">
                <PDFDownloadButton
                  document={<DayAuditReportPDF />}
                  fileName="Terminal_Attendance_Log_Audit.pdf"
                  buttonText="Export Terminal Attendance Log (PDF)"
                  variant="primary"
                  className="w-full p-2.5 rounded-lg text-left text-xs font-semibold flex items-center justify-between"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
