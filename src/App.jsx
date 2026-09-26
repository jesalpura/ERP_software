import React, { useState, useEffect, lazy, Suspense } from 'react';
import { websiteConfig } from './config/siteConfig';
import LoginPage from './components/auth/LoginPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ErrorBoundary from './components/common/ErrorBoundary';

// Lazy-load dashboards — each is only fetched when the user's role is known
const AdminDashboard   = lazy(() => import('./components/dashboards/AdminDashboard'));
const FacultyDashboard = lazy(() => import('./components/dashboards/FacultyDashboard'));
const StudentDashboard = lazy(() => import('./components/dashboards/StudentDashboard'));
const FinanceDashboard = lazy(() => import('./components/dashboards/FinanceDashboard'));

import RegisterStudentModal from './components/modals/RegisterStudentModal';
import CollectFeeModal from './components/modals/CollectFeeModal';
import ReceiptPreviewModal from './components/modals/ReceiptPreviewModal';
import PublishNoticeModal from './components/modals/PublishNoticeModal';

import { 
  initialStudents, 
  initialTransactions, 
  initialLabs, 
  initialFaculty, 
  initialExpenses, 
  initialNotices, 
  initialAssignments,
  initialComplaintsAndRequests,
  initialWeeklySchedule,
  initialPcTerminals,
  initialPcMessages
} from './data/mockData';

import { erpService } from './services/erpService';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';

export default function App() {
  // Authentication & Role State (Supabase Auth & RBAC)
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null); // 'admin' | 'faculty' | 'student' | 'finance'
  const [searchQuery, setSearchQuery] = useState('');

  // Sync Supabase authentication session state with strict Role-Based Access Control (RBAC)
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const handleSessionUser = (sessionUser) => {
      if (sessionUser) {
        setUser(sessionUser);
        setIsAuthenticated(true);

        const email = sessionUser.email?.toLowerCase() || '';
        const metadataRole = sessionUser.user_metadata?.role || sessionUser.app_metadata?.role;
        let authorizedRole = null;

        // 1. Check strict email-based role rules
        if (email.includes('admin')) {
          authorizedRole = 'admin';
        } else if (email.includes('faculty') || email.includes('instructor') || email.includes('teacher')) {
          authorizedRole = 'faculty';
        } else if (email.includes('finance') || email.includes('account') || email.includes('billing')) {
          authorizedRole = 'finance';
        } else if (email.includes('student')) {
          authorizedRole = 'student';
        }

        // 2. Check if a role was saved in user metadata
        if (!authorizedRole && metadataRole && ['admin', 'faculty', 'student', 'finance'].includes(metadataRole)) {
          authorizedRole = metadataRole;
        }

        // 3. Fallback: read selected card role from localStorage
        if (!authorizedRole) {
          const pendingRole = localStorage.getItem('supabase_selected_role');
          if (pendingRole && ['admin', 'faculty', 'student', 'finance'].includes(pendingRole)) {
            authorizedRole = pendingRole;
          } else {
            authorizedRole = 'student';
          }
        }

        setUserRole(authorizedRole);
        localStorage.setItem('supabase_selected_role', authorizedRole);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setUserRole(null);
      }
    };

    // Get active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSessionUser(session?.user || null);
    });

    // Listen to Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSessionUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSwitchRole = (newRole) => {
    setUserRole(newRole);
    setActiveTab('overview');
  };

  // Central Application Data States
  const [students, setStudents] = useState(initialStudents);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [labs, setLabs] = useState(initialLabs);
  const [faculty, setFaculty] = useState(initialFaculty);
  const [expenses, setExpenses] = useState(initialExpenses);
  const [notices, setNotices] = useState(initialNotices);
  const [assignments, setAssignments] = useState(initialAssignments);
  const [complaintsAndRequests, setComplaintsAndRequests] = useState(initialComplaintsAndRequests);
  const [weeklySchedule, setWeeklySchedule] = useState(initialWeeklySchedule);

  // Realtime Allocated PC Workstation Terminals & Messages
  const [pcTerminals, setPcTerminals] = useState(initialPcTerminals);
  const [pcMessages, setPcMessages] = useState(initialPcMessages);
  const [isDataSyncing, setIsDataSyncing] = useState(false);

  const handleAddComplaintRequest = (newItem) => {
    setComplaintsAndRequests((prev) => [newItem, ...prev.filter(t => t.id !== newItem.id)]);
    erpService.broadcastTicketCreated(newItem);
  };

  const handleUpdateComplaintRequest = (updatedItem) => {
    setComplaintsAndRequests((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
    erpService.broadcastTicketUpdated(updatedItem);
  };

  const handleSendPcMessage = (newMsg) => {
    setPcMessages((prev) => [...prev, newMsg]);
    erpService.broadcastPcMessage(newMsg);
  };

  const handleUpdatePcTerminal = (updatedTerminal) => {
    setPcTerminals((prev) =>
      prev.map((t) => (t.id === updatedTerminal.id ? updatedTerminal : t))
    );
    erpService.broadcastPcTerminalUpdate(updatedTerminal);
  };

  // Realtime Subscriptions for Allocated PC Messages & Terminal updates
  useEffect(() => {
    const unsubPcMsgs = erpService.subscribeToPcMessages((newMsg) => {
      setPcMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    });

    const unsubPcTerminals = erpService.subscribeToPcTerminalUpdates((updatedTerminal) => {
      setPcTerminals((prev) =>
        prev.map((t) => (t.id === updatedTerminal.id ? updatedTerminal : t))
      );
    });

    return () => {
      unsubPcMsgs();
      unsubPcTerminals();
    };
  }, []);

  // Fetch initial live data and subscribe to universal real-time events
  useEffect(() => {
    let isMounted = true;
    let unsubscribeDb = () => {};

    if (isSupabaseConfigured) {
      setIsDataSyncing(true);

      async function loadBackendData() {
        try {
          const [fetchedStudents, fetchedTransactions, fetchedLabs, fetchedFaculty, fetchedExpenses, fetchedNotices, fetchedAssignments] = await Promise.all([
            erpService.getStudents(),
            erpService.getTransactions(),
            erpService.getLabs(),
            erpService.getFaculty(),
            erpService.getExpenses(),
            erpService.getNotices(),
            erpService.getAssignments()
          ]);

          if (isMounted) {
            if (fetchedStudents && fetchedStudents.length > 0) setStudents(fetchedStudents);
            if (fetchedTransactions && fetchedTransactions.length > 0) setTransactions(fetchedTransactions);
            if (fetchedLabs && fetchedLabs.length > 0) setLabs(fetchedLabs);
            if (fetchedFaculty && fetchedFaculty.length > 0) setFaculty(fetchedFaculty);
            if (fetchedExpenses && fetchedExpenses.length > 0) setExpenses(fetchedExpenses);
            if (fetchedNotices && fetchedNotices.length > 0) setNotices(fetchedNotices);
            if (fetchedAssignments && fetchedAssignments.length > 0) setAssignments(fetchedAssignments);
          }
        } catch (err) {
          console.error('Error loading data from Supabase backend:', err);
        } finally {
          if (isMounted) setIsDataSyncing(false);
        }
      }

      loadBackendData();

      // Subscribe to Supabase Realtime Postgres Changes
      unsubscribeDb = erpService.subscribeToDatabaseChanges({
        onStudentChange: (eventType, newStudent, oldStudent) => {
          if (eventType === 'INSERT' && newStudent) {
            setStudents((prev) => [newStudent, ...prev.filter(s => s.id !== newStudent.id)]);
          } else if (eventType === 'UPDATE' && newStudent) {
            setStudents((prev) => prev.map(s => s.id === newStudent.id ? newStudent : s));
          } else if (eventType === 'DELETE' && oldStudent) {
            setStudents((prev) => prev.filter(s => s.id !== oldStudent.id));
          }
        },
        onTransactionChange: (eventType, newTx) => {
          if (eventType === 'INSERT' && newTx) {
            setTransactions((prev) => [newTx, ...prev.filter(t => t.id !== newTx.id)]);
          }
        },
        onLabChange: (eventType, newLab) => {
          if (newLab) {
            setLabs((prev) => prev.map(l => l.id === newLab.id ? newLab : l));
          }
        },
        onFacultyChange: (eventType, newFaculty) => {
          if (newFaculty) {
            setFaculty((prev) => prev.map(f => f.id === newFaculty.id ? newFaculty : f));
          }
        },
        onNoticeChange: (eventType, newNotice) => {
          if (eventType === 'INSERT' && newNotice) {
            setNotices((prev) => [newNotice, ...prev]);
          }
        }
      });
    }

    // Always subscribe to Universal Multi-Device Realtime Broadcasts
    const unsubscribeQr = erpService.subscribeToQrBroadcast({
      onQrCreated: (sessionPayload) => {
        setActiveQrSession(sessionPayload);
      },
      onStudentScanned: ({ studentId, code }) => {
        setActiveQrSession((prev) => {
          if (!prev || prev.code !== code) return prev;
          if (prev.scannedStudentIds.includes(studentId)) return prev;
          return {
            ...prev,
            scannedStudentIds: [...prev.scannedStudentIds, studentId]
          };
        });
        setStudents((prev) =>
          prev.map((s) => {
            if (s.id === studentId) {
              return { ...s, attendance: Math.min(100, s.attendance + 2) };
            }
            return s;
          })
        );
      }
    });

    // Subscribe to Supabase Realtime Complaints & Requests Ticket Broadcasts
    const unsubscribeTickets = erpService.subscribeToTicketBroadcast({
      onTicketCreated: (newTicket) => {
        if (newTicket) {
          setComplaintsAndRequests((prev) => [newTicket, ...prev.filter(t => t.id !== newTicket.id)]);
        }
      },
      onTicketUpdated: (updatedTicket) => {
        if (updatedTicket) {
          setComplaintsAndRequests((prev) =>
            prev.map(t => t.id === updatedTicket.id ? updatedTicket : t)
          );
        }
      }
    });

    // Subscribe to Supabase Realtime Campus Notice Broadcasts
    const unsubscribeNotices = erpService.subscribeToNoticeBroadcast((newNotice) => {
      if (newNotice) {
        setNotices((prev) => [newNotice, ...prev.filter(n => n.id !== newNotice.id)]);
      }
    });

    // Subscribe to Supabase Realtime Weekly Schedule Broadcasts
    const unsubscribeSchedule = erpService.subscribeToScheduleBroadcast((updatedSchedule) => {
      if (updatedSchedule) {
        setWeeklySchedule(updatedSchedule);
      }
    });

    // Subscribe to Supabase Realtime Faculty Status Broadcasts
    const unsubscribeFacultyStatus = erpService.subscribeToFacultyStatusBroadcast(({ facultyId, status }) => {
      if (facultyId && status) {
        setFaculty((prev) =>
          prev.map((f) => (f.id === facultyId ? { ...f, status } : f))
        );
      }
    });

    // Subscribe to Supabase Realtime Faculty Disbursement Broadcasts
    const unsubscribeFacultyDisbursement = erpService.subscribeToFacultyDisbursementBroadcast(({ facultyId, disbursed }) => {
      if (facultyId) {
        setFaculty((prev) =>
          prev.map((f) => (f.id === facultyId ? { ...f, disbursed } : f))
        );
      }
    });

    return () => {
      isMounted = false;
      unsubscribeDb();
      unsubscribeQr();
      unsubscribeTickets();
      unsubscribeNotices();
      unsubscribeSchedule();
      unsubscribeFacultyStatus();
      unsubscribeFacultyDisbursement();
    };
  }, []);

  // Dark/Light Theme Mode State & Sidebar Collapse State
  const [darkMode, setDarkMode] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modal Controls
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isCollectFeeOpen, setIsCollectFeeOpen] = useState(false);
  const [isPublishNoticeOpen, setIsPublishNoticeOpen] = useState(false);
  const [selectedReceiptTx, setSelectedReceiptTx] = useState(null);

  const [activeTab, setActiveTab] = useState('overview');

  // Live 60s QR Attendance Session State (Shared between Faculty & Student)
  const [activeQrSession, setActiveQrSession] = useState({
    code: 'QR-ATT-2024',
    lab: 'LAB-01',
    subject: 'MERN Stack Web Dev',
    secondsLeft: 60,
    active: true,
    scannedStudentIds: ['AT-2024-089']
  });

  const handleRecordQrScan = (studentId) => {
    if (!activeQrSession || !activeQrSession.active) {
      return { success: false, message: 'No active QR attendance session found.' };
    }
    if (activeQrSession.scannedStudentIds.includes(studentId)) {
      return { success: false, message: 'Attendance already recorded for this QR session!' };
    }

    // Broadcast scan event to all active sessions via Supabase Realtime
    erpService.broadcastQrScan(studentId, activeQrSession.code);

    setActiveQrSession((prev) => prev ? {
      ...prev,
      scannedStudentIds: [...prev.scannedStudentIds, studentId]
    } : null);

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          return { ...s, attendance: Math.min(100, s.attendance + 2) };
        }
        return s;
      })
    );

    return { success: true, message: 'Attendance verified & recorded for today!' };
  };

  // Authentication Handlers
  const handleRoleLogin = (roleObj) => {
    setUser({ email: roleObj.email || `${roleObj.id}@${websiteConfig.domain}` });
    setUserRole(roleObj.id);
    setActiveTab('overview');
    setIsAuthenticated(true);
  };

  const handleSignOut = async () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setUser(null);
    setActiveTab('overview');
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
  };

  // Action Handlers with Supabase Persistence
  const handleRegisterStudent = async (newStudent) => {
    setStudents((prev) => [newStudent, ...prev]);
    await erpService.addStudent(newStudent);
  };

  const handleAddTransaction = async (newTx) => {
    setTransactions((prev) => [newTx, ...prev]);
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === newTx.studentId) {
          const updatedPaid = s.paidFee + newTx.amount;
          const updatedPending = Math.max(0, s.totalFee - updatedPaid);
          return {
            ...s,
            paidFee: updatedPaid,
            pendingFee: updatedPending,
            status: updatedPending === 0 ? 'Paid' : s.status
          };
        }
        return s;
      })
    );
    setSelectedReceiptTx(newTx);
    await erpService.addTransaction(newTx);
  };

  const handlePublishNotice = async (newNotice) => {
    setNotices((prev) => [newNotice, ...prev]);
    await erpService.addNotice(newNotice);
    erpService.broadcastNotice(newNotice);
  };

  const handleUpdateFacultyStatus = (facultyId, status) => {
    setFaculty((prev) =>
      prev.map((f) => (f.id === facultyId ? { ...f, status } : f))
    );
    erpService.broadcastFacultyStatus(facultyId, status);
  };

  const handleUpdateFacultyDisbursement = async (facultyId, disbursed) => {
    setFaculty((prev) =>
      prev.map((f) => (f.id === facultyId ? { ...f, disbursed } : f))
    );
    await erpService.updateFacultyDisbursement(facultyId, disbursed);
  };

  const handleDisburseAllFaculty = async () => {
    setFaculty((prev) =>
      prev.map((f) => ({ ...f, disbursed: true }))
    );
    const pendingList = faculty.filter((f) => !f.disbursed);
    for (const f of pendingList) {
      await erpService.updateFacultyDisbursement(f.id, true);
    }
  };

  const renderRoleDashboard = () => {
    let dashboard = null;

    switch (userRole) {
      case 'admin':
        dashboard = (
          <AdminDashboard
            students={students}
            transactions={transactions}
            labs={labs}
            faculty={faculty}
            notices={notices}
            weeklySchedule={weeklySchedule}
            setWeeklySchedule={setWeeklySchedule}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onOpenRegister={() => setIsRegisterOpen(true)}
            onOpenCollectFee={() => setIsCollectFeeOpen(true)}
            onOpenPublishNotice={() => setIsPublishNoticeOpen(true)}
            onViewReceipt={(tx) => setSelectedReceiptTx(tx)}
            complaintsAndRequests={complaintsAndRequests}
            onAddComplaintRequest={handleAddComplaintRequest}
            onUpdateComplaintRequest={handleUpdateComplaintRequest}
          />
        );
        break;

      case 'faculty':
        dashboard = (
          <FacultyDashboard
            faculty={faculty}
            students={students}
            labs={labs}
            weeklySchedule={weeklySchedule}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            activeQrSession={activeQrSession}
            setActiveQrSession={setActiveQrSession}
            complaintsAndRequests={complaintsAndRequests}
            onAddComplaintRequest={handleAddComplaintRequest}
            onUpdateComplaintRequest={handleUpdateComplaintRequest}
            onUpdateFacultyStatus={handleUpdateFacultyStatus}
            pcTerminals={pcTerminals}
            pcMessages={pcMessages}
            onSendPcMessage={handleSendPcMessage}
            onUpdatePcTerminal={handleUpdatePcTerminal}
          />
        );
        break;

      case 'student':
        dashboard = (
          <StudentDashboard
            students={students}
            transactions={transactions}
            notices={notices}
            assignments={assignments}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            activeQrSession={activeQrSession}
            onRecordQrScan={handleRecordQrScan}
            complaintsAndRequests={complaintsAndRequests}
            onAddComplaintRequest={handleAddComplaintRequest}
            onUpdateComplaintRequest={handleUpdateComplaintRequest}
            pcTerminals={pcTerminals}
            pcMessages={pcMessages}
            onSendPcMessage={handleSendPcMessage}
            onUpdatePcTerminal={handleUpdatePcTerminal}
          />
        );
        break;

      case 'finance':
        dashboard = (
          <FinanceDashboard
            transactions={transactions}
            students={students}
            faculty={faculty}
            expenses={expenses}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onViewReceipt={(tx) => setSelectedReceiptTx(tx)}
            onOpenCollectFee={() => setIsCollectFeeOpen(true)}
            onUpdateFacultyDisbursement={handleUpdateFacultyDisbursement}
            onDisburseAllFaculty={handleDisburseAllFaculty}
          />
        );
        break;

      default:
        return null;
    }

    return (
      <ErrorBoundary label="Dashboard">
        <Suspense fallback={
          <div className="flex items-center justify-center h-[60vh]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-slate-500 text-sm font-medium">Loading dashboard…</span>
            </div>
          </div>
        }>
          {dashboard}
        </Suspense>
      </ErrorBoundary>
    );
  };

  // If not authenticated, present the Role Login Gateway
  if (!isAuthenticated) {
    return <LoginPage onSelectRoleLogin={handleRoleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans transition-colors duration-200">
      {/* Sidebar - Locked to authenticated role */}
      <Sidebar
        user={user}
        userRole={userRole}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSignOut={handleSignOut}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className={`${isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'} pl-0 flex-1 flex flex-col min-w-0 transition-all duration-300`}>
        <Header
          userRole={userRole}
          onSwitchRole={handleSwitchRole}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenRegister={() => setIsRegisterOpen(true)}
          onOpenCollectFee={() => setIsCollectFeeOpen(true)}
          onOpenPublishNotice={() => setIsPublishNoticeOpen(true)}
          onSignOut={handleSignOut}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          isSidebarCollapsed={isSidebarCollapsed}
          notices={notices}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        <main className="pt-20 px-3 sm:px-6 lg:px-8 pb-12 flex-1 min-h-[calc(100vh-5rem)] min-w-0 overflow-x-hidden">
          {renderRoleDashboard()}
        </main>
      </div>

      {/* Global Modals */}
      <RegisterStudentModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onRegisterStudent={handleRegisterStudent}
      />

      <CollectFeeModal
        isOpen={isCollectFeeOpen}
        onClose={() => setIsCollectFeeOpen(false)}
        students={students}
        onAddTransaction={handleAddTransaction}
      />

      <ReceiptPreviewModal
        isOpen={!!selectedReceiptTx}
        onClose={() => setSelectedReceiptTx(null)}
        transaction={selectedReceiptTx}
      />

      <PublishNoticeModal
        isOpen={isPublishNoticeOpen}
        onClose={() => setIsPublishNoticeOpen(false)}
        onPublishNotice={handlePublishNotice}
      />
    </div>
  );
}
