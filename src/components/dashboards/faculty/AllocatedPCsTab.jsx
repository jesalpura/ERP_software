import React, { useState } from 'react';
import { 
  Monitor, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  UserCheck, 
  Zap, 
  MessageSquare 
} from 'lucide-react';

export default function AllocatedPCsTab({
  currentFaculty,
  selectedLabId,
  setSelectedLabId,
  labs,
  pcTerminals,
  pcMessages,
  onSendPcMessage,
  onUpdatePcTerminal,
  showToast
}) {
  const [selectedPcNumber, setSelectedPcNumber] = useState(14);
  const [terminalChatInput, setTerminalChatInput] = useState('');
  const [labBroadcastInput, setLabBroadcastInput] = useState('');
  const [isLabBroadcastModalOpen, setIsLabBroadcastModalOpen] = useState(false);

  const activeLabTerminals = pcTerminals.filter((t) => {
    if (!t.labId) return false;
    return t.labId.replace('-', ' ').toLowerCase() === selectedLabId.toLowerCase() || t.labId === selectedLabId;
  });

  const currentSeat = activeLabTerminals.find((t) => t.pcNumber === selectedPcNumber) || activeLabTerminals[0] || null;

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

          <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2">
            <button
              onClick={() => setIsLabBroadcastModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Send className="w-3.5 h-3.5 shrink-0" />
              <span>Broadcast to All PCs</span>
            </button>

            {/* Lab selector — scrollable on mobile to prevent overflow */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto">
              {labs.map((lab) => (
                <button
                  key={lab.id}
                  onClick={() => {
                    setSelectedLabId(lab.id);
                    setSelectedPcNumber(1);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                    selectedLabId === lab.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lab.id}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Legend bar */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
          <span className="font-bold text-slate-700 w-full xs:w-auto">Seat Status Legend:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500 shrink-0"></span>
            <span>Occupied ({activeLabTerminals.filter(s => s.status === 'Occupied').length})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-500 animate-pulse shrink-0"></span>
            <span>✋ Help ({activeLabTerminals.filter(s => s.helpRequested).length})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-200 border border-slate-300 shrink-0"></span>
            <span>Vacant ({activeLabTerminals.filter(s => s.status === 'Vacant').length})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-indigo-600 shrink-0"></span>
            <span>Selected</span>
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
                  <p className="text-[11px] text-slate-500">Sends realtime broadcast alert to all logged-in students</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSendLabBroadcastSubmit} className="flex flex-col gap-4">
              <textarea
                rows={4}
                required
                placeholder="Enter important announcement or instruction for the entire lab..."
                value={labBroadcastInput}
                onChange={(e) => setLabBroadcastInput(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 resize-none"
              />
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsLabBroadcastModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Broadcast</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
