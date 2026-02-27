# 🏫 Bluejay School Management System — Setup Guide

## Step 1: Create Supabase Project (FREE)

1. Go to **https://supabase.com** → Sign Up (free)
2. Click **"New Project"**
3. Name it `bluejay-school`, choose a strong password, pick nearest region
4. Wait ~2 minutes for project to be created

---

## Step 2: Set Up the Database

1. In your Supabase project, click **"SQL Editor"** in the left sidebar
2. Click **"New Query"**
3. Open the file `supabase-setup.sql` (in this folder)
4. Copy ALL the contents and paste into the SQL editor
5. Click **"RUN"**
6. You should see "Success. No rows returned"

---

## Step 3: Create Your System Admin Account

1. In Supabase, go to **Authentication → Users → Add User**
2. Enter:
   - Email: `sysadmin@bluejay.edu`
   - Password: `Admin@1234!`
3. Click the user you just created, copy the **UUID** (looks like: `abc123-...`)
4. Go back to SQL Editor, click "New Query", and run:
```sql
INSERT INTO profiles (id, full_name, email, role, status)
VALUES ('PASTE-YOUR-UUID-HERE', 'System Administrator', 'sysadmin@bluejay.edu', 'system_admin', 'active');
```

---

## Step 4: Add Your API Keys to config.js

1. In Supabase, go to **Settings → API**
2. Copy:
   - **Project URL** (looks like `https://abcdef.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)
3. Open `config.js` in this folder and paste both values

---

## Step 5: Open the System

- Open `index.html` in your browser (double-click it)
- Login with `sysadmin@bluejay.edu` / `Admin@1234!`
- You're in! 🎉

---

## Default Login Credentials (Initial Admin Account)

| Role | Email | Password |
|------|-------|----------|
| System Admin | sysadmin@bluejay.edu | Admin@1234! |

> All other accounts (Admin, Head Teacher, Teacher, Parent) are created through the System Admin dashboard.

---

## Need Help?

- Supabase Docs: https://supabase.com/docs
- Free tier includes 500MB database + unlimited users
