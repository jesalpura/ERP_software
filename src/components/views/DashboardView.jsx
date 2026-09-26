import React, { useState, useEffect } from 'react';
import PDFDownloadButton from '../pdf/PDFDownloadButton';
import DayAuditReportPDF from '../pdf/DayAuditReportPDF';
import { 
  School, 
  Clock, 
  Download, 
  UserPlus, 
  Receipt, 
  Send, 
  CalendarPlus,
  Calendar,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  Monitor,
  CheckCircle,
  QrCode,
  DollarSign,
  Filter,
  Eye,
  CheckCircle2,
  Users,
  Megaphone
} from 'lucide-react';

export default function DashboardView({
  students,
  transactions,
  labs,
  faculty,
  notices = [],
  onOpenRegister,
  onOpenCollectFee,
  onOpenPublishNotice,
  onViewReceipt,
  setActiveView
}) {
  const [timeString, setTimeString] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) + ' IST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const totalStudents = students.length;
  const activeBatchesCount = labs.length * 2;
  const monthCollection = transactions.reduce((acc, t) => acc + t.amount, 0) + 319000;
  const pendingDues = students.reduce((acc, s) => acc + s.pendingFee, 0);

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Welcome & Institutional Pulse Header */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-white via-blue-50/50 to-white p-6 shadow-xs border border-slate-200/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/30">
              <School className="w-8 h-8" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back, Rajesh</h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Academic Session 2024-25 • Term 2 • <span className="text-blue-600 font-medium">4 Computer Labs Operational</span> • 92% Average Occupancy
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 self-start md:self-auto bg-white/80 backdrop-blur-xs p-1.5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 px-3 py-1.5 text-slate-600 text-xs font-mono">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>{timeString || '05:58:37 AM IST'}</span>
            </div>
            <div className="h-4 w-px bg-slate-200"></div>
            <PDFDownloadButton
              document={<DayAuditReportPDF />}
              fileName="ERP_Day_Audit_Report.pdf"
              buttonText="Day Report"
              variant="light"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5"
            />
          </div>
        </div>
      </section>

      {/* Quick Action Command Bar */}
      <section className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenRegister}
            className="group px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-xs flex items-center gap-2.5 text-xs font-bold"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Student</span>
          </button>

          <button
            onClick={() => setActiveView('academic-calendar')}
            className="group px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white transition-all shadow-xs flex items-center gap-2 text-xs font-bold cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-white" />
            <span>🇮🇳 Holiday Calendar</span>
          </button>

          <button
            onClick={() => setActiveView('students-batches')}
            className="group px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-all border border-slate-200 flex items-center gap-2.5 text-xs font-bold cursor-pointer"
          >
            <CalendarPlus className="w-4 h-4 text-slate-600" />
            <span>Assign Batch</span>
          </button>
        </div>

        {/* Quick Tasks */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden lg:inline">Quick Tasks:</span>
          
          {onOpenPublishNotice && (
            <button
              onClick={onOpenPublishNotice}
              className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="Publish Campus Announcement"
            >
              <Megaphone className="w-3.5 h-3.5 text-indigo-600" />
              <span>Publish Notice</span>
            </button>
          )}

          <button
            onClick={onOpenCollectFee}
            className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
            title="Collect Fee & Issue E-Receipt"
          >
            <Receipt className="w-3.5 h-3.5 text-teal-600" />
            <span>Collect Fee</span>
          </button>
        </div>
      </section>

      {/* Key Academic & Operational Metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Stat 1: Total Students */}
        <div className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Enrolled</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                <ArrowUpRight className="w-3 h-3" />+12 this mo
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">204</span>
              <span className="text-xs text-slate-500 font-medium">Active Students</span>
            </div>
          </div>
          <div className="mt-4 pt-3 bg-slate-50/80 -mx-5 -mb-5 px-5 pb-3 border-t border-slate-100">
            <div className="flex justify-between text-xs text-slate-500">
              <span>IT & Full Stack: <strong className="text-slate-900">140</strong></span>
              <span>Tally/Accounts: <strong className="text-slate-900">64</strong></span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 flex overflow-hidden">
              <div className="bg-blue-600 h-full w-[68%]" title="Coding & IT (68%)"></div>
              <div className="bg-teal-600 h-full w-[32%]" title="Finance & Accounting (32%)"></div>
            </div>
          </div>
        </div>

        {/* Stat 2: Active Batches */}
        <div className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Batch Schedules</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 text-xs font-medium">
                4 Labs Live
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">8</span>
              <span className="text-xs text-slate-500 font-medium">Batches Running Today</span>
            </div>
          </div>
          <div className="mt-4 pt-3 bg-slate-50/80 -mx-5 -mb-5 px-5 pb-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500"></span>Morning: 4</span>
              <span className="flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-indigo-500"></span>Evening: 4</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 flex overflow-hidden">
              <div className="bg-amber-500 h-full w-1/2"></div>
              <div className="bg-indigo-500 h-full w-1/2"></div>
            </div>
          </div>
        </div>

        {/* Stat 3: Fees Collected */}
        <div className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Month Collection</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                <TrendingUp className="w-3 h-3" />+18% MoM
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">₹{monthCollection.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <div className="mt-4 pt-3 bg-slate-50/80 -mx-5 -mb-5 px-5 pb-3 border-t border-slate-100">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">84% of ₹4,10,000 Target</span>
              <span className="font-semibold text-slate-900">12 Days Left</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full w-[84%]"></div>
            </div>
          </div>
        </div>

        {/* Stat 4: Pending Dues */}
        <div className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Uncollected Dues</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-xs font-bold">
                <AlertTriangle className="w-3 h-3" />Action req.
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-rose-600 tracking-tight">₹{pendingDues.toLocaleString('en-IN')}</span>
              <span className="text-xs text-slate-500 font-medium">Pending</span>
            </div>
          </div>
          <div className="mt-4 pt-2.5 bg-rose-50/50 -mx-5 -mb-5 px-5 pb-3 border-t border-rose-100 flex items-center justify-between">
            <span className="text-xs text-rose-700 font-medium">28 Overdue Installments</span>
            <span className="text-xs text-rose-700 font-bold">Action Required</span>
          </div>
        </div>
      </section>

      {/* 2-Column Main Operation Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT PANEL: 8 Columns */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Live Classroom & Lab Utilization Grid */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Live Classroom & Lab Utilization</h2>
                <p className="text-xs text-slate-500 mt-0.5">Real-time workstation engagement • Currently 74 of 80 Terminals In Use</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Midday Session (10:00 - 12:00)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {labs.map((lab) => (
                <div key={lab.id} className="rounded-xl bg-slate-50 p-4 flex flex-col gap-3 border border-slate-200/60 hover:shadow-xs transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-semibold">{lab.id}</span>
                      <span className="font-bold text-sm text-slate-900">{lab.name}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      lab.status.includes('Progress') ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {lab.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Faculty: <strong>{lab.faculty}</strong></span>
                    <span>{lab.timing}</span>
                  </div>

                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Capacity Occupied</span>
                      <span className="font-semibold text-slate-900">{lab.occupied} / {lab.capacity} PCs ({lab.occupancyPct}%)</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div className={`h-full rounded-full ${lab.barColor}`} style={{ width: `${lab.occupancyPct}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Faculty Realtime Presence & Status Monitor */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">Realtime Faculty Presence & Status</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    Live Supabase Sync
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Live tracking: In Lab, Ready for Class, Office Hours & Leave status</p>
              </div>
              <button 
                onClick={() => setActiveView('schedule-builder')}
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
              >
                View Full Timetable →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              {faculty.map((fac) => {
                const isLab = fac.status === 'In Session' || fac.status === 'In Lab';
                const isReady = fac.status === 'Ready';
                const isOffice = fac.status === 'Office Hours';
                const isLeave = fac.status === 'On Leave' || fac.status === 'Leave';

                const badgeBg = isLab ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                                isReady ? 'bg-blue-50 text-blue-800 border-blue-200' :
                                isOffice ? 'bg-sky-50 text-sky-800 border-sky-200' :
                                'bg-amber-50 text-amber-800 border-amber-200';

                const dotColor = isLab ? 'bg-emerald-500 animate-pulse' :
                                 isReady ? 'bg-blue-500' :
                                 isOffice ? 'bg-sky-500' :
                                 'bg-amber-500';

                const statusText = isLab ? 'In Lab (In Session)' :
                                   isReady ? 'Ready for Session' :
                                   isOffice ? 'In Staff Office' : 'On Leave';

                return (
                  <div key={fac.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col gap-2.5">
                    <div className="flex items-center gap-3">
                      <img src={fac.avatar} alt={fac.name} className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-200" />
                      <div className="flex flex-col min-w-0">
                        <span className="font-extrabold text-xs text-slate-900 truncate">{fac.name}</span>
                        <span className="text-[10px] text-slate-500 truncate">{fac.subject}</span>
                      </div>
                    </div>

                    <div className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border flex items-center justify-between ${badgeBg}`}>
                      <span className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${dotColor}`}></span>
                        {statusText}
                      </span>
                      <span className="text-[9px] opacity-75 font-mono">LIVE</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Fee Transactions & Invoices Table */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Recent Fee Transactions</h2>
                <p className="text-xs text-slate-500 mt-0.5">Showing latest 6 transactions recorded in Ledger</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setActiveView('fee-ledger')}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs flex items-center gap-1.5"
                >
                  View All Ledger →
                </button>
              </div>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-6">Student & Roll #</th>
                    <th className="py-3 px-4">Course</th>
                    <th className="py-3 px-4">Receipt / Voucher</th>
                    <th className="py-3 px-4">Mode</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {transactions.slice(0, 6).map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={tx.avatar}
                            alt={tx.studentName}
                            className="h-9 w-9 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <div className="font-semibold text-slate-900">{tx.studentName}</div>
                            <div className="font-mono text-[11px] text-slate-400">{tx.studentId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                          {tx.course}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 font-medium">{tx.id}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-900">{tx.mode}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">₹{tx.amount.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-4 text-slate-400">{tx.timestamp}</td>
                      <td className="py-3.5 px-6 text-right">
                        <button
                          onClick={() => onViewReceipt(tx)}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-[11px] font-semibold transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" /> Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: 4 Columns */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Quick Notice & Auto-Scrolling Reminders Widget */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 flex flex-col gap-4 overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Announcements & Reminders</h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold flex items-center gap-1 border border-blue-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                  Live Feed
                </span>
              </div>
              {onOpenPublishNotice ? (
                <button
                  onClick={onOpenPublishNotice}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer border border-indigo-500/50"
                  title="Add New Reminder / Campus Notice Manually"
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>+ Add Reminder</span>
                </button>
              ) : (
                <span className="text-[11px] font-medium text-slate-400">Campus Notices</span>
              )}
            </div>
            
            {/* Auto-scrolling ticker container */}
            <div className="relative h-64 overflow-hidden rounded-xl bg-slate-50/50 p-2 border border-slate-100 group">
              <div className="animate-auto-scroll flex flex-col gap-3">
                {/* Dynamically Map Notices or Fallback Cards */}
                {(notices && notices.length > 0 ? [...notices, ...notices] : []).map((n, idx) => {
                  const isUrgent = n.priority === 'Urgent' || n.priority === 'High';
                  return (
                    <div 
                      key={`${n.id}-${idx}`}
                      className={`p-3.5 rounded-xl border shadow-2xs ${
                        isUrgent 
                          ? 'bg-rose-50/80 border-rose-200/80' 
                          : 'bg-amber-50/80 border-amber-200/80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isUrgent ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {n.category || 'General Notice'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{n.date || 'Today'}</span>
                      </div>
                      <h4 className="font-semibold text-xs text-slate-900 mt-1.5">{n.title}</h4>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                        {n.body}
                      </p>
                    </div>
                  );
                })}

                {/* Default Fallback Reminders if notices is empty */}
                {(!notices || notices.length === 0) && (
                  <>
                    <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 shadow-2xs">
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold uppercase">Academic Schedule</span>
                      <h4 className="font-semibold text-xs text-slate-900 mt-1.5">Diwali Session Schedule & Lab Maintenance</h4>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                        All evening batches (04:00 PM onwards) will undergo practical project reviews in Lab 1 & 2.
                      </p>
                      <span className="text-[10px] text-slate-400 mt-2 block">Posted Oct 24, 2024</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-rose-50/80 border border-rose-200/80 shadow-2xs">
                      <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold uppercase">Fee Clearance</span>
                      <h4 className="font-semibold text-xs text-slate-900 mt-1.5">Quarterly Fee Installment Clearance</h4>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                        28 overdue installments pending. Clear at counter or via online portal before Friday.
                      </p>
                      <span className="text-[10px] text-slate-400 mt-2 block">Posted Oct 20, 2024</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats & Faculty Roster Summary */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-900">Faculty Roster Today</h3>
            <div className="space-y-3">
              {faculty.map((f) => (
                <div key={f.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <img src={f.avatar} alt={f.name} className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <div className="text-xs font-semibold text-slate-900">{f.name}</div>
                      <div className="text-[11px] text-slate-400">{f.subject}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    f.status === 'Present' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {f.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
