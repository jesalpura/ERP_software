import React, { useState } from 'react';
import { User, Calendar, BookOpen, Clock, Download, CheckCircle2, ShieldAlert, Award } from 'lucide-react';

export default function StudentPortalView({ students, transactions, notices }) {
  const [activeStudentId, setActiveStudentId] = useState(students[0]?.id || 'AT-2024-089');
  const currentStudent = students.find((s) => s.id === activeStudentId) || students[0];

  const studentTx = transactions.filter((t) => t.studentId === currentStudent.id);

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Student Profile & Switcher Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-4">
          <img src={currentStudent.avatar} alt={currentStudent.name} className="w-14 h-14 rounded-full object-cover border-2 border-blue-600" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{currentStudent.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-mono text-xs font-semibold">
                {currentStudent.id}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Enrolled: <strong className="text-slate-800">{currentStudent.course}</strong> • {currentStudent.batch}
            </p>
          </div>
        </div>

        {/* Simulator Student Switcher */}
        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 pl-2">Simulate Student:</span>
          <select
            value={activeStudentId}
            onChange={(e) => setActiveStudentId(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-900 outline-none"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Student Overview Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-400 font-bold uppercase">Attendance Record</span>
          <div className="text-3xl font-extrabold text-emerald-600 mt-1">{currentStudent.attendance}%</div>
          <div className="text-xs text-slate-500 mt-1">Overall Lab Attendance</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-400 font-bold uppercase">Paid Fee Balance</span>
          <div className="text-3xl font-extrabold text-slate-900 mt-1">₹{currentStudent.paidFee.toLocaleString('en-IN')}</div>
          <div className="text-xs text-slate-500 mt-1">Total Fee: ₹{currentStudent.totalFee.toLocaleString('en-IN')}</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-400 font-bold uppercase">Pending Installment</span>
          <div className={`text-3xl font-extrabold mt-1 ${currentStudent.pendingFee > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            ₹{currentStudent.pendingFee.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-slate-500 mt-1">{currentStudent.pendingFee > 0 ? 'Due via Cash/UPI' : 'Cleared'}</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-400 font-bold uppercase">Assigned Workstation</span>
          <div className="text-2xl font-extrabold text-blue-600 mt-1">{currentStudent.lab} • PC-14</div>
          <div className="text-xs text-slate-500 mt-1">Dedicated Terminal</div>
        </div>
      </div>

      {/* Course Timetable & Receipts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-4">
          <h2 className="text-base font-bold text-slate-900">My Fee Receipt History</h2>
          <div className="divide-y divide-slate-100">
            {studentTx.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">No prior receipts recorded for this student ID.</div>
            ) : (
              studentTx.map((tx) => (
                <div key={tx.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-blue-600">{tx.id}</span>
                    <div className="text-slate-500">{tx.installment} • {tx.mode}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900">₹{tx.amount.toLocaleString('en-IN')}</div>
                    <div className="text-emerald-600 font-semibold text-[11px]">{tx.status}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-4">
          <h2 className="text-base font-bold text-slate-900">Course Materials & Notices</h2>
          <div className="space-y-3">
            {notices.map((n) => (
              <div key={n.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <span className="text-[10px] font-bold text-blue-600 uppercase">{n.category}</span>
                <h4 className="font-semibold text-slate-900 mt-1">{n.title}</h4>
                <p className="text-slate-500 text-[11px] mt-1">{n.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
