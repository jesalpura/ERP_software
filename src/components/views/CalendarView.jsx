import React, { useState, useEffect, useMemo } from 'react';
import Holidays from 'date-holidays';
import { Observer, getUpcomingFestivals } from '@ishubhamx/panchangam-js';
import CalendarLoader from '../common/CalendarLoader';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Search, 
  Clock, 
  Check, 
  X, 
  MapPin, 
  Sparkles, 
  Filter
} from 'lucide-react';

const INDIAN_STATES = [
  { code: 'IN', name: 'All India (National Public Holidays)' },
  { code: 'IN-MH', name: 'Maharashtra (MH)' },
  { code: 'IN-KA', name: 'Karnataka (KA)' },
  { code: 'IN-DL', name: 'Delhi NCR (DL)' },
  { code: 'IN-GJ', name: 'Gujarat (GJ)' },
  { code: 'IN-TN', name: 'Tamil Nadu (TN)' },
  { code: 'IN-WB', name: 'West Bengal (WB)' },
  { code: 'IN-UP', name: 'Uttar Pradesh (UP)' },
  { code: 'IN-TS', name: 'Telangana (TS)' }
];

const EVENT_CATEGORIES = [
  { id: 'panchang-festival', label: '🪔 Major Hindu Festival', color: 'bg-amber-500 text-white', border: 'border-amber-200', lightBg: 'bg-amber-50 text-amber-900' },
  { id: 'exam', label: 'Exam & Assessment', color: 'bg-rose-500 text-white', border: 'border-rose-200', lightBg: 'bg-rose-50 text-rose-800' },
  { id: 'academic', label: 'Academic Event / Workshop', color: 'bg-indigo-600 text-white', border: 'border-indigo-200', lightBg: 'bg-indigo-50 text-indigo-800' },
  { id: 'meeting', label: 'Faculty & Admin Meeting', color: 'bg-sky-600 text-white', border: 'border-sky-200', lightBg: 'bg-sky-50 text-sky-800' },
  { id: 'offday', label: 'Class Off-Day / Vacation', color: 'bg-purple-600 text-white', border: 'border-purple-200', lightBg: 'bg-purple-50 text-purple-800' },
  { id: 'custom-holiday', label: 'Custom Institutional Holiday', color: 'bg-emerald-600 text-white', border: 'border-emerald-200', lightBg: 'bg-emerald-50 text-emerald-800' },
  { id: 'personal', label: 'Personal Note', color: 'bg-slate-600 text-white', border: 'border-slate-200', lightBg: 'bg-slate-100 text-slate-800' }
];

const INITIAL_CUSTOM_EVENTS = [
  {
    id: 'evt-101',
    date: '2026-01-15',
    title: 'Makar Sankranti & Pongal Celebration',
    category: 'custom-holiday',
    time: 'All Day',
    description: 'Cultural events and campus holiday observance.',
    userRole: 'admin'
  },
  {
    id: 'evt-102',
    date: '2026-02-18',
    title: 'MERN Stack Mid-Term Practical Exams',
    category: 'exam',
    time: '09:30 AM - 01:30 PM',
    description: 'Mandatory code submission and live demonstration in Computer Labs 1 & 2.',
    userRole: 'faculty'
  },
  {
    id: 'evt-103',
    date: '2026-03-10',
    title: 'Annual Apex Tech Hackathon 2026',
    category: 'academic',
    time: '10:00 AM - 06:00 PM',
    description: '24-hour full-stack web development competition with industry mentors.',
    userRole: 'admin'
  },
  {
    id: 'evt-104',
    date: '2026-04-20',
    title: 'Faculty Quarterly Curriculum Review',
    category: 'meeting',
    time: '02:00 PM - 04:30 PM',
    description: 'Review of AI, DevOps and Full Stack course modules for upcoming semester.',
    userRole: 'faculty'
  }
];

export default function CalendarView({ userRole = 'admin', embedded = false }) {
  const currentDate = new Date();
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth()); // 0-indexed
  const [selectedStateCode, setSelectedStateCode] = useState('IN-MH');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Custom User Events & Notes state (Persisted in localStorage)
  const [customEvents, setCustomEvents] = useState(() => {
    try {
      const saved = localStorage.getItem('erp_academic_calendar_events_v2');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load saved calendar events', e);
    }
    return INITIAL_CUSTOM_EVENTS;
  });

  // Save custom events to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('erp_academic_calendar_events_v2', JSON.stringify(customEvents));
    } catch (e) {
      console.error('Failed to save calendar events', e);
    }
  }, [customEvents]);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  
  // Event Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('academic');
  const [formTime, setFormTime] = useState('10:00 AM - 12:00 PM');
  const [formDescription, setFormDescription] = useState('');
  const [formDate, setFormDate] = useState('');

  // Non-blocking deferred loading state to prevent UI glitches during panchangam calculations
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    setIsInitialLoading(true);
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 60);
    return () => clearTimeout(timer);
  }, [currentYear, selectedStateCode]);

  // 1. Official Public Indian Holidays calculation via date-holidays library
  const indianOfficialHolidays = useMemo(() => {
    if (isInitialLoading) return [];
    try {
      const hd = new Holidays();
      if (selectedStateCode && selectedStateCode.includes('-')) {
        const [country, state] = selectedStateCode.split('-');
        hd.init(country, state);
      } else {
        hd.init('IN');
      }
      
      const holidayList = hd.getHolidays(currentYear) || [];
      
      return holidayList.map((h, idx) => {
        let dateStr = '';
        if (typeof h.date === 'string') {
          dateStr = h.date.split(' ')[0];
        } else if (h.date instanceof Date) {
          dateStr = h.date.toISOString().split('T')[0];
        }
        return {
          id: `in-hol-${currentYear}-${idx}-${h.rule || h.name}`,
          date: dateStr,
          title: h.name,
          type: h.type || 'public',
          isIndianHoliday: true,
          category: 'indian-holiday',
          badge: '🇮🇳 Official Holiday',
          description: h.note || 'Official Public / National Holiday in India'
        };
      });
    } catch (err) {
      console.error('Error fetching date-holidays for India:', err);
      return [];
    }
  }, [currentYear, selectedStateCode, isInitialLoading]);

  // 2. Panchang Major Indian Festivals calculation via @ishubhamx/panchangam-js library
  const panchangFestivals = useMemo(() => {
    if (isInitialLoading) return [];
    try {
      const observer = new Observer(19.0760, 72.8777, 0);
      const startOfYear = new Date(currentYear, 0, 1);
      
      const festivalList = getUpcomingFestivals({
        date: startOfYear,
        observer,
        days: 366,
        categories: ['major']
      }) || [];

      const filtered = festivalList.filter((f) => f.category === 'major');

      return filtered.map((f, idx) => {
        let dateStr = '';
        if (f.date instanceof Date) {
          dateStr = f.date.toISOString().split('T')[0];
        } else if (typeof f.date === 'string') {
          dateStr = f.date.split('T')[0];
        }

        return {
          id: `panchang-fest-${currentYear}-${idx}-${f.name}`,
          date: dateStr,
          title: f.name,
          category: 'panchang-festival',
          isPanchangFestival: true,
          badge: '🪔 Major Festival',
          masa: f.masa,
          paksha: f.paksha,
          description: f.description || `Major Hindu Festival during ${f.masa || ''} ${f.paksha || ''} Paksha.`,
          observances: f.observances || []
        };
      });
    } catch (err) {
      console.error('Error calculating festivals with panchangam-js:', err);
      return [];
    }
  }, [currentYear, isInitialLoading]);

  // Navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
  };

  // Open modal to add event for specific date
  const handleOpenAddModal = (dateString = '') => {
    const targetDate = dateString || `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-15`;
    setEditingEventId(null);
    setFormDate(targetDate);
    setFormTitle('');
    setFormCategory('academic');
    setFormTime('10:00 AM - 12:00 PM');
    setFormDescription('');
    setIsModalOpen(true);
  };

  // Open modal to edit event
  const handleOpenEditModal = (eventObj) => {
    setEditingEventId(eventObj.id);
    setFormDate(eventObj.date);
    setFormTitle(eventObj.title);
    setFormCategory(eventObj.category || 'academic');
    setFormTime(eventObj.time || '10:00 AM - 12:00 PM');
    setFormDescription(eventObj.description || '');
    setIsModalOpen(true);
  };

  // Save event (Create or Edit)
  const handleSaveEvent = (e) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDate) return;

    if (editingEventId) {
      setCustomEvents((prev) =>
        prev.map((evt) =>
          evt.id === editingEventId
            ? {
                ...evt,
                title: formTitle.trim(),
                category: formCategory,
                time: formTime,
                description: formDescription.trim(),
                date: formDate
              }
            : evt
        )
      );
    } else {
      const newEvt = {
        id: `evt-${Date.now()}`,
        title: formTitle.trim(),
        category: formCategory,
        time: formTime,
        description: formDescription.trim(),
        date: formDate,
        userRole: userRole
      };
      setCustomEvents((prev) => [newEvt, ...prev]);
    }

    setIsModalOpen(false);
  };

  // Delete custom event
  const handleDeleteEvent = (id) => {
    setConfirmDeleteId(id);
  };

  const handleConfirmDelete = () => {
    if (confirmDeleteId) {
      setCustomEvents((prev) => prev.filter((e) => e.id !== confirmDeleteId));
      setIsModalOpen(false);
      setConfirmDeleteId(null);
    }
  };

  // Build calendar matrix (Days of the month)
  const monthDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    const daysInMonth = lastDayOfMonth.getDate();
    
    // Day of week index (0 = Mon, ..., 6 = Sun)
    let startingDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startingDayOfWeek === -1) startingDayOfWeek = 6;

    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();

    const days = [];

    // Previous month padding days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const pMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const pYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${pYear}-${String(pMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      days.push({
        dayNumber: dayNum,
        dateString: dateStr,
        isCurrentMonth: false,
        isToday: false
      });
    }

    // Current month days
    const todayStr = new Date().toISOString().split('T')[0];
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        dayNumber: i,
        dateString: dateStr,
        isCurrentMonth: true,
        isToday: dateStr === todayStr
      });
    }

    // Next month padding days to complete grid cells
    const remainingCells = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remainingCells; i++) {
      const nMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${nYear}-${String(nMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        dayNumber: i,
        dateString: dateStr,
        isCurrentMonth: false,
        isToday: false
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Combine Official Indian holidays, Panchang Festivals & Custom Events per Date
  const getEventsForDate = (dateString) => {
    const officialHols = indianOfficialHolidays.filter((h) => h.date === dateString);
    const pFestivals = panchangFestivals.filter((pf) => pf.date === dateString);
    const custom = customEvents.filter((c) => c.date === dateString);

    let all = [
      ...officialHols,
      ...pFestivals,
      ...custom
    ];

    // De-duplicate if an official holiday and panchang festival share exact same name
    const uniqueMap = new Map();
    all.forEach((item) => {
      const key = `${item.date}-${item.title.toLowerCase().trim()}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, item);
      }
    });
    all = Array.from(uniqueMap.values());

    if (selectedCategory !== 'all') {
      if (selectedCategory === 'indian-holiday') {
        all = all.filter((e) => e.isIndianHoliday);
      } else if (selectedCategory === 'panchang-festival') {
        all = all.filter((e) => e.isPanchangFestival);
      } else {
        all = all.filter((e) => e.category === selectedCategory);
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      all = all.filter(
        (e) => e.title.toLowerCase().includes(q) || (e.description && e.description.toLowerCase().includes(q))
      );
    }

    return all;
  };

  // Upcoming items for current month list view
  const upcomingEventsThisMonth = useMemo(() => {
    const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    const hols = indianOfficialHolidays.filter((h) => h.date.startsWith(monthPrefix));
    const pFests = panchangFestivals.filter((pf) => pf.date.startsWith(monthPrefix));
    const evts = customEvents.filter((c) => c.date.startsWith(monthPrefix));

    const combined = [...hols, ...pFests, ...evts];

    // De-duplicate
    const uniqueMap = new Map();
    combined.forEach((item) => {
      const key = `${item.date}-${item.title.toLowerCase().trim()}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, item);
      }
    });
    const result = Array.from(uniqueMap.values());
    result.sort((a, b) => a.date.localeCompare(b.date));
    return result;
  }, [currentYear, currentMonth, indianOfficialHolidays, panchangFestivals, customEvents]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (isInitialLoading) {
    return <CalendarLoader />;
  }

  return (
    <div className={`flex flex-col gap-4 sm:gap-6 font-sans ${embedded ? '' : 'pb-12'}`}>
      {/* Clean Light Header Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-sm font-bold shrink-0">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              Calendar
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500">
              Academic schedule, Indian public holidays, and major Hindu festivals
            </p>
          </div>
        </div>

        {/* Action Controls & Region Selector */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Region / State Picker */}
          <div className="flex items-center gap-2 bg-slate-50 p-2 px-3 rounded-2xl border border-slate-200 text-xs w-full xs:w-auto">
            <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
            <span className="font-bold text-slate-700 text-[11px] shrink-0">Region:</span>
            <select
              value={selectedStateCode}
              onChange={(e) => setSelectedStateCode(e.target.value)}
              className="bg-transparent text-slate-900 font-bold outline-none cursor-pointer w-full xs:w-auto truncate"
            >
              {INDIAN_STATES.map((st) => (
                <option key={st.code} value={st.code} className="bg-white text-slate-900">
                  {st.name}
                </option>
              ))}
            </select>
          </div>

          {/* Add Event Button */}
          <button
            onClick={() => handleOpenAddModal()}
            className="w-full xs:w-auto px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>+ Add Event / Off-Day</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar (Light Theme) */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
        {/* Month Navigation & Today */}
        <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-white text-slate-700 transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="px-2 sm:px-3 py-1 font-extrabold text-xs sm:text-sm text-slate-900 min-w-[110px] sm:min-w-[140px] text-center">
              {monthNames[currentMonth]} {currentYear}
            </div>

            <button
              onClick={handleNextMonth}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-white text-slate-700 transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleToday}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all border border-slate-200 cursor-pointer"
          >
            Today
          </button>
        </div>

        {/* Search & Category Filter Pills */}
        <div className="flex flex-col xs:flex-row items-center gap-2 sm:gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search festivals, holidays & events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full xs:w-auto px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 outline-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="panchang-festival">🪔 Major Hindu Festivals</option>
            <option value="indian-holiday">🇮🇳 Official Public Holidays</option>
            <option value="exam">📕 Exams</option>
            <option value="academic">🎓 Academic Events</option>
            <option value="meeting">👥 Faculty Meetings</option>
            <option value="offday">🌴 Class Off-Days</option>
            <option value="custom-holiday">🏛️ Custom Holidays</option>
            <option value="personal">✍️ Personal Notes</option>
          </select>
        </div>
      </div>

      {/* Main Grid & Sidebar Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* CALENDAR MONTH GRID (3 Cols) */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200 shadow-xs p-3 sm:p-5 flex flex-col gap-3 sm:gap-4 overflow-x-auto">
          <div className="min-w-[300px] sm:min-w-0 flex flex-col gap-3 sm:gap-4">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 text-center border-b border-slate-200 pb-2 sm:pb-3">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                <span
                  key={day}
                  className={`text-[10px] sm:text-xs font-extrabold uppercase tracking-wider ${
                    i >= 5 ? 'text-rose-600' : 'text-slate-500'
                  }`}
                >
                  <span className="hidden sm:inline">{day}</span>
                  <span className="sm:hidden">{day.slice(0, 2)}</span>
                </span>
              ))}
            </div>

            {/* Month Grid Cells */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {monthDays.map((cell, idx) => {
                const dayEvents = getEventsForDate(cell.dateString);
                const hasHoliday = dayEvents.some((e) => e.isIndianHoliday);
                const hasPanchangFest = dayEvents.some((e) => e.isPanchangFestival);
                const isWeekend = (idx % 7 === 5) || (idx % 7 === 6);

                return (
                  <div
                    key={cell.dateString}
                    onClick={() => handleOpenAddModal(cell.dateString)}
                    className={`min-h-[70px] sm:min-h-[105px] p-1 sm:p-2 rounded-xl sm:rounded-2xl border transition-all flex flex-col justify-between cursor-pointer group relative overflow-hidden ${
                      !cell.isCurrentMonth
                        ? 'bg-slate-50/50 border-slate-100 text-slate-400 opacity-60'
                        : cell.isToday
                        ? 'bg-gradient-to-b from-indigo-50 to-blue-50/40 border-indigo-500 shadow-sm ring-2 ring-indigo-500/20'
                        : hasPanchangFest
                        ? 'bg-amber-50/60 border-amber-200 hover:border-amber-400'
                        : hasHoliday
                        ? 'bg-rose-50/50 border-rose-200 hover:border-rose-300'
                        : isWeekend
                        ? 'bg-slate-50/80 border-slate-200/60 hover:border-slate-300'
                        : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-xs'
                    }`}
                  >
                    {/* Day Number Header */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] sm:text-xs font-extrabold h-5 w-5 sm:h-6 sm:w-6 rounded-full flex items-center justify-center ${
                          cell.isToday
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : hasPanchangFest
                            ? 'bg-amber-100 text-amber-900 font-black'
                            : hasHoliday
                            ? 'bg-rose-100 text-rose-800'
                            : cell.isCurrentMonth
                            ? 'text-slate-800'
                            : 'text-slate-400'
                        }`}
                      >
                        {cell.dayNumber}
                      </span>

                      {cell.isToday && (
                        <span className="text-[8px] sm:text-[9px] font-extrabold text-indigo-600 uppercase tracking-widest hidden xs:inline">
                          TODAY
                        </span>
                      )}

                      {/* Quick Add Icon on Hover */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenAddModal(cell.dateString);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md bg-indigo-50 text-indigo-600 transition-opacity cursor-pointer hidden sm:block"
                        title="Add event on this date"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Day Events List Badges */}
                    <div className="flex flex-col gap-0.5 sm:gap-1 mt-0.5 sm:mt-1 overflow-hidden">
                      {dayEvents.slice(0, 2).map((evt) => {
                        if (evt.isPanchangFestival) {
                          return (
                            <div
                              key={evt.id}
                              className="px-1 py-0.5 rounded sm:rounded-md bg-amber-500 text-white text-[8px] sm:text-[10px] font-extrabold truncate flex items-center gap-0.5 sm:gap-1 shadow-2xs"
                              title={`🪔 Major Hindu Festival: ${evt.title}`}
                            >
                              <span className="shrink-0 text-[8px] sm:text-[10px]">🪔</span>
                              <span className="truncate">{evt.title}</span>
                            </div>
                          );
                        }

                        if (evt.isIndianHoliday) {
                          return (
                            <div
                              key={evt.id}
                              className="px-1 py-0.5 rounded sm:rounded-md bg-rose-500 text-white text-[8px] sm:text-[10px] font-bold truncate flex items-center gap-0.5 sm:gap-1 shadow-2xs"
                              title={`🇮🇳 ${evt.title} (${evt.type})`}
                            >
                              <span className="shrink-0 text-[8px] sm:text-[10px]">🇮🇳</span>
                              <span className="truncate">{evt.title}</span>
                            </div>
                          );
                        }

                        const catConfig = EVENT_CATEGORIES.find((c) => c.id === evt.category) || EVENT_CATEGORIES[2];
                        return (
                          <div
                            key={evt.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditModal(evt);
                            }}
                            className={`px-1 py-0.5 rounded sm:rounded-md text-[8px] sm:text-[10px] font-bold truncate flex items-center gap-0.5 sm:gap-1 cursor-pointer transition-transform hover:scale-102 ${catConfig.color}`}
                            title={`${evt.title} (${evt.time})`}
                          >
                            <span className="truncate">{evt.title}</span>
                          </div>
                        );
                      })}

                      {dayEvents.length > 2 && (
                        <span className="text-[8px] sm:text-[9px] font-bold text-slate-500 px-0.5">
                          +{dayEvents.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* SIDEBAR: UPCOMING FESTIVALS & HOLIDAYS (1 Col) */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Quick Category Legend Card */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col gap-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-indigo-600" /> Event Legend
            </h3>

            <div className="flex flex-col gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0"></span>
                <span className="font-bold text-slate-800">🪔 Major Hindu Festival</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0"></span>
                <span className="font-bold text-slate-800">🇮🇳 Public Holiday</span>
              </div>
              {EVENT_CATEGORIES.slice(1).map((cat) => (
                <div key={cat.id} className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${cat.color.split(' ')[0]} shrink-0`}></span>
                  <span className="text-slate-600 font-medium">{cat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Panchang Festivals & Holidays */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Month Highlights</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-extrabold">
                {upcomingEventsThisMonth.length} Listed
              </span>
            </div>

            <div className="flex flex-col gap-3 max-h-[480px] overflow-y-auto pr-1">
              {upcomingEventsThisMonth.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No festivals or custom events scheduled for {monthNames[currentMonth]}.
                </div>
              ) : (
                upcomingEventsThisMonth.map((item) => {
                  const isPanchang = item.isPanchangFestival;
                  const isIndian = item.isIndianHoliday;
                  
                  const catConfig = isPanchang
                    ? { lightBg: 'bg-amber-50 text-amber-900', border: 'border-amber-200' }
                    : isIndian
                    ? { lightBg: 'bg-rose-50 text-rose-800', border: 'border-rose-200' }
                    : EVENT_CATEGORIES.find((c) => c.id === item.category) || EVENT_CATEGORIES[2];

                  return (
                    <div
                      key={item.id}
                      onClick={() => (!isIndian && !isPanchang) && handleOpenEditModal(item)}
                      className={`p-3 rounded-2xl border transition-all ${catConfig.lightBg} ${catConfig.border} ${
                        (!isIndian && !isPanchang) ? 'cursor-pointer hover:shadow-xs' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider font-mono">
                          {item.date}
                        </span>
                        {isPanchang ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-black uppercase">
                            🪔 VEDIC FESTIVAL
                          </span>
                        ) : isIndian ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-extrabold uppercase">
                            OFFICIAL HOLIDAY
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" /> {item.time || 'All Day'}
                          </span>
                        )}
                      </div>

                      <h4 className="font-extrabold text-xs mt-1.5 text-slate-900">
                        {isPanchang ? `🪔 ${item.title}` : isIndian ? `🇮🇳 ${item.title}` : item.title}
                      </h4>

                      {item.description && (
                        <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* EVENT ADD / EDIT USER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 flex flex-col gap-5 text-slate-900 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[11px] font-bold uppercase border border-indigo-200">
                  User Calendar Editor
                </span>
                <span className="text-xs text-slate-400 font-mono">Role: {userRole.toUpperCase()}</span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mt-2">
                {editingEventId ? 'Edit Calendar Event' : 'Add New Event / Class Off-Day'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Customize institution events, exam schedules, or personal calendar notes.
              </p>
            </div>

            <form onSubmit={handleSaveEvent} className="flex flex-col gap-4 text-xs">
              {/* Event Title */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-700">Event Title / Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MERN Mid-Term Exam, Staff Meeting, Special Off-Day"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900"
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-700">Target Date *</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-slate-700">Timing / Hours</label>
                  <input
                    type="text"
                    placeholder="e.g. 10:00 AM - 01:00 PM or All Day"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900"
                  />
                </div>
              </div>

              {/* Category Select */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-700">Category Tag</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900"
                >
                  {EVENT_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-slate-700">Description / Notes</label>
                <textarea
                  rows={3}
                  placeholder="Optional details, classroom instructions, or agenda notes..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900"
                ></textarea>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-between gap-3 mt-2 pt-3 border-t border-slate-200">
                {editingEventId ? (
                  confirmDeleteId === editingEventId ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-rose-600">Remove this event?</span>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmDelete}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors cursor-pointer"
                      >
                        Yes, Delete
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleDeleteEvent(editingEventId)}
                      className="px-4 py-2.5 rounded-xl bg-rose-50 text-rose-600 font-bold hover:bg-rose-100 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  )
                ) : (
                  <div></div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold shadow-md flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>{editingEventId ? 'Update Event' : 'Save to Calendar'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
