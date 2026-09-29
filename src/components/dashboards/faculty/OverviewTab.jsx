import React from 'react';
import { 
  Clock, 
  Users, 
  MessageSquare, 
  Monitor, 
  ArrowUpRight, 
  Calendar, 
  Sparkles, 
  QrCode, 
  CheckCircle2 
} from 'lucide-react';
import CalendarView from '../../views/CalendarView';

export default function OverviewTab({
  currentFaculty,
  complaintsAndRequests,
  setActiveTab,
  selectedLabId,
  weeklySchedule,
  selectedScheduleDay,
  setSelectedScheduleDay,
  selectedFacultyId,
  handleGenerateQrCode
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Today Punch</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{currentFaculty.punchTime || '09:00 AM'}</div>
          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Checked In • {currentFaculty.status || 'Present'}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Assigned Batches</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{(currentFaculty.assignedBatches || []).length} Batches</div>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            {(currentFaculty.assignedBatches || []).map((b) => (
              <span key={b} className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100">
                {b}
              </span>
            ))}
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('complaints-requests')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Complaints & Requests</span>
            <MessageSquare className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-600 mt-2">
            {(complaintsAndRequests || []).filter(c => c.senderType === 'Faculty' && c.senderId === currentFaculty.id).length} Record(s)
          </div>
          <span className="text-[11px] text-indigo-600 font-semibold mt-1 flex items-center gap-1 group-hover:underline">
            Open Realtime Communication Desk →
          </span>
        </div>
      </div>

      {/* Allocated PCs Quick Summary Banner */}
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl p-6 shadow-xs border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-2xs">
            <Monitor className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Allocated PC Terminals Overview</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold border border-emerald-200 dark:border-emerald-800">
                Active in {selectedLabId || 'LAB-01'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Real-time workstation seat mapping, student login tracking, hardware status, and ping control.
            </p>
          </div>
        </div>
        <button
          onClick={() => setActiveTab('allocated-pc')}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-xs self-start md:self-auto cursor-pointer"
        >
          <span>View Allocated PCs Tab</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* OFFICIAL WEEKLY SCHEDULE DECIDED BY ADMIN */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-lg flex items-center gap-2">
                Weekly Class Timetable & Lab Schedule
                <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-extrabold border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-500" /> Decided & Published by Admin Desk
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Official weekly lecture allocations and lab room assignments for <strong>{currentFaculty.name}</strong>
            </p>
          </div>

          {/* Day Selector Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl overflow-x-auto">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'All Days'].map((day) => (
              <button
                key={day}
                onClick={() => setSelectedScheduleDay(day)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedScheduleDay === day
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Filtered Schedule Sessions */}
        {(() => {
          const allItems = Object.entries(weeklySchedule || {}).map(([key, val]) => {
            const [day, ...slotParts] = key.split('-');
            return { key, day, timeSlot: slotParts.join('-'), ...val };
          });

          const facultyItems = allItems.filter(
            (item) =>
              item.facultyId === currentFaculty.id ||
              item.facultyName?.toLowerCase() === currentFaculty.name?.toLowerCase() ||
              selectedFacultyId === item.facultyId
          );

          const displayItems = facultyItems.filter(
            (item) => selectedScheduleDay === 'All Days' || item.day === selectedScheduleDay
          );

          if (displayItems.length === 0) {
            return (
              <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-center flex flex-col items-center gap-2">
                <Calendar className="w-8 h-8 text-slate-400" />
                <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300">No Classes Assigned on {selectedScheduleDay}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm">
                  Admin has not scheduled any lecture sessions for {currentFaculty.name} on {selectedScheduleDay}. Check other days or contact Admin Desk.
                </p>
              </div>
            );
          }

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayItems.map((item) => (
                <div
                  key={item.key}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between gap-3 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200 text-[10px] font-extrabold flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {item.day} • {item.timeSlot}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                      {item.lab || 'Lab 01'}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{item.course}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>Batch: <strong className="text-slate-700 dark:text-slate-200 font-mono">{item.batch}</strong></span>
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">Assigned by Admin</span>
                    <button
                      onClick={handleGenerateQrCode}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Generate QR</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}

        {/* 6-Day Full Weekly Timetable Matrix View */}
        <div className="mt-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Full 6-Day Weekly Matrix Overview ({currentFaculty.name})
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Mon - Sat Complete Schedule</span>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700 whitespace-nowrap">
                  <th className="p-3 border-r border-slate-200 dark:border-slate-700">Day</th>
                  <th className="p-3 border-r border-slate-200 dark:border-slate-700">Assigned Session</th>
                  <th className="p-3 border-r border-slate-200 dark:border-slate-700">Time Slot</th>
                  <th className="p-3 border-r border-slate-200 dark:border-slate-700">Batch ID</th>
                  <th className="p-3">Assigned Lab</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => {
                  const dayItems = Object.entries(weeklySchedule || {}).filter(([key, val]) => {
                    const [itemDay] = key.split('-');
                    return itemDay === day && (val.facultyId === currentFaculty.id || val.facultyName?.toLowerCase() === currentFaculty.name?.toLowerCase());
                  });

                  if (dayItems.length === 0) {
                    return (
                      <tr key={day} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 text-slate-400">
                        <td className="p-3 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800">{day}</td>
                        <td colSpan={4} className="p-3 italic text-[11px]">No classes assigned by Admin</td>
                      </tr>
                    );
                  }

                  return dayItems.map(([key, val], idx) => {
                    const timeSlot = key.split('-').slice(1).join('-');
                    return (
                      <tr key={key} className="hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                        {idx === 0 && (
                          <td rowSpan={dayItems.length} className="p-3 font-bold text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 whitespace-nowrap">
                            {day}
                          </td>
                        )}
                        <td className="p-3 font-extrabold text-indigo-700 dark:text-indigo-300 border-r border-slate-100 dark:border-slate-800 whitespace-nowrap">{val.course}</td>
                        <td className="p-3 font-mono text-slate-600 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800 whitespace-nowrap">{timeSlot}</td>
                        <td className="p-3 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800 whitespace-nowrap">{val.batch}</td>
                        <td className="p-3 font-bold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">{val.lab}</td>
                      </tr>
                    );
                  });
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* EMBEDDED ACADEMIC & HOLIDAY CALENDAR WIDGET */}
      <div className="mt-2">
        <CalendarView embedded={true} userRole="faculty" />
      </div>
    </div>
  );
}
