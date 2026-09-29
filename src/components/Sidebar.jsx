import React from 'react';
import { useSiteConfig } from '../context/SiteConfigContext';
import SiteLogo from './common/SiteLogo';
import { 
  LayoutDashboard,
  Users,
  UserCheck,
  Settings,
  Calendar,
  CheckSquare,
  Code,
  DollarSign,
  User,
  Wallet,
  BookOpen,
  Bell,
  TrendingUp,
  ShieldCheck,
  LogOut,
  Sparkles,
  ChevronRight,
  Monitor,
  BarChart3,
  Award,
  PanelLeftClose,
  PanelLeftOpen,
  MessageSquare,
  X
} from 'lucide-react';

export default function Sidebar({ 
  user,
  userRole, 
  activeTab, 
  setActiveTab, 
  onSignOut,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile
}) {
  const { websiteConfig } = useSiteConfig();
  const roleNavItems = {
    admin: [
      { id: 'overview', label: 'Institutional Overview', icon: LayoutDashboard },
      { id: 'academic-calendar', label: 'Holiday & Academic Calendar', icon: Calendar },
      { id: 'complaints-requests', label: 'Complaints & Requests', icon: MessageSquare },
      { id: 'students-batches', label: 'Student Directory', icon: Users },
      { id: 'schedule-builder', label: 'Faculty Schedule', icon: Calendar },
      { id: 'certificates', label: 'Certificate Generator', icon: Award },
      { id: 'settings', label: 'Settings & Logs', icon: Settings },
    ],
    faculty: [
      { id: 'overview', label: 'Overview & Schedule', icon: LayoutDashboard },
      { id: 'complaints-requests', label: 'Complaints & Requests', icon: MessageSquare },
      { id: 'allocated-pc', label: 'Allocated PCs', icon: Monitor },
      { id: 'batches', label: 'My Batches & Roster', icon: Users },
      { id: 'submissions', label: 'Student Submissions', icon: BookOpen },
      { id: 'attendance-grading', label: 'Attendance & Grading', icon: CheckSquare },
      { id: 'salary', label: 'Salary & Honorarium', icon: DollarSign },
    ],
    student: [
      { id: 'overview', label: 'My Overview', icon: User },
      { id: 'complaints-requests', label: 'Complaints & Requests', icon: MessageSquare },
      { id: 'schedule', label: 'Schedule & Lab Seat', icon: Calendar },
      { id: 'fees-attendance', label: 'Fees & Attendance', icon: Wallet },
      { id: 'materials-assignments', label: 'Assignments', icon: BookOpen },
      { id: 'notices-helpdesk', label: 'Notices & Helpdesk', icon: Bell },
    ],
    finance: [
      { id: 'overview', label: 'Cash Flow & Overview', icon: TrendingUp },
      { id: 'yearly-growth', label: 'Yearly Growth & Analytics', icon: BarChart3 },
      { id: 'student-collections', label: 'Fee Collections', icon: Wallet },
      { id: 'faculty-payroll', label: 'Faculty Payroll', icon: DollarSign },
      { id: 'expense-ledger', label: 'Expense Ledger', icon: ShieldCheck },
    ]
  };

  const roleMetadata = {
    admin: {
      title: 'Administrator',
      badge: 'ADMIN',
      badgeBg: 'bg-blue-600',
      email: `admin@${websiteConfig.domain}`
    },
    faculty: {
      title: 'Faculty Instructor',
      badge: 'FACULTY',
      badgeBg: 'bg-indigo-600',
      email: `faculty.verma@${websiteConfig.domain}`
    },
    student: {
      title: 'Student Portal',
      badge: 'STUDENT',
      badgeBg: 'bg-emerald-600',
      email: `rohan.adhikari@${websiteConfig.domain}`
    },
    finance: {
      title: 'Finance & Accounts',
      badge: 'FINANCE',
      badgeBg: 'bg-teal-600',
      email: `finance.desk@${websiteConfig.domain}`
    }
  };

  const currentRole = roleMetadata[userRole] || roleMetadata.admin;
  const navItems = roleNavItems[userRole] || roleNavItems.admin;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden animate-fadeIn"
        />
      )}

      <aside className={`fixed left-0 top-0 h-full ${
        isCollapsed ? 'lg:w-20' : 'lg:w-64'
      } w-64 bg-white shadow-2xl lg:shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between border-r border-slate-200 transition-all duration-300 ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex flex-col">
          {/* Brand Header & Toggle Button */}
          <div className={`h-16 flex items-center border-b border-slate-100 transition-all ${isCollapsed ? 'px-3 justify-center' : 'px-5 justify-between'}`}>
            <div className="flex items-center gap-3 min-w-0">
              <SiteLogo imageClassName="h-9 w-9 object-cover rounded-xl shadow-md border border-slate-200/50" />
              {!isCollapsed && (
                <div className="flex flex-col leading-tight truncate">
                  <span className="font-bold text-slate-900 tracking-tight text-sm flex items-center gap-1.5 truncate">
                    {websiteConfig.shortName} <Sparkles className="w-3.5 h-3.5 text-blue-600 fill-blue-600 shrink-0" />
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold truncate">{websiteConfig.logo.tag}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={onToggleCollapse}
                title={isCollapsed ? "Expand Sidebar Menu" : "Collapse Sidebar Menu"}
                className="hidden lg:block p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                {isCollapsed ? <PanelLeftOpen className="w-5 h-5 text-blue-600" /> : <PanelLeftClose className="w-5 h-5" />}
              </button>
              {onCloseMobile && (
                <button
                  onClick={onCloseMobile}
                  title="Close Menu"
                  className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Navigation Section */}
          <div className={`py-4 flex flex-col gap-1.5 ${isCollapsed ? 'px-2' : 'px-3'}`}>
            {!isCollapsed && (
              <div className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Navigation Menu
              </div>
            )}

            <nav className="flex flex-col gap-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      if (onCloseMobile) onCloseMobile();
                    }}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isCollapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-2.5'
                    } ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>
                    {!isCollapsed && isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80 shrink-0" />}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* User Profile & Sign Out Footer */}
        <div className={`rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col gap-3 transition-all ${
          isCollapsed ? 'm-2 p-2.5 items-center' : 'm-3 p-4'
        }`}>
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="h-8 w-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
              {currentRole.badge.slice(0, 2)}
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-slate-900 truncate">{currentRole.title}</span>
                </div>
                <span className="text-[10px] text-slate-400 block truncate font-mono">
                  {user?.email || user?.primaryEmailAddress?.emailAddress || currentRole.email}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onSignOut}
            title="Sign Out"
            className={`w-full py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition-colors flex items-center justify-center gap-2 ${
              isCollapsed ? 'px-0' : 'px-3'
            }`}
          >
            <LogOut className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
