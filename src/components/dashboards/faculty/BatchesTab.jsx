import React, { useState } from 'react';
import { Search, UserCheck, UserX } from 'lucide-react';

export default function BatchesTab({ 
  currentFaculty, 
  facultyStudents, 
  onMarkPresent, 
  onMarkAbsent 
}) {
  const [rosterSearch, setRosterSearch] = useState('');
  const [batchFilter, setBatchFilter] = useState('All');

  const filteredStudents = facultyStudents.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(rosterSearch.toLowerCase()) || s.id.toLowerCase().includes(rosterSearch.toLowerCase());
    const matchesBatch = batchFilter === 'All' || s.batch?.startsWith(batchFilter);
    return matchesSearch && matchesBatch;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Enrolled Students Roster</h3>
          <p className="text-xs text-slate-500 mt-0.5">Showing students assigned to {currentFaculty.subject} batches</p>
        </div>

        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 sm:gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search student or roll #..."
              value={rosterSearch}
              onChange={(e) => setRosterSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-100 text-xs font-semibold rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 w-full xs:w-44"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto">
            {['All', ...(currentFaculty?.assignedBatches || [])].map((b) => (
              <button
                key={b}
                onClick={() => setBatchFilter(b)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  batchFilter === b ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop table — hidden on mobile */}
      <div className="hidden sm:block overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-[11px] text-slate-400 font-bold uppercase tracking-wider whitespace-nowrap">
              <th className="py-3 px-4 sm:px-6">Student & Roll #</th>
              <th className="py-3 px-4">Batch</th>
              <th className="py-3 px-4">Attendance</th>
              <th className="py-3 px-4">Grade</th>
              <th className="py-3 px-4 hidden md:table-cell">Project</th>
              <th className="py-3 px-4 sm:px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filteredStudents.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 sm:px-6 whitespace-nowrap">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <img src={s.avatar} alt={s.name} className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0" />
                    <div className="min-w-0">
                      <span className="font-bold text-slate-900 block leading-tight truncate">{s.name}</span>
                      <span className="font-mono text-[11px] text-slate-400">{s.id}</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 font-semibold text-slate-700 whitespace-nowrap">{s.batch}</td>
                <td className="py-3 px-4 font-bold text-emerald-600 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span>{s.attendance || 0}%</span>
                    <div className="w-12 bg-slate-200 rounded-full h-1.5 overflow-hidden hidden lg:block">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${s.attendance || 0}%` }}></div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-extrabold text-[11px] border border-indigo-100 whitespace-nowrap">
                    {s.gpa || 'N/A'}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-600 hidden md:table-cell whitespace-nowrap">{s.projectStatus}</td>
                <td className="py-3 px-4 sm:px-6 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1">
                    <button 
                      onClick={() => onMarkPresent(s.id)}
                      className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors border border-emerald-200 cursor-pointer"
                      title="Mark Present (+2%)"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => onMarkAbsent(s.id)}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors border border-rose-200 cursor-pointer"
                      title="Mark Absent (-2%)"
                    >
                      <UserX className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card list — visible only on small screens */}
      <div className="sm:hidden flex flex-col divide-y divide-slate-100">
        {filteredStudents.map((s) => (
          <div key={s.id} className="p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <img src={s.avatar} alt={s.name} className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="font-bold text-slate-900 text-sm block leading-tight truncate">{s.name}</span>
                <span className="font-mono text-[11px] text-slate-400">{s.id} • {s.batch}</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-extrabold text-xs border border-indigo-100 shrink-0">
                {s.gpa || 'N/A'}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 whitespace-nowrap">Attendance:</span>
                <span className="text-xs font-bold text-emerald-600 whitespace-nowrap">{s.attendance || 0}%</span>
                <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden shrink-0">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${s.attendance || 0}%` }}></div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => onMarkPresent(s.id)}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold transition-colors border border-emerald-200 flex items-center gap-1 shrink-0 whitespace-nowrap"
                >
                  <UserCheck className="w-3 h-3 shrink-0" /> Present
                </button>
                <button
                  onClick={() => onMarkAbsent(s.id)}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold transition-colors border border-rose-200 flex items-center gap-1 shrink-0 whitespace-nowrap"
                >
                  <UserX className="w-3 h-3 shrink-0" /> Absent
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
