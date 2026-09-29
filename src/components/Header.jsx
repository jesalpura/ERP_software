import React, { useState, useEffect } from 'react';
import { Calendar, Bell, PlusCircle, CreditCard, LogOut, ShieldCheck, Sun, Moon, ChevronDown, User, Zap, Menu } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import SiteLogo from './common/SiteLogo';
import { useSiteConfig } from '../context/SiteConfigContext';

export default function Header({
  userRole,
  searchQuery,
  setSearchQuery,
  onOpenRegister,
  onOpenCollectFee,
  onOpenPublishNotice,
  onSignOut,
  darkMode,
  setDarkMode,
  isSidebarCollapsed,
  notices = [],
  onToggleMobileSidebar
}) {
  const { websiteConfig } = useSiteConfig();
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [readNotices, setReadNotices] = useState(new Set());

  // Automatically light up red dot notification badge when new notices arrive
  useEffect(() => {
    if (notices && notices.length > 0) {
      setHasUnread(true);
    }
  }, [notices.length]);

  const handleMarkAllRead = () => {
    setHasUnread(false);
    setReadNotices(new Set(notices.map(n => n.id)));
  };

  const roleNames = {
    admin: 'Administrator',
    faculty: 'Faculty Instructor',
    student: 'Student',
    finance: 'Finance Officer'
  };

  return (
    <header className={`fixed top-0 left-0 ${isSidebarCollapsed ? 'lg:left-20' : 'lg:left-64'} right-0 h-16 bg-white/95 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-2.5 sm:px-6 lg:px-8 border-b border-slate-200 transition-all duration-300`}>
      {/* Header Left Actions / Mobile Menu Button */}
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
        <button
          onClick={onToggleMobileSidebar}
          title="Open Navigation Menu"
          className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2 lg:hidden min-w-0">
          <SiteLogo imageClassName="h-7 w-7 object-cover rounded-lg shrink-0" />
          <span className="font-extrabold text-xs sm:text-sm text-slate-900 tracking-tight truncate max-w-[80px] xs:max-w-[140px] sm:max-w-none">
            {websiteConfig.shortName}
          </span>
        </div>
      </div>

      {/* Header Right Actions */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">

        {/* Active Role Indicator Badge (Read-Only) */}
        <div 
          title={`Active Portal Role: ${roleNames[userRole] || 'User'}`}
          className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full bg-slate-100 text-slate-800 text-[10px] sm:text-xs font-bold border border-slate-200"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="uppercase text-[9px] sm:text-[11px] truncate max-w-[45px] xs:max-w-[85px] sm:max-w-none">
            {roleNames[userRole] || 'USER'}
          </span>
        </div>

        {/* Quick CTA buttons for Admin/Finance */}
        {(userRole === 'admin' || userRole === 'finance') && (
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={onOpenRegister}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-semibold transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Assign Faculty</span>
            </button>
            <button
              onClick={onOpenCollectFee}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 text-xs font-semibold transition-colors"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Collect Fee</span>
            </button>
          </div>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) setHasUnread(false);
            }}
            title="Campus Notifications & Official Announcements"
            className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            {hasUnread && notices.length > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 ring-2 ring-white"></span>
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 sm:w-88 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs text-slate-900">Official Announcements</span>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-extrabold border border-indigo-200">
                    {notices.length} Live
                  </span>
                </div>
                <button
                  onClick={handleMarkAllRead}
                  className="text-[11px] text-indigo-600 font-bold hover:underline cursor-pointer"
                >
                  Mark all read
                </button>
              </div>

              {/* Published Notices List */}
              <div className="space-y-3 mt-3 max-h-96 overflow-y-auto pr-1">
                {notices.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No active campus notices at this time.
                  </div>
                ) : (
                  notices.map((n) => {
                    const isUrgent = n.priority === 'Urgent' || n.priority === 'High';
                    const isRead = readNotices.has(n.id);
                    
                    return (
                      <div 
                        key={n.id}
                        className={`p-3 rounded-xl border text-xs flex flex-col gap-1 transition-all ${
                          isRead
                            ? 'opacity-50 grayscale bg-slate-50 border-slate-200'
                            : isUrgent
                              ? 'bg-rose-50/60 border-rose-200'
                              : 'bg-slate-50 border-slate-200/80'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                            isUrgent
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {n.category || 'General Notice'}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">{n.date || 'Today'}</span>
                        </div>
                        <h4 className="font-bold text-slate-900 mt-0.5 leading-snug">{n.title}</h4>
                        <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">{n.body}</p>
                        {n.audience && (
                          <span className="text-[9px] font-bold text-slate-400 mt-1 block">
                            Target: {n.audience}
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Admin Publish CTA inside dropdown */}
              {userRole === 'admin' && onOpenPublishNotice && (
                <div className="pt-3 mt-3 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      onOpenPublishNotice();
                    }}
                    className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>+ Publish New Campus Notice</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

        {/* User Account & Sign Out */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 px-2 py-1 sm:px-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
            <div className="h-6 w-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
              {(userRole || 'U').slice(0, 1).toUpperCase()}
            </div>
            <span className="hidden md:inline font-mono text-[11px] text-slate-600">
              {userRole ? userRole.toUpperCase() : 'USER'}
            </span>
          </div>

          <button
            onClick={onSignOut}
            title="Sign Out of Auth"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
