import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Filter, 
  Search, 
  User, 
  GraduationCap, 
  ShieldCheck, 
  PlusCircle, 
  X, 
  Check, 
  HelpCircle,
  Inbox,
  ArrowRight,
  Sparkles,
  ChevronRight,
  CornerDownRight
} from 'lucide-react';

export default function ComplaintsRequestsView({
  userRole = 'admin',
  currentUser = null,
  complaintsAndRequests = [],
  onAddComplaintRequest,
  onUpdateComplaintRequest,
  facultyList = [],
  studentList = []
}) {
  const [filterSender, setFilterSender] = useState('All'); // 'All' | 'Faculty' | 'Student'
  const [filterType, setFilterType] = useState('All'); // 'All' | 'Complaint' | 'Request'
  const [filterStatus, setFilterStatus] = useState('All'); // 'All' | 'Pending' | 'Resolved'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState(
    complaintsAndRequests && complaintsAndRequests.length > 0 ? complaintsAndRequests[0].id : null
  );

  // Reply Input State
  const [replyText, setReplyText] = useState('');

  // New Direct Communication Modal State
  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);
  const [composeRecipientType, setComposeRecipientType] = useState('Student'); // 'Student' | 'Faculty'
  const [composeRecipientId, setComposeRecipientId] = useState('');
  const [composeType, setComposeType] = useState('Request'); // 'Request' | 'Complaint'
  const [composeCategory, setComposeCategory] = useState('Academic / Technical Query');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeMessage, setComposeMessage] = useState('');

  // Role-Aware Filtering Logic
  const roleFilteredTickets = (complaintsAndRequests || []).filter((item) => {
    if (userRole === 'faculty') {
      if (currentUser && currentUser.id) {
        return item.senderType === 'Faculty' && (item.senderId === currentUser.id || item.senderName === currentUser.name);
      }
      return item.senderType === 'Faculty';
    }
    if (userRole === 'student') {
      if (currentUser && currentUser.id) {
        return item.senderType === 'Student' && (item.senderId === currentUser.id || item.senderName === currentUser.name);
      }
      return item.senderType === 'Student';
    }
    // Admin sees all
    return true;
  });

  const filteredTickets = roleFilteredTickets.filter((item) => {
    const matchesSender = filterSender === 'All' || item.senderType === filterSender;
    const matchesType = filterType === 'All' || item.type === filterType;
    const matchesStatus = 
      filterStatus === 'All' ? true :
      filterStatus === 'Pending' ? (item.status === 'Pending' || item.status === 'Under Review') :
      (item.status === 'Resolved' || item.status === 'Approved');
    
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      item.subject.toLowerCase().includes(query) ||
      item.senderName.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.id.toLowerCase().includes(query);

    return matchesSender && matchesType && matchesStatus && matchesSearch;
  });

  const selectedTicket = (complaintsAndRequests || []).find((t) => t.id === selectedTicketId) || filteredTickets[0];

  // Stats Counters
  const totalCount = roleFilteredTickets.length;
  const facultyCount = roleFilteredTickets.filter((t) => t.senderType === 'Faculty').length;
  const studentCount = roleFilteredTickets.filter((t) => t.senderType === 'Student').length;
  const pendingCount = roleFilteredTickets.filter((t) => t.status === 'Pending' || t.status === 'Under Review').length;

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    let senderName = 'Admin Desk';
    let senderRoleTitle = 'Administrator';

    if (userRole === 'faculty') {
      senderName = currentUser?.name || 'Faculty Instructor';
      senderRoleTitle = 'Faculty';
    } else if (userRole === 'student') {
      senderName = currentUser?.name || 'Student';
      senderRoleTitle = 'Student';
    }

    const newReply = {
      id: `REP-${Date.now()}`,
      sender: senderName,
      senderRole: senderRoleTitle,
      text: replyText.trim(),
      timestamp: 'Just now'
    };

    const updatedTicket = {
      ...selectedTicket,
      status: (userRole === 'admin' && selectedTicket.status === 'Pending') ? 'Under Review' : selectedTicket.status,
      replies: [...(selectedTicket.replies || []), newReply]
    };

    onUpdateComplaintRequest(updatedTicket);
    setReplyText('');
  };

  const handleStatusChange = (newStatus) => {
    if (!selectedTicket) return;
    const updatedTicket = {
      ...selectedTicket,
      status: newStatus
    };
    onUpdateComplaintRequest(updatedTicket);
  };

  const handleComposeSubmit = (e) => {
    e.preventDefault();
    if (!composeSubject.trim() || !composeMessage.trim()) return;

    let senderTypeVal = 'Student';
    let senderIdVal = currentUser?.id || 'AT-2024-089';
    let senderNameVal = currentUser?.name || 'Student';
    let senderRoleVal = currentUser?.course || 'Student';
    let senderAvatarVal = currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';

    if (userRole === 'admin') {
      senderTypeVal = composeRecipientType;
      let targetPerson = null;
      if (composeRecipientType === 'Faculty') {
        targetPerson = facultyList.find((f) => f.id === composeRecipientId) || facultyList[0] || { id: 'FAC-001', name: 'Faculty Instructor', role: 'Faculty', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' };
      } else {
        targetPerson = studentList.find((s) => s.id === composeRecipientId) || studentList[0] || { id: 'AT-2024-089', name: 'Student', course: 'Full Stack', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' };
      }
      senderIdVal = targetPerson.id;
      senderNameVal = targetPerson.name;
      senderRoleVal = composeRecipientType === 'Faculty' ? (targetPerson.role || 'Faculty Instructor') : (targetPerson.course || 'Student');
      senderAvatarVal = targetPerson.avatar;
    } else if (userRole === 'faculty') {
      senderTypeVal = 'Faculty';
      senderIdVal = currentUser?.id || 'FAC-001';
      senderNameVal = currentUser?.name || 'Amit Verma';
      senderRoleVal = currentUser?.role || 'Lead Full Stack Instructor';
      senderAvatarVal = currentUser?.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150';
    }

    const newTicket = {
      id: `${composeType === 'Complaint' ? 'CMP' : 'REQ'}-2024-${Math.floor(100 + Math.random() * 900)}`,
      senderType: senderTypeVal,
      senderId: senderIdVal,
      senderName: senderNameVal,
      senderRole: senderRoleVal,
      senderAvatar: senderAvatarVal,
      type: composeType,
      category: composeCategory,
      subject: composeSubject.trim(),
      message: composeMessage.trim(),
      status: 'Pending',
      createdAt: 'Just now',
      replies: userRole === 'admin' ? [
        {
          id: `REP-INIT-${Date.now()}`,
          sender: 'Admin Desk',
          senderRole: 'Administrator',
          text: 'Official notice & request issued from Admin Desk.',
          timestamp: 'Just now'
        }
      ] : []
    };

    onAddComplaintRequest(newTicket);
    setSelectedTicketId(newTicket.id);
    setIsComposeModalOpen(false);
    setComposeSubject('');
    setComposeMessage('');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200 flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>;
      case 'Under Review':
        return <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200 flex items-center gap-1"><HelpCircle className="w-3 h-3" /> Under Review</span>;
      case 'In Progress':
        return <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200 flex items-center gap-1"><Sparkles className="w-3 h-3" /> In Progress</span>;
      case 'Approved':
      case 'Resolved':
        return <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Resolved</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">{status}</span>;
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Top Banner & KPI Stat Cards - Light Theme */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-white p-6 rounded-3xl text-slate-900 shadow-sm border border-blue-100">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-blue-600/20 shrink-0">
            <Inbox className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-lg text-slate-900 tracking-tight">Complaints & Requests Arrived Desk</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-extrabold border border-blue-200/80">
                ⚡ REALTIME HUB
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Direct two-way communication channel between Admin Command Center, Faculty, and Students
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsComposeModalOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Direct Communication</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Inbox className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-semibold block uppercase">Total Arrived</span>
            <span className="text-lg font-black text-slate-900">{totalCount}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-semibold block uppercase">From Faculty</span>
            <span className="text-lg font-black text-slate-900">{facultyCount}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-semibold block uppercase">From Students</span>
            <span className="text-lg font-black text-slate-900">{studentCount}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-semibold block uppercase">Pending Action</span>
            <span className="text-lg font-black text-slate-900">{pendingCount}</span>
          </div>
        </div>
      </div>

      {/* Main Layout: Left Inbox List, Right Live Communication Thread */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Arrived Requests & Complaints List (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
          {/* Search & Filter Header */}
          <div className="flex flex-col gap-3 pb-3 border-b border-slate-100">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search arrived complaints & requests..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Quick Filter Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              {/* Sender Filter */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
                <button
                  onClick={() => setFilterSender('All')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${filterSender === 'All' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  All ({totalCount})
                </button>
                <button
                  onClick={() => setFilterSender('Faculty')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${filterSender === 'Faculty' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Faculty
                </button>
                <button
                  onClick={() => setFilterSender('Student')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${filterSender === 'Student' ? 'bg-white text-emerald-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Student
                </button>
              </div>

              {/* Type Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-2 py-1 rounded-xl bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-700 focus:outline-none"
              >
                <option value="All">All Types</option>
                <option value="Complaint">Complaints</option>
                <option value="Request">Requests</option>
              </select>
            </div>
          </div>

          {/* List of Cards */}
          <div className="flex flex-col gap-2.5 max-h-[550px] overflow-y-auto pr-1">
            {filteredTickets.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <Inbox className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <span>No arrived complaints or requests match your filter.</span>
              </div>
            ) : (
              filteredTickets.map((item) => {
                const isSelected = selectedTicket && selectedTicket.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedTicketId(item.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-500/50 shadow-xs'
                        : 'bg-slate-50/60 border-slate-200/80 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <img
                          src={item.senderAvatar}
                          alt={item.senderName}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-slate-900">{item.senderName}</span>
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                              item.senderType === 'Faculty' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              {item.senderType}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block">{item.createdAt}</span>
                        </div>
                      </div>
                      {getStatusBadge(item.status)}
                    </div>

                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        item.type === 'Complaint' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {item.type}
                      </span>
                      <span className="text-[10px] font-medium text-slate-500 truncate">{item.category}</span>
                    </div>

                    <h4 className="font-bold text-xs text-slate-800 line-clamp-1">
                      {item.subject}
                    </h4>

                    <p className="text-[11px] text-slate-600 line-clamp-2 mt-1">
                      {item.message}
                    </p>

                    {item.replies && item.replies.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-blue-600 font-semibold">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" /> {item.replies.length} {item.replies.length === 1 ? 'Reply' : 'Replies'}
                        </span>
                        <span>Latest: {item.replies[item.replies.length - 1].sender}</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Active Communication Thread & Response Desk (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs min-h-[550px] flex flex-col justify-between">
          {selectedTicket ? (
            <div className="flex flex-col h-full justify-between gap-6">
              {/* Thread Header */}
              <div className="pb-4 border-b border-slate-100 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedTicket.senderAvatar}
                      alt={selectedTicket.senderName}
                      className="w-10 h-10 rounded-2xl object-cover border-2 border-blue-500/30"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-sm text-slate-900">
                          {selectedTicket.senderName}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          selectedTicket.senderType === 'Faculty' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {selectedTicket.senderType}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        {selectedTicket.senderRole} &bull; ID: {selectedTicket.senderId}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[11px] text-slate-400 font-medium">{selectedTicket.createdAt}</span>
                    {getStatusBadge(selectedTicket.status)}
                  </div>
                </div>

                {/* Ticket Subject & Category */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      selectedTicket.type === 'Complaint' ? 'bg-rose-600 text-white' : 'bg-blue-600 text-white'
                    }`}>
                      {selectedTicket.type}
                    </span>
                    <span className="text-xs font-semibold text-slate-600">
                      Category: {selectedTicket.category}
                    </span>
                    <span className="text-xs text-slate-400 ml-auto font-mono">#{selectedTicket.id}</span>
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900 mt-1">
                    {selectedTicket.subject}
                  </h3>
                </div>

                {/* Quick Status Action Controls for Admin */}
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Update Status:</span>
                  {['Under Review', 'In Progress', 'Resolved'].map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(st)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedTicket.status === st
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message & Communication Log */}
              <div className="flex-1 flex flex-col gap-4 overflow-y-auto max-h-[320px] pr-2">
                {/* Original Message from Faculty/Student */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                    <span className="flex items-center gap-1.5 text-slate-800 font-bold">
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      Original Submission from {selectedTicket.senderName}
                    </span>
                    <span>{selectedTicket.createdAt}</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-normal">
                    {selectedTicket.message}
                  </p>
                </div>

                {/* Replies Thread */}
                {selectedTicket.replies && selectedTicket.replies.length > 0 ? (
                  selectedTicket.replies.map((rep) => {
                    const isAdmin = rep.sender === 'Admin Desk' || rep.senderRole === 'Administrator';
                    return (
                      <div
                        key={rep.id}
                        className={`p-4 rounded-2xl border flex flex-col gap-1.5 ${
                          isAdmin
                            ? 'bg-blue-50/80 border-blue-200 ml-4'
                            : 'bg-slate-50 border-slate-200 mr-4'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-extrabold text-blue-700 flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                            {rep.sender} ({rep.senderRole})
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">{rep.timestamp}</span>
                        </div>
                        <p className="text-xs text-slate-800 leading-relaxed">
                          {rep.text}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-3 text-center text-xs text-slate-400 italic">
                    No replies sent yet. Type a response below to initiate two-way communication.
                  </div>
                )}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <textarea
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Type official response to ${selectedTicket.senderName}...`}
                    className="flex-1 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-medium"
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim()}
                    className="h-14 px-5 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md shrink-0 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Reply</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 py-16">
              <Inbox className="w-12 h-12 mb-3 text-slate-300" />
              <p className="text-sm font-bold text-slate-600">Select an Arrived Complaint or Request</p>
              <p className="text-xs text-slate-400">Click any item from the left inbox list to open communication thread</p>
            </div>
          )}
        </div>
      </div>

      {/* Compose New Direct Communication Modal */}
      {isComposeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Compose Direct Communication</h3>
                  <p className="text-[11px] text-slate-500">Send an official request, notice, or message directly to Faculty or Student</p>
                </div>
              </div>
              <button
                onClick={() => setIsComposeModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleComposeSubmit} className="flex flex-col gap-4">
              {/* Recipient Role Picker */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setComposeRecipientType('Faculty')}
                  className={`p-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    composeRecipientType === 'Faculty'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-600'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Send to Faculty</span>
                </button>
                <button
                  type="button"
                  onClick={() => setComposeRecipientType('Student')}
                  className={`p-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    composeRecipientType === 'Student'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-600'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Send to Student</span>
                </button>
              </div>

              {/* Specific Person Selection */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Select Specific {composeRecipientType}:
                </label>
                <select
                  value={composeRecipientId}
                  onChange={(e) => setComposeRecipientId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800"
                >
                  {composeRecipientType === 'Faculty' ? (
                    facultyList.map((f) => (
                      <option key={f.id} value={f.id}>{f.name} ({f.subject})</option>
                    ))
                  ) : (
                    studentList.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} - Roll #{s.id} ({s.course})</option>
                    ))
                  )}
                </select>
              </div>

              {/* Type & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Communication Type</label>
                  <select
                    value={composeType}
                    onChange={(e) => setComposeType(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800"
                  >
                    <option value="Request">Official Request</option>
                    <option value="Complaint">Complaint / Notice</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Category</label>
                  <input
                    type="text"
                    value={composeCategory}
                    onChange={(e) => setComposeCategory(e.target.value)}
                    placeholder="e.g. Academic, Lab Dues"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Subject Title</label>
                <input
                  type="text"
                  required
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder="e.g. Schedule Update & Practical Exam Directive"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                />
              </div>

              {/* Detailed Message */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Detailed Communication Message</label>
                <textarea
                  rows={4}
                  required
                  value={composeMessage}
                  onChange={(e) => setComposeMessage(e.target.value)}
                  placeholder="Enter detailed instructions, request notes, or complaint resolution directive..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsComposeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Communication</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
