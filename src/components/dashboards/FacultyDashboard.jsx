import React, { useState, useEffect, lazy, Suspense } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { erpService } from '../../services/erpService';

// Lazy-load heavy view/PDF chunks
const ComplaintsRequestsView = lazy(() => import('../views/ComplaintsRequestsView'));
const CalendarView           = lazy(() => import('../views/CalendarView'));
import CalendarLoader         from '../common/CalendarLoader';
import PDFDownloadButton from '../pdf/PDFDownloadButton';
import SubmissionsTab from './faculty/SubmissionsTab';
import SalaryTab from './faculty/SalaryTab';
import BatchesTab from './faculty/BatchesTab';
import AllocatedPCsTab from './faculty/AllocatedPCsTab';
import OverviewTab from './faculty/OverviewTab';
import { 
  GraduationCap, 
  Calendar, 
  Users, 
  CheckSquare, 
  Code, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  FileCheck,
  Send,
  Monitor,
  Search,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  Award,
  BookOpen,
  ArrowUpRight,
  UserCheck,
  UserX,
  QrCode,
  X,
  RefreshCw,
  MessageSquare
} from 'lucide-react';

import { useSiteConfig } from '../../context/SiteConfigContext';

export default function FacultyDashboard({ 
  faculty, 
  students: initialStudents, 
  labs, 
  assignments: initialAssignments = [],
  weeklySchedule = {},
  activeTab: parentActiveTab, 
  setActiveTab: parentSetActiveTab,
  activeQrSession,
  setActiveQrSession,
  onEndQrSession,
  onMarkStudentAttendance,
  complaintsAndRequests = [],
  onAddComplaintRequest,
  onUpdateComplaintRequest,
  onUpdateFacultyStatus,
  pcTerminals = [],
  onSendPcMessage,
  onUpdatePcTerminal,
  user
}) {
  const { websiteConfig, pdfConfig } = useSiteConfig();
  const [localActiveTab, setLocalActiveTab] = useState('overview');
  const activeTab = parentActiveTab !== undefined ? parentActiveTab : localActiveTab;
  const setActiveTab = parentSetActiveTab || setLocalActiveTab;

  const [selectedFacultyId, setSelectedFacultyId] = useState(null);
  
  const loggedInFaculty = faculty.find(f => f.email === user?.email) || faculty[0];
  const currentFaculty = selectedFacultyId ? (faculty.find((f) => f.id === selectedFacultyId) || loggedInFaculty) : loggedInFaculty;

  const [facultyStatus, setFacultyStatus] = useState('In Session');
  const [selectedLabId, setSelectedLabId] = useState('LAB-01');
  const [selectedScheduleDay, setSelectedScheduleDay] = useState('Monday');

  // PC Terminal states (terminalChatInput, labBroadcastInput, isLabBroadcastModalOpen, selectedPcNumber) moved to AllocatedPCsTab.jsx

  // Search & Filters for Roster & Grading
  // (rosterSearch and batchFilter moved to BatchesTab.jsx)

  // QR Generator Modal State
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrTimeLeft, setQrTimeLeft] = useState(60);

  // Admin Request / Complaint Ticket Modal State
  const [isAdminTicketModalOpen, setIsAdminTicketModalOpen] = useState(false);
  const [ticketType, setTicketType] = useState('Request'); // 'Request' | 'Complaint'
  const [ticketCategory, setTicketCategory] = useState('Lab Hardware / Equipment');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDetails, setTicketDetails] = useState('');
  const [facultyTickets, setFacultyTickets] = useState([
    {
      id: 'FAC-TKT-101',
      type: 'Request',
      category: 'Hardware Upgrade',
      subject: 'Additional 16GB RAM for MERN Lab 1 PCs',
      status: 'Under Admin Review',
      date: 'Oct 22, 2024'
    }
  ]);

  // Removed local studentGrades and studentAttendance states to use live Supabase students prop directly.

  // PR Reviews State
  const [prs, setPrs] = useState([
    {
      id: 'PR-14',
      student: 'Rohan Adhikari',
      rollNo: 'AT-2024-089',
      title: 'E-Commerce REST API with JWT Auth & Stripe Integration',
      repo: 'apextech/mern-b1-rohan',
      filesCount: 12,
      additions: 420,
      deletions: 18,
      status: 'Pending',
      codeSnippet: `// auth.middleware.js
const jwt = require('jsonwebtoken');
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(403).json({ error: 'Access token required' });
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid signature' });
    req.user = user;
    next();
  });
};`,
      expanded: true
    },
    {
      id: 'PR-08',
      student: 'Vikramaditya Rao',
      rollNo: 'AT-2024-094',
      title: 'Django ORM Database Migration & PostgreSQL Schema',
      repo: 'apextech/python-b1-vikram',
      filesCount: 4,
      additions: 145,
      deletions: 32,
      status: 'Pending',
      codeSnippet: `# models.py
from django.db import models

class StudentTerminal(models.Model):
    student_id = models.CharField(max_length=20, unique=True)
    lab_number = models.CharField(max_length=10)
    pc_terminal = models.IntegerField()
    is_active = models.BooleanField(default=True)`,
      expanded: false
    }
  ]);

  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Student Submissions State: { [assignmentId]: { [studentId]: { submitted, submittedAt, fileNote, grade } } }
  const [submissions, setSubmissions] = useState(() => {
    const init = {};
    initialAssignments.forEach((a) => {
      init[a.id] = {};
      initialStudents.forEach((s, idx) => {
        // Simulate some students already submitted
        const didSubmit = idx < (a.submissions || 0);
        init[a.id][s.id] = {
          submitted: didSubmit,
          submittedAt: didSubmit ? `Oct ${18 + idx}, 2024 • ${9 + idx}:${idx * 7 % 60 < 10 ? '0' : ''}${idx * 7 % 60} AM` : null,
          fileNote: didSubmit ? 'Submitted via Portal' : null,
          grade: null
        };
      });
    });
    return init;
  });

  const [newAssignmentOpen, setNewAssignmentOpen] = useState(false);
  const [newAssignment, setNewAssignment] = useState({ title: '', dueDate: '', description: '' });
  const [localAssignments, setLocalAssignments] = useState(initialAssignments);

  const handleToggleSubmission = (assignmentId, studentId) => {
    setSubmissions((prev) => {
      const current = prev[assignmentId]?.[studentId] || {};
      const nowSubmitted = !current.submitted;
      return {
        ...prev,
        [assignmentId]: {
          ...prev[assignmentId],
          [studentId]: {
            ...current,
            submitted: nowSubmitted,
            submittedAt: nowSubmitted ? new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : null,
            fileNote: nowSubmitted ? 'Manually marked by Faculty' : null
          }
        }
      };
    });
    const student = initialStudents.find((s) => s.id === studentId);
    const assignment = localAssignments.find((a) => a.id === assignmentId);
    showToast(`${student?.name || studentId} marked as submitted for "${assignment?.title || assignmentId}"`);
  };

  const handleSubmissionGrade = (assignmentId, studentId, grade) => {
    setSubmissions((prev) => ({
      ...prev,
      [assignmentId]: {
        ...prev[assignmentId],
        [studentId]: { ...prev[assignmentId]?.[studentId], grade }
      }
    }));
  };

  const handleAddAssignment = (e) => {
    e.preventDefault();
    if (!newAssignment.title.trim()) return;
    const created = {
      id: `ASM-${Date.now()}`,
      title: newAssignment.title.trim(),
      course: currentFaculty.subject,
      dueDate: newAssignment.dueDate || 'TBD',
      description: newAssignment.description.trim(),
      submissions: 0,
      total: facultyStudents.length,
      status: 'Active'
    };
    setLocalAssignments((prev) => [created, ...prev]);
    setSubmissions((prev) => {
      const studentEntries = {};
      facultyStudents.forEach((s) => { studentEntries[s.id] = { submitted: false, submittedAt: null, fileNote: null, grade: null }; });
      return { ...prev, [created.id]: studentEntries };
    });
    setNewAssignment({ title: '', dueDate: '', description: '' });
    setNewAssignmentOpen(false);
    showToast(`Assignment "${created.title}" published to ${facultyStudents.length} student(s)!`);
  };

  // Extracted SubmissionsTab to separate file

  // 60-second timer countdown logic for QR generator
  useEffect(() => {
    let timer;
    if (isQrModalOpen && qrTimeLeft > 0) {
      timer = setInterval(() => {
        setQrTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (qrTimeLeft === 0 && activeQrSession && activeQrSession.active) {
      if (onEndQrSession) {
        onEndQrSession();
      } else if (setActiveQrSession) {
        setActiveQrSession((prev) => prev ? { ...prev, active: false } : null);
      }
      showToast('QR session expired. Absent students attendance decreased (-2%).');
    }
    return () => clearInterval(timer);
  }, [isQrModalOpen, qrTimeLeft, activeQrSession, setActiveQrSession, onEndQrSession]);

  const handleGenerateQrCode = () => {
    setQrTimeLeft(60);
    setIsQrModalOpen(true);
    const newCode = `QR-ATT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newSession = {
      code: newCode,
      lab: selectedLabId || 'LAB-01',
      subject: currentFaculty.subject || 'MERN Stack Web Dev',
      secondsLeft: 60,
      active: true,
      scannedStudentIds: []
    };
    if (setActiveQrSession) {
      setActiveQrSession(newSession);
    }
    erpService.broadcastQrSession(newSession);
    showToast('60-Second Live Attendance QR Generated & Broadcast!');
  };

  const handleGradeChange = (studentId, newGrade) => {
    // Need to wire this to Supabase later
    // setStudentGrades((prev) => ({ ...prev, [studentId]: newGrade }));
    const student = initialStudents.find((s) => s.id === studentId);
    showToast(`Grade for ${student ? student.name : studentId} updated to ${newGrade}`);
  };

  const handleMarkPresent = (studentId) => {
    if (onMarkStudentAttendance) {
      onMarkStudentAttendance(studentId, 'present');
    }
    const student = initialStudents.find((s) => s.id === studentId);
    showToast(`Marked Present: ${student ? student.name : studentId} (+2% attendance)`);
  };

  const handleMarkAbsent = (studentId) => {
    if (onMarkStudentAttendance) {
      onMarkStudentAttendance(studentId, 'absent');
    }
    const student = initialStudents.find((s) => s.id === studentId);
    showToast(`Marked Absent: ${student ? student.name : studentId} (-2% attendance)`);
  };

  const handleApprovePR = (prId) => {
    setPrs((prev) =>
      prev.map((pr) => (pr.id === prId ? { ...pr, status: 'Approved' } : pr))
    );
    showToast(`${prId} approved and merged into main branch!`);
  };

  const handleSubmitAdminTicket = (e) => {
    e.preventDefault();
    if (!ticketSubject.trim()) {
      showToast('Please enter a ticket subject');
      return;
    }
    const newTkt = {
      id: `FAC-TKT-${Math.floor(100 + Math.random() * 900)}`,
      senderType: 'Faculty',
      senderId: currentFaculty.id,
      senderName: currentFaculty.name,
      senderRole: currentFaculty.role,
      senderAvatar: currentFaculty.avatar,
      type: ticketType,
      category: ticketCategory,
      subject: ticketSubject.trim(),
      message: ticketDetails.trim() || ticketSubject.trim(),
      status: 'Pending',
      createdAt: 'Just now',
      replies: [],
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    setFacultyTickets([newTkt, ...facultyTickets]);
    if (onAddComplaintRequest) {
      onAddComplaintRequest(newTkt);
    }
    setIsAdminTicketModalOpen(false);
    setTicketSubject('');
    setTicketDetails('');
    showToast(`${ticketType} "${newTkt.subject}" broadcasted to Admin Desk via Supabase Realtime!`);
  };

  const togglePRExpand = (prId) => {
    setPrs((prev) =>
      prev.map((pr) => (pr.id === prId ? { ...pr, expanded: !pr.expanded } : pr))
    );
  };

  // Students belonging to this faculty's assigned batches
  const facultyStudents = initialStudents.filter((s) => {
    if (!currentFaculty?.assignedBatches?.length) return true; // Show all if no batches assigned yet
    return currentFaculty.assignedBatches.some((b) => s.batch?.startsWith(b));
  });

  // (filteredStudents logic moved to BatchesTab.jsx)

  // (activeLabTerminals and PC Terminal Handlers moved to AllocatedPCsTab.jsx)

  return (
    <div className="flex flex-col gap-6 pb-12 font-sans">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2 text-xs font-semibold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modern Interactive Instructor Control Header */}
      <div className="bg-white text-slate-900 p-6 rounded-3xl shadow-xs border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-4 relative z-10">
          <div className="relative">
            <img 
              src={currentFaculty.avatar} 
              alt={currentFaculty.name} 
              className="w-16 h-16 rounded-2xl object-cover ring-4 ring-indigo-500/20 shadow-md" 
            />
            <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
              facultyStatus === 'In Session' ? 'bg-emerald-500 animate-pulse' :
              facultyStatus === 'Office Hours' ? 'bg-sky-500' :
              facultyStatus === 'Ready' ? 'bg-blue-500' : 'bg-amber-500'
            }`}></span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900">{currentFaculty.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-extrabold tracking-wider uppercase">
                INSTRUCTOR PORTAL
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
              <span>{currentFaculty.role}</span> • <span className="text-indigo-600 font-semibold">{currentFaculty.subject}</span>
            </p>
          </div>
        </div>

        {/* Live QR Action, Request to Admin & Status Switcher */}
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <button
            onClick={() => setIsAdminTicketModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <AlertCircle className="w-4 h-4 text-amber-100" />
            <span>Request / Complain to Admin</span>
          </button>

          <button
            onClick={handleGenerateQrCode}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-indigo-100 animate-pulse" />
            <span>Generate Attendance QR (60s)</span>
          </button>

          {/* Availability Switcher */}
          <div className="bg-slate-100 p-1 rounded-2xl border border-slate-200 flex flex-wrap items-center gap-1">
            {[
              { label: 'In Lab', val: 'In Session', color: 'bg-emerald-600 text-white' },
              { label: 'Ready', val: 'Ready', color: 'bg-blue-600 text-white' },
              { label: 'Office Hours', val: 'Office Hours', color: 'bg-sky-600 text-white' },
              { label: 'On Leave', val: 'On Leave', color: 'bg-amber-600 text-white' }
            ].map((st) => (
              <button
                key={st.val}
                onClick={() => {
                  setFacultyStatus(st.val);
                  if (onUpdateFacultyStatus) {
                    onUpdateFacultyStatus(currentFaculty.id, st.val);
                  } else {
                    erpService.broadcastFacultyStatus(currentFaculty.id, st.val);
                  }
                  showToast(`Status updated to "${st.label}" & broadcasted live to Admin!`);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  facultyStatus === st.val
                    ? `${st.color} shadow-xs`
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Switch Faculty Dropdown */}
          <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 px-3 rounded-2xl border border-slate-700/80 text-xs">
            <span className="text-slate-400 font-medium text-[11px]">Instructor:</span>
            <select
              value={selectedFacultyId}
              onChange={(e) => setSelectedFacultyId(e.target.value)}
              className="bg-transparent text-white font-bold outline-none cursor-pointer"
            >
              {faculty.map((f) => (
                <option key={f.id} value={f.id} className="bg-slate-900 text-white">
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 60-SECOND LIVE QR ATTENDANCE MODAL */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 flex flex-col items-center gap-5 text-slate-900 relative">
            <button 
              onClick={() => setIsQrModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100 inline-flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5" /> 60-Second Live Attendance Broadcast
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 mt-2">Scan QR to Record Attendance</h3>
              <p className="text-xs text-slate-500 mt-1">{currentFaculty.subject} • {selectedLabId}</p>
            </div>

            {/* QR Graphic Container */}
            <div className="p-6 bg-slate-900 rounded-3xl border-4 border-indigo-600 shadow-xl flex flex-col items-center gap-3 relative">
              <div className="w-48 h-48 bg-white p-3 rounded-2xl flex items-center justify-center relative shadow-inner">
                <QRCodeSVG
                  value={JSON.stringify({
                    code: activeQrSession?.code || 'QR-ATT-2024',
                    subject: currentFaculty.subject || 'MERN Stack Web Dev',
                    lab: selectedLabId || 'LAB-01',
                    timestamp: Date.now()
                  })}
                  size={168}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-white font-mono">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Session Code: {activeQrSession?.code || 'QR-ATT-2024'}</span>
              </div>
            </div>

            {/* Live 60s Countdown Timer */}
            <div className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span className="font-bold text-slate-700">Expires in:</span>
              </div>
              <div className={`text-lg font-mono font-extrabold px-3 py-1 rounded-xl ${
                qrTimeLeft > 10 ? 'bg-indigo-100 text-indigo-900' : 'bg-rose-100 text-rose-700 animate-pulse'
              }`}>
                {qrTimeLeft}s
              </div>
            </div>

            {/* Realtime Scanned Count & Verified Students List */}
            <div className="w-full flex flex-col gap-2">
              <div className="text-center">
                <span className="text-xs text-slate-500 font-semibold">
                  Scanned: <strong className="text-emerald-600 font-bold">{activeQrSession?.scannedStudentIds?.length || 0}</strong> Student(s) Verified
                </span>
              </div>

              {activeQrSession?.scannedStudentIds && activeQrSession.scannedStudentIds.length > 0 && (
                <div className="max-h-32 overflow-y-auto bg-slate-50 p-2 rounded-xl border border-slate-200 flex flex-col gap-1.5 text-xs">
                  {activeQrSession.scannedStudentIds.map((stId) => {
                    const studentObj = initialStudents.find((s) => s.id === stId) || { name: stId, id: stId };
                    return (
                      <div key={stId} className="flex items-center justify-between bg-white p-1.5 px-2 rounded-lg border border-slate-100 shadow-2xs">
                        <span className="font-bold text-slate-900">{studentObj.name} ({stId})</span>
                        <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified (+2%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {qrTimeLeft === 0 ? (
              <button
                onClick={handleGenerateQrCode}
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                <RefreshCw className="w-4 h-4" /> Regenerate 60s QR Code
              </button>
            ) : (
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
              >
                Close QR Window
              </button>
            )}
          </div>
        </div>
      )}

      {/* FACULTY REQUEST / COMPLAINT TO ADMIN MODAL */}
      {isAdminTicketModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 flex flex-col gap-5 text-slate-900 relative">
            <button 
              onClick={() => setIsAdminTicketModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold uppercase border border-amber-200">
                  Admin Helpdesk
                </span>
                <span className="text-xs text-slate-400 font-mono">Official Faculty Portal</span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mt-2">Submit Request or Complaint to Admin</h3>
              <p className="text-xs text-slate-500 mt-1">Direct escalation channel for lab hardware, schedule adjustments, or facility issues</p>
            </div>

            <form onSubmit={handleSubmitAdminTicket} className="flex flex-col gap-4">
              {/* Ticket Type Toggle */}
              <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
                {['Request', 'Complaint'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setTicketType(type)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                      ticketType === type
                        ? type === 'Complaint' ? 'bg-rose-600 text-white shadow-xs' : 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {type === 'Request' ? '📋 Service / Equipment Request' : '⚠️ Formal Complaint'}
                  </button>
                ))}
              </div>

              {/* Category Select */}
              <div className="flex flex-col gap-1.5 text-xs">
                <label className="font-bold text-slate-700">Category / Department:</label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="Lab Hardware / Equipment">Lab Hardware / PC Terminals</option>
                  <option value="Software License / Software Defect">Software License & Tools</option>
                  <option value="Timetable / Batch Adjustment">Lecture Timetable / Batch Swap</option>
                  <option value="Payroll & Honorarium Query">Salary / Honorarium Clearance</option>
                  <option value="Facility & Infrastructure">Classroom Air-Conditioning & Facilities</option>
                </select>
              </div>

              {/* Subject */}
              <div className="flex flex-col gap-1.5 text-xs">
                <label className="font-bold text-slate-700">Subject / Summary:</label>
                <input
                  type="text"
                  required
                  placeholder={ticketType === 'Request' ? 'e.g. Need 5 additional PC licenses for React lab' : 'e.g. PC-08 in Lab 1 monitor flickering constantly'}
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5 text-xs">
                <label className="font-bold text-slate-700">Detailed Message / Description:</label>
                <textarea
                  rows={3}
                  placeholder="Provide any relevant details, workstation numbers, or urgency notes..."
                  value={ticketDetails}
                  onChange={(e) => setTicketDetails(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdminTicketModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-2.5 rounded-xl text-white font-extrabold text-xs transition-colors shadow-md flex items-center justify-center gap-2 ${
                    ticketType === 'Complaint' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>Submit {ticketType} to Admin</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 1: OVERVIEW & SCHEDULE */}
      {activeTab === 'overview' && (
        <OverviewTab
          currentFaculty={currentFaculty}
          complaintsAndRequests={complaintsAndRequests}
          setActiveTab={setActiveTab}
          selectedLabId={selectedLabId}
          weeklySchedule={weeklySchedule}
          selectedScheduleDay={selectedScheduleDay}
          setSelectedScheduleDay={setSelectedScheduleDay}
          selectedFacultyId={selectedFacultyId}
          handleGenerateQrCode={handleGenerateQrCode}
        />
      )}

      {/* TAB: ALLOCATED PCS & REALTIME COMMUNICATION */}
      {activeTab === 'allocated-pc' && (
        <AllocatedPCsTab
          currentFaculty={currentFaculty}
          selectedLabId={selectedLabId}
          setSelectedLabId={setSelectedLabId}
          labs={labs}
          pcTerminals={pcTerminals}
          pcMessages={pcMessages}
          onSendPcMessage={onSendPcMessage}
          onUpdatePcTerminal={onUpdatePcTerminal}
          showToast={showToast}
        />
      )}

      {activeTab === 'batches' && (
        <BatchesTab
          currentFaculty={currentFaculty}
          facultyStudents={facultyStudents}
          onMarkPresent={handleMarkPresent}
          onMarkAbsent={handleMarkAbsent}
        />
      )}

      {/* TAB: STUDENT SUBMISSIONS */}
      {activeTab === 'submissions' && (
        <SubmissionsTab
          assignments={initialAssignments}
          students={initialStudents}
          facultyStudents={facultyStudents}
          currentFaculty={currentFaculty}
          studentGrades={studentGrades}
          onGradeChange={handleGradeChange}
          showToast={showToast}
        />
      )}

      {/* TAB 3: ATTENDANCE & GRADING */}
      {activeTab === 'attendance-grading' && (
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Batch Marksheet & Grading Desk</h3>
              <p className="text-xs text-slate-500 mt-0.5">Direct grade modification with live academic transcript updates</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {initialStudents.map((s) => (
              <div key={s.id} className="p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col xs:flex-row xs:items-center justify-between gap-3 hover:border-indigo-200 transition-all">
                <div className="flex items-center gap-3 min-w-0">
                  <img src={s.avatar} alt={s.name} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-slate-200 shrink-0" />
                  <div className="min-w-0">
                    <span className="font-bold text-slate-900 text-sm block leading-tight truncate">{s.name}</span>
                    <span className="text-slate-400 text-xs font-mono truncate block">{s.id}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Grade:</span>
                  <select
                    value={studentGrades[s.id] || s.gpa}
                    onChange={(e) => handleGradeChange(s.id, e.target.value)}
                    className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 font-extrabold text-indigo-700 text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
                  >
                    <option value="O (Outstanding)">O (Outstanding)</option>
                    <option value="A+">A+</option>
                    <option value="A">A</option>
                    <option value="B+">B+</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: MY SALARY & HONORARIUM */}
      {activeTab === 'salary' && (
        <SalaryTab currentFaculty={currentFaculty} />
      )}

      {/* TAB 5: ACADEMIC & HOLIDAY CALENDAR */}
      {activeTab === 'academic-calendar' && (
        <Suspense fallback={<CalendarLoader />}>
          <CalendarView userRole="faculty" />
        </Suspense>
      )}

      {/* TAB 6: COMPLAINTS & REQUESTS DESK */}
      {activeTab === 'complaints-requests' && (
        <Suspense fallback={
          <div className="flex items-center justify-center h-[50vh]">
            <div className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <ComplaintsRequestsView
            userRole="faculty"
            currentUser={currentFaculty}
            complaintsAndRequests={complaintsAndRequests}
            onAddComplaintRequest={onAddComplaintRequest}
            onUpdateComplaintRequest={onUpdateComplaintRequest}
            facultyList={faculty}
            studentList={initialStudents}
          />
        </Suspense>
      )}
    </div>
  );
}
