export const initialStudents = [
  {
    id: "AT-2024-089",
    name: "Rohan Adhikari",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    course: "MERN Full Stack",
    batch: "MERN-B2 (10:00 AM - 12:00 PM)",
    lab: "Lab 01",
    totalFee: 32000,
    paidFee: 24000,
    pendingFee: 8000,
    status: "Active",
    attendance: 94,
    phone: "+91 98765 43210",
    email: "rohan.adhikari@example.com",
    joinedDate: "2024-06-15",
    gpa: "A+",
    projectStatus: "PR #14 Approved (E-Commerce API)"
  },
  {
    id: "AT-2024-114",
    name: "Ananya Sen",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    course: "Tally Prime + GST",
    batch: "Tally-B1 (10:00 AM - 11:30 AM)",
    lab: "Lab 02",
    totalFee: 18000,
    paidFee: 13500,
    pendingFee: 4500,
    status: "Active",
    attendance: 88,
    phone: "+91 98123 45678",
    email: "ananya.sen@example.com",
    joinedDate: "2024-07-01",
    gpa: "A",
    projectStatus: "GST Audit Project Completed"
  },
  {
    id: "AT-2024-042",
    name: "Vikramaditya Rao",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    course: "Python & Django",
    batch: "Py-B1 (02:00 PM - 04:00 PM)",
    lab: "Lab 03",
    totalFee: 28000,
    paidFee: 21500,
    pendingFee: 6500,
    status: "Active",
    attendance: 96,
    phone: "+91 97654 32109",
    email: "vikram.rao@example.com",
    joinedDate: "2024-05-10",
    gpa: "O (Outstanding)",
    projectStatus: "PR #08 Pending Review (Django Rest)"
  },
  {
    id: "AT-2024-177",
    name: "Tanvi Kulkarni",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    course: "Java Spring Boot",
    batch: "Java-B3 (11:30 AM - 01:30 PM)",
    lab: "Lab 03",
    totalFee: 30000,
    paidFee: 23000,
    pendingFee: 7000,
    status: "Active",
    attendance: 91,
    phone: "+91 99887 76655",
    email: "tanvi.k@example.com",
    joinedDate: "2024-07-20",
    gpa: "A+",
    projectStatus: "Microservice Submission Verified"
  },
  {
    id: "AT-2024-055",
    name: "Kabir Sharma",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    course: "MERN Full Stack",
    batch: "MERN-B2 (10:00 AM - 12:00 PM)",
    lab: "Lab 01",
    totalFee: 32000,
    paidFee: 16000,
    pendingFee: 16000,
    status: "Overdue",
    attendance: 78,
    phone: "+91 98234 56789",
    email: "kabir.sharma@example.com",
    joinedDate: "2024-06-01",
    gpa: "B+",
    projectStatus: "PR #03 Needs Revision"
  }
];

export const initialTransactions = [
  {
    id: "RCP-OCT-4102",
    studentId: "AT-2024-089",
    studentName: "Rohan Adhikari",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    course: "MERN Full Stack",
    mode: "UPI / GPay",
    amount: 8000,
    timestamp: "Today, 10:14 AM",
    status: "Verified & Paid",
    installment: "Installment 3 of 4",
    remarks: "Quarterly fee clearance"
  },
  {
    id: "RCP-OCT-4101",
    studentId: "AT-2024-114",
    studentName: "Ananya Sen",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    course: "Tally Prime + GST",
    mode: "Cash Desk",
    amount: 4500,
    timestamp: "Today, 09:48 AM",
    status: "Verified & Paid",
    installment: "Installment 2 of 3",
    remarks: "Cash paid at Front Office counter 1"
  },
  {
    id: "RCP-OCT-4099",
    studentId: "AT-2024-042",
    studentName: "Vikramaditya Rao",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    course: "Python & Django",
    mode: "Net Banking",
    amount: 6500,
    timestamp: "Today, 09:12 AM",
    status: "Verified & Paid",
    installment: "Installment 3 of 4",
    remarks: "HDFC Online Transfer #TXN99420"
  },
  {
    id: "RCP-OCT-4098",
    studentId: "AT-2024-177",
    studentName: "Tanvi Kulkarni",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    course: "Java Spring Boot",
    mode: "UPI / PhonePe",
    amount: 7000,
    timestamp: "Yesterday, 05:40 PM",
    status: "Verified & Paid",
    installment: "Installment 3 of 4",
    remarks: "PhonePe confirmation ID #88741"
  }
];

export const initialLabs = [
  {
    id: "Lab 01",
    name: "MERN Full Stack",
    faculty: "Amit Verma",
    timing: "10:00 AM - 12:00 PM",
    capacity: 20,
    occupied: 19,
    occupancyPct: 95,
    status: "In Progress",
    statusColor: "bg-emerald-500",
    barColor: "bg-blue-600"
  },
  {
    id: "Lab 02",
    name: "Tally Prime & GST",
    faculty: "Neha Gupta",
    timing: "10:00 AM - 11:30 AM",
    capacity: 20,
    occupied: 18,
    occupancyPct: 90,
    status: "In Progress",
    statusColor: "bg-emerald-500",
    barColor: "bg-teal-600"
  },
  {
    id: "Lab 03",
    name: "Java Full Stack B3",
    faculty: "S. K. Roy",
    timing: "11:30 AM - 01:30 PM",
    capacity: 20,
    occupied: 20,
    occupancyPct: 100,
    status: "Starts 11:30 AM",
    statusColor: "bg-amber-500",
    barColor: "bg-indigo-600"
  },
  {
    id: "Lab 04",
    name: "CCC Foundation & Office",
    faculty: "Priya Das",
    timing: "09:30 AM - 11:00 AM",
    capacity: 20,
    occupied: 17,
    occupancyPct: 85,
    status: "In Progress",
    statusColor: "bg-emerald-500",
    barColor: "bg-slate-600"
  }
];

export const initialFaculty = [
  {
    id: "FAC-001",
    name: "Amit Verma",
    role: "Lead Full Stack Instructor",
    subject: "React & Node.js",
    punchTime: "09:15 AM",
    status: "Present",
    salary: 55000,
    honorarium: 12000,
    disbursed: true,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    assignedBatches: ["MERN-B1", "MERN-B2"],
    prReviewsCount: 14
  },
  {
    id: "FAC-002",
    name: "Neha Gupta",
    role: "Senior Accounting Trainer",
    subject: "Tally Prime & Taxation",
    punchTime: "09:30 AM",
    status: "Present",
    salary: 48000,
    honorarium: 8000,
    disbursed: false,
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    assignedBatches: ["Tally-B1", "Tally-B2"],
    prReviewsCount: 8
  },
  {
    id: "FAC-003",
    name: "S. K. Roy",
    role: "Java & Enterprise Architect",
    subject: "Java & Spring Boot",
    punchTime: "09:20 AM",
    status: "Present",
    salary: 62000,
    honorarium: 15000,
    disbursed: true,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    assignedBatches: ["Java-B1", "Java-B3"],
    prReviewsCount: 19
  },
  {
    id: "FAC-004",
    name: "Priya Das",
    role: "Office Automation Instructor",
    subject: "Excel & CCC",
    punchTime: "--:--",
    status: "On Leave",
    salary: 35000,
    honorarium: 5000,
    disbursed: false,
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    assignedBatches: ["CCC-B1"],
    prReviewsCount: 5
  }
];

export const initialExpenses = [
  {
    id: "EXP-OCT-091",
    category: "Infrastructure",
    description: "Lab 01 & 02 PC Workstation Electricity Bill",
    vendor: "CESC Power Supply",
    amount: 24500,
    date: "Oct 18, 2024",
    status: "Approved & Paid",
    mode: "Corporate NetBanking"
  },
  {
    id: "EXP-OCT-088",
    category: "Software Licenses",
    description: "JetBrains & Tally Prime Multi-User Enterprise Licenses",
    vendor: "Tally Solutions India",
    amount: 35000,
    date: "Oct 14, 2024",
    status: "Approved & Paid",
    mode: "Credit Card"
  },
  {
    id: "EXP-OCT-072",
    category: "Network & Fiber",
    description: "High-Speed Dual Fiber Leased Line (500 Mbps)",
    vendor: "Airtel Business",
    amount: 12000,
    date: "Oct 10, 2024",
    status: "Approved & Paid",
    mode: "Auto Debit"
  },
  {
    id: "EXP-OCT-065",
    category: "Office Supplies",
    description: "Whiteboard Markers, Certificate Paper & Printing Ink",
    vendor: "Metro Office Depot",
    amount: 8500,
    date: "Oct 05, 2024",
    status: "Approved & Paid",
    mode: "Cash Voucher"
  }
];

export const initialNotices = [
  {
    id: "NOT-101",
    title: "Diwali Session Schedule & Lab Maintenance",
    date: "Oct 24, 2024",
    category: "Academic",
    priority: "High",
    body: "All evening batches (04:00 PM onwards) will undergo practical project reviews in Lab 1 & 2."
  },
  {
    id: "NOT-102",
    title: "Quarterly Fee Installment Clearance Notice",
    date: "Oct 20, 2024",
    category: "Finance",
    priority: "Urgent",
    body: "Students with pending dues above ₹5,000 are requested to settle via UPI/Cash desk to avoid exam admit card lock."
  }
];

export const initialAssignments = [
  {
    id: "ASM-101",
    title: "E-Commerce REST API with JWT Auth",
    course: "MERN Full Stack",
    dueDate: "Oct 28, 2024",
    submissions: 18,
    total: 20,
    status: "Active"
  },
  {
    id: "ASM-102",
    title: "GST Return Filing & Ledger Reconciliation",
    course: "Tally Prime + GST",
    dueDate: "Oct 25, 2024",
    submissions: 16,
    total: 18,
    status: "Active"
  },
  {
    id: "ASM-103",
    title: "Spring Security & Microservices Architecture",
    course: "Java Spring Boot",
    dueDate: "Nov 02, 2024",
    submissions: 12,
    total: 20,
    status: "Upcoming"
  }
];

export const initialComplaintsAndRequests = [
  {
    id: "REQ-2024-001",
    senderType: "Faculty",
    senderId: "FAC-001",
    senderName: "Amit Verma",
    senderRole: "Lead Full Stack Instructor",
    senderAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    type: "Request",
    category: "Hardware Upgrade",
    subject: "Additional 16GB RAM for MERN Lab 01 Workstations",
    message: "Students in MERN Batch 2 are experiencing Docker & Node container build slowdowns on 8GB machines. Requesting RAM upgrade to 16GB for 10 workstations.",
    status: "Under Review",
    createdAt: "Today, 09:30 AM",
    replies: [
      {
        id: "REP-1",
        sender: "Admin Desk",
        senderRole: "Administrator",
        text: "IT team is evaluating stock. We will approve procurement by end of week.",
        timestamp: "Today, 10:15 AM"
      }
    ]
  },
  {
    id: "CMP-2024-002",
    senderType: "Student",
    senderId: "AT-2024-089",
    senderName: "Rohan Adhikari",
    senderRole: "MERN Full Stack Student",
    senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    type: "Complaint",
    category: "Lab Seat Allocation",
    subject: "AC Cooling & Monitor Flicker at Seat L1-PC08",
    message: "The secondary monitor connected to PC 08 in Lab 01 flicks intermittently during afternoon batch and the air conditioning vent is blowing directly overhead.",
    status: "Pending",
    createdAt: "Today, 08:45 AM",
    replies: []
  },
  {
    id: "REQ-2024-003",
    senderType: "Faculty",
    senderId: "FAC-002",
    senderName: "Neha Gupta",
    senderRole: "Senior Accounting Trainer",
    senderAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    type: "Request",
    category: "Software License",
    subject: "Tally Prime Gold Multi-User License Renewal",
    message: "Tally Prime license in Lab 02 expires in 5 days. Kindly approve the annual enterprise software renewal subscription.",
    status: "Approved",
    createdAt: "Yesterday, 04:20 PM",
    replies: [
      {
        id: "REP-2",
        sender: "Admin Desk",
        senderRole: "Administrator",
        text: "License key renewed and processed via Accounts team. Please check active keys in Admin Settings.",
        timestamp: "Yesterday, 05:30 PM"
      }
    ]
  },
  {
    id: "CMP-2024-004",
    senderType: "Student",
    senderId: "AT-2024-055",
    senderName: "Kabir Sharma",
    senderRole: "MERN Full Stack Student",
    senderAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    type: "Complaint",
    category: "Fee Ledger / Receipt",
    subject: "Installment Receipt Update Delay",
    message: "I paid ₹8,000 via UPI yesterday afternoon, but my portal still displays status as Overdue. Please verify transaction ID #UPI-884210.",
    status: "In Progress",
    createdAt: "Yesterday, 02:10 PM",
    replies: [
      {
        id: "REP-3",
        sender: "Admin Desk",
        senderRole: "Administrator",
        text: "Finance desk is reconciling bank ledger statement. Will update your receipt shortly.",
        timestamp: "Yesterday, 03:00 PM"
      }
    ]
  }
];

export const initialWeeklySchedule = {
  'Monday-09:00 AM - 10:30 AM': {
    facultyId: 'FAC-001',
    facultyName: 'Amit Verma',
    course: 'MERN Full Stack',
    batch: 'MERN-B1',
    lab: 'Lab 01',
    color: 'blue'
  },
  'Monday-10:30 AM - 12:00 PM': {
    facultyId: 'FAC-002',
    facultyName: 'Neha Gupta',
    course: 'Tally Prime + GST',
    batch: 'Tally-B1',
    lab: 'Lab 02',
    color: 'emerald'
  },
  'Tuesday-11:30 AM - 01:00 PM': {
    facultyId: 'FAC-003',
    facultyName: 'S. K. Roy',
    course: 'Java Spring Boot',
    batch: 'Java-B3',
    lab: 'Lab 03',
    color: 'indigo'
  },
  'Wednesday-09:00 AM - 10:30 AM': {
    facultyId: 'FAC-001',
    facultyName: 'Amit Verma',
    course: 'MERN Full Stack',
    batch: 'MERN-B2',
    lab: 'Lab 01',
    color: 'blue'
  },
  'Thursday-02:00 PM - 03:30 PM': {
    facultyId: 'FAC-004',
    facultyName: 'Priya Das',
    course: 'Excel & CCC Foundation',
    batch: 'CCC-B1',
    lab: 'Lab 04',
    color: 'amber'
  },
  'Friday-10:30 AM - 12:00 PM': {
    facultyId: 'FAC-002',
    facultyName: 'Neha Gupta',
    course: 'Tally Prime + GST',
    batch: 'Tally-B2',
    lab: 'Lab 02',
    color: 'emerald'
  },
  'Saturday-09:00 AM - 10:30 AM': {
    facultyId: 'FAC-003',
    facultyName: 'S. K. Roy',
    course: 'Java Spring Boot',
    batch: 'Java-B1',
    lab: 'Lab 03',
    color: 'indigo'
  },
  'Saturday-11:30 AM - 01:00 PM': {
    facultyId: 'FAC-001',
    facultyName: 'Amit Verma',
    course: 'MERN Full Stack',
    batch: 'MERN-B1 Project Review',
    lab: 'Lab 01',
    color: 'blue'
  }
};

// INITIAL REALTIME LAB PC TERMINAL ALLOCATIONS
export const initialPcTerminals = [
  // LAB-01 Terminals
  { id: 'LAB-01-PC-01', labId: 'LAB-01', pcNumber: 1, pcName: 'PC-01', status: 'Occupied', studentId: 'AT-2024-001', studentName: 'Aarav Sharma', studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', course: 'MERN Full Stack', batch: 'MERN-B1', loginTime: '09:45 AM', ipAddress: '192.168.1.101', helpRequested: false },
  { id: 'LAB-01-PC-02', labId: 'LAB-01', pcNumber: 2, pcName: 'PC-02', status: 'Occupied', studentId: 'AT-2024-005', studentName: 'Ananya Verma', studentAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', course: 'MERN Full Stack', batch: 'MERN-B1', loginTime: '09:50 AM', ipAddress: '192.168.1.102', helpRequested: false },
  { id: 'LAB-01-PC-03', labId: 'LAB-01', pcNumber: 3, pcName: 'PC-03', status: 'Occupied', studentId: 'AT-2024-012', studentName: 'Rohan Mehta', studentAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', course: 'MERN Full Stack', batch: 'MERN-B1', loginTime: '09:52 AM', ipAddress: '192.168.1.103', helpRequested: false },
  { id: 'LAB-01-PC-04', labId: 'LAB-01', pcNumber: 4, pcName: 'PC-04', status: 'Occupied', studentId: 'AT-2024-018', studentName: 'Priya Sen', studentAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150', course: 'MERN Full Stack', batch: 'MERN-B1', loginTime: '09:55 AM', ipAddress: '192.168.1.104', helpRequested: false },
  { id: 'LAB-01-PC-05', labId: 'LAB-01', pcNumber: 5, pcName: 'PC-05', status: 'Occupied', studentId: 'AT-2024-024', studentName: 'Kabir Das', studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', course: 'MERN Full Stack', batch: 'MERN-B1', loginTime: '09:58 AM', ipAddress: '192.168.1.105', helpRequested: true },
  { id: 'LAB-01-PC-06', labId: 'LAB-01', pcNumber: 6, pcName: 'PC-06', status: 'Occupied', studentId: 'AT-2024-031', studentName: 'Diya Patel', studentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', course: 'MERN Full Stack', batch: 'MERN-B1', loginTime: '10:00 AM', ipAddress: '192.168.1.106', helpRequested: false },
  { id: 'LAB-01-PC-07', labId: 'LAB-01', pcNumber: 7, pcName: 'PC-07', status: 'Occupied', studentId: 'AT-2024-038', studentName: 'Siddharth Roy', studentAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', course: 'MERN Full Stack', batch: 'MERN-B1', loginTime: '10:02 AM', ipAddress: '192.168.1.107', helpRequested: false },
  { id: 'LAB-01-PC-08', labId: 'LAB-01', pcNumber: 8, pcName: 'PC-08', status: 'Occupied', studentId: 'AT-2024-042', studentName: 'Isha Nair', studentAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', course: 'MERN Full Stack', batch: 'MERN-B1', loginTime: '10:05 AM', ipAddress: '192.168.1.108', helpRequested: false },
  { id: 'LAB-01-PC-09', labId: 'LAB-01', pcNumber: 9, pcName: 'PC-09', status: 'Occupied', studentId: 'AT-2024-049', studentName: 'Aditya Mukherji', studentAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', course: 'MERN Full Stack', batch: 'MERN-B1', loginTime: '10:06 AM', ipAddress: '192.168.1.109', helpRequested: false },
  { id: 'LAB-01-PC-10', labId: 'LAB-01', pcNumber: 10, pcName: 'PC-10', status: 'Occupied', studentId: 'AT-2024-055', studentName: 'Sneha Banerjee', studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', course: 'MERN Full Stack', batch: 'MERN-B1', loginTime: '10:08 AM', ipAddress: '192.168.1.110', helpRequested: false },
  { id: 'LAB-01-PC-11', labId: 'LAB-01', pcNumber: 11, pcName: 'PC-11', status: 'Occupied', studentId: 'AT-2024-061', studentName: 'Varun Malhotra', studentAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', course: 'MERN Full Stack', batch: 'MERN-B1', loginTime: '10:10 AM', ipAddress: '192.168.1.111', helpRequested: false },
  { id: 'LAB-01-PC-12', labId: 'LAB-01', pcNumber: 12, pcName: 'PC-12', status: 'Occupied', studentId: 'AT-2024-070', studentName: 'Meera Kapoor', studentAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', course: 'MERN Full Stack', batch: 'MERN-B1', loginTime: '10:12 AM', ipAddress: '192.168.1.112', helpRequested: false },
  { id: 'LAB-01-PC-13', labId: 'LAB-01', pcNumber: 13, pcName: 'PC-13', status: 'Occupied', studentId: 'AT-2024-077', studentName: 'Nikhil Saxena', studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', course: 'MERN Full Stack', batch: 'MERN-B1', loginTime: '10:14 AM', ipAddress: '192.168.1.113', helpRequested: false },
  { id: 'LAB-01-PC-14', labId: 'LAB-01', pcNumber: 14, pcName: 'PC-14', status: 'Occupied', studentId: 'AT-2024-089', studentName: 'Rohan Adhikari', studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', course: 'MERN Full Stack', batch: 'MERN-B1', loginTime: '10:15 AM', ipAddress: '192.168.1.114', helpRequested: true },
  { id: 'LAB-01-PC-15', labId: 'LAB-01', pcNumber: 15, pcName: 'PC-15', status: 'Occupied', studentId: 'AT-2024-094', studentName: 'Vikramaditya Rao', studentAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', course: 'MERN Full Stack', batch: 'MERN-B1', loginTime: '10:18 AM', ipAddress: '192.168.1.115', helpRequested: false },
  { id: 'LAB-01-PC-16', labId: 'LAB-01', pcNumber: 16, pcName: 'PC-16', status: 'Occupied', studentId: 'AT-2024-099', studentName: 'Kavya Pillai', studentAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', course: 'MERN Full Stack', batch: 'MERN-B1', loginTime: '10:20 AM', ipAddress: '192.168.1.116', helpRequested: false },
  { id: 'LAB-01-PC-17', labId: 'LAB-01', pcNumber: 17, pcName: 'PC-17', status: 'Vacant', studentId: null, studentName: null, studentAvatar: null, course: null, batch: null, loginTime: null, ipAddress: null, helpRequested: false },
  { id: 'LAB-01-PC-18', labId: 'LAB-01', pcNumber: 18, pcName: 'PC-18', status: 'Vacant', studentId: null, studentName: null, studentAvatar: null, course: null, batch: null, loginTime: null, ipAddress: null, helpRequested: false },
  { id: 'LAB-01-PC-19', labId: 'LAB-01', pcNumber: 19, pcName: 'PC-19', status: 'Vacant', studentId: null, studentName: null, studentAvatar: null, course: null, batch: null, loginTime: null, ipAddress: null, helpRequested: false },
  { id: 'LAB-01-PC-20', labId: 'LAB-01', pcNumber: 20, pcName: 'PC-20', status: 'Vacant', studentId: null, studentName: null, studentAvatar: null, course: null, batch: null, loginTime: null, ipAddress: null, helpRequested: false },

  // LAB-02 Terminals
  ...Array.from({ length: 20 }, (_, i) => ({
    id: `LAB-02-PC-${i + 1 < 10 ? `0${i + 1}` : i + 1}`,
    labId: 'LAB-02',
    pcNumber: i + 1,
    pcName: `PC-${i + 1 < 10 ? `0${i + 1}` : i + 1}`,
    status: i < 18 ? 'Occupied' : 'Vacant',
    studentId: i < 18 ? `AT-2024-${100 + i}` : null,
    studentName: i < 18 ? `Tally Student ${i + 1}` : null,
    studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    course: 'Tally Prime + GST',
    batch: 'Tally-B1',
    loginTime: i < 18 ? '10:00 AM' : null,
    ipAddress: i < 18 ? `192.168.2.${101 + i}` : null,
    helpRequested: i === 2
  })),

  // LAB-03 Terminals
  ...Array.from({ length: 20 }, (_, i) => ({
    id: `LAB-03-PC-${i + 1 < 10 ? `0${i + 1}` : i + 1}`,
    labId: 'LAB-03',
    pcNumber: i + 1,
    pcName: `PC-${i + 1 < 10 ? `0${i + 1}` : i + 1}`,
    status: 'Occupied',
    studentId: `AT-2024-${200 + i}`,
    studentName: `Java Student ${i + 1}`,
    studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    course: 'Java Spring Boot',
    batch: 'Java-B3',
    loginTime: '11:30 AM',
    ipAddress: `192.168.3.${101 + i}`,
    helpRequested: false
  })),

  // LAB-04 Terminals
  ...Array.from({ length: 20 }, (_, i) => ({
    id: `LAB-04-PC-${i + 1 < 10 ? `0${i + 1}` : i + 1}`,
    labId: 'LAB-04',
    pcNumber: i + 1,
    pcName: `PC-${i + 1 < 10 ? `0${i + 1}` : i + 1}`,
    status: i < 17 ? 'Occupied' : 'Vacant',
    studentId: i < 17 ? `AT-2024-${300 + i}` : null,
    studentName: i < 17 ? `Foundation Student ${i + 1}` : null,
    studentAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150',
    course: 'CCC Foundation',
    batch: 'CCC-B1',
    loginTime: i < 17 ? '09:30 AM' : null,
    ipAddress: i < 17 ? `192.168.4.${101 + i}` : null,
    helpRequested: false
  }))
];

// INITIAL REALTIME PC MESSAGES STREAM
export const initialPcMessages = [
  {
    id: 'MSG-PC-101',
    labId: 'LAB-01',
    pcNumber: 14,
    studentId: 'AT-2024-089',
    sender: 'Faculty',
    senderName: 'Prof. Amit Verma',
    senderRole: 'Faculty Instructor',
    text: 'Rohan, please verify your JWT secret key in your .env file before running npm start.',
    type: 'chat',
    timestamp: '10:25 AM'
  },
  {
    id: 'MSG-PC-102',
    labId: 'LAB-01',
    pcNumber: 14,
    studentId: 'AT-2024-089',
    sender: 'Student',
    senderName: 'Rohan Adhikari',
    senderRole: 'Student',
    text: 'Thank you Sir! Fixed the secret key issue, server is now listening on Port 5000.',
    type: 'chat',
    timestamp: '10:28 AM'
  },
  {
    id: 'MSG-PC-103',
    labId: 'LAB-01',
    pcNumber: 5,
    studentId: 'AT-2024-024',
    sender: 'Student',
    senderName: 'Kabir Das',
    senderRole: 'Student',
    text: '✋ Requesting instructor help at PC-05 regarding MongoDB connection string timeout.',
    type: 'help_request',
    timestamp: '10:30 AM'
  }
];

