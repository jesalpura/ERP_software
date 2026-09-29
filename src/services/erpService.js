import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { 
  initialStudents, 
  initialTransactions, 
  initialLabs, 
  initialFaculty, 
  initialExpenses, 
  initialNotices, 
  initialAssignments,
  initialPcTerminals,
  initialPcMessages
} from '../data/mockData';

// Helper to format snake_case DB student to camelCase React format
const formatStudent = (s) => ({
  id: s.id,
  name: s.name,
  avatar: s.avatar,
  course: s.course,
  batch: s.batch,
  lab: s.lab,
  totalFee: Number(s.total_fee || s.totalFee || 0),
  paidFee: Number(s.paid_fee || s.paidFee || 0),
  pendingFee: Number(s.pending_fee || s.pendingFee || 0),
  status: s.status,
  attendance: Number(s.attendance || 0),
  phone: s.phone,
  email: s.email,
  joinedDate: s.joined_date || s.joinedDate,
  gpa: s.gpa,
  projectStatus: s.project_status || s.projectStatus
});

// Helper to format snake_case DB transaction to camelCase React format
const formatTransaction = (t) => ({
  id: t.id,
  studentId: t.student_id || t.studentId,
  studentName: t.student_name || t.studentName,
  avatar: t.avatar,
  course: t.course,
  mode: t.mode,
  amount: Number(t.amount || 0),
  timestamp: t.timestamp,
  status: t.status,
  installment: t.installment,
  remarks: t.remarks
});

// Helper to format snake_case DB lab
const formatLab = (l) => ({
  id: l.id,
  name: l.name,
  faculty: l.faculty,
  timing: l.timing,
  capacity: l.capacity,
  occupied: l.occupied,
  occupancyPct: l.occupancy_pct || l.occupancyPct,
  status: l.status,
  statusColor: l.status_color || l.statusColor,
  barColor: l.bar_color || l.barColor
});

// Helper to format snake_case DB faculty
const formatFaculty = (f) => ({
  id: f.id,
  name: f.name,
  role: f.role,
  subject: f.subject,
  punchTime: f.punch_time || f.punchTime,
  status: f.status,
  salary: Number(f.salary || 0),
  honorarium: Number(f.honorarium || 0),
  disbursed: Boolean(f.disbursed),
  avatar: f.avatar,
  assignedBatches: f.assigned_batches || f.assignedBatches || [],
  prReviewsCount: f.pr_reviews_count || f.prReviewsCount || 0
});

// Universal Multi-Device & Multi-Browser Realtime Engine
class UniversalRealtimeEngine {
  constructor() {
    this.listeners = new Set();
    this.ws = null;
    this.supabaseChannel = null;
    this.bc = typeof window !== 'undefined' && 'BroadcastChannel' in window
      ? new BroadcastChannel('tcit_erp_universal_channel_v3')
      : null;

    if (this.bc) {
      this.bc.onmessage = (event) => {
        if (event.data?.type && event.data?.payload !== undefined) {
          this.notifyListeners(event.data.type, event.data.payload);
        }
      };
    }

    this.initWebSocketRelay();
    this.initSupabaseRealtime();
  }

  initWebSocketRelay() {
    if (typeof window === 'undefined') return;
    try {
      // Free, zero-config WebSocket relay for cross-device multi-browser sync
      const ws = new WebSocket('wss://socketsbay.com/wss/v2/1/demo/');
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg && msg.tcit_event && msg.tcit_payload !== undefined) {
            this.notifyListeners(msg.tcit_event, msg.tcit_payload);
          }
        } catch (e) {}
      };
      ws.onclose = () => {
        setTimeout(() => this.initWebSocketRelay(), 3500);
      };
      ws.onerror = () => {};
      this.ws = ws;
    } catch (e) {}
  }

  initSupabaseRealtime() {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      this.supabaseChannel = supabase.channel('tcit_erp_global_realtime_v3', {
        config: { broadcast: { self: true } }
      });

      this.supabaseChannel.on('broadcast', { event: '*' }, ({ event, payload }) => {
        if (event && payload !== undefined) {
          this.notifyListeners(event, payload);
        }
      });

      this.supabaseChannel.subscribe();
    } catch (err) {
      console.warn('Supabase realtime init error:', err);
    }
  }

  broadcast(eventType, payload) {
    // 1. Dispatch locally in current window
    this.notifyListeners(eventType, payload);

    // 2. Dispatch via BroadcastChannel (same machine tabs)
    if (this.bc) {
      try {
        this.bc.postMessage({ type: eventType, payload });
      } catch (e) {}
    }

    // 3. Dispatch via Persistent Supabase Realtime Channel (cross-device websockets)
    if (this.supabaseChannel) {
      try {
        this.supabaseChannel.send({
          type: 'broadcast',
          event: eventType,
          payload
        });
      } catch (e) {}
    }

    // 4. Dispatch via Public WebSocket Relay (cross-device fallback websockets)
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify({ tcit_event: eventType, tcit_payload: payload }));
      } catch (e) {}
    }
  }

  notifyListeners(eventType, payload) {
    this.listeners.forEach((callback) => {
      try {
        callback(eventType, payload);
      } catch (e) {}
    });
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }
}

export const realtimeEngine = new UniversalRealtimeEngine();

export const erpService = {
  // 1. STUDENTS
  async getStudents() {
    if (!isSupabaseConfigured) return initialStudents;
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        console.warn('Supabase students fetch returned empty/error, using initial mock fallback:', error?.message);
        return initialStudents;
      }
      return data.map(formatStudent);
    } catch (err) {
      console.error('Students fetch error:', err);
      return initialStudents;
    }
  },

  async addStudent(student) {
    if (!isSupabaseConfigured) return student;
    try {
      const dbPayload = {
        id: student.id,
        name: student.name,
        avatar: student.avatar,
        course: student.course,
        batch: student.batch,
        lab: student.lab,
        total_fee: student.totalFee,
        paid_fee: student.paidFee,
        pending_fee: student.pendingFee,
        status: student.status,
        attendance: student.attendance,
        phone: student.phone,
        email: student.email,
        joined_date: student.joinedDate,
        gpa: student.gpa,
        project_status: student.projectStatus
      };

      const { data, error } = await supabase
        .from('students')
        .insert([dbPayload])
        .select();

      if (error) {
        console.error('Error inserting student to Supabase:', error);
        throw error;
      }
      return data && data[0] ? formatStudent(data[0]) : student;
    } catch (err) {
      console.error('Failed to add student to Supabase:', err);
      return student;
    }
  },

  broadcastStudentCreated(newStudent) {
    realtimeEngine.broadcast('student-created', newStudent);
  },

  subscribeToStudentCreated(onStudentCreated) {
    return realtimeEngine.subscribe((event, payload) => {
      if (event === 'student-created' && onStudentCreated) onStudentCreated(payload);
    });
  },

  // Update student's lab/batch/faculty assignment (admin action)
  async updateStudentAssignment(studentId, { lab, batch }) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('students')
          .update({ lab, batch })
          .eq('id', studentId);
        if (error) console.error('Error updating student assignment:', error);
      } catch (err) {
        console.error('updateStudentAssignment failed:', err);
      }
    }
    realtimeEngine.broadcast('student-assignment-updated', { studentId, lab, batch });
  },

  subscribeToStudentAssignmentUpdated(onUpdated) {
    return realtimeEngine.subscribe((event, payload) => {
      if (event === 'student-assignment-updated' && onUpdated) onUpdated(payload);
    });
  },

  broadcastFacultyCreated(newFaculty) {
    realtimeEngine.broadcast('faculty-created', newFaculty);
  },

  subscribeToFacultyCreated(onFacultyCreated) {
    return realtimeEngine.subscribe((event, payload) => {
      if (event === 'faculty-created' && onFacultyCreated) onFacultyCreated(payload);
    });
  },

  // 2. TRANSACTIONS
  async getTransactions() {
    if (!isSupabaseConfigured) return initialTransactions;
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return initialTransactions;
      }
      return data.map(formatTransaction);
    } catch (err) {
      console.error('Transactions fetch error:', err);
      return initialTransactions;
    }
  },

  async addTransaction(tx) {
    if (!isSupabaseConfigured) return tx;
    try {
      const dbPayload = {
        id: tx.id,
        student_id: tx.studentId,
        student_name: tx.studentName,
        avatar: tx.avatar,
        course: tx.course,
        mode: tx.mode,
        amount: tx.amount,
        timestamp: tx.timestamp,
        status: tx.status,
        installment: tx.installment,
        remarks: tx.remarks
      };

      const { data, error } = await supabase
        .from('transactions')
        .insert([dbPayload])
        .select();

      if (error) {
        console.error('Error inserting transaction to Supabase:', error);
      }

      // Also update student's fee paid & pending in Supabase
      const { data: studentData } = await supabase
        .from('students')
        .select('*')
        .eq('id', tx.studentId)
        .single();

      if (studentData) {
        const updatedPaid = Number(studentData.paid_fee || 0) + Number(tx.amount);
        const updatedPending = Math.max(0, Number(studentData.total_fee || 0) - updatedPaid);
        await supabase
          .from('students')
          .update({
            paid_fee: updatedPaid,
            pending_fee: updatedPending,
            status: updatedPending === 0 ? 'Paid' : studentData.status
          })
          .eq('id', tx.studentId);
      }

      return data && data[0] ? formatTransaction(data[0]) : tx;
    } catch (err) {
      console.error('Failed to add transaction to Supabase:', err);
      return tx;
    }
  },

  // 3. LABS
  async getLabs() {
    if (!isSupabaseConfigured) return initialLabs;
    try {
      const { data, error } = await supabase.from('labs').select('*');
      if (error || !data || data.length === 0) return initialLabs;
      return data.map(formatLab);
    } catch {
      return initialLabs;
    }
  },

  // 4. FACULTY
  async getFaculty() {
    if (!isSupabaseConfigured) return initialFaculty;
    try {
      const { data, error } = await supabase.from('faculty').select('*');
      if (error || !data || data.length === 0) return initialFaculty;
      return data.map(formatFaculty);
    } catch {
      return initialFaculty;
    }
  },

  // 5. EXPENSES
  async getExpenses() {
    if (!isSupabaseConfigured) return initialExpenses;
    try {
      const { data, error } = await supabase.from('expenses').select('*');
      if (error || !data || data.length === 0) return initialExpenses;
      return data;
    } catch {
      return initialExpenses;
    }
  },

  // 6. NOTICES
  async getNotices() {
    if (!isSupabaseConfigured) return initialNotices;
    try {
      const { data, error } = await supabase.from('notices').select('*').order('created_at', { ascending: false });
      if (error || !data || data.length === 0) return initialNotices;
      return data;
    } catch {
      return initialNotices;
    }
  },

  async addNotice(notice) {
    if (!isSupabaseConfigured) return notice;
    try {
      const dbPayload = {
        id: notice.id,
        title: notice.title,
        category: notice.category,
        priority: notice.priority,
        audience: notice.audience,
        body: notice.body,
        date: notice.date
      };
      const { data, error } = await supabase.from('notices').insert([dbPayload]).select();
      if (error) {
        console.error('Error inserting notice to Supabase:', error);
      }
      return data && data[0] ? data[0] : notice;
    } catch (err) {
      console.error('Failed to add notice to Supabase:', err);
      return notice;
    }
  },

  // 7. ASSIGNMENTS
  async getAssignments() {
    if (!isSupabaseConfigured) return initialAssignments;
    try {
      const { data, error } = await supabase.from('assignments').select('*');
      if (error || !data || data.length === 0) return initialAssignments;
      return data;
    } catch {
      return initialAssignments;
    }
  },

  // 8. SUPABASE REALTIME SUBSCRIPTIONS & BROADCAST CHANNELS
  subscribeToDatabaseChanges(callbacks = {}) {
    if (!isSupabaseConfigured || !supabase) return () => {};

    const dbChannel = supabase
      .channel('erp-db-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'students' },
        (payload) => {
          if (callbacks.onStudentChange) {
            callbacks.onStudentChange(payload.eventType, payload.new ? formatStudent(payload.new) : null, payload.old);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions' },
        (payload) => {
          if (callbacks.onTransactionChange) {
            callbacks.onTransactionChange(payload.eventType, payload.new ? formatTransaction(payload.new) : null, payload.old);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'labs' },
        (payload) => {
          if (callbacks.onLabChange) {
            callbacks.onLabChange(payload.eventType, payload.new ? formatLab(payload.new) : null, payload.old);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'faculty' },
        (payload) => {
          if (callbacks.onFacultyChange) {
            callbacks.onFacultyChange(payload.eventType, payload.new ? formatFaculty(payload.new) : null, payload.old);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notices' },
        (payload) => {
          if (callbacks.onNoticeChange) {
            callbacks.onNoticeChange(payload.eventType, payload.new, payload.old);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(dbChannel);
    };
  },

  // 9. LIVE QR ATTENDANCE BROADCAST & REALTIME SCANNING
  broadcastQrSession(qrSessionPayload) {
    realtimeEngine.broadcast('qr-session-created', qrSessionPayload);
  },

  broadcastQrScan(studentId, code) {
    realtimeEngine.broadcast('qr-student-scanned', { studentId, code, timestamp: Date.now() });
  },

  subscribeToQrBroadcast(callbacks = {}) {
    return realtimeEngine.subscribe((event, payload) => {
      if (event === 'qr-session-created' && callbacks.onQrCreated) callbacks.onQrCreated(payload);
      if (event === 'qr-student-scanned' && callbacks.onStudentScanned) callbacks.onStudentScanned(payload);
    });
  },

  // 10. ADMIN ESCALATION & COMPLAINTS/REQUESTS REALTIME BROADCAST CHANNELS
  broadcastTicketCreated(ticketPayload) {
    realtimeEngine.broadcast('ticket-created', ticketPayload);
  },

  broadcastTicketUpdated(ticketPayload) {
    realtimeEngine.broadcast('ticket-updated', ticketPayload);
  },

  subscribeToTicketBroadcast(callbacks = {}) {
    return realtimeEngine.subscribe((event, payload) => {
      if (event === 'ticket-created' && callbacks.onTicketCreated) callbacks.onTicketCreated(payload);
      if (event === 'ticket-updated' && callbacks.onTicketUpdated) callbacks.onTicketUpdated(payload);
    });
  },

  // 11. CAMPUS NOTICES REALTIME BROADCAST
  broadcastNotice(noticePayload) {
    realtimeEngine.broadcast('notice-published', noticePayload);
  },

  subscribeToNoticeBroadcast(onNoticePublished) {
    return realtimeEngine.subscribe((event, payload) => {
      if (event === 'notice-published' && onNoticePublished) onNoticePublished(payload);
    });
  },

  // 12. FACULTY WEEKLY SCHEDULE REALTIME BROADCAST
  broadcastScheduleUpdate(schedulePayload) {
    realtimeEngine.broadcast('schedule-updated', schedulePayload);
  },

  subscribeToScheduleBroadcast(onScheduleUpdated) {
    return realtimeEngine.subscribe((event, payload) => {
      if (event === 'schedule-updated' && onScheduleUpdated) onScheduleUpdated(payload);
    });
  },

  // 13. FACULTY REALTIME STATUS BROADCAST
  broadcastFacultyStatus(facultyId, status) {
    if (isSupabaseConfigured && supabase) {
      supabase.from('faculty').update({ status }).eq('id', facultyId).then(({ error }) => {
        if (error) console.error('Error updating faculty status in DB:', error);
      });
    }
    realtimeEngine.broadcast('faculty-status-changed', { facultyId, status, timestamp: Date.now() });
  },

  subscribeToFacultyStatusBroadcast(onStatusChanged) {
    return realtimeEngine.subscribe((event, payload) => {
      if (event === 'faculty-status-changed' && onStatusChanged) onStatusChanged(payload);
    });
  },

  // 13B. FACULTY SALARY DISBURSEMENT UPDATES & REALTIME BROADCAST
  async updateFacultyDisbursement(facultyId, disbursed) {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('faculty').update({ disbursed }).eq('id', facultyId);
      } catch (err) {}
    }
    realtimeEngine.broadcast('faculty-disbursement-changed', { facultyId, disbursed, timestamp: Date.now() });
  },

  subscribeToFacultyDisbursementBroadcast(onDisbursementChanged) {
    return realtimeEngine.subscribe((event, payload) => {
      if (event === 'faculty-disbursement-changed' && onDisbursementChanged) onDisbursementChanged(payload);
    });
  },

  // 14. REALTIME ALLOCATED PC TERMINALS & MESSAGES
  async getPcTerminals() {
    return initialPcTerminals;
  },

  async getPcMessages() {
    return initialPcMessages;
  },

  broadcastPcMessage(msgPayload) {
    realtimeEngine.broadcast('pc-message-sent', msgPayload);
  },

  subscribeToPcMessages(onMessageReceived) {
    return realtimeEngine.subscribe((event, payload) => {
      if (event === 'pc-message-sent' && onMessageReceived) onMessageReceived(payload);
    });
  },

  broadcastPcTerminalUpdate(updatedTerminal) {
    realtimeEngine.broadcast('pc-terminal-updated', updatedTerminal);
  },

  subscribeToPcTerminalUpdates(onTerminalUpdated) {
    return realtimeEngine.subscribe((event, payload) => {
      if (event === 'pc-terminal-updated' && onTerminalUpdated) onTerminalUpdated(payload);
    });
  },

  // 15. REALTIME ASSIGNMENT SUBMISSIONS
  broadcastAssignmentSubmit(submissionPayload) {
    realtimeEngine.broadcast('assignment-submitted', submissionPayload);
  },

  subscribeToAssignmentSubmissions(onSubmissionReceived) {
    return realtimeEngine.subscribe((event, payload) => {
      if (event === 'assignment-submitted' && onSubmissionReceived) onSubmissionReceived(payload);
    });
  }
};

