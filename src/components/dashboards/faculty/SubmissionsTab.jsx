import React, { useState } from 'react';
import { BookOpen, FileCheck, Send, CheckCircle2, AlertCircle, UserX, UserCheck } from 'lucide-react';

export default function SubmissionsTab({ 
  assignments, 
  students, 
  facultyStudents, 
  currentFaculty, 
  studentGrades, 
  onGradeChange, 
  showToast,
  submissions,
  localAssignments,
  newAssignmentOpen,
  setNewAssignmentOpen,
  newAssignment,
  setNewAssignment,
  handleAddAssignment,
  handleToggleSubmission,
  handleSubmissionGrade
}) {
  const [selectedAsmId, setSelectedAsmId] = useState(assignments[0]?.id || null);
  const [submissionFilter, setSubmissionFilter] = useState('All');

  // Show only assignments relevant to this faculty's courses
  const facultyCourses = (currentFaculty?.assignedBatches || []).map(b => b.split('-')[0]);
  const relevantAssignments = localAssignments;
  const selectedAsm = relevantAssignments.find((a) => a.id === selectedAsmId) || relevantAssignments[0];
  const asmSubmissions = submissions[selectedAsm?.id] || {};

  const submittedStudents = facultyStudents.filter((s) => asmSubmissions[s.id]?.submitted);
  const pendingStudents = facultyStudents.filter((s) => !asmSubmissions[s.id]?.submitted);
  const displayStudents = submissionFilter === 'Submitted' ? submittedStudents
    : submissionFilter === 'Pending' ? pendingStudents
    : facultyStudents;

  const submittedCount = submittedStudents.length;
  const totalCount = facultyStudents.length;
  const onTimeRate = totalCount > 0 ? Math.round((submittedCount / totalCount) * 100) : 0;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Student Assignment Submissions
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Review, grade, and track submissions from your enrolled students</p>
        </div>
        <button
          onClick={() => setNewAssignmentOpen(!newAssignmentOpen)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all shrink-0"
        >
          <FileCheck className="w-4 h-4" />
          {newAssignmentOpen ? 'Cancel' : '+ New Assignment'}
        </button>
      </div>

      {/* New Assignment Form */}
      {newAssignmentOpen && (
        <form onSubmit={handleAddAssignment} className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-indigo-900">📋 Publish New Assignment to {facultyStudents.length} Students</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-indigo-800 uppercase">Assignment Title *</label>
              <input
                required
                value={newAssignment.title}
                onChange={(e) => setNewAssignment((p) => ({ ...p, title: e.target.value }))}
                placeholder="e.g. REST API with JWT Auth"
                className="px-3.5 py-2.5 rounded-xl bg-white border border-indigo-200 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-400/30"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-indigo-800 uppercase">Due Date</label>
              <input
                type="date"
                value={newAssignment.dueDate}
                onChange={(e) => setNewAssignment((p) => ({ ...p, dueDate: e.target.value }))}
                className="px-3.5 py-2.5 rounded-xl bg-white border border-indigo-200 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-400/30"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-indigo-800 uppercase">Description / Instructions</label>
            <textarea
              rows={2}
              value={newAssignment.description}
              onChange={(e) => setNewAssignment((p) => ({ ...p, description: e.target.value }))}
              placeholder="Describe what students need to submit..."
              className="px-3.5 py-2.5 rounded-xl bg-white border border-indigo-200 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-400/30 resize-none"
            />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md flex items-center gap-2">
              <Send className="w-3.5 h-3.5" /> Publish Assignment
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Assignment List Panel */}
        <div className="lg:w-72 shrink-0 flex flex-col gap-2">
          {relevantAssignments.length === 0 ? (
            <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
              No assignments published yet.
            </div>
          ) : (
            relevantAssignments.map((a) => {
              const asmSubs = submissions[a.id] || {};
              const subCount = facultyStudents.filter((s) => asmSubs[s.id]?.submitted).length;
              const isSelected = selectedAsmId === a.id;
              return (
                <button
                  key={a.id}
                  onClick={() => setSelectedAsmId(a.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex flex-col gap-2 ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-700 text-white shadow-md'
                      : 'bg-white border-slate-200 hover:border-indigo-300 text-slate-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className={`text-xs font-bold leading-snug ${isSelected ? 'text-white' : 'text-slate-900'}`}>{a.title}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                      a.status === 'Active'
                        ? isSelected ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                        : isSelected ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
                    }`}>{a.status}</span>
                  </div>
                  <div className={`text-[11px] ${isSelected ? 'text-indigo-200' : 'text-slate-500'}`}>
                    Due: {a.dueDate}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`flex-1 h-1.5 rounded-full ${isSelected ? 'bg-white/20' : 'bg-slate-100'}`}>
                      <div
                        className={`h-full rounded-full ${isSelected ? 'bg-white' : 'bg-indigo-500'}`}
                        style={{ width: facultyStudents.length > 0 ? `${(subCount / facultyStudents.length) * 100}%` : '0%' }}
                      />
                    </div>
                    <span className={`text-[10px] font-bold shrink-0 ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                      {subCount}/{facultyStudents.length}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Submission Detail Panel */}
        {selectedAsm ? (
          <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
            {/* Assignment Header */}
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{selectedAsm.title}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">{selectedAsm.course} • Due: {selectedAsm.dueDate}</p>
                {selectedAsm.description && (
                  <p className="text-[11px] text-slate-600 mt-1 italic">{selectedAsm.description}</p>
                )}
              </div>
              {/* Summary Stats */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-center px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-100">
                  <div className="text-lg font-extrabold text-emerald-700">{submittedCount}</div>
                  <div className="text-[10px] text-emerald-600 font-semibold">Submitted</div>
                </div>
                <div className="text-center px-3 py-2 rounded-xl bg-rose-50 border border-rose-100">
                  <div className="text-lg font-extrabold text-rose-600">{totalCount - submittedCount}</div>
                  <div className="text-[10px] text-rose-500 font-semibold">Pending</div>
                </div>
                <div className="text-center px-3 py-2 rounded-xl bg-indigo-50 border border-indigo-100">
                  <div className="text-lg font-extrabold text-indigo-700">{onTimeRate}%</div>
                  <div className="text-[10px] text-indigo-600 font-semibold">Rate</div>
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-1">
              {['All', 'Submitted', 'Pending'].map((f) => (
                <button
                  key={f}
                  onClick={() => setSubmissionFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    submissionFilter === f ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {f} {f === 'Submitted' ? `(${submittedCount})` : f === 'Pending' ? `(${totalCount - submittedCount})` : `(${totalCount})`}
                </button>
              ))}
            </div>

            {/* Student Submission Rows */}
            {displayStudents.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No students in this filter. All {totalCount} are {submissionFilter === 'Submitted' ? 'pending' : 'submitted'}.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-3 px-5">Student</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Submitted At</th>
                      <th className="py-3 px-4">Note</th>
                      <th className="py-3 px-4">Grade</th>
                      <th className="py-3 px-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {displayStudents.map((s) => {
                      const sub = asmSubmissions[s.id] || {};
                      return (
                        <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-5 whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <img src={s.avatar} alt={s.name} className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0" />
                              <div>
                                <div className="font-bold text-slate-900">{s.name}</div>
                                <div className="font-mono text-[10px] text-slate-400">{s.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {sub.submitted ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                                <CheckCircle2 className="w-3 h-3" /> Submitted
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-[11px] font-bold">
                                <AlertCircle className="w-3 h-3" /> Pending
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                            {sub.submittedAt || <span className="text-slate-300 italic">—</span>}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 max-w-[140px] truncate">
                            {sub.fileNote || <span className="text-slate-300 italic">—</span>}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {sub.submitted ? (
                              <select
                                value={sub.grade || ''}
                                onChange={(e) => handleSubmissionGrade(selectedAsm.id, s.id, e.target.value)}
                                className="px-2 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-700 outline-none focus:ring-2 focus:ring-indigo-400/30"
                              >
                                <option value="">Grade</option>
                                <option value="O">O (Outstanding)</option>
                                <option value="A+">A+</option>
                                <option value="A">A</option>
                                <option value="B+">B+</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                                <option value="F">F (Fail)</option>
                              </select>
                            ) : (
                              <span className="text-slate-300 text-xs italic">Not submitted</span>
                            )}
                          </td>
                          <td className="py-3.5 px-5 text-right whitespace-nowrap">
                            <button
                              onClick={() => handleToggleSubmission(selectedAsm.id, s.id)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ml-auto ${
                                sub.submitted
                                  ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200'
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              }`}
                            >
                              {sub.submitted ? (
                                <><UserX className="w-3.5 h-3.5" /> Unmark</>
                              ) : (
                                <><UserCheck className="w-3.5 h-3.5" /> Mark Submitted</>
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-12 flex items-center justify-center text-slate-400 text-sm">
            Select an assignment to view submissions
          </div>
        )}
      </div>
    </div>
  );
}
