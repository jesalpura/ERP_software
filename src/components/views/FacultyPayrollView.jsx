import React, { useState } from 'react';
import { GraduationCap, CheckCircle2, AlertCircle, DollarSign, Calendar, Clock, RotateCcw, Check, Sparkles } from 'lucide-react';

export default function FacultyPayrollView({ faculty, onUpdateFacultyDisbursement, onDisburseAllFaculty }) {
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const totalPayroll = faculty.reduce((acc, f) => acc + (f.salary || 0) + (f.honorarium || 0), 0);
  const disbursedTotal = faculty.filter((f) => f.disbursed).reduce((acc, f) => acc + (f.salary || 0) + (f.honorarium || 0), 0);
  const pendingTotal = totalPayroll - disbursedTotal;
  const pendingFaculty = faculty.filter((f) => !f.disbursed);

  const handleApprove = (f) => {
    if (onUpdateFacultyDisbursement) {
      onUpdateFacultyDisbursement(f.id, true);
    }
    showToast(`Salary payment of ₹${((f.salary || 0) + (f.honorarium || 0)).toLocaleString('en-IN')} approved & marked as Disbursed for ${f.name}.`);
  };

  const handleRevoke = (f) => {
    if (onUpdateFacultyDisbursement) {
      onUpdateFacultyDisbursement(f.id, false);
    }
    showToast(`Salary status for ${f.name} updated back to Pending Clearance.`);
  };

  const handleDisburseAll = () => {
    if (pendingFaculty.length === 0) return;
    if (onDisburseAllFaculty) {
      onDisburseAllFaculty();
    }
    showToast(`All ${pendingFaculty.length} pending faculty salaries (₹${pendingTotal.toLocaleString('en-IN')}) authorized & disbursed via NEFT/Bank Transfer!`);
  };

  return (
    <div className="flex flex-col gap-6 pb-12 font-sans relative">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2.5 text-xs font-semibold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            Faculty Attendance & Monthly Payroll <GraduationCap className="w-5 h-5 text-teal-600" />
          </h1>
          <p className="text-xs text-slate-500 mt-1">Instructor attendance rosters, honorarium calculation, and direct salary disbursement logs</p>
        </div>
        <div className="flex items-center gap-3">
          {pendingFaculty.length > 0 ? (
            <button 
              onClick={handleDisburseAll}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-md shadow-teal-600/20 flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-teal-200" />
              <span>Disburse All Pending ({pendingFaculty.length})</span>
            </button>
          ) : (
            <div className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>All Faculty Salaries Cleared</span>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-400 font-bold uppercase">Total Monthly Budget</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">₹{totalPayroll.toLocaleString('en-IN')}</div>
          <div className="text-xs text-slate-500 mt-1">Base Salary + Lecture Honorarium</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-400 font-bold uppercase">Disbursed Amount</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">₹{disbursedTotal.toLocaleString('en-IN')}</div>
          <div className="text-xs text-emerald-700 font-medium mt-1">Cleared via Bank Transfer</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-400 font-bold uppercase">Pending Clearance</span>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">₹{pendingTotal.toLocaleString('en-IN')}</div>
          <div className="text-xs text-amber-700 font-medium mt-1">
            {pendingFaculty.length} Faculty Member{pendingFaculty.length === 1 ? '' : 's'} Pending
          </div>
        </div>
      </div>

      {/* Faculty Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Faculty Payroll & Payout Authorization Ledger</h3>
            <p className="text-xs text-slate-500 mt-0.5">Toggle salary disbursement status for individual instructors</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
            {faculty.length} Faculty Members Listed
          </span>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] text-slate-400 font-bold uppercase tracking-wider whitespace-nowrap">
                <th className="py-3.5 px-4 sm:px-6">Faculty Member</th>
                <th className="py-3.5 px-4">Subject / Specialization</th>
                <th className="py-3.5 px-4">Today Punch</th>
                <th className="py-3.5 px-4">Monthly Base Salary</th>
                <th className="py-3.5 px-4">Honorarium Bonus</th>
                <th className="py-3.5 px-4">Total Net Payout</th>
                <th className="py-3.5 px-4">Payout Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Disbursement Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {faculty.map((f) => {
                const totalPayout = (f.salary || 0) + (f.honorarium || 0);
                return (
                  <tr key={f.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img src={f.avatar} alt={f.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{f.name}</div>
                          <div className="text-[11px] text-slate-400">{f.role} ({f.id})</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-800 whitespace-nowrap">{f.subject}</td>
                    <td className="py-4 px-4 font-mono text-slate-600 whitespace-nowrap">{f.punchTime}</td>
                    <td className="py-4 px-4 font-bold text-slate-900 whitespace-nowrap">₹{(f.salary || 0).toLocaleString('en-IN')}</td>
                    <td className="py-4 px-4 font-semibold text-blue-600 whitespace-nowrap">+₹{(f.honorarium || 0).toLocaleString('en-IN')}</td>
                    <td className="py-4 px-4 font-extrabold text-slate-900 whitespace-nowrap">₹{totalPayout.toLocaleString('en-IN')}</td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      {f.disbursed ? (
                        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Disbursed & Paid
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending Clearance
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                      {f.disbursed ? (
                        <button 
                          onClick={() => handleRevoke(f)}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                          <span>Mark Pending</span>
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleApprove(f)}
                          className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                        >
                          <Check className="w-3.5 h-3.5 text-teal-200" />
                          <span>Approve & Disburse</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
