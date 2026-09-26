import React, { useState } from 'react';
import { erpService } from '../../services/erpService';
import { 
  Calendar, 
  Clock, 
  UserCheck, 
  Send, 
  Trash2, 
  Plus, 
  Database, 
  Bell, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  SlidersHorizontal,
  Info,
  Layers,
  ChevronRight
} from 'lucide-react';

export default function FacultyScheduleView({ faculty, labs, externalSchedule, setExternalSchedule }) {
  // Pre-configured default weekly schedule matrix
  const initialSchedule = {
    'Monday-09:00 AM - 10:30 AM': {
      facultyId: 'FAC-001',
      facultyName: 'Amit Verma',
      course: 'MERN Full Stack',
      batch: 'MERN-B1',
      lab: 'Lab 01',
      color: 'blue'
    },
    'Monday-10:30 AM - 12:00 PM': {
      facultyId: 'FAC-002',
      facultyName: 'Neha Gupta',
      course: 'Tally Prime + GST',
      batch: 'Tally-B1',
      lab: 'Lab 02',
      color: 'emerald'
    },
    'Tuesday-11:30 AM - 01:00 PM': {
      facultyId: 'FAC-003',
      facultyName: 'S. K. Roy',
      course: 'Java Spring Boot',
      batch: 'Java-B3',
      lab: 'Lab 03',
      color: 'indigo'
    },
    'Wednesday-09:00 AM - 10:30 AM': {
      facultyId: 'FAC-001',
      facultyName: 'Amit Verma',
      course: 'MERN Full Stack',
      batch: 'MERN-B2',
      lab: 'Lab 01',
      color: 'blue'
    },
    'Thursday-02:00 PM - 03:30 PM': {
      facultyId: 'FAC-004',
      facultyName: 'Priya Das',
      course: 'Excel & CCC Foundation',
      batch: 'CCC-B1',
      lab: 'Lab 04',
      color: 'amber'
    },
    'Friday-10:30 AM - 12:00 PM': {
      facultyId: 'FAC-002',
      facultyName: 'Neha Gupta',
      course: 'Tally Prime + GST',
      batch: 'Tally-B2',
      lab: 'Lab 02',
      color: 'emerald'
    },
    'Saturday-09:00 AM - 10:30 AM': {
      facultyId: 'FAC-003',
      facultyName: 'S. K. Roy',
      course: 'Java Spring Boot',
      batch: 'Java-B1',
      lab: 'Lab 03',
      color: 'indigo'
    }
  };

  const [localSchedule, setLocalSchedule] = useState(initialSchedule);
  const schedule = externalSchedule || localSchedule;

  const setSchedule = (updater) => {
    const nextSchedule = typeof updater === 'function' ? updater(schedule) : updater;
    if (setExternalSchedule) {
      setExternalSchedule(nextSchedule);
    } else {
      setLocalSchedule(nextSchedule);
    }
    erpService.broadcastScheduleUpdate(nextSchedule);
  };
  const [selectedLabFilter, setSelectedLabFilter] = useState('All');
  const [selectedFacultyForClick, setSelectedFacultyForClick] = useState(null);
  const [draggedFaculty, setDraggedFaculty] = useState(null);

  // Modal State for Notification Preview
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState('idle'); // 'idle' | 'sending' | 'sent'
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = [
    '09:00 AM - 10:30 AM',
    '10:30 AM - 12:00 PM',
    '11:30 AM - 01:00 PM',
    '02:00 PM - 03:30 PM',
    '04:00 PM - 05:30 PM'
  ];

  const facultyPalette = [
    {
      id: 'FAC-001',
      name: 'Amit Verma',
      subject: 'React & Node.js',
      defaultCourse: 'MERN Full Stack',
      defaultBatch: 'MERN-B1',
      defaultLab: 'Lab 01',
      color: 'blue',
      badgeBg: 'bg-blue-50 border-blue-200 text-blue-900',
      tagBg: 'bg-blue-600 text-white',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'FAC-002',
      name: 'Neha Gupta',
      subject: 'Tally Prime & Taxation',
      defaultCourse: 'Tally Prime + GST',
      defaultBatch: 'Tally-B1',
      defaultLab: 'Lab 02',
      color: 'emerald',
      badgeBg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      tagBg: 'bg-emerald-600 text-white',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'FAC-003',
      name: 'S. K. Roy',
      subject: 'Java & Spring Boot',
      defaultCourse: 'Java Spring Boot',
      defaultBatch: 'Java-B3',
      defaultLab: 'Lab 03',
      color: 'indigo',
      badgeBg: 'bg-indigo-50 border-indigo-200 text-indigo-900',
      tagBg: 'bg-indigo-600 text-white',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'FAC-004',
      name: 'Priya Das',
      subject: 'Excel & CCC Foundation',
      defaultCourse: 'Excel & CCC Foundation',
      defaultBatch: 'CCC-B1',
      defaultLab: 'Lab 04',
      color: 'amber',
      badgeBg: 'bg-amber-50 border-amber-200 text-amber-900',
      tagBg: 'bg-amber-600 text-white',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
    }
  ];

  // Drag Handlers
  const handleDragStart = (e, facItem) => {
    setDraggedFaculty(facItem);
    e.dataTransfer.setData('text/plain', JSON.stringify(facItem));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (day, slot) => {
    if (!draggedFaculty) return;
    const key = `${day}-${slot}`;
    setSchedule((prev) => ({
      ...prev,
      [key]: {
        facultyId: draggedFaculty.id,
        facultyName: draggedFaculty.name,
        course: draggedFaculty.defaultCourse,
        batch: draggedFaculty.defaultBatch,
        lab: selectedLabFilter === 'All' ? draggedFaculty.defaultLab : selectedLabFilter,
        color: draggedFaculty.color
      }
    }));
    setDraggedFaculty(null);
  };

  // Click placement for touch/desktop alternative
  const handleCellClick = (day, slot) => {
    const key = `${day}-${slot}`;
    if (selectedFacultyForClick) {
      setSchedule((prev) => ({
        ...prev,
        [key]: {
          facultyId: selectedFacultyForClick.id,
          facultyName: selectedFacultyForClick.name,
          course: selectedFacultyForClick.defaultCourse,
          batch: selectedFacultyForClick.defaultBatch,
          lab: selectedLabFilter === 'All' ? selectedFacultyForClick.defaultLab : selectedLabFilter,
          color: selectedFacultyForClick.color
        }
      }));
    }
  };

  const handleRemoveAssignment = (e, day, slot) => {
    e.stopPropagation();
    const key = `${day}-${slot}`;
    setSchedule((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const handleResetSchedule = () => {
    setShowResetConfirm(true);
  };

  const handleConfirmReset = () => {
    setSchedule({});
    setShowResetConfirm(false);
  };

  const handleSimulatePublish = () => {
    setDispatchStatus('sending');
    setTimeout(() => {
      setDispatchStatus('sent');
    }, 1200);
  };

  const totalAssignedSessions = Object.keys(schedule).length;

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Inline Reset Confirmation Banner */}
      {showResetConfirm && (
        <div className="flex items-center justify-between gap-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl px-5 py-3 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <RefreshCw className="w-4 h-4 text-rose-500" />
            <span>Reset the entire weekly schedule matrix? This cannot be undone.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowResetConfirm(false)}
              className="px-3 py-1.5 rounded-lg bg-white border border-rose-200 text-rose-700 text-xs font-semibold hover:bg-rose-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmReset}
              className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors cursor-pointer"
            >
              Yes, Reset Grid
            </button>
          </div>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            Weekly Faculty Schedule & Drag-and-Drop Timetable <Calendar className="w-5 h-5 text-blue-600" />
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Construct weekly lab timetables for instructors. Schedule updates will auto-notify concerned faculty and enrolled students upon backend DB connection.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleResetSchedule}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Grid</span>
          </button>

          <button
            onClick={() => {
              setDispatchStatus('idle');
              setIsNotifyModalOpen(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Publish & Notify All ({totalAssignedSessions} Sessions)</span>
          </button>
        </div>
      </div>

      {/* Backend & DB Notification Status Callout */}
      <div className="bg-white p-5 rounded-2xl text-slate-900 shadow-xs border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 shrink-0 mt-0.5">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs tracking-wide text-slate-900 uppercase">Backend & DB Notification Bridge</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                Hook Configured
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-3xl">
              When the backend API server and database are connected, modifying or publishing this timetable automatically dispatches real-time <strong>in-app push notifications</strong> to all affected faculty members and student rosters.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 text-slate-200 text-[11px] font-mono border border-white/10">
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span>Webhook: /api/v1/schedule/notify</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT DRAGGABLE PALETTE */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center justify-between">
                <span>Faculty Draggable Pool</span>
                <Sparkles className="w-4 h-4 text-blue-600" />
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Drag cards onto any time slot grid cell or click to select for tap placement.
              </p>
            </div>

            {/* Faculty List Draggables */}
            <div className="flex flex-col gap-3">
              {facultyPalette.map((fac) => {
                const isSelected = selectedFacultyForClick?.id === fac.id;
                return (
                  <div
                    key={fac.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, fac)}
                    onClick={() => setSelectedFacultyForClick(isSelected ? null : fac)}
                    className={`p-3.5 rounded-xl border transition-all cursor-grab active:cursor-grabbing hover:shadow-md select-none ${fac.badgeBg} ${
                      isSelected ? 'ring-2 ring-blue-600 shadow-sm' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={fac.avatar}
                        alt={fac.name}
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-white"
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-xs truncate">{fac.name}</h3>
                        <p className="text-[11px] text-slate-600 truncate">{fac.subject}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${fac.tagBg}`}>
                            {fac.defaultLab}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium truncate">
                            {fac.defaultBatch}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedFacultyForClick && (
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center justify-between">
                <span className="font-semibold text-[11px]">Selected: {selectedFacultyForClick.name}</span>
                <span className="text-[10px] text-blue-600">Click any grid cell to place</span>
              </div>
            )}
          </div>

          {/* Lab Filter Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-3">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span>Lab Room View Filter</span>
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {['All', 'Lab 01', 'Lab 02', 'Lab 03', 'Lab 04'].map((labName) => (
                <button
                  key={labName}
                  onClick={() => setSelectedLabFilter(labName)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    selectedLabFilter === labName
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {labName}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT WEEKLY GRID MATRIX */}
        <div className="lg:col-span-9 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-4 overflow-x-auto">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              <span>Weekly Class Schedule Grid ({selectedLabFilter})</span>
            </h2>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span> Lab 01
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span> Lab 02
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block"></span> Lab 03
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block"></span> Lab 04
              </span>
            </div>
          </div>

          {/* Timetable Table */}
          <div className="min-w-[700px] border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800 text-xs font-bold border-b border-slate-200">
                  <th className="py-3 px-4 w-36 border-r border-slate-200">Time Slot</th>
                  {days.map((day) => (
                    <th key={day} className="py-3 px-3 text-center border-r border-slate-200 last:border-r-0">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {timeSlots.map((slot) => (
                  <tr key={slot} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-700 bg-slate-50/80 border-r border-slate-200 text-[11px] align-middle">
                      {slot}
                    </td>

                    {days.map((day) => {
                      const key = `${day}-${slot}`;
                      const item = schedule[key];
                      const matchesLab = selectedLabFilter === 'All' || (item && item.lab === selectedLabFilter);

                      return (
                        <td
                          key={day}
                          onDragOver={handleDragOver}
                          onDrop={() => handleDrop(day, slot)}
                          onClick={() => handleCellClick(day, slot)}
                          className={`p-2 border-r border-slate-200 last:border-r-0 min-h-[90px] h-24 align-top transition-colors relative group ${
                            item && matchesLab ? 'bg-slate-50/30' : 'hover:bg-blue-50/30'
                          }`}
                        >
                          {item && matchesLab ? (
                            <div
                              className={`h-full p-2.5 rounded-xl border text-xs flex flex-col justify-between shadow-xs transition-all ${
                                item.color === 'blue'
                                  ? 'bg-blue-50/90 border-blue-200 text-blue-950'
                                  : item.color === 'emerald'
                                  ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
                                  : item.color === 'indigo'
                                  ? 'bg-indigo-50/90 border-indigo-200 text-indigo-950'
                                  : 'bg-amber-50/90 border-amber-200 text-amber-950'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-1">
                                <span className="font-bold text-xs truncate block leading-tight">
                                  {item.facultyName}
                                </span>
                                <button
                                  onClick={(e) => handleRemoveAssignment(e, day, slot)}
                                  title="Unassign Faculty"
                                  className="text-slate-400 hover:text-rose-600 transition-colors p-0.5 rounded"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="mt-1">
                                <span className="text-[10px] text-slate-600 font-medium block truncate">
                                  {item.course}
                                </span>
                              </div>

                              <div className="flex items-center justify-between gap-1 mt-2 text-[10px] font-bold">
                                <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200 shadow-2xs font-mono">
                                  {item.lab}
                                </span>
                                <span className="text-slate-500 uppercase font-mono">{item.batch}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="h-full w-full rounded-xl border border-dashed border-slate-200 group-hover:border-blue-400 flex flex-col items-center justify-center text-slate-400 text-[10px] font-medium transition-colors cursor-pointer gap-1 p-2 text-center">
                              <Plus className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500" />
                              <span className="opacity-0 group-hover:opacity-100 transition-opacity">Drop / Assign</span>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* PUBLISH & NOTIFY PREVIEW MODAL */}
      {isNotifyModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Publish Schedule & Notify Roster</h3>
                  <p className="text-xs text-slate-500">Preview auto-generated dispatch notifications for faculty & students</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-3">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>Weekly Sessions Programmed</span>
                  <span className="px-2.5 py-1 rounded-full bg-blue-600 text-white font-mono text-[11px]">
                    {totalAssignedSessions} Total Classes
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-slate-600 text-[11px]">
                  <div>• Faculty Receiving Alerts: <strong>4 Members</strong></div>
                  <div>• Student Batches Notified: <strong>5 Batches</strong></div>
                  <div>• Lab Rooms Scheduled: <strong>Lab 01, 02, 03, 04</strong></div>
                  <div>• Notification Channel: <strong>In-App Push</strong></div>
                </div>
              </div>

              {/* Notification Payload Simulator */}
              <div className="p-4 rounded-2xl bg-slate-50 text-slate-800 font-mono text-[11px] border border-slate-200 flex flex-col gap-2">
                <div className="flex items-center justify-between text-slate-500 text-[10px] uppercase tracking-wider font-bold">
                  <span>Automated Payload Bridge</span>
                  <span className="text-emerald-700 font-bold">STATUS: READY FOR BACKEND DB</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 text-blue-700 leading-relaxed overflow-x-auto">
                  {`{
  "event": "SCHEDULE_PUBLISHED",
  "totalSessions": ${totalAssignedSessions},
  "recipientFaculty": ["FAC-001", "FAC-002", "FAC-003", "FAC-004"],
  "affectedBatches": ["MERN-B1", "Tally-B1", "Java-B3", "CCC-B1"],
  "dbSyncPending": true,
  "backendEndpoint": "POST /api/v1/schedule/publish"
}`}
                </div>
              </div>
            </div>

            {dispatchStatus === 'sent' && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Simulated Notification Broadcast Dispatched! All queued payloads logged for backend sync.</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsNotifyModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors"
              >
                Close Window
              </button>
              <button
                onClick={handleSimulatePublish}
                disabled={dispatchStatus === 'sending'}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-2"
              >
                {dispatchStatus === 'sending' ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Dispatching Payload...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Simulate Dispatch & Log Payload</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
