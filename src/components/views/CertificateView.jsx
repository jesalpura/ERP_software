import React, { useState, useEffect } from 'react';
import { useSiteConfig } from '../../context/SiteConfigContext';
import SiteLogo from '../common/SiteLogo';
import pdfLibService from '../../services/pdfLibService';
import { 
  Award, 
  Printer, 
  Send, 
  Download, 
  CheckCircle2, 
  Sparkles, 
  FileText, 
  User, 
  Calendar, 
  ShieldCheck,
  QrCode,
  Search,
  Upload,
  FileSpreadsheet
} from 'lucide-react';

export default function CertificateView({ students = [] }) {
  const { websiteConfig, certificateConfig } = useSiteConfig();
  const studentList = Array.isArray(students) && students.length > 0 ? students : [
    { id: 'AT-2024-089', name: 'Rohan Adhikari', course: 'MERN Full Stack' }
  ];
  const [selectedStudentId, setSelectedStudentId] = useState(studentList[0]?.id || 'AT-2024-089');
  const [certType, setCertType] = useState(certificateConfig?.defaultCertType || 'Course Completion');
  const [serialNo, setSerialNo] = useState(`${certificateConfig?.serialPrefix || 'APEX-CERT-'}${Math.floor(100000 + Math.random() * 900000)}`);
  const [issueDate, setIssueDate] = useState('2024-10-24');
  const [signatory, setSignatory] = useState(
    certificateConfig?.signatory?.name 
      ? `${certificateConfig.signatory.name} (${certificateConfig.signatory.title})`
      : 'Dr. A. K. Banerjee (Academic Director)'
  );
  const [customRemarks, setCustomRemarks] = useState('Completed with Distinction in Practical Lab Modules');
  const [issuedLogs, setIssuedLogs] = useState([
    {
      id: 'APEX-CERT-884102',
      studentName: 'Rohan Adhikari',
      course: 'MERN Full Stack',
      type: 'Course Completion',
      date: '2024-10-15',
      status: 'Issued & Verified'
    },
    {
      id: 'APEX-CERT-773910',
      studentName: 'Ananya Sen',
      course: 'Tally Prime + GST',
      type: 'Bonafide Certificate',
      date: '2024-10-10',
      status: 'Issued & Verified'
    }
  ]);

  const selectedStudent = studentList.find((s) => s.id === selectedStudentId) || studentList[0];
  const [hasCustomTemplate, setHasCustomTemplate] = useState(!!pdfLibService.getTemplate('certificate'));
  const [pdfLibGenerating, setPdfLibGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    let isMounted = true;
    let createdUrl = null;

    const generatePdfScreen = async () => {
      setPdfLibGenerating(true);
      try {
        const pdfBytes = await pdfLibService.generateCertificate({
          studentName: selectedStudent.name,
          course: selectedStudent.course,
          certType: certType,
          serialNo: serialNo,
          issueDate: issueDate,
          signatory: signatory,
          institutionName: websiteConfig.name || certificateConfig.institutionName,
          accreditationText: certificateConfig.accreditationText,
          logoUrl: websiteConfig.logo?.imageUrl || '/logo.png'
        });

        if (isMounted) {
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          createdUrl = URL.createObjectURL(blob);
          setPdfUrl(createdUrl);
        }
      } catch (err) {
        console.error('Error generating on-screen pdf-lib preview:', err);
      } finally {
        if (isMounted) setPdfLibGenerating(false);
      }
    };

    generatePdfScreen();

    return () => {
      isMounted = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [selectedStudent, certType, serialNo, issueDate, signatory, hasCustomTemplate, websiteConfig, certificateConfig]);

  const handleUploadTemplateFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        pdfLibService.saveTemplate('certificate', reader.result);
        setHasCustomTemplate(true);
        alert('Custom Demo Certificate PDF Template uploaded & saved! PDF-Lib will now place student name directly on your demo document.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGeneratePdfLibCert = async () => {
    setPdfLibGenerating(true);
    try {
      const pdfBytes = await pdfLibService.generateCertificate({
        studentName: selectedStudent.name,
        course: selectedStudent.course,
        certType: certType,
        serialNo: serialNo,
        issueDate: issueDate,
        signatory: signatory,
        institutionName: websiteConfig.name || certificateConfig.institutionName,
        accreditationText: certificateConfig.accreditationText,
        logoUrl: websiteConfig.logo?.imageUrl || '/logo.png'
      });

      pdfLibService.downloadPdfBytes(pdfBytes, `Certificate_${selectedStudent.name.replace(/\s+/g, '_')}_pdf-lib.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF via pdf-lib:', err);
      alert('Error generating PDF via pdf-lib. Check console logs.');
    } finally {
      setPdfLibGenerating(false);
    }
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  const handleIssueCertificate = () => {
    const newLog = {
      id: serialNo,
      studentName: selectedStudent.name,
      course: selectedStudent.course,
      type: certType,
      date: issueDate,
      status: 'Issued & Verified'
    };
    setIssuedLogs([newLog, ...issuedLogs]);
    alert(`Certificate #${serialNo} issued successfully for ${selectedStudent.name}! Notification sent to student portal.`);
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            Institutional Certificate Generator & Issuance Desk <Award className="w-5 h-5 text-amber-500" />
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Design, preview, and generate verified academic completion, bonafide, and excellence certificates with institutional seals.
          </p>
        </div>

        <div className="flex items-center gap-3 print:hidden flex-wrap">
          <button
            onClick={handleGeneratePdfLibCert}
            disabled={pdfLibGenerating}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-md shadow-amber-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{pdfLibGenerating ? 'pdf-lib Processing…' : 'Download Certificate PDF'}</span>
          </button>

          <button
            onClick={handlePrintCertificate}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Print Certificate</span>
          </button>

          <button
            onClick={handleIssueCertificate}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Issue & Publish Certificate</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:block">
        {/* LEFT CONTROLS FORM */}
        <div className="lg:col-span-4 flex flex-col gap-5 print:hidden">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center justify-between">
              <span>Certificate Configuration</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </h2>

            {/* pdf-lib Template Upload & Generator Card */}
            <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-amber-700" />
                  pdf-lib Demo Template
                </span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${hasCustomTemplate ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                  {hasCustomTemplate ? 'Custom Template Loaded' : 'Default Canvas'}
                </span>
              </div>
              <p className="text-[11px] text-amber-900/80 leading-relaxed">
                Upload a demo PDF document. <code className="bg-amber-100/80 px-1 rounded text-amber-950 font-mono">pdf-lib</code> will place the student name directly on your demo template and show it on screen.
              </p>

              <div className="flex items-center gap-2 pt-1">
                <label className="w-full py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs cursor-pointer transition-colors text-center flex items-center justify-center gap-1.5 shadow-xs">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Demo PDF Template</span>
                  <input type="file" accept="application/pdf" onChange={handleUploadTemplateFile} className="hidden" />
                </label>
              </div>
            </div>

            {/* Select Student */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Target Student Roster
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-100 text-slate-900 text-xs font-medium border border-transparent outline-none focus:bg-white focus:border-blue-500"
              >
                {studentList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.id}) - {s.course}
                  </option>
                ))}
              </select>
            </div>

            {/* Certificate Type */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Certificate Format Type
              </label>
              <select
                value={certType}
                onChange={(e) => setCertType(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-100 text-slate-900 text-xs font-medium border border-transparent outline-none focus:bg-white focus:border-blue-500"
              >
                <option value="Course Completion">Course Completion Certificate</option>
                <option value="Bonafide Certificate">Bonafide Student Certificate</option>
                <option value="Academic Excellence">Academic Excellence & Merit Award</option>
                <option value="Industrial Training">Industrial Training & Practical Lab</option>
              </select>
            </div>

            {/* Serial Number & Issue Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Certificate Serial ID
                </label>
                <input
                  type="text"
                  value={serialNo}
                  onChange={(e) => setSerialNo(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-slate-100 text-slate-900 text-xs font-mono border border-transparent outline-none focus:bg-white focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Issue Date
                </label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-slate-100 text-slate-900 text-xs font-medium border border-transparent outline-none focus:bg-white focus:border-blue-500"
                />
              </div>
            </div>

            {/* Signatory Title */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Authorized Signatory
              </label>
              <input
                type="text"
                value={signatory}
                onChange={(e) => setSignatory(e.target.value)}
                className="w-full h-9 px-3 rounded-xl bg-slate-100 text-slate-900 text-xs font-medium border border-transparent outline-none focus:bg-white focus:border-blue-500"
              />
            </div>

            {/* Custom Remarks */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Academic Remarks / Honors
              </label>
              <input
                type="text"
                value={customRemarks}
                onChange={(e) => setCustomRemarks(e.target.value)}
                className="w-full h-9 px-3 rounded-xl bg-slate-100 text-slate-900 text-xs font-medium border border-transparent outline-none focus:bg-white focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* RIGHT LIVE CERTIFICATE PDF SCREEN PREVIEW */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Status Header Bar */}
          <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-xs print:hidden">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-amber-700" />
              <span className="text-xs font-bold text-slate-900">pdf-lib Live Certificate Display</span>
            </div>
            <div className="text-[11px] font-semibold text-slate-500">
              {hasCustomTemplate ? '✨ Custom Demo PDF Template Active' : '📄 Canvas PDF Active'}
            </div>
          </div>

          {/* Display Screen */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xl min-h-[560px] flex flex-col items-center justify-center relative overflow-hidden">
            {pdfLibGenerating && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-xs z-10 flex flex-col items-center justify-center gap-2 text-amber-700 text-xs font-bold">
                <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Updating pdf-lib Live Screen...</span>
              </div>
            )}
            {pdfUrl ? (
              <object
                data={pdfUrl}
                type="application/pdf"
                className="w-full h-[540px] rounded-2xl border border-slate-200 shadow-inner"
              >
                <iframe src={pdfUrl} title="pdf-lib Live Screen View" className="w-full h-[540px] rounded-2xl" />
              </object>
            ) : (
              <div className="text-slate-400 text-xs font-medium">Generating pdf-lib live screen preview...</div>
            )}
          </div>

          {/* Issued History Table */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-4 print:hidden">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Recently Issued Certificate Registry Log</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 text-[11px] font-bold">
                    <th className="py-2.5 px-3">Serial ID</th>
                    <th className="py-2.5 px-3">Student</th>
                    <th className="py-2.5 px-3">Course</th>
                    <th className="py-2.5 px-3">Certificate Type</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {issuedLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono text-[11px] font-semibold text-slate-700">
                        {log.id}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{log.studentName}</td>
                      <td className="py-2.5 px-3 text-slate-600">{log.course}</td>
                      <td className="py-2.5 px-3 text-slate-600">{log.type}</td>
                      <td className="py-2.5 px-3 text-slate-500">{log.date}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-bold text-[10px] flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" /> {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
