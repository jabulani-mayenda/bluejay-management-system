-- ============================================================
-- BLUEJAY SCHOOL MANAGEMENT SYSTEM - Database Schema
-- Run this entire file in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── PROFILES (all users) ────────────────────────────────────
CREATE TABLE profiles (
  id           UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name    TEXT NOT NULL,
  email        TEXT NOT NULL UNIQUE,
  role         TEXT NOT NULL CHECK (role IN ('system_admin','admin','head_teacher','teacher','parent')),
  phone        TEXT,
  photo_url    TEXT,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active','pending','rejected','inactive')),
  approved_by  UUID REFERENCES profiles(id),
  created_by   UUID REFERENCES profiles(id),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── CLASSES ─────────────────────────────────────────────────
CREATE TABLE classes (
  id                UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name              TEXT NOT NULL,
  section           TEXT DEFAULT 'A',
  academic_year     TEXT DEFAULT '2024/2025',
  class_teacher_id  UUID REFERENCES profiles(id),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─── STUDENTS ────────────────────────────────────────────────
CREATE TABLE students (
  id                TEXT PRIMARY KEY,   -- e.g. BJ-2024-001
  full_name         TEXT NOT NULL,
  gender            TEXT,
  date_of_birth     DATE,
  class_id          UUID REFERENCES classes(id),
  section           TEXT,
  admission_date    DATE DEFAULT CURRENT_DATE,
  parent_name       TEXT,
  parent_phone      TEXT,
  parent_email      TEXT,
  parent_occupation TEXT,
  photo_url         TEXT,
  fees_total        NUMERIC(12,2) DEFAULT 0,
  fees_paid         NUMERIC(12,2) DEFAULT 0,
  status            TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active','pending','rejected','inactive')),
  approved_by       UUID REFERENCES profiles(id),
  created_by        UUID REFERENCES profiles(id),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─── SUBJECTS ────────────────────────────────────────────────
CREATE TABLE subjects (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name        TEXT NOT NULL,
  code        TEXT,
  class_id    UUID REFERENCES classes(id),
  teacher_id  UUID REFERENCES profiles(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── RESULTS / GRADES ────────────────────────────────────────
CREATE TABLE results (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id    TEXT REFERENCES students(id) ON DELETE CASCADE,
  subject_id    UUID REFERENCES subjects(id),
  marks         NUMERIC(6,2),
  max_marks     NUMERIC(6,2) DEFAULT 100,
  grade_letter  TEXT,
  term          TEXT DEFAULT 'Term 1',
  academic_year TEXT DEFAULT '2024/2025',
  comments      TEXT,
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  entered_by    UUID REFERENCES profiles(id),
  approved_by   UUID REFERENCES profiles(id),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, subject_id, term, academic_year)
);

-- ─── ATTENDANCE ───────────────────────────────────────────────
CREATE TABLE attendance (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id  TEXT REFERENCES students(id) ON DELETE CASCADE,
  class_id    UUID REFERENCES classes(id),
  date        DATE NOT NULL,
  status      TEXT NOT NULL CHECK (status IN ('present','absent','late','excused')),
  marked_by   UUID REFERENCES profiles(id),
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, date)
);

-- ─── FEE PAYMENTS ────────────────────────────────────────────
CREATE TABLE fee_payments (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id      TEXT REFERENCES students(id) ON DELETE CASCADE,
  amount          NUMERIC(12,2) NOT NULL,
  payment_date    DATE DEFAULT CURRENT_DATE,
  payment_method  TEXT DEFAULT 'Cash',
  receipt_number  TEXT,
  notes           TEXT,
  recorded_by     UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── EXPENSES / PURCHASE REQUESTS ────────────────────────────
CREATE TABLE expenses (
  id                UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title             TEXT NOT NULL,
  expense_type      TEXT,
  amount            NUMERIC(12,2) NOT NULL,
  description       TEXT,
  status            TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  submitted_by      UUID REFERENCES profiles(id),
  approved_by       UUID REFERENCES profiles(id),
  approval_date     TIMESTAMPTZ,
  rejection_reason  TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─── NOTICES ─────────────────────────────────────────────────
CREATE TABLE notices (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title       TEXT NOT NULL,
  content     TEXT,
  visible_to  TEXT DEFAULT 'all',
  posted_by   UUID REFERENCES profiles(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── TIMETABLE ───────────────────────────────────────────────
CREATE TABLE timetable (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  class_id    UUID REFERENCES classes(id),
  subject_id  UUID REFERENCES subjects(id),
  teacher_id  UUID REFERENCES profiles(id),
  day_of_week TEXT CHECK (day_of_week IN ('Monday','Tuesday','Wednesday','Thursday','Friday')),
  start_time  TIME,
  end_time    TIME,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── PARENT ↔ STUDENT LINK ───────────────────────────────────
CREATE TABLE parent_students (
  parent_id     UUID REFERENCES profiles(id),
  student_id    TEXT REFERENCES students(id),
  relationship  TEXT DEFAULT 'parent',
  PRIMARY KEY (parent_id, student_id)
);

-- ─── LIBRARY ─────────────────────────────────────────────────
CREATE TABLE library_books (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title         TEXT NOT NULL,
  author        TEXT,
  isbn          TEXT,
  quantity      INT DEFAULT 1,
  available     INT DEFAULT 1,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE library_loans (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  book_id     UUID REFERENCES library_books(id),
  borrower_id TEXT,
  borrow_type TEXT DEFAULT 'student',
  issue_date  DATE DEFAULT CURRENT_DATE,
  due_date    DATE,
  return_date DATE,
  status      TEXT DEFAULT 'borrowed' CHECK (status IN ('borrowed','returned','overdue')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── DISCIPLINARY RECORDS ────────────────────────────────────
CREATE TABLE disciplinary_records (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id  TEXT REFERENCES students(id) ON DELETE CASCADE,
  incident    TEXT NOT NULL,
  details     TEXT,
  severity    TEXT DEFAULT 'minor' CHECK (severity IN ('minor','moderate','serious')),
  action_taken TEXT,
  reported_by UUID REFERENCES profiles(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ACTIVITY LOG ────────────────────────────────────────────
CREATE TABLE activity_log (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id    UUID REFERENCES profiles(id),
  action     TEXT NOT NULL,
  entity     TEXT,
  entity_id  TEXT,
  details    TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── EXAM SCHEDULE ───────────────────────────────────────────
CREATE TABLE exam_schedule (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  subject_id  UUID REFERENCES subjects(id),
  class_id    UUID REFERENCES classes(id),
  exam_date   DATE NOT NULL,
  start_time  TIME,
  end_time    TIME,
  venue       TEXT,
  term        TEXT DEFAULT 'Term 1',
  created_by  UUID REFERENCES profiles(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── STAFF SALARIES ──────────────────────────────────────────
CREATE TABLE staff_salaries (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  staff_id        UUID REFERENCES profiles(id),
  month           TEXT NOT NULL,
  year            INT NOT NULL,
  gross_salary    NUMERIC(12,2),
  deductions      NUMERIC(12,2) DEFAULT 0,
  net_salary      NUMERIC(12,2),
  payment_status  TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('paid','unpaid')),
  paid_date       DATE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- ENABLE ROW LEVEL SECURITY (run in dashboard after setup)
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- For quick start, use permissive policies or disable RLS
-- ────────────────────────────────────────────────────────────

-- ─── DEFAULT SYSTEM ADMIN ACCOUNT ───────────────────────────
-- STEP: After running this SQL:
-- 1. Go to Supabase → Authentication → Users → Add User
-- 2. Email: sysadmin@bluejay.edu | Password: Admin@1234!
-- 3. Copy the UUID from the user, run the INSERT below with that UUID:
-- INSERT INTO profiles (id, full_name, email, role, status)
-- VALUES ('<YOUR-UUID-HERE>', 'System Administrator', 'sysadmin@bluejay.edu', 'system_admin', 'active');
