-- ==============================================================================
-- APEX TECH ERP - SUPABASE DATABASE SCHEMA & INITIAL SEED DATA
-- Project: erpproject
-- ==============================================================================

-- 1. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS public.students (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    avatar TEXT,
    course VARCHAR(255) NOT NULL,
    batch VARCHAR(255) NOT NULL,
    lab VARCHAR(100) NOT NULL,
    total_fee NUMERIC(10, 2) DEFAULT 0,
    paid_fee NUMERIC(10, 2) DEFAULT 0,
    pending_fee NUMERIC(10, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Active',
    attendance INTEGER DEFAULT 0,
    phone VARCHAR(50),
    email VARCHAR(255),
    joined_date DATE,
    gpa VARCHAR(50),
    project_status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.transactions (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) REFERENCES public.students(id) ON DELETE SET NULL,
    student_name VARCHAR(255) NOT NULL,
    avatar TEXT,
    course VARCHAR(255) NOT NULL,
    mode VARCHAR(100) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    timestamp VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'Verified & Paid',
    installment VARCHAR(100),
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. LABS TABLE
CREATE TABLE IF NOT EXISTS public.labs (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    faculty VARCHAR(255) NOT NULL,
    timing VARCHAR(100) NOT NULL,
    capacity INTEGER DEFAULT 20,
    occupied INTEGER DEFAULT 0,
    occupancy_pct INTEGER DEFAULT 0,
    status VARCHAR(100) DEFAULT 'In Progress',
    status_color VARCHAR(100),
    bar_color VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. FACULTY TABLE
CREATE TABLE IF NOT EXISTS public.faculty (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    punch_time VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Present',
    salary NUMERIC(10, 2) DEFAULT 0,
    honorarium NUMERIC(10, 2) DEFAULT 0,
    disbursed BOOLEAN DEFAULT FALSE,
    avatar TEXT,
    assigned_batches TEXT[],
    pr_reviews_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. EXPENSES TABLE
CREATE TABLE IF NOT EXISTS public.expenses (
    id VARCHAR(50) PRIMARY KEY,
    category VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    vendor VARCHAR(255) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    date VARCHAR(100) NOT NULL,
    status VARCHAR(100) DEFAULT 'Approved & Paid',
    mode VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. NOTICES TABLE
CREATE TABLE IF NOT EXISTS public.notices (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    date VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    priority VARCHAR(50) DEFAULT 'Normal',
    body TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS public.assignments (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    course VARCHAR(255) NOT NULL,
    due_date VARCHAR(100) NOT NULL,
    submissions INTEGER DEFAULT 0,
    total INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. QR SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.qr_sessions (
    id SERIAL PRIMARY KEY,
    code VARCHAR(100) NOT NULL,
    lab VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    seconds_left INTEGER DEFAULT 60,
    active BOOLEAN DEFAULT TRUE,
    scanned_student_ids TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ENABLE ROW LEVEL SECURITY & PUBLIC READ/WRITE POLICIES (Development Mode)
-- ==============================================================================

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to students" ON public.students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to labs" ON public.labs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to faculty" ON public.faculty FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to expenses" ON public.expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to notices" ON public.notices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to assignments" ON public.assignments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to qr_sessions" ON public.qr_sessions FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- INITIAL SEED DATA INSERTION
-- ==============================================================================

INSERT INTO public.students (id, name, avatar, course, batch, lab, total_fee, paid_fee, pending_fee, status, attendance, phone, email, joined_date, gpa, project_status)
VALUES
('AT-2024-089', 'Rohan Adhikari', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 'MERN Full Stack', 'MERN-B2 (10:00 AM - 12:00 PM)', 'Lab 01', 32000, 24000, 8000, 'Active', 94, '+91 98765 43210', 'rohan.adhikari@example.com', '2024-06-15', 'A+', 'PR #14 Approved (E-Commerce API)'),
('AT-2024-114', 'Ananya Sen', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', 'Tally Prime + GST', 'Tally-B1 (10:00 AM - 11:30 AM)', 'Lab 02', 18000, 13500, 4500, 'Active', 88, '+91 98123 45678', 'ananya.sen@example.com', '2024-07-01', 'A', 'GST Audit Project Completed'),
('AT-2024-042', 'Vikramaditya Rao', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 'Python & Django', 'Py-B1 (02:00 PM - 04:00 PM)', 'Lab 03', 28000, 21500, 6500, 'Active', 96, '+91 97654 32109', 'vikram.rao@example.com', '2024-05-10', 'O (Outstanding)', 'PR #08 Pending Review (Django Rest)'),
('AT-2024-177', 'Tanvi Kulkarni', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', 'Java Spring Boot', 'Java-B3 (11:30 AM - 01:30 PM)', 'Lab 03', 30000, 23000, 7000, 'Active', 91, '+91 99887 76655', 'tanvi.k@example.com', '2024-07-20', 'A+', 'Microservice Submission Verified'),
('AT-2024-055', 'Kabir Sharma', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', 'MERN Full Stack', 'MERN-B2 (10:00 AM - 12:00 PM)', 'Lab 01', 32000, 16000, 16000, 'Overdue', 78, '+91 98234 56789', 'kabir.sharma@example.com', '2024-06-01', 'B+', 'PR #03 Needs Revision')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.transactions (id, student_id, student_name, avatar, course, mode, amount, timestamp, status, installment, remarks)
VALUES
('RCP-OCT-4102', 'AT-2024-089', 'Rohan Adhikari', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 'MERN Full Stack', 'UPI / GPay', 8000, 'Today, 10:14 AM', 'Verified & Paid', 'Installment 3 of 4', 'Quarterly fee clearance'),
('RCP-OCT-4101', 'AT-2024-114', 'Ananya Sen', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', 'Tally Prime + GST', 'Cash Desk', 4500, 'Today, 09:48 AM', 'Verified & Paid', 'Installment 2 of 3', 'Cash paid at Front Office counter 1'),
('RCP-OCT-4099', 'AT-2024-042', 'Vikramaditya Rao', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 'Python & Django', 'Net Banking', 6500, 'Today, 09:12 AM', 'Verified & Paid', 'Installment 3 of 4', 'HDFC Online Transfer #TXN99420'),
('RCP-OCT-4098', 'AT-2024-177', 'Tanvi Kulkarni', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', 'Java Spring Boot', 'UPI / PhonePe', 7000, 'Yesterday, 05:40 PM', 'Verified & Paid', 'Installment 3 of 4', 'PhonePe confirmation ID #88741')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.labs (id, name, faculty, timing, capacity, occupied, occupancy_pct, status, status_color, bar_color)
VALUES
('Lab 01', 'MERN Full Stack', 'Amit Verma', '10:00 AM - 12:00 PM', 20, 19, 95, 'In Progress', 'bg-emerald-500', 'bg-blue-600'),
('Lab 02', 'Tally Prime & GST', 'Neha Gupta', '10:00 AM - 11:30 AM', 20, 18, 90, 'In Progress', 'bg-emerald-500', 'bg-teal-600'),
('Lab 03', 'Java Full Stack B3', 'S. K. Roy', '11:30 AM - 01:30 PM', 20, 20, 100, 'Starts 11:30 AM', 'bg-amber-500', 'bg-indigo-600'),
('Lab 04', 'CCC Foundation & Office', 'Priya Das', '09:30 AM - 11:00 AM', 20, 17, 85, 'In Progress', 'bg-emerald-500', 'bg-slate-600')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.faculty (id, name, role, subject, punch_time, status, salary, honorarium, disbursed, avatar, assigned_batches, pr_reviews_count)
VALUES
('FAC-001', 'Amit Verma', 'Lead Full Stack Instructor', 'React & Node.js', '09:15 AM', 'Present', 55000, 12000, true, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', ARRAY['MERN-B1', 'MERN-B2'], 14),
('FAC-002', 'Neha Gupta', 'Senior Accounting Trainer', 'Tally Prime & Taxation', '09:30 AM', 'Present', 48000, 8000, false, 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', ARRAY['Tally-B1', 'Tally-B2'], 8),
('FAC-003', 'S. K. Roy', 'Java & Enterprise Architect', 'Java & Spring Boot', '09:20 AM', 'Present', 62000, 15000, true, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', ARRAY['Java-B1', 'Java-B3'], 19),
('FAC-004', 'Priya Das', 'Office Automation Instructor', 'Excel & CCC', '--:--', 'On Leave', 35000, 5000, false, 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80', ARRAY['CCC-B1'], 5)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.expenses (id, category, description, vendor, amount, date, status, mode)
VALUES
('EXP-OCT-091', 'Infrastructure', 'Lab 01 & 02 PC Workstation Electricity Bill', 'CESC Power Supply', 24500, 'Oct 18, 2024', 'Approved & Paid', 'Corporate NetBanking'),
('EXP-OCT-088', 'Software Licenses', 'JetBrains & Tally Prime Multi-User Enterprise Licenses', 'Tally Solutions India', 35000, 'Oct 14, 2024', 'Approved & Paid', 'Credit Card'),
('EXP-OCT-072', 'Network & Fiber', 'High-Speed Dual Fiber Leased Line (500 Mbps)', 'Airtel Business', 12000, 'Oct 10, 2024', 'Approved & Paid', 'Auto Debit'),
('EXP-OCT-065', 'Office Supplies', 'Whiteboard Markers, Certificate Paper & Printing Ink', 'Metro Office Depot', 8500, 'Oct 05, 2024', 'Approved & Paid', 'Cash Voucher')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.notices (id, title, date, category, priority, body)
VALUES
('NOT-101', 'Diwali Session Schedule & Lab Maintenance', 'Oct 24, 2024', 'Academic', 'High', 'All evening batches (04:00 PM onwards) will undergo practical project reviews in Lab 1 & 2.'),
('NOT-102', 'Quarterly Fee Installment Clearance Notice', 'Oct 20, 2024', 'Finance', 'Urgent', 'Students with pending dues above ₹5,000 are requested to settle via UPI/Cash desk to avoid exam admit card lock.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.assignments (id, title, course, due_date, submissions, total, status)
VALUES
('ASM-101', 'E-Commerce REST API with JWT Auth', 'MERN Full Stack', 'Oct 28, 2024', 18, 20, 'Active'),
('ASM-102', 'GST Return Filing & Ledger Reconciliation', 'Tally Prime + GST', 'Oct 25, 2024', 16, 18, 'Active'),
('ASM-103', 'Spring Security & Microservices Architecture', 'Java Spring Boot', 'Nov 02, 2024', 12, 20, 'Upcoming')
ON CONFLICT (id) DO NOTHING;
