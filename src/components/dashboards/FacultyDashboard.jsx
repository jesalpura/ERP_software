import React, { useState, useEffect, lazy, Suspense } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { erpService } from '../../services/erpService';

// Lazy-load heavy view/PDF chunks
const ComplaintsRequestsView = lazy(() => import('../views/ComplaintsRequestsView'));
const CalendarView           = lazy(() => import('../views/CalendarView'));
const FacultyPayslipPDF      = lazy(() => import('../pdf/FacultyPayslipPDF'));
import CalendarLoader         from '../common/CalendarLoader';
import PDFDownloadButton from '../pdf/PDFDownloadButton';
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

export default function FacultyDashboard({ 
  faculty, 
  students: initialStudents, 
  labs, 
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
  pcMessages = [],
  onSendPcMessage,
  onUpdatePcTerminal
}) {
  const [localActiveTab, setLocalActiveTab] = useState('overview');
  const activeTab = parentActiveTab !== undefined ? parentActiveTab : localActiveTab;
  const setActiveTab = parentSetActiveTab || setLocalActiveTab;

  const [selectedFacultyId, setSelectedFacultyId] = useState('FAC-001');
  const [facultyStatus, setFacultyStatus] = useState('In Session');
  const [selectedLabId, setSelectedLabId] = useState('LAB-01');
  const [selectedPcNumber, setSelectedPcNumber] = useState(14); // Default to PC-14
  const [selectedScheduleDay, setSelectedScheduleDay] = useState('Monday');

  // Realtime PC Terminal Communication States
  const [terminalChatInput, setTerminalChatInput] = useState('');
  const [labBroadcastInput, setLabBroadcastInput] = useState('');
  const [isLabBroadcastModalOpen, setIsLabBroadcastModalOpen] = useState(false);

  // Search & Filters for Roster & Grading
  const [rosterSearch, setRosterSearch] = useState('');
  const [batchFilter, setBatchFilter] = useState('All');

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

  // Interactive Student Grades & Attendance State
  const [studentGrades, setStudentGrades] = useState(
    initialStudents.reduce((acc, s) => ({ ...acc, [s.id]: s.gpa }), {})
  );
  const [studentAttendance, setStudentAttendance] = useState(
    initialStudents.reduce((acc, s) => ({ ...acc, [s.id]: s.attendance }), {})
  );

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

  const currentFaculty = faculty.find((f) => f.id === selectedFacultyId) || faculty[0];

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
    setStudentGrades((prev) => ({ ...prev, [studentId]: newGrade }));
    const student = initialStudents.find((s) => s.id === studentId);
    showToast(`Grade for ${student ? student.name : studentId} updated to ${newGrade}`);
  };

  const handleMarkPresent = (studentId) => {
    if (onMarkStudentAttendance) {
      onMarkStudentAttendance(studentId, 'present');
    }
    setStudentAttendance((prev) => {
      const current = prev[studentId] || 85;
      const nextVal = Math.min(100, current + 2);
      return { ...prev, [studentId]: nextVal };
    });
    const student = initialStudents.find((s) => s.id === studentId);
    showToast(`Marked Present: ${student ? student.name : studentId} (+2% attendance)`);
  };

  const handleMarkAbsent = (studentId) => {
    if (onMarkStudentAttendance) {
      onMarkStudentAttendance(studentId, 'absent');
    }
    setStudentAttendance((prev) => {
      const current = prev[studentId] || 85;
      const nextVal = Math.max(0, current - 2);
      return { ...prev, [studentId]: nextVal };
    });
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

  const filteredStudents = initialStudents.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(rosterSearch.toLowerCase()) || s.id.toLowerCase().includes(rosterSearch.toLowerCase());
    const matchesBatch = batchFilter === 'All' || s.batch === batchFilter;
    return matchesSearch && matchesBatch;
  });

  const activeLabTerminals = pcTerminals.filter((t) => t.labId === selectedLabId);
  const currentSeat = activeLabTerminals.find((t) => t.pcNumber === selectedPcNumber) || activeLabTerminals[0] || null;

  // Realtime PC terminal messages for selected terminal
  const activePcMessages = pcMessages.filter(
    (m) => m.labId === selectedLabId && m.pcNumber === selectedPcNumber
  );

  const handleSendTerminalMessageSubmit = (e) => {
    e.preventDefault();
    if (!terminalChatInput.trim() || !currentSeat) return;

    const newMsg = {
      id: `MSG-PC-${Date.now()}`,
      labId: selectedLabId,
      pcNumber: currentSeat.pcNumber,
      studentId: currentSeat.studentId || null,
      sender: 'Faculty',
      senderName: currentFaculty?.name || 'Prof. Amit Verma',
      senderRole: 'Faculty Instructor',
      text: terminalChatInput.trim(),
      type: 'chat',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    if (onSendPcMessage) onSendPcMessage(newMsg);
    setTerminalChatInput('');
  };

  const handlePingSelectedPc = () => {
    if (!currentSeat) return;
    const newMsg = {
      id: `MSG-PING-${Date.now()}`,
      labId: selectedLabId,
      pcNumber: currentSeat.pcNumber,
      studentId: currentSeat.studentId || null,
      sender: 'Faculty',
      senderName: currentFaculty?.name || 'Prof. Amit Verma',
      senderRole: 'Faculty Instructor',
      text: `⚡ PING ALERT: Prof. ${currentFaculty?.name} pinged PC-${currentSeat.pcNumber < 10 ? `0${currentSeat.pcNumber}` : currentSeat.pcNumber}. Please acknowledge screen check!`,
      type: 'ping',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    if (onSendPcMessage) onSendPcMessage(newMsg);
    showToast(`⚡ Diagnostic Ping sent to PC-${currentSeat.pcNumber < 10 ? `0${currentSeat.pcNumber}` : currentSeat.pcNumber}!`);
  };

  const handleResolveHelpRequest = () => {
    if (!currentSeat) return;
    if (onUpdatePcTerminal) {
      onUpdatePcTerminal({ ...currentSeat, helpRequested: false });
    }
    showToast(`✋ Help request resolved for PC-${currentSeat.pcNumber}!`);
  };

  const handleSendLabBroadcastSubmit = (e) => {
    e.preventDefault();
    if (!labBroadcastInput.trim()) return;

    const occupiedTerminals = activeLabTerminals.filter((t) => t.status === 'Occupied');
    occupiedTerminals.forEach((t) => {
      const bMsg = {
        id: `MSG-BCAST-${Date.now()}-${t.pcNumber}`,
        labId: selectedLabId,
        pcNumber: t.pcNumber,
        studentId: t.studentId,
        sender: 'Faculty',
        senderName: `Prof. ${currentFaculty?.name || 'Instructor'}`,
        senderRole: 'Faculty Instructor',
        text: `📢 [LAB BROADCAST]: ${labBroadcastInput.trim()}`,
        type: 'broadcast',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      if (onSendPcMessage) onSendPcMessage(bMsg);
    });

    setIsLabBroadcastModalOpen(false);
    setLabBroadcastInput('');
    showToast(`📢 Realtime Broadcast sent to all ${occupiedTerminals.length} occupied PCs in ${selectedLabId}!`);
  };

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
          <div className="bg-slate-100 p-1 rounded-2xl border border-slate-200 flex items-center gap-1">
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
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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

            {/* Realtime Scanned Count */}
            <div className="w-full text-center">
              <span className="text-xs text-slate-500 font-semibold">
                Scanned: <strong className="text-emerald-600">{activeQrSession?.scannedStudentIds?.length || 0}</strong> Student(s) Verified
              </span>
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
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Today Punch</span>
                <Clock className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 mt-2">{currentFaculty.punchTime}</div>
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Checked In • {currentFaculty.status}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Assigned Batches</span>
                <Users className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 mt-2">{currentFaculty.assignedBatches.length} Batches</div>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                {currentFaculty.assignedBatches.map((b) => (
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
                <span className="text-[11px] font-bold uppercase tracking-wider">Complaints & Requests Desk</span>
                <MessageSquare className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl font-extrabold text-indigo-600 mt-2">
                {complaintsAndRequests.filter(c => c.senderType === 'Faculty').length} Record(s)
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
                    16 / 20 Active in {selectedLabId}
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
                    <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
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
                              <td rowSpan={dayItems.length} className="p-3 font-bold text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30">
                                {day}
                              </td>
                            )}
                            <td className="p-3 font-extrabold text-indigo-700 dark:text-indigo-300 border-r border-slate-100 dark:border-slate-800">{val.course}</td>
                            <td className="p-3 font-mono text-slate-600 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800">{timeSlot}</td>
                            <td className="p-3 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800">{val.batch}</td>
                            <td className="p-3 font-bold text-emerald-700 dark:text-emerald-400">{val.lab}</td>
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
      )}

      {/* TAB: ALLOCATED PCS & REALTIME COMMUNICATION */}
      {activeTab === 'allocated-pc' && (
        <div className="flex flex-col gap-6">
          {/* Top Stat Cards for PC Allocation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Total Lab PCs</span>
                <Monitor className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 mt-2">80 Terminals</div>
              <span className="text-[11px] text-slate-500 mt-1 block">Across 4 Computer Labs</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Currently Occupied</span>
                <UserCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-extrabold text-emerald-600 mt-2">
                {activeLabTerminals.filter(t => t.status === 'Occupied').length} / {activeLabTerminals.length || 20} PCs
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">In {selectedLabId} Workstations</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Vacant Terminals</span>
                <CheckCircle2 className="w-4 h-4 text-sky-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 mt-2">
                {activeLabTerminals.filter(t => t.status === 'Vacant').length} PCs Ready
              </div>
              <span className="text-[11px] text-sky-600 font-medium mt-1 block">Available for walk-in lab access</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Student Help Requests</span>
                <AlertCircle className="w-4 h-4 text-rose-500 animate-pulse" />
              </div>
              <div className="text-2xl font-extrabold text-rose-600 mt-2">
                {activeLabTerminals.filter(t => t.helpRequested).length} Active Hand(s)
              </div>
              <span className="text-[11px] text-rose-600 font-medium mt-1 block">Students awaiting instructor assistance</span>
            </div>
          </div>

          {/* Interactive Live Lab Terminal Radar Map */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">Allocated PC Workstations & Live Realtime Radar</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Supabase Realtime Active
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Click any PC terminal node to open direct two-way live communication stream with assigned student</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsLabBroadcastModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Broadcast to All PCs</span>
                </button>

                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                  {labs.map((lab) => (
                    <button
                      key={lab.id}
                      onClick={() => {
                        setSelectedLabId(lab.id);
                        setSelectedPcNumber(1);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        selectedLabId === lab.id
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {lab.id} ({lab.name.split(' ')[0]})
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Legend bar */}
            <div className="flex items-center gap-4 text-xs font-medium text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="font-bold text-slate-700">Seat Status Legend:</span>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500"></span>
                <span>Occupied ({activeLabTerminals.filter(s => s.status === 'Occupied').length})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-500 animate-pulse"></span>
                <span>✋ Help Requested ({activeLabTerminals.filter(s => s.helpRequested).length})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-slate-200 border border-slate-300"></span>
                <span>Vacant ({activeLabTerminals.filter(s => s.status === 'Vacant').length})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-indigo-600"></span>
                <span>Selected Node</span>
              </div>
            </div>

            {/* PC Nodes Grid */}
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 md:grid-cols-10 gap-2 sm:gap-3 pt-2">
              {activeLabTerminals.map((seat) => {
                const isSelected = currentSeat?.pcNumber === seat.pcNumber;
                const isHelp = seat.helpRequested;
                const isOccupied = seat.status === 'Occupied';
                return (
                  <button
                    key={seat.id || seat.pcNumber}
                    onClick={() => setSelectedPcNumber(seat.pcNumber)}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all relative cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-700 ring-2 ring-indigo-400/40 scale-105 shadow-md'
                        : isHelp
                        ? 'bg-amber-50 border-amber-400 text-amber-900 ring-2 ring-amber-400/50 animate-pulse'
                        : isOccupied
                        ? 'bg-emerald-50/80 border-emerald-200 hover:bg-emerald-100 text-emerald-900'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isHelp && (
                      <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[9px] font-black px-1 rounded-full shadow-xs">
                        ✋
                      </span>
                    )}
                    <Monitor className={`w-4 h-4 ${isSelected ? 'text-white' : isHelp ? 'text-amber-600' : isOccupied ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span className="text-[11px] font-mono font-bold">{seat.pcName || `PC-${seat.pcNumber}`}</span>
                  </button>
                );
              })}
            </div>

            {/* Realtime Direct Terminal Communication & Control Panel */}
            {currentSeat ? (
              <div className="mt-3 p-5 rounded-2xl bg-slate-50/90 border border-slate-200 flex flex-col gap-4 animate-fadeIn shadow-xs">
                {/* Seat Info Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-200/80">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-mono font-bold flex items-center justify-center text-base shadow-sm shrink-0">
                      {currentSeat.pcName || `PC-${currentSeat.pcNumber}`}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-base">
                          {currentSeat.status === 'Occupied' && currentSeat.studentName ? currentSeat.studentName : 'Terminal Vacant'}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          currentSeat.status === 'Occupied' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {currentSeat.status === 'Occupied' ? 'IN SESSION' : 'AVAILABLE'}
                        </span>
                        {currentSeat.helpRequested && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black animate-pulse flex items-center gap-1">
                            ✋ HELP REQUESTED
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 text-xs mt-0.5 font-medium">
                        {currentSeat.status === 'Occupied' && currentSeat.studentName 
                          ? `Roll #: ${currentSeat.studentId} • ${currentSeat.course} • Batch: ${currentSeat.batch} • IP: ${currentSeat.ipAddress || '192.168.1.100'} • Logged in: ${currentSeat.loginTime || '09:30 AM'}`
                          : 'No student logged in at this workstation seat.'}
                      </p>
                    </div>
                  </div>

                  {/* Quick Controls */}
                  {currentSeat.status === 'Occupied' && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={handlePingSelectedPc}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-300" />
                        <span>Ping PC</span>
                      </button>

                      {currentSeat.helpRequested && (
                        <button
                          onClick={handleResolveHelpRequest}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Clear Help Hand</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Realtime Live Terminal Messages Stream */}
                {currentSeat.status === 'Occupied' ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-indigo-600" />
                        Live Terminal Stream ({currentSeat.pcName || `PC-${currentSeat.pcNumber}`} &bull; {currentSeat.studentName})
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">SUPABASE REALTIME CHAT CHANNEL</span>
                    </div>

                    {/* Messages Container */}
                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200 max-h-56 overflow-y-auto flex flex-col gap-2.5">
                      {activePcMessages.length === 0 ? (
                        <div className="py-6 text-center text-xs text-slate-400 italic">
                          No messages exchanged yet with {currentSeat.studentName} at {currentSeat.pcName}. Type a message or click "Ping PC" below to start communication.
                        </div>
                      ) : (
                        activePcMessages.map((msg) => {
                          const isFacultySender = msg.sender === 'Faculty';
                          const isPing = msg.type === 'ping';
                          const isHelp = msg.type === 'help_request';
                          return (
                            <div
                              key={msg.id}
                              className={`p-3 rounded-xl text-xs flex flex-col gap-1 border ${
                                isPing
                                  ? 'bg-indigo-50 border-indigo-200 text-indigo-900'
                                  : isHelp
                                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                                  : isFacultySender
                                  ? 'bg-blue-50/80 border-blue-200 self-end max-w-[85%]'
                                  : 'bg-slate-50 border-slate-200 self-start max-w-[85%]'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-3 text-[10px] font-bold">
                                <span className={isFacultySender ? 'text-blue-700' : 'text-emerald-700'}>
                                  {msg.senderName} ({msg.senderRole})
                                </span>
                                <span className="text-slate-400 font-mono">{msg.timestamp}</span>
                              </div>
                              <p className="text-slate-800 font-medium leading-relaxed">{msg.text}</p>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Input Form */}
                    <form onSubmit={handleSendTerminalMessageSubmit} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={terminalChatInput}
                        onChange={(e) => setTerminalChatInput(e.target.value)}
                        placeholder={`Send live instruction or note to ${currentSeat.studentName} at ${currentSeat.pcName}...`}
                        className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                      />
                      <button
                        type="submit"
                        disabled={!terminalChatInput.trim()}
                        className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send to PC</span>
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-slate-500 font-medium">
                    This terminal seat ({currentSeat.pcName}) is currently vacant. Assign a student or select an occupied seat to chat.
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 text-center text-xs text-slate-500">
                Click any PC terminal node above to inspect workstation details, assigned student info, and open direct communication.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Broadcast Modal for Faculty */}
      {isLabBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Broadcast Message to All PCs in {selectedLabId}</h3>
                  <p className="text-[11px] text-slate-500">Sends realtime broadcast alert to all logged-in students in this lab</p>
                </div>
              </div>
              <button
                onClick={() => setIsLabBroadcastModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendLabBroadcastSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Broadcast Alert Message:
                </label>
                <textarea
                  rows={3}
                  required
                  value={labBroadcastInput}
                  onChange={(e) => setLabBroadcastInput(e.target.value)}
                  placeholder="e.g. Attention students: Practical submission deadline is in 15 minutes. Save all project files!"
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLabBroadcastModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Realtime Broadcast</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: MY BATCHES & ROSTER */}
      {activeTab === 'batches' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Enrolled Students Roster</h3>
              <p className="text-xs text-slate-500 mt-0.5">Showing students assigned to {currentFaculty.subject} batches</p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search student or roll #..."
                  value={rosterSearch}
                  onChange={(e) => setRosterSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-100 text-xs font-semibold rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 w-48"
                />
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                {['All', 'MERN-B1', 'MERN-B2', 'PYTHON-B1'].map((b) => (
                  <button
                    key={b}
                    onClick={() => setBatchFilter(b)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      batchFilter === b ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-6">Student & Roll #</th>
                  <th className="py-3 px-4">Batch</th>
                  <th className="py-3 px-4">Attendance Rate</th>
                  <th className="py-3 px-4">Current Grade</th>
                  <th className="py-3 px-4">Project Status</th>
                  <th className="py-3 px-6 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <img src={s.avatar} alt={s.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                        <div>
                          <span className="font-bold text-slate-900 block leading-tight">{s.name}</span>
                          <span className="font-mono text-[11px] text-slate-400">{s.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">{s.batch}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600">
                      <div className="flex items-center gap-2">
                        <span>{studentAttendance[s.id] || s.attendance}%</span>
                        <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${studentAttendance[s.id] || s.attendance}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-extrabold text-[11px] border border-indigo-100">
                        {studentGrades[s.id] || s.gpa}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{s.projectStatus}</td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => handleMarkPresent(s.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold transition-colors inline-flex items-center gap-1 border border-emerald-200"
                          title="Mark Present (+2%)"
                        >
                          <UserCheck className="w-3 h-3" /> Present
                        </button>
                        <button 
                          onClick={() => handleMarkAbsent(s.id)}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold transition-colors inline-flex items-center gap-1 border border-rose-200"
                          title="Mark Absent (-2%)"
                        >
                          <UserX className="w-3 h-3" /> Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ATTENDANCE & GRADING */}
      {activeTab === 'attendance-grading' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Batch Marksheet & Grading Desk</h3>
              <p className="text-xs text-slate-500 mt-0.5">Direct grade modification with live academic transcript updates</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {initialStudents.map((s) => (
              <div key={s.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4 hover:border-indigo-200 transition-all">
                <div className="flex items-center gap-3">
                  <img src={s.avatar} alt={s.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                  <div>
                    <span className="font-bold text-slate-900 text-sm block leading-tight">{s.name}</span>
                    <span className="text-slate-400 text-xs font-mono">{s.id} • {s.course}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">Grade:</span>
                  <select
                    value={studentGrades[s.id] || s.gpa}
                    onChange={(e) => handleGradeChange(s.id, e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 font-extrabold text-indigo-700 text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
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
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-6 font-sans">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Instructor Earnings & Honorarium Statement</h3>
              <p className="text-xs text-slate-500 mt-0.5">Detailed breakdown for Oct 2024 academic cycle ({currentFaculty.name})</p>
            </div>
            <Suspense fallback={<span className="text-xs text-slate-400">Preparing PDF…</span>}>
              <PDFDownloadButton
                document={<FacultyPayslipPDF faculty={currentFaculty} />}
                fileName={`Payslip_${currentFaculty?.name ? currentFaculty.name.replace(/\s+/g, '_') : 'Faculty'}_Oct2024.pdf`}
                buttonText="Download Payslip PDF"
                variant="indigo"
              />
            </Suspense>
          </div>

          {/* Real-time Salary Disbursement Status Banner */}
          {currentFaculty.disbursed ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-emerald-900 text-sm">Monthly Salary Disbursed & Deposited</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 text-[10px] font-black uppercase">
                      Bank Transfer Cleared
                    </span>
                  </div>
                  <p className="text-emerald-700 font-medium mt-0.5">
                    Your net earnings of <strong>₹{(currentFaculty.salary + currentFaculty.honorarium).toLocaleString('en-IN')}</strong> have been approved by Finance Desk and transferred to your registered bank account.
                  </p>
                </div>
              </div>
              <span className="font-mono text-emerald-800 text-[11px] font-bold bg-white/80 px-3 py-1.5 rounded-xl border border-emerald-200 shrink-0">
                TXN #NEFT-OCT-8842
              </span>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-amber-950 text-sm">Payout Clearance Pending</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 text-[10px] font-black uppercase">
                      Under Finance Review
                    </span>
                  </div>
                  <p className="text-amber-800 font-medium mt-0.5">
                    Your October 2024 earnings of <strong>₹{(currentFaculty.salary + currentFaculty.honorarium).toLocaleString('en-IN')}</strong> are currently pending clearance at the Finance Command Desk.
                  </p>
                </div>
              </div>
              <span className="font-mono text-amber-900 text-[11px] font-bold bg-white/80 px-3 py-1.5 rounded-xl border border-amber-200 shrink-0">
                STATUS: PENDING APPROVAL
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 font-bold uppercase text-[11px]">Monthly Base Salary</span>
              <div className="text-3xl font-extrabold text-slate-900 mt-1">₹{currentFaculty.salary.toLocaleString('en-IN')}</div>
              <p className="text-xs text-slate-500 mt-2">Fixed monthly pay contract</p>
            </div>

            <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100">
              <span className="text-indigo-700 font-bold uppercase text-[11px]">Lecture & Lab Honorarium</span>
              <div className="text-3xl font-extrabold text-indigo-700 mt-1">₹{currentFaculty.honorarium.toLocaleString('en-IN')}</div>
              <p className="text-xs text-indigo-600 mt-2">Calculated for conducted practical lab sessions</p>
            </div>
          </div>
        </div>
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
