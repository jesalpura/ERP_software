import React, { useState, useEffect } from 'react';
import { X, UserCheck, GraduationCap, FlaskConical, Users, CheckCircle2, Loader2 } from 'lucide-react';

export default function AssignFacultyModal({ isOpen, onClose, student, faculty, labs, onSave }) {
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [selectedLab, setSelectedLab]             = useState('');
  const [selectedBatch, setSelectedBatch]         = useState('');
  const [saving, setSaving]                       = useState(false);

  // Pre-fill from existing student data when modal opens
  useEffect(() => {
    if (student) {
      const matchedFaculty = faculty.find((f) =>
        (f.assignedBatches || []).some((b) => student.batch?.startsWith(b))
      );
      setSelectedFacultyId(matchedFaculty?.id || '');
      setSelectedLab(student.lab || '');
      setSelectedBatch(student.batch || '');
    }
  }, [student, faculty]);

  if (!isOpen || !student) return null;

  const selectedFaculty = faculty.find((f) => f.id === selectedFacultyId);

  const handleFacultyChange = (fId) => {
    setSelectedFacultyId(fId);
    const f = faculty.find((x) => x.id === fId);
    if (f?.assignedBatches?.length > 0) {
      setSelectedBatch(f.assignedBatches[0]);
    } else {
      setSelectedBatch('');
    }
  };

  const handleLabChange = (labId) => {
    setSelectedLab(labId);
    const lab = labs.find((l) => l.id === labId);
    if (lab) {
      const f = faculty.find((x) => x.name === lab.faculty);
      if (f) {
        setSelectedFacultyId(f.id);
        if (f.assignedBatches?.length > 0) setSelectedBatch(f.assignedBatches[0]);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFacultyId || !selectedLab || !selectedBatch) return;
    setSaving(true);
    await onSave(student.id, {
      facultyId: selectedFacultyId,
      facultyName: selectedFaculty?.name || '',
      lab: selectedLab,
      batch: selectedBatch,
    });
    setSaving(false);
    onClose();
  };

  const inputCls =
    'w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-900 text-xs outline-none focus:bg-white focus:border-indigo-500 transition-colors';

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto animate-in fade-in zoom-in-95 duration-150">

        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Assign Faculty &amp; Lab</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Student: <span className="font-semibold text-slate-700">{student.name}</span>
                <span className="ml-2 font-mono text-slate-400">{student.id}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Assignment Banner */}
        <div className="px-6 pt-4">
          <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 flex items-start gap-3">
            <Users className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div className="text-[11px] text-amber-800">
              <span className="font-bold block mb-0.5">Current Assignment</span>
              <span>Lab: <b>{student.lab || 'Not assigned'}</b> · Batch: <b>{student.batch || 'Not assigned'}</b></span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">

          {/* Lab Selection */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
              <FlaskConical className="w-3.5 h-3.5 text-indigo-500" />
              Assign Lab
            </label>
            <select
              value={selectedLab}
              onChange={(e) => handleLabChange(e.target.value)}
              required
              className={inputCls}
            >
              <option value="">— Select a Lab —</option>
              {labs.map((lab) => (
                <option key={lab.id} value={lab.id}>
                  {lab.id} — {lab.name} · {lab.faculty} · {lab.timing}
                </option>
              ))}
            </select>
          </div>

          {/* Faculty Selection */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
              Assign Faculty
            </label>
            <select
              value={selectedFacultyId}
              onChange={(e) => handleFacultyChange(e.target.value)}
              required
              className={inputCls}
            >
              <option value="">— Select Faculty —</option>
              {faculty.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} · {f.role} · {f.subject}
                </option>
              ))}
            </select>

            {/* Faculty info card */}
            {selectedFaculty && (
              <div className="mt-2 flex items-center gap-3 p-3 rounded-xl bg-indigo-50 border border-indigo-100">
                <img
                  src={selectedFaculty.avatar}
                  alt={selectedFaculty.name}
                  className="w-9 h-9 rounded-full object-cover border border-indigo-200"
                />
                <div>
                  <div className="font-bold text-indigo-900 text-xs">{selectedFaculty.name}</div>
                  <div className="text-[11px] text-indigo-600">{selectedFaculty.subject}</div>
                  <div className="text-[10px] text-indigo-400 mt-0.5">
                    Batches: {(selectedFaculty.assignedBatches || []).join(', ') || 'None yet'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Batch */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-500" />
              Batch / Timing
            </label>
            {selectedFaculty && selectedFaculty.assignedBatches?.length > 0 ? (
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                required
                className={inputCls}
              >
                <option value="">— Select a Batch —</option>
                {selectedFaculty.assignedBatches.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                required
                placeholder="e.g. MERN-B2 (10:00 AM - 12:00 PM)"
                className={inputCls}
              />
            )}
            <p className="text-[10px] text-slate-400 mt-1">
              Batches are auto-listed from the selected faculty's assigned batches.
            </p>
          </div>

          {/* Footer */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !selectedFacultyId || !selectedLab || !selectedBatch}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors shadow-md shadow-indigo-500/20 flex items-center gap-2 text-xs disabled:opacity-60"
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /><span>Saving...</span></>
              ) : (
                <><CheckCircle2 className="w-4 h-4" /><span>Confirm Assignment</span></>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
