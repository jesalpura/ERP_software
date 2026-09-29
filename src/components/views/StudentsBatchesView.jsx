import React, { useState } from 'react';
import { 
  Users, 
  Filter,
  UserCheck,
  Mail, 
  Phone, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  BookOpen,
  GraduationCap
} from 'lucide-react';

export default function StudentsBatchesView({
  students,
  faculty = [],
  searchQuery,
  setSearchQuery,
  onOpenCollectFee,
  onOpenAssignFaculty
}) {
  const [selectedCourse, setSelectedCourse] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const filteredStudents = students.filter((s) => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.course.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCourse = selectedCourse === 'All' || s.course.includes(selectedCourse);
    const matchesStatus = selectedStatus === 'All' || s.status === selectedStatus;

    return matchesSearch && matchesCourse && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Student Directory &amp; Batch Allocation</h1>
          <p className="text-xs text-slate-500 mt-1">Assign faculty, labs, and batches. Students self-register via the Student Portal sign-up.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-slate-100 text-slate-500 text-xs font-semibold flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            <span>Students self-register via sign-up</span>
          </div>
        </div>
      </div>


      {/* Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Courses:
          </span>
          {['All', 'MERN', 'Tally', 'Python', 'Java', 'CCC'].map((course) => (
            <button
              key={course}
              onClick={() => setSelectedCourse(course)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedCourse === course
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {course}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium outline-none border border-transparent focus:border-blue-500"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Overdue">Overdue</option>
            <option value="Paid">Paid</option>
          </select>
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] text-slate-400 font-bold uppercase tracking-wider whitespace-nowrap">
                <th className="py-3.5 px-6">Roll ID & Student</th>
                <th className="py-3.5 px-4">Course & Batch</th>
                <th className="py-3.5 px-4">Lab Seat</th>
                <th className="py-3.5 px-4">Attendance</th>
                <th className="py-3.5 px-4">Fee Summary</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 text-sm">
                    No student records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-xs"
                        />
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{student.name}</div>
                          <div className="font-mono text-[11px] text-slate-400">{student.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-800">{student.course}</div>
                      <div className="text-[11px] text-slate-400">{student.batch || <span className="text-amber-500 font-semibold">Not assigned</span>}</div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      {student.lab ? (
                        <div>
                          <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold block mb-1">
                            {student.lab}
                          </span>
                          {(() => {
                            const f = faculty.find((fac) =>
                              (fac.assignedBatches || []).some((b) => student.batch?.startsWith(b))
                            );
                            return f ? (
                              <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                <img src={f.avatar} alt={f.name} className="w-4 h-4 rounded-full object-cover" />
                                <span className="font-medium text-slate-600">{f.name}</span>
                              </div>
                            ) : null;
                          })()}
                        </div>
                      ) : (
                        <span className="text-[11px] text-amber-500 font-semibold">Not assigned</span>
                      )}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{student.attendance}%</span>
                        <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${student.attendance > 90 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                            style={{ width: `${student.attendance}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="text-slate-900 font-bold">₹{student.paidFee.toLocaleString('en-IN')} paid</div>
                      <div className="text-[11px] text-slate-400">Total: ₹{student.totalFee.toLocaleString('en-IN')}</div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        student.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                        student.status === 'Overdue' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => onOpenAssignFaculty && onOpenAssignFaculty(student)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-semibold transition-colors flex items-center gap-1"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          {student.lab ? 'Reassign' : 'Assign Faculty'}
                        </button>
                        <button
                          onClick={onOpenCollectFee}
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 text-xs font-semibold transition-colors"
                        >
                          Collect Fee
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
