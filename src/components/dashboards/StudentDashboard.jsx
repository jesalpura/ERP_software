import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import QrCameraScanner from '../common/QrCameraScanner';
import { erpService } from '../../services/erpService';

// Lazy-load heavy view/PDF chunks
const ComplaintsRequestsView = lazy(() => import('../views/ComplaintsRequestsView'));
const ExamAdmitCardPDF       = lazy(() => import('../pdf/ExamAdmitCardPDF'));
import PDFDownloadButton from '../pdf/PDFDownloadButton';
import { 
  User, 
  Calendar, 
  Wallet, 
  BookOpen, 
  Bell, 
  Download, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  HelpCircle,
  Upload,
  Sparkles,
  Monitor,
  Check,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  Wifi,
  FileText,
  Send,
  Camera,
  QrCode,
  X,
  Zap,
  MessageSquare,
  FileCheck,
  ExternalLink,
  Paperclip
} from 'lucide-react';

export default function StudentDashboard({ 
  students, 
  transactions, 
  notices, 
  assignments: initialAssignments, 
  activeTab: parentActiveTab, 
  setActiveTab: parentSetActiveTab,
  user,
  activeQrSession,
  onRecordQrScan,
  complaintsAndRequests = [],
  onAddComplaintRequest,
  onUpdateComplaintRequest,
  pcTerminals = [],
  pcMessages = [],
  onSendPcMessage,
  onUpdatePcTerminal
}) {
  const [localActiveTab, setLocalActiveTab] = useState('overview');
  const activeTab = parentActiveTab !== undefined ? parentActiveTab : localActiveTab;
  const setActiveTab = parentSetActiveTab || setLocalActiveTab;

  // Determine current student by email or default to first if not found (or mock)
  const currentStudentByEmail = students.find(s => s.email === user?.email);
  const [selectedStudentId, setSelectedStudentId] = useState(currentStudentByEmail ? currentStudentByEmail.id : 'AT-2024-089');

  useEffect(() => {
    if (currentStudentByEmail) {
      setSelectedStudentId(currentStudentByEmail.id);
    }
  }, [currentStudentByEmail]);

  const activeScheduleDay = 'Today'; // Mock active schedule day if unused or use state
  const [activeScheduleDayState, setActiveScheduleDay] = useState('Today');
  const [assignmentFilter, setAssignmentFilter] = useState('All');
  const [studentChatInput, setStudentChatInput] = useState('');

  // Real PDF Assignment Submission State
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [activeAssignmentToSubmit, setActiveAssignmentToSubmit] = useState(null);
  const [selectedPdfFile, setSelectedPdfFile] = useState(null);
  const [pdfComments, setPdfComments] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [isSubmittingPdf, setIsSubmittingPdf] = useState(false);
  const [submissions, setSubmissions] = useState({
    'ASM-102': {
      assignmentId: 'ASM-102',
      fileName: 'GST_Ledger_Reconciliation_Solution.pdf',
      fileSize: '1.4 MB',
      submittedAt: 'Oct 24, 2024 • 04:30 PM',
      comment: 'Reconciled GST ledger vouchers & filled return summaries in PDF format.',
      status: 'Submitted',
      fileUrl: null
    }
  });

  // Listen for realtime assignment submissions from other tabs/users
  useEffect(() => {
    const unsubscribe = erpService.subscribeToAssignmentSubmissions((newSub) => {
      if (newSub && newSub.assignmentId) {
        setSubmissions((prev) => ({
          ...prev,
          [newSub.assignmentId]: newSub
        }));
      }
    });
    return () => unsubscribe();
  }, []);

  // QR Scanner Modal State
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Terminal Ping State
  const [isTestingTerminal, setIsTestingTerminal] = useState(false);
  const [terminalStatus, setTerminalStatus] = useState(null);

  // Admin Request / Complaint Ticket Modal State
  const [isAdminTicketModalOpen, setIsAdminTicketModalOpen] = useState(false);
  const [ticketType, setTicketType] = useState('Request'); // 'Request' | 'Complaint'
  const [ticketCategory, setTicketCategory] = useState('Workstation / PC Defect');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDetails, setTicketDetails] = useState('');
  const [studentTickets, setStudentTickets] = useState([
    {
      id: 'STU-TKT-301',
      type: 'Request',
      category: 'Workstation / PC Defect',
      subject: 'Request for PC-14 Keyboard Replacement in Lab 1',
      status: 'In Progress',
      date: 'Oct 21, 2024'
    }
  ]);

  // Toast State
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg, isError = false) => {
    const text = typeof msg === 'string' ? msg : (msg?.message || String(msg));
    setToastMessage({ text, isError });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const currentStudent = students.find((s) => s.id === selectedStudentId) || students[0];
  const studentTx = transactions.filter((t) => t.studentId === currentStudent.id);

  const assignedTerminal = pcTerminals.find((t) => t.studentId === currentStudent.id) ||
    pcTerminals.find((t) => t.pcNumber === 14 && t.labId === 'LAB-01') || {
      labId: 'LAB-01',
      pcNumber: 14,
      pcName: 'PC-14',
      status: 'Occupied',
      helpRequested: false
    };

  const myPcMessages = pcMessages.filter(
    (m) => m.labId === assignedTerminal.labId && m.pcNumber === assignedTerminal.pcNumber
  );

  const handleSendStudentPcMessage = (e) => {
    e.preventDefault();
    if (!studentChatInput.trim() || !assignedTerminal) return;

    const newMsg = {
      id: `MSG-STU-${Date.now()}`,
      labId: assignedTerminal.labId,
      pcNumber: assignedTerminal.pcNumber,
      studentId: currentStudent.id,
      sender: 'Student',
      senderName: currentStudent.name,
      senderRole: 'Student',
      text: studentChatInput.trim(),
      type: 'chat',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    if (onSendPcMessage) onSendPcMessage(newMsg);
    setStudentChatInput('');
  };

  const handleRaiseHandHelp = () => {
    if (!assignedTerminal) return;
    if (onUpdatePcTerminal) {
      onUpdatePcTerminal({
        ...assignedTerminal,
        helpRequested: true
      });
    }

    const helpMsg = {
      id: `MSG-HELP-${Date.now()}`,
      labId: assignedTerminal.labId,
      pcNumber: assignedTerminal.pcNumber,
      studentId: currentStudent.id,
      sender: 'Student',
      senderName: currentStudent.name,
      senderRole: 'Student',
      text: `✋ HELP REQUEST: ${currentStudent.name} at ${assignedTerminal.pcName || `PC-${assignedTerminal.pcNumber}`} is requesting assistance from Professor.`,
      type: 'help_request',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    if (onSendPcMessage) onSendPcMessage(helpMsg);
    showToast(`✋ Help Hand raised at ${assignedTerminal.pcName || `PC-${assignedTerminal.pcNumber}`}! Professor notified in realtime.`);
  };

  const handleSubmitStudentTicket = (e) => {
    e.preventDefault();
    if (!ticketSubject.trim()) {
      showToast('Please enter a ticket subject');
      return;
    }
    const newTkt = {
      id: `STU-TKT-${Math.floor(100 + Math.random() * 900)}`,
      senderType: 'Student',
      senderId: currentStudent.id,
      senderName: currentStudent.name,
      senderRole: currentStudent.course || 'Student',
      senderAvatar: currentStudent.avatar,
      type: ticketType,
      category: ticketCategory,
      subject: ticketSubject.trim(),
      message: ticketDetails.trim() || ticketSubject.trim(),
      status: 'Pending',
      createdAt: 'Just now',
      replies: [],
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    setStudentTickets([newTkt, ...studentTickets]);
    if (onAddComplaintRequest) {
      onAddComplaintRequest(newTkt);
    }
    setIsAdminTicketModalOpen(false);
    setTicketSubject('');
    setTicketDetails('');
    showToast(`${ticketType} "${newTkt.subject}" broadcasted to Admin Desk via Supabase Realtime!`);
  };

  const handleTestTerminal = () => {
    setIsTestingTerminal(true);
    setTerminalStatus(null);
    setTimeout(() => {
      setIsTestingTerminal(false);
      setTerminalStatus({ ping: '12ms', ip: '192.168.1.114', status: 'Online & Health OK' });
      showToast('Workstation PC-14 ping successful! System online.');
    }, 1200);
  };

  // Called by QrCameraScanner when a QR code is successfully decoded by the camera
  const handleQrCodeDetected = useCallback((decodedText) => {
    setIsScannerOpen(false);
    if (onRecordQrScan) {
      const res = onRecordQrScan(currentStudent.id, decodedText);
      showToast(res.message, !res.success);
    } else {
      showToast(`✅ Attendance recorded! Code scanned: ${decodedText}`);
    }
  }, [currentStudent, onRecordQrScan]);

  const handleOpenPdfModal = (asm) => {
    setActiveAssignmentToSubmit(asm);
    setSelectedPdfFile(null);
    setPdfComments('');
    setGithubUrl('');
    setIsPdfModalOpen(true);
  };

  const handlePdfFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        showToast('Please select a valid PDF document (.pdf).');
        return;
      }
      setSelectedPdfFile(file);
    }
  };

  const handleConfirmPdfSubmit = () => {
    if (!selectedPdfFile) {
      showToast('Please select a PDF document file to upload.');
      return;
    }

    setIsSubmittingPdf(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const fileDataUrl = event.target.result;
      const submissionObj = {
        assignmentId: activeAssignmentToSubmit.id,
        assignmentTitle: activeAssignmentToSubmit.title,
        studentId: currentStudent.id,
        studentName: currentStudent.name,
        fileName: selectedPdfFile.name,
        fileSize: selectedPdfFile.size > 1024 * 1024
          ? (selectedPdfFile.size / (1024 * 1024)).toFixed(2) + ' MB'
          : (selectedPdfFile.size / 1024).toFixed(1) + ' KB',
        fileUrl: fileDataUrl,
        submittedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' • ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        comment: pdfComments || 'PDF solution submitted for instructor grading.',
        githubUrl: githubUrl || '',
        status: 'Submitted'
      };

      setSubmissions((prev) => ({
        ...prev,
        [activeAssignmentToSubmit.id]: submissionObj
      }));

      // Realtime broadcast across tabs & Supabase websockets
      erpService.broadcastAssignmentSubmit(submissionObj);

      setIsSubmittingPdf(false);
      setIsPdfModalOpen(false);
      setSelectedPdfFile(null);
      setPdfComments('');
      setGithubUrl('');
      showToast(`PDF Solution "${selectedPdfFile.name}" submitted successfully!`);
    };

    reader.onerror = () => {
      setIsSubmittingPdf(false);
      showToast('Error reading PDF file. Please try again.');
    };

    reader.readAsDataURL(selectedPdfFile);
  };

  const attendanceDays = [
    { day: 'Mon', status: 'Present' },
    { day: 'Tue', status: 'Present' },
    { day: 'Wed', status: 'Present' },
    { day: 'Thu', status: 'Present' },
    { day: 'Fri', status: 'Present' },
    { day: 'Sat', status: 'Holiday' },
    { day: 'Sun', status: 'Holiday' }
  ];

  const filteredAssignments = initialAssignments.filter((asm) => {
    const isSubmitted = !!submissions[asm.id];
    if (assignmentFilter === 'Pending') return !isSubmitted;
    if (assignmentFilter === 'Submitted') return isSubmitted;
    return true;
  });

  return (
    <div className="flex flex-col gap-6 pb-12 font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 text-white px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2 text-xs font-semibold animate-bounce ${
          toastMessage.isError ? 'bg-rose-900/95 border-rose-700 text-rose-100' : 'bg-slate-900 border-slate-700'
        }`}>
          {toastMessage.isError ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{toastMessage.text || toastMessage}</span>
        </div>
      )}

      {/* Student Portal Header */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-slate-900 text-white p-6 rounded-3xl shadow-md border border-blue-900/50 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-4 relative z-10">
          <div className="relative">
            <img 
              src={currentStudent.avatar} 
              alt={currentStudent.name} 
              className="w-16 h-16 rounded-2xl object-cover ring-4 ring-blue-500/30 shadow-md" 
            />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900 animate-pulse"></span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-extrabold tracking-tight text-white">{currentStudent.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono text-[10px] font-extrabold tracking-wider">
                {currentStudent.id}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {currentStudent.course} • <span className="text-blue-300 font-semibold">{currentStudent.batch}</span>
            </p>
          </div>
        </div>

        {/* Quick Actions, Request to Admin & QR Scanner Trigger */}
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <button
            onClick={() => setIsAdminTicketModalOpen(true)}
            className="px-3.5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2 border border-amber-500/50"
          >
            <AlertCircle className="w-4 h-4 text-amber-200" />
            <span>Request / Complain to Admin</span>
          </button>

          <button
            onClick={() => setIsScannerOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2 border border-emerald-500/50"
          >
            <QrCode className="w-4 h-4 text-emerald-200 animate-pulse" />
            <span>Scan Attendance QR</span>
          </button>

          <Suspense fallback={<span className="text-xs text-slate-400">Preparing PDF…</span>}>
            <PDFDownloadButton
              document={<ExamAdmitCardPDF student={currentStudent} />}
              fileName={`AdmitCard_${currentStudent?.id || 'Student'}.pdf`}
              buttonText="Download Admit Card PDF"
              variant="indigo"
            />
          </Suspense>

          {/* Switch Student Simulator */}
          <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 px-3 rounded-2xl border border-slate-700/80 text-xs">
            <span className="text-slate-400 font-medium text-[11px]">Simulate:</span>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="bg-transparent text-white font-bold outline-none cursor-pointer"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                  {s.name} ({s.id})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* STUDENT QR SCANNER CAMERA MODAL */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 flex flex-col items-center gap-5 text-slate-900 relative">
            <button
              onClick={() => setIsScannerOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100 inline-flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5" /> Live Camera • Auto-Scan
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 mt-2">Scan Faculty Attendance QR</h3>
              <p className="text-xs text-slate-500 mt-1">Point your device camera at the instructor's QR code — detected automatically</p>
            </div>

            {/* Real live camera QR scanner */}
            <QrCameraScanner
              onScan={handleQrCodeDetected}
              onError={(err) => console.warn('QR Camera error:', err)}
            />

            {/* Active Session Info Tag */}
            <div className="w-full bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs text-center text-slate-600 font-mono">
              Target Session Code: <strong className="text-slate-900">{activeQrSession?.code || 'QR-ATT-2024'}</strong>
            </div>
          </div>
        </div>
      )}

      {/* STUDENT REQUEST / COMPLAINT TO ADMIN MODAL */}
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
                  Student Helpdesk
                </span>
                <span className="text-xs text-slate-400 font-mono">Official ERP Helpdesk</span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mt-2">Submit Request or Complaint to Admin</h3>
              <p className="text-xs text-slate-500 mt-1">Direct support desk for workstation issues, attendance disputes, or fee extensions</p>
            </div>

            <form onSubmit={handleSubmitStudentTicket} className="flex flex-col gap-4">
              {/* Ticket Type Toggle */}
              <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
                {['Request', 'Complaint'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setTicketType(type)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                      ticketType === type
                        ? type === 'Complaint' ? 'bg-rose-600 text-white shadow-xs' : 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {type === 'Request' ? '📋 Academic / Fee Request' : '⚠️ Issue / Complaint'}
                  </button>
                ))}
              </div>

              {/* Category Select */}
              <div className="flex flex-col gap-1.5 text-xs">
                <label className="font-bold text-slate-700">Category:</label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="Workstation / PC Defect">Workstation / PC Hardware Defect</option>
                  <option value="Attendance Discrepancy">Attendance Record Discrepancy</option>
                  <option value="Fee Installment Extension">Fee Due Date Extension Request</option>
                  <option value="Batch / Schedule Change">Batch Transfer / Schedule Change</option>
                  <option value="Certificate / Transcript">Admit Card / Course Certificate Request</option>
                  <option value="Wi-Fi & Network Access">Lab Wi-Fi / High-Speed LAN Connection</option>
                </select>
              </div>

              {/* Subject */}
              <div className="flex flex-col gap-1.5 text-xs">
                <label className="font-bold text-slate-700">Subject / Title:</label>
                <input
                  type="text"
                  required
                  placeholder={ticketType === 'Request' ? 'e.g. Request 5-day fee installment extension' : 'e.g. PC-14 mouse scroll wheel not responding'}
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5 text-xs">
                <label className="font-bold text-slate-700">Message / Details:</label>
                <textarea
                  rows={3}
                  placeholder="Describe your issue or request in detail for the Administration team..."
                  value={ticketDetails}
                  onChange={(e) => setTicketDetails(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
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
                    ticketType === 'Complaint' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-blue-600 hover:bg-blue-700'
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

      {/* TAB 1: OVERVIEW & PROGRESS */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Workstation Attendance</span>
              <div className="text-3xl font-extrabold text-emerald-600 mt-2">{currentStudent.attendance}%</div>
              <div className="flex items-center gap-1 mt-2 text-[10px]">
                {attendanceDays.map((d, idx) => (
                  <span 
                    key={idx} 
                    title={`${d.day}: ${d.status}`}
                    className={`w-5 h-5 rounded-md flex items-center justify-center font-bold ${
                      d.status === 'Present' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {d.day[0]}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Paid Tuition</span>
              <div className="text-3xl font-extrabold text-slate-900 mt-2">₹{currentStudent.paidFee.toLocaleString('en-IN')}</div>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Due: ₹{currentStudent.pendingFee.toLocaleString('en-IN')}</span>
                  <span className="font-bold text-slate-900">{Math.round((currentStudent.paidFee / currentStudent.totalFee) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: `${(currentStudent.paidFee / currentStudent.totalFee) * 100}%` }}></div>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Academic Standing</span>
              <div className="text-3xl font-extrabold text-blue-600 mt-2">{currentStudent.gpa}</div>
              <span className="text-[11px] text-slate-500 font-medium mt-2 block">Ranked Top 5% in Batch</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Assigned Workstation</span>
              <div className="text-2xl font-extrabold text-slate-900 mt-2">
                {assignedTerminal.labId} • {assignedTerminal.pcName || `PC-${assignedTerminal.pcNumber}`}
              </div>
              <span className="text-[11px] text-emerald-600 font-bold mt-2 flex items-center gap-1">
                <Wifi className="w-3.5 h-3.5" /> Supabase Realtime Stream
              </span>
            </div>
          </div>

          {/* REALTIME ALLOCATED PC WORKSTATION & PROFESSOR COMMUNICATION STREAM */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 flex flex-col gap-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs shrink-0 font-mono font-bold text-lg">
                  {assignedTerminal.pcName || `PC-${assignedTerminal.pcNumber}`}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      My Workstation Terminal &bull; {assignedTerminal.labId} ({assignedTerminal.pcName || `PC-${assignedTerminal.pcNumber}`})
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Live Sync
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Assigned seat for {currentStudent.course} • IP: {assignedTerminal.ipAddress || '192.168.1.114'} • Dual Monitor Workstation
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleRaiseHandHelp}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <AlertCircle className="w-4 h-4 text-white animate-pulse" />
                  <span>✋ Raise Hand / Request Help</span>
                </button>

                <button
                  onClick={handleTestTerminal}
                  disabled={isTestingTerminal}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-200 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Wifi className="w-4 h-4 text-blue-600" />
                  <span>{isTestingTerminal ? 'Testing Ping...' : 'Test PC Ping'}</span>
                </button>
              </div>
            </div>

            {/* Realtime Terminal Messages Box */}
            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  Realtime Terminal Stream with Professor (PC-{assignedTerminal.pcNumber})
                </span>
                <span className="text-[10px] text-slate-400 font-mono">SUPABASE BROADCAST CHANNEL</span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 max-h-56 overflow-y-auto flex flex-col gap-2.5">
                {myPcMessages.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400 italic">
                    No active terminal messages yet. Messages sent by Professor or raised help requests will appear here in real time.
                  </div>
                ) : (
                  myPcMessages.map((msg) => {
                    const isFacultySender = msg.sender === 'Faculty';
                    const isPing = msg.type === 'ping';
                    const isBroadcast = msg.type === 'broadcast';
                    return (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-xl text-xs flex flex-col gap-1 border ${
                          isBroadcast
                            ? 'bg-amber-50 border-amber-300 text-amber-900'
                            : isPing
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-900'
                            : isFacultySender
                            ? 'bg-blue-50/90 border-blue-200 self-start max-w-[85%]'
                            : 'bg-emerald-50/90 border-emerald-200 self-end max-w-[85%]'
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

              {/* Student Reply Form */}
              <form onSubmit={handleSendStudentPcMessage} className="flex items-center gap-2">
                <input
                  type="text"
                  value={studentChatInput}
                  onChange={(e) => setStudentChatInput(e.target.value)}
                  placeholder={`Type response or code query from ${assignedTerminal.pcName || `PC-${assignedTerminal.pcNumber}`}...`}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
                <button
                  type="submit"
                  disabled={!studentChatInput.trim()}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Reply</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MY SCHEDULE & LAB SEAT */}
      {activeTab === 'schedule' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Class Timetable & Lab Slot Schedule</h3>
              <p className="text-xs text-slate-500 mt-0.5">Interactive timetable for {currentStudent.course}</p>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {['Today', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((d) => (
                <button
                  key={d}
                  onClick={() => setActiveScheduleDay(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeScheduleDay === d ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-100 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-900 text-base">{currentStudent.course} Practical</span>
                <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold">
                  10:00 AM - 12:00 PM
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Instructor: <strong>Prof. Verma</strong> • Lab: <strong>{currentStudent.lab}</strong> • Terminal #14
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-base">Full Stack Code Review & PR Demo</span>
                <span className="px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-xs font-bold">
                  02:00 PM - 04:00 PM
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Instructor: <strong>Prof. Verma</strong> • Lab: <strong>LAB-02</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FEES & ATTENDANCE LEDGER */}
      {activeTab === 'fees-attendance' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Fee Receipts & Transaction Log</h3>
              <p className="text-xs text-slate-500 mt-0.5">E-Receipt vouchers issued by Finance Desk</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {studentTx.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">No transaction receipts found.</div>
            ) : (
              studentTx.map((t) => (
                <div key={t.id} className="py-4 flex items-center justify-between text-xs hover:bg-slate-50/50 p-2 rounded-xl transition-colors">
                  <div>
                    <span className="font-mono font-bold text-blue-600 text-sm block">{t.id}</span>
                    <div className="text-slate-500 mt-0.5">{t.installment} • {t.mode} • {t.timestamp}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900 text-sm">₹{t.amount.toLocaleString('en-IN')}</div>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {t.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: MATERIALS & ASSIGNMENTS */}
      {activeTab === 'materials-assignments' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Course Assignments & Code Submissions</h3>
              <p className="text-xs text-slate-500 mt-0.5">Submit repository links or zip files for faculty review</p>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {['All', 'Pending', 'Submitted'].map((f) => (
                <button
                  key={f}
                  onClick={() => setAssignmentFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    assignmentFilter === f ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredAssignments.map((asm) => {
              const sub = submissions[asm.id];
              return (
                <div key={asm.id} className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                  sub ? 'bg-emerald-50/40 border-emerald-200' : 'bg-slate-50 border-slate-200 hover:border-blue-200'
                }`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-blue-600 text-xs">{asm.id}</span>
                      {sub ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Solution Submitted
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                          Pending Upload
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mt-1">{asm.title}</h4>
                    <p className="text-slate-500 text-xs mt-1">Due Date: <strong>{asm.dueDate}</strong> • Course: {asm.course}</p>
                    
                    {sub && (
                      <div className="mt-3 p-3 rounded-xl bg-white border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div>
                            <span className="font-bold text-slate-900 block">{sub.fileName}</span>
                            <span className="text-[10px] text-slate-500">{sub.fileSize} • Submitted {sub.submittedAt}</span>
                          </div>
                        </div>
                        {sub.fileUrl && (
                          <button
                            onClick={() => {
                              const w = window.open();
                              if (w) w.document.write(`<iframe src="${sub.fileUrl}" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                          >
                            <Paperclip className="w-3.5 h-3.5" /> View Uploaded PDF
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-auto">
                    <button
                      onClick={() => handleOpenPdfModal(asm)}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-colors shadow-xs flex items-center gap-2 cursor-pointer ${
                        sub 
                          ? 'bg-slate-200 text-slate-800 hover:bg-slate-300' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{sub ? 'Re-upload PDF' : 'Upload PDF Solution'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: NOTICES & HELPDESK */}
      {activeTab === 'notices-helpdesk' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Academy Announcements & Student Helpdesk</h3>
              <p className="text-xs text-slate-500 mt-0.5">Important session notices and direct escalation tickets to Administration</p>
            </div>
            <button
              onClick={() => setIsAdminTicketModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors shadow-xs flex items-center gap-2 self-start sm:self-auto"
            >
              <AlertCircle className="w-4 h-4 text-amber-200" />
              <span>Submit Request / Complain to Admin</span>
            </button>
          </div>

          {/* My Submitted Admin Tickets */}
          <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-slate-900 text-sm">My Logged Tickets with Administration</h4>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold">
                  {studentTickets.length} Active Ticket(s)
                </span>
              </div>
            </div>

            <div className="space-y-2.5 mt-1">
              {studentTickets.map((tkt) => (
                <div key={tkt.id} className="p-3.5 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shadow-2xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-700">{tkt.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                        tkt.type === 'Complaint' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {tkt.type}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">{tkt.date}</span>
                    </div>
                    <div className="font-bold text-slate-900 mt-1">{tkt.subject}</div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-extrabold self-start sm:self-auto">
                    {tkt.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 text-sm">Campus Notices & Broadcasts</h4>
            {notices.map((n) => (
              <div key={n.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
                <span className="px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px] uppercase">
                  {n.category}
                </span>
                <h4 className="font-bold text-slate-900 text-sm mt-2">{n.title}</h4>
                <p className="text-slate-600 mt-1 leading-relaxed">{n.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: COMPLAINTS & REQUESTS HUB */}
      {activeTab === 'complaints-requests' && (
        <Suspense fallback={
          <div className="flex items-center justify-center h-[50vh]">
            <div className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <ComplaintsRequestsView
            userRole="student"
            currentUser={currentStudent}
            complaintsAndRequests={complaintsAndRequests}
            onAddComplaintRequest={onAddComplaintRequest}
            onUpdateComplaintRequest={onUpdateComplaintRequest}
            facultyList={students}
            studentList={students}
          />
        </Suspense>
      )}

      {/* REAL PDF ASSIGNMENT SUBMISSION MODAL */}
      {isPdfModalOpen && activeAssignmentToSubmit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 flex flex-col gap-5 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Upload PDF Assignment Solution</h3>
                  <p className="text-xs text-slate-500 font-mono">{activeAssignmentToSubmit.id} • {activeAssignmentToSubmit.course}</p>
                </div>
              </div>
              <button
                onClick={() => setIsPdfModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-900 text-sm">{activeAssignmentToSubmit.title}</h4>
              <p className="text-xs text-slate-500 mt-1">Due Date: <strong>{activeAssignmentToSubmit.dueDate}</strong></p>
            </div>

            {/* PDF File Drag & Drop Upload Input */}
            <div className="flex flex-col gap-2">
              <label className="block text-xs font-extrabold text-slate-700">
                Attach Assignment PDF File <span className="text-rose-500">*</span>
              </label>

              <div className="relative border-2 border-dashed border-blue-200 hover:border-blue-500 bg-blue-50/40 rounded-2xl p-6 text-center flex flex-col items-center justify-center gap-2 transition-all cursor-pointer">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handlePdfFileChange}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                />

                {selectedPdfFile ? (
                  <div className="flex flex-col items-center gap-1.5 z-0">
                    <FileCheck className="w-10 h-10 text-emerald-600" />
                    <span className="font-bold text-xs text-slate-900">{selectedPdfFile.name}</span>
                    <span className="text-[11px] font-mono text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {(selectedPdfFile.size / 1024 > 1024 ? (selectedPdfFile.size / (1024*1024)).toFixed(2) + ' MB' : (selectedPdfFile.size / 1024).toFixed(1) + ' KB')} • PDF Ready
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1">Click to select a different PDF file</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 z-0">
                    <Upload className="w-9 h-9 text-blue-500" />
                    <span className="font-extrabold text-xs text-slate-800">Click or Drag & Drop PDF Document Here</span>
                    <span className="text-[11px] text-slate-500 font-mono">Accepts .pdf files (Max 25MB)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Instructor Notes / Comments */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Comments / Solution Summary for Instructor (Optional)
              </label>
              <textarea
                value={pdfComments}
                onChange={(e) => setPdfComments(e.target.value)}
                placeholder="Explain key implementations, REST endpoint summaries, or special notes..."
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>

            {/* GitHub Repo URL */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                GitHub Repository / Live Demo URL (Optional)
              </label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/your-username/assignment-repo"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>

            {/* Submit Action Buttons */}
            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsPdfModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedPdfFile || isSubmittingPdf}
                onClick={handleConfirmPdfSubmit}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition-colors shadow-md shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmittingPdf ? (
                  <span>Uploading PDF...</span>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Confirm & Submit PDF</span>
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
