import React, { useState, lazy, Suspense } from 'react';

// Lazy-load views — each chunk only loads when its tab is active
const DashboardView          = lazy(() => import('../views/DashboardView'));
const StudentsBatchesView    = lazy(() => import('../views/StudentsBatchesView'));
const FacultyScheduleView    = lazy(() => import('../views/FacultyScheduleView'));
const CertificateView        = lazy(() => import('../views/CertificateView'));
const SettingsReportsView    = lazy(() => import('../views/SettingsReportsView'));
const ComplaintsRequestsView = lazy(() => import('../views/ComplaintsRequestsView'));
const CalendarView           = lazy(() => import('../views/CalendarView'));
import CalendarLoader         from '../common/CalendarLoader';
import { LayoutDashboard, Users, Calendar, Award, Settings, MessageSquare, Inbox, BellRing, Megaphone } from 'lucide-react';

export default function AdminDashboard({
  students,
  transactions,
  labs,
  faculty,
  notices = [],
  weeklySchedule,
  setWeeklySchedule,
  searchQuery,
  setSearchQuery,
  activeTab: parentActiveTab,
  setActiveTab: parentSetActiveTab,
  onOpenRegister,
  onOpenCollectFee,
  onOpenPublishNotice,
  onViewReceipt,
  complaintsAndRequests = [],
  onAddComplaintRequest,
  onUpdateComplaintRequest
}) {
  const [localActiveTab, setLocalActiveTab] = useState('overview');
  const activeTab = parentActiveTab !== undefined ? parentActiveTab : localActiveTab;
  const setActiveTab = parentSetActiveTab || setLocalActiveTab;

  const pendingCount = complaintsAndRequests.filter(
    (c) => c.status === 'Pending' || c.status === 'Under Review'
  ).length;

  const adminTabs = [
    { id: 'overview', label: 'Institutional Overview', icon: LayoutDashboard },
    { id: 'academic-calendar', label: 'Holiday & Academic Calendar', icon: Calendar },
    { id: 'complaints-requests', label: 'Complaints & Requests Desk', icon: MessageSquare },
    { id: 'students-batches', label: 'Student Directory & Batches', icon: Users },
    { id: 'schedule-builder', label: 'Faculty Schedule', icon: Calendar },
    { id: 'certificates', label: 'Certificate Generator', icon: Award },
    { id: 'settings', label: 'Settings & Audit Logs', icon: Settings },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Role Banner with Action Buttons */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
            AD
          </div>
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white text-base">Administrator Command Center</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Full control over campus admissions, faculty & student communication, and financial ledgers</p>
          </div>
        </div>

        {/* Action Buttons: Publish Notice & Complaints/Requests */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={onOpenPublishNotice}
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white transition-all flex items-center gap-2 shadow-sm shadow-indigo-600/30 cursor-pointer border border-indigo-500/50"
          >
            <Megaphone className="w-4 h-4 text-indigo-200 animate-pulse" />
            <span>Publish Campus Notice</span>
          </button>

          <button
            onClick={() => setActiveTab('complaints-requests')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2.5 shadow-sm cursor-pointer ${
              activeTab === 'complaints-requests'
                ? 'bg-blue-600 text-white shadow-blue-600/30'
                : 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-slate-700 hover:border-blue-400'
            }`}
          >
            <div className="relative">
              <Inbox className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              )}
            </div>
            <span>Complaints & Requests Arrived</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white dark:bg-blue-500 text-[10px] font-extrabold shadow-2xs">
              {complaintsAndRequests.length} Total
            </span>
          </button>
        </div>
      </div>

      {/* Tab Content Rendering — each view is lazy-loaded on first visit */}
      <Suspense fallback={
        <div className="flex items-center justify-center h-[50vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-slate-500 text-sm font-medium">Loading…</span>
          </div>
        </div>
      }>
        <div>
          {activeTab === 'overview' && (
            <DashboardView
              students={students}
              transactions={transactions}
              labs={labs}
              faculty={faculty}
              notices={notices}
              onOpenRegister={onOpenRegister}
              onOpenCollectFee={onOpenCollectFee}
              onOpenPublishNotice={onOpenPublishNotice}
              onViewReceipt={onViewReceipt}
              setActiveView={setActiveTab}
            />
          )}
          {activeTab === 'academic-calendar' && (
            <Suspense fallback={<CalendarLoader />}>
              <CalendarView userRole="admin" />
            </Suspense>
          )}
          {activeTab === 'complaints-requests' && (
            <ComplaintsRequestsView
              complaintsAndRequests={complaintsAndRequests}
              onAddComplaintRequest={onAddComplaintRequest}
              onUpdateComplaintRequest={onUpdateComplaintRequest}
              facultyList={faculty}
              studentList={students}
            />
          )}
          {activeTab === 'students-batches' && (
            <StudentsBatchesView
              students={students}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onOpenRegister={onOpenRegister}
              onOpenCollectFee={onOpenCollectFee}
            />
          )}
          {activeTab === 'schedule-builder' && (
            <FacultyScheduleView
              faculty={faculty}
              labs={labs}
              externalSchedule={weeklySchedule}
              setExternalSchedule={setWeeklySchedule}
            />
          )}
          {activeTab === 'certificates' && (
            <CertificateView students={students} />
          )}
          {activeTab === 'settings' && (
            <SettingsReportsView
              students={students}
              transactions={transactions}
              faculty={faculty}
              labs={labs}
            />
          )}
        </div>
      </Suspense>
    </div>
  );
}

