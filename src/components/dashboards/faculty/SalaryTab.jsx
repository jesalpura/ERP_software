import React, { lazy, Suspense } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { useSiteConfig } from '../../../context/SiteConfigContext';
import PDFDownloadButton from '../../pdf/PDFDownloadButton';

const FacultyPayslipPDF = lazy(() => import('../../pdf/FacultyPayslipPDF'));

export default function SalaryTab({ currentFaculty }) {
  const { websiteConfig, pdfConfig } = useSiteConfig();

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Instructor Earnings & Honorarium Statement</h3>
          <p className="text-xs text-slate-500 mt-0.5">Detailed breakdown for Oct 2024 academic cycle ({currentFaculty.name})</p>
        </div>
        <Suspense fallback={<span className="text-xs text-slate-400">Preparing PDF…</span>}>
          <PDFDownloadButton
            document={<FacultyPayslipPDF faculty={currentFaculty} websiteConfig={websiteConfig} pdfConfig={pdfConfig} />}
            fileName={`Payslip_${currentFaculty?.name ? currentFaculty.name.replace(/\s+/g, '_') : 'Faculty'}_Oct2024.pdf`}
            buttonText="Download Payslip PDF"
            variant="indigo"
          />
        </Suspense>
      </div>

      {/* Real-time Salary Disbursement Status Banner */}
      {currentFaculty.disbursed ? (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-emerald-900 text-sm">Monthly Salary Disbursed & Deposited</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 text-[10px] font-black uppercase">
                  Bank Transfer Cleared
                </span>
              </div>
              <p className="text-emerald-700 font-medium mt-0.5">
                Your net earnings of <strong>₹{((currentFaculty.salary || 0) + (currentFaculty.honorarium || 0)).toLocaleString('en-IN')}</strong> have been approved by Finance Desk and transferred to your registered bank account.
              </p>
            </div>
          </div>
          <span className="font-mono text-emerald-800 text-[11px] font-bold bg-white/80 px-3 py-1.5 rounded-xl border border-emerald-200 shrink-0">
            TXN #NEFT-OCT-8842
          </span>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-amber-950 text-sm">Payout Clearance Pending</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 text-[10px] font-black uppercase">
                  Under Finance Review
                </span>
              </div>
              <p className="text-amber-800 font-medium mt-0.5">
                Your October 2024 earnings of <strong>₹{((currentFaculty.salary || 0) + (currentFaculty.honorarium || 0)).toLocaleString('en-IN')}</strong> are currently pending clearance at the Finance Command Desk.
              </p>
            </div>
          </div>
          <span className="font-mono text-amber-900 text-[11px] font-bold bg-white/80 px-3 py-1.5 rounded-xl border border-amber-200 shrink-0">
            STATUS: PENDING APPROVAL
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
          <span className="text-slate-400 font-bold uppercase text-[11px]">Monthly Base Salary</span>
          <div className="text-3xl font-extrabold text-slate-900 mt-1">₹{(currentFaculty.salary || 0).toLocaleString('en-IN')}</div>
          <p className="text-xs text-slate-500 mt-2">Fixed monthly pay contract</p>
        </div>

        <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100">
          <span className="text-indigo-700 font-bold uppercase text-[11px]">Lecture & Lab Honorarium</span>
          <div className="text-3xl font-extrabold text-indigo-700 mt-1">₹{(currentFaculty.honorarium || 0).toLocaleString('en-IN')}</div>
          <p className="text-xs text-indigo-600 mt-2">Calculated for conducted practical lab sessions</p>
        </div>
      </div>
    </div>
  );
}
