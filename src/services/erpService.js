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
    if (!isSupabaseConfigured || !supabase) return;
    const channel = supabase.channel('attendance-qr-live');
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        channel.send({
          type: 'broadcast',
          event: 'qr-session-created',
          payload: qrSessionPayload
        });
      }
    });
  },

  broadcastQrScan(studentId, code) {
    if (!isSupabaseConfigured || !supabase) return;
    const channel = supabase.channel('attendance-qr-live');
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        channel.send({
          type: 'broadcast',
          event: 'qr-student-scanned',
          payload: { studentId, code, timestamp: Date.now() }
        });
      }
    });
  },

  subscribeToQrBroadcast(callbacks = {}) {
    if (!isSupabaseConfigured || !supabase) return () => {};

    const qrChannel = supabase
      .channel('attendance-qr-live')
      .on('broadcast', { event: 'qr-session-created' }, ({ payload }) => {
        if (callbacks.onQrCreated) callbacks.onQrCreated(payload);
      })
      .on('broadcast', { event: 'qr-student-scanned' }, ({ payload }) => {
        if (callbacks.onStudentScanned) callbacks.onStudentScanned(payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(qrChannel);
    };
  },

  // 10. ADMIN ESCALATION & COMPLAINTS/REQUESTS REALTIME BROADCAST CHANNELS
  broadcastTicketCreated(ticketPayload) {
    if (!isSupabaseConfigured || !supabase) return;
    const channel = supabase.channel('admin-tickets-channel');
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        channel.send({
          type: 'broadcast',
          event: 'ticket-created',
          payload: ticketPayload
        });
      }
    });
  },

  broadcastTicketUpdated(ticketPayload) {
    if (!isSupabaseConfigured || !supabase) return;
    const channel = supabase.channel('admin-tickets-channel');
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        channel.send({
          type: 'broadcast',
          event: 'ticket-updated',
          payload: ticketPayload
        });
      }
    });
  },

  subscribeToTicketBroadcast(callbacks = {}) {
    if (!isSupabaseConfigured || !supabase) return () => {};

    const ticketChannel = supabase
      .channel('admin-tickets-channel')
      .on('broadcast', { event: 'ticket-created' }, ({ payload }) => {
        if (callbacks.onTicketCreated) callbacks.onTicketCreated(payload);
      })
      .on('broadcast', { event: 'ticket-updated' }, ({ payload }) => {
        if (callbacks.onTicketUpdated) callbacks.onTicketUpdated(payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ticketChannel);
    };
  },

  // 11. CAMPUS NOTICES REALTIME BROADCAST
  broadcastNotice(noticePayload) {
    if (!isSupabaseConfigured || !supabase) return;
    const channel = supabase.channel('campus-notices-broadcast');
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        channel.send({
          type: 'broadcast',
          event: 'notice-published',
          payload: noticePayload
        });
      }
    });
  },

  subscribeToNoticeBroadcast(onNoticePublished) {
    if (!isSupabaseConfigured || !supabase) return () => {};

    const noticeChannel = supabase
      .channel('campus-notices-broadcast')
      .on('broadcast', { event: 'notice-published' }, ({ payload }) => {
        if (onNoticePublished) onNoticePublished(payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(noticeChannel);
    };
  },

  // 12. FACULTY WEEKLY SCHEDULE REALTIME BROADCAST
  broadcastScheduleUpdate(schedulePayload) {
    if (!isSupabaseConfigured || !supabase) return;
    const channel = supabase.channel('faculty-weekly-schedule-channel');
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        channel.send({
          type: 'broadcast',
          event: 'schedule-updated',
          payload: schedulePayload
        });
      }
    });
  },

  subscribeToScheduleBroadcast(onScheduleUpdated) {
    if (!isSupabaseConfigured || !supabase) return () => {};

    const scheduleChannel = supabase
      .channel('faculty-weekly-schedule-channel')
      .on('broadcast', { event: 'schedule-updated' }, ({ payload }) => {
        if (onScheduleUpdated) onScheduleUpdated(payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(scheduleChannel);
    };
  },

  // 13. FACULTY REALTIME STATUS BROADCAST (IN LAB, READY, OFFICE HOURS, ON LEAVE)
  broadcastFacultyStatus(facultyId, status) {
    if (isSupabaseConfigured && supabase) {
      supabase.from('faculty').update({ status }).eq('id', facultyId).then(({ error }) => {
        if (error) console.error('Error updating faculty status in DB:', error);
      });
    }

    if (!isSupabaseConfigured || !supabase) return;
    const channel = supabase.channel('faculty-status-broadcast');
    channel.subscribe((statusChannel) => {
      if (statusChannel === 'SUBSCRIBED') {
        channel.send({
          type: 'broadcast',
          event: 'faculty-status-changed',
          payload: { facultyId, status, timestamp: Date.now() }
        });
      }
    });
  },

  subscribeToFacultyStatusBroadcast(onStatusChanged) {
    if (!isSupabaseConfigured || !supabase) return () => {};

    const statusChannel = supabase
      .channel('faculty-status-broadcast')
      .on('broadcast', { event: 'faculty-status-changed' }, ({ payload }) => {
        if (onStatusChanged) onStatusChanged(payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(statusChannel);
    };
  },

  // 13B. FACULTY SALARY DISBURSEMENT UPDATES & REALTIME BROADCAST
  async updateFacultyDisbursement(facultyId, disbursed) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('faculty')
          .update({ disbursed })
          .eq('id', facultyId);
        if (error) console.error('Error updating faculty disbursement in DB:', error);
      } catch (err) {
        console.error('Failed to update faculty disbursement:', err);
      }

      const channel = supabase.channel('faculty-disbursement-broadcast');
      channel.subscribe((statusChannel) => {
        if (statusChannel === 'SUBSCRIBED') {
          channel.send({
            type: 'broadcast',
            event: 'faculty-disbursement-changed',
            payload: { facultyId, disbursed, timestamp: Date.now() }
          });
        }
      });
    }
  },

  subscribeToFacultyDisbursementBroadcast(onDisbursementChanged) {
    if (!isSupabaseConfigured || !supabase) return () => {};

    const disbursementChannel = supabase
      .channel('faculty-disbursement-broadcast')
      .on('broadcast', { event: 'faculty-disbursement-changed' }, ({ payload }) => {
        if (onDisbursementChanged) onDisbursementChanged(payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(disbursementChannel);
    };
  },

  // 14. REALTIME ALLOCATED PC TERMINALS & MESSAGES
  async getPcTerminals() {
    return initialPcTerminals;
  },

  async getPcMessages() {
    return initialPcMessages;
  },

  broadcastPcMessage(msgPayload) {
    // 1. Broadcast via local window CustomEvent
    window.dispatchEvent(new CustomEvent('allocated-pc-message-sent', { detail: msgPayload }));

    // 2. Broadcast via Browser BroadcastChannel API (Works cross-tab / cross-window on deployed origin)
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const bc = new BroadcastChannel('tcit_erp_global_realtime');
        bc.postMessage({ type: 'pc-message-sent', payload: msgPayload });
        bc.close();
      } catch (err) {
        console.warn('BroadcastChannel error:', err);
      }
    }

    // 3. Broadcast via Supabase Realtime Channel
    if (!isSupabaseConfigured || !supabase) return;
    const channel = supabase.channel('allocated-pc-communication-channel');
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        channel.send({
          type: 'broadcast',
          event: 'pc-message-sent',
          payload: msgPayload
        });
      }
    });
  },

  subscribeToPcMessages(onMessageReceived) {
    const localHandler = (e) => {
      if (onMessageReceived && e.detail) onMessageReceived(e.detail);
    };
    window.addEventListener('allocated-pc-message-sent', localHandler);

    let bcListener = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      bcListener = new BroadcastChannel('tcit_erp_global_realtime');
      bcListener.onmessage = (event) => {
        if (event.data?.type === 'pc-message-sent' && onMessageReceived) {
          onMessageReceived(event.data.payload);
        }
      };
    }

    if (!isSupabaseConfigured || !supabase) {
      return () => {
        window.removeEventListener('allocated-pc-message-sent', localHandler);
        if (bcListener) bcListener.close();
      };
    }

    const pcChannel = supabase
      .channel('allocated-pc-communication-channel')
      .on('broadcast', { event: 'pc-message-sent' }, ({ payload }) => {
        if (onMessageReceived) onMessageReceived(payload);
      })
      .subscribe();

    return () => {
      window.removeEventListener('allocated-pc-message-sent', localHandler);
      if (bcListener) bcListener.close();
      supabase.removeChannel(pcChannel);
    };
  },

  broadcastPcTerminalUpdate(updatedTerminal) {
    window.dispatchEvent(new CustomEvent('allocated-pc-terminal-updated', { detail: updatedTerminal }));

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const bc = new BroadcastChannel('tcit_erp_global_realtime');
        bc.postMessage({ type: 'pc-terminal-updated', payload: updatedTerminal });
        bc.close();
      } catch (err) {
        console.warn('BroadcastChannel error:', err);
      }
    }

    if (!isSupabaseConfigured || !supabase) return;
    const channel = supabase.channel('allocated-pc-terminal-channel');
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        channel.send({
          type: 'broadcast',
          event: 'pc-terminal-updated',
          payload: updatedTerminal
        });
      }
    });
  },

  subscribeToPcTerminalUpdates(onTerminalUpdated) {
    const localHandler = (e) => {
      if (onTerminalUpdated && e.detail) onTerminalUpdated(e.detail);
    };
    window.addEventListener('allocated-pc-terminal-updated', localHandler);

    let bcListener = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      bcListener = new BroadcastChannel('tcit_erp_global_realtime');
      bcListener.onmessage = (event) => {
        if (event.data?.type === 'pc-terminal-updated' && onTerminalUpdated) {
          onTerminalUpdated(event.data.payload);
        }
      };
    }

    if (!isSupabaseConfigured || !supabase) {
      return () => {
        window.removeEventListener('allocated-pc-terminal-updated', localHandler);
        if (bcListener) bcListener.close();
      };
    }

    const terminalChannel = supabase
      .channel('allocated-pc-terminal-channel')
      .on('broadcast', { event: 'pc-terminal-updated' }, ({ payload }) => {
        if (onTerminalUpdated) onTerminalUpdated(payload);
      })
      .subscribe();

    return () => {
      window.removeEventListener('allocated-pc-terminal-updated', localHandler);
      if (bcListener) bcListener.close();
      supabase.removeChannel(terminalChannel);
    };
  },

  // 15. REALTIME ASSIGNMENT SUBMISSIONS
  broadcastAssignmentSubmit(submissionPayload) {
    window.dispatchEvent(new CustomEvent('assignment-submitted-event', { detail: submissionPayload }));

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const bc = new BroadcastChannel('tcit_erp_global_realtime');
        bc.postMessage({ type: 'assignment-submitted', payload: submissionPayload });
        bc.close();
      } catch (err) {
        console.warn('BroadcastChannel error:', err);
      }
    }

    if (!isSupabaseConfigured || !supabase) return;
    const channel = supabase.channel('assignments-realtime-channel');
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        channel.send({
          type: 'broadcast',
          event: 'assignment-submitted',
          payload: submissionPayload
        });
      }
    });
  },

  subscribeToAssignmentSubmissions(onSubmissionReceived) {
    const localHandler = (e) => {
      if (onSubmissionReceived && e.detail) onSubmissionReceived(e.detail);
    };
    window.addEventListener('assignment-submitted-event', localHandler);

    let bcListener = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      bcListener = new BroadcastChannel('tcit_erp_global_realtime');
      bcListener.onmessage = (event) => {
        if (event.data?.type === 'assignment-submitted' && onSubmissionReceived) {
          onSubmissionReceived(event.data.payload);
        }
      };
    }

    if (!isSupabaseConfigured || !supabase) {
      return () => {
        window.removeEventListener('assignment-submitted-event', localHandler);
        if (bcListener) bcListener.close();
      };
    }

    const asmChannel = supabase
      .channel('assignments-realtime-channel')
      .on('broadcast', { event: 'assignment-submitted' }, ({ payload }) => {
        if (onSubmissionReceived) onSubmissionReceived(payload);
      })
      .subscribe();

    return () => {
      window.removeEventListener('assignment-submitted-event', localHandler);
      if (bcListener) bcListener.close();
      supabase.removeChannel(asmChannel);
    };
  }
};

