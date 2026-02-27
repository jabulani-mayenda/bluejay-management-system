/* ============================================================
   BLUEJAY SCHOOL MANAGEMENT SYSTEM — Shared JS
   Auth helpers, sidebar renderer, utilities
   ============================================================ */
'use strict';

// ── SUPABASE CLIENT ──────────────────────────────────────────
const { createClient } = supabase;
const db = createClient(window.SUPABASE_URL, window.SUPABASE_ANON);

// ── CONSTANTS ────────────────────────────────────────────────
const ROLE_DASHBOARDS = {
    system_admin: '../../pages/system-admin/dashboard.html',
    admin: '../../pages/admin/dashboard.html',
    head_teacher: '../../pages/headteacher/dashboard.html',
    teacher: '../../pages/teacher/dashboard.html',
    parent: '../../pages/parent/dashboard.html',
};
const ROLE_LABELS = {
    system_admin: 'System Admin',
    admin: 'Admin',
    head_teacher: 'Head Teacher',
    teacher: 'Teacher',
    parent: 'Parent',
};
const ROLE_COLORS = {
    system_admin: '#7c3aed',
    admin: '#2563eb',
    head_teacher: '#059669',
    teacher: '#d97706',
    parent: '#dc2626',
};

// ── SIDEBAR CONFIG PER ROLE ──────────────────────────────────
const SIDEBAR_LINKS = {
    system_admin: [
        { icon: 'dashboard', label: 'Dashboard', href: 'dashboard.html' },
        { icon: 'check_circle', label: 'Approvals', href: 'approvals.html', badge: 'pending_count' },
        { icon: 'people', label: 'Users', href: 'users.html' },
        { icon: 'account_balance', label: 'Finance', href: 'finance.html' },
        { icon: 'description', label: 'Reports', href: 'reports.html' },
        { hr: true },
        { icon: 'campaign', label: 'Notice Board', href: '../../shared/noticeboard.html' },
        { icon: 'timeline', label: 'Activity Log', href: 'activity.html' },
        { icon: 'payments', label: 'Staff Salaries', href: 'salaries.html' },
        { icon: 'settings', label: 'Settings', href: 'settings.html' },
    ],
    admin: [
        { icon: 'dashboard', label: 'Dashboard', href: 'dashboard.html' },
        { icon: 'school', label: 'Students', href: 'students.html' },
        { icon: 'payments', label: 'Fees', href: 'fees.html' },
        { icon: 'shopping_cart', label: 'Expenses', href: 'expenses.html' },
        { hr: true },
        { icon: 'campaign', label: 'Notice Board', href: '../../shared/noticeboard.html' },
        { icon: 'description', label: 'Reports', href: 'reports.html' },
    ],
    head_teacher: [
        { icon: 'dashboard', label: 'Dashboard', href: 'dashboard.html' },
        { icon: 'class', label: 'Classes', href: 'classes.html' },
        { icon: 'menu_book', label: 'Subjects', href: 'subjects.html' },
        { icon: 'people', label: 'Teachers', href: 'teachers.html' },
        { icon: 'grade', label: 'Results', href: 'results.html' },
        { icon: 'event', label: 'Exam Schedule', href: 'exams.html' },
        { icon: 'calendar_month', label: 'Timetable', href: 'timetable.html' },
        { hr: true },
        { icon: 'campaign', label: 'Notice Board', href: '../../shared/noticeboard.html' },
        { icon: 'trending_up', label: 'Analytics', href: 'analytics.html' },
        { icon: 'local_library', label: 'Library', href: 'library.html' },
        { icon: 'description', label: 'Reports', href: 'reports.html' },
    ],
    teacher: [
        { icon: 'dashboard', label: 'Dashboard', href: 'dashboard.html' },
        { icon: 'fact_check', label: 'Attendance', href: 'attendance.html' },
        { icon: 'grade', label: 'Enter Marks', href: 'grades.html' },
        { icon: 'schedule', label: 'Timetable', href: 'timetable.html' },
        { icon: 'warning', label: 'Discipline', href: 'discipline.html' },
        { hr: true },
        { icon: 'campaign', label: 'Notice Board', href: '../../shared/noticeboard.html' },
    ],
    parent: [
        { icon: 'dashboard', label: 'Dashboard', href: 'dashboard.html' },
        { icon: 'payments', label: 'Fees', href: 'fees.html' },
        { icon: 'grade', label: 'Results', href: 'results.html' },
        { icon: 'fact_check', label: 'Attendance', href: 'attendance.html' },
        { hr: true },
        { icon: 'campaign', label: 'Notice Board', href: '../../shared/noticeboard.html' },
    ],
};

// ── AUTH ─────────────────────────────────────────────────────
window._currentUser = null;
window._currentProfile = null;

async function checkAuth(allowedRoles = []) {
    const { data: { user } } = await db.auth.getUser();
    if (!user) { goLogin(); return null; }

    const { data: profile, error } = await db.from('profiles').select('*').eq('id', user.id).single();
    if (error || !profile) { goLogin(); return null; }
    if (profile.status !== 'active') { goLogin(); return null; }
    if (allowedRoles.length && !allowedRoles.includes(profile.role)) {
        const dash = ROLE_DASHBOARDS[profile.role];
        window.location.href = dash || '../../index.html';
        return null;
    }
    window._currentUser = user;
    window._currentProfile = profile;
    return { user, profile };
}

function goLogin() { window.location.href = getRootPath() + 'index.html'; }

function getRootPath() {
    // Determine how many folders deep we are relative to the root 'index.html'
    // This works for both http://localhost and file:/// paths
    const path = window.location.pathname;
    const isRoot = path.endsWith('/index.html') || path.endsWith('bluejay school -managment system/') || (!path.includes('.html') && !path.includes('/pages/') && !path.includes('/shared/'));
    if (isRoot) return './';

    // If we are inside /pages/role/... or /shared/... we are 2 levels deep
    if (path.includes('/pages/') || path.includes('/shared/')) {
        return '../../';
    }
    return './';
}

async function signOut() {
    await db.auth.signOut();
    window.location.replace(getRootPath() + 'index.html');
}

// ── SIDEBAR RENDERER ─────────────────────────────────────────
function renderSidebar(role, activePage) {
    const links = SIDEBAR_LINKS[role] || [];
    const label = ROLE_LABELS[role] || role;
    const color = ROLE_COLORS[role] || '#2563eb';
    const p = window._currentProfile || {};
    const avi = (p.full_name || 'U').split(' ').slice(0, 2).map(n => n[0]).join('');

    const navHTML = links.map(l => {
        if (l.hr) return '<div style="margin:10px 0;border-top:1px solid rgba(255,255,255,.07)"></div>';
        const isActive = l.href && (window.location.pathname.endsWith(l.href) || window.location.href.includes(l.href));
        return `<a href="${l.href}" class="sb-link ${isActive ? 'active' : ''}" onclick="closeMobileSB()">
      <span class="material-icons-round">${l.icon}</span>
      <span class="nav-label">${l.label}</span>
    </a>`;
    }).join('');

    return `
    <div class="sb-backdrop" id="sb-backdrop" onclick="closeMobileSB()"></div>
    <aside class="sidebar" id="sidebar">
      <div class="sb-header">
        <div class="sb-logo">B</div>
        <div style="flex:1">
          <div class="sb-brand">Bluejay School</div>
          <div class="sb-role-tag" style="color:${color}">${label}</div>
        </div>
        <button onclick="closeMobileSB()" style="background:none;border:none;cursor:pointer;color:rgba(255,255,255,.5);display:none" id="sb-close"><span class="material-icons-round">close</span></button>
      </div>
      <nav class="sb-nav">${navHTML}</nav>
      <div class="sb-footer">
        <div class="sb-user" onclick="signOut()">
          <div class="sb-avatar">${avi}</div>
          <div style="flex:1;min-width:0">
            <div class="sb-user-name">${p.full_name || 'User'}</div>
            <div class="sb-user-role">${label}</div>
          </div>
          <span class="material-icons-round sb-signout" title="Sign out">logout</span>
        </div>
      </div>
    </aside>`;
}

// Mobile sidebar toggle
function openMobileSB() { document.getElementById('sidebar')?.classList.add('open'); document.getElementById('sb-backdrop')?.classList.add('show'); document.getElementById('sb-close')?.style && (document.getElementById('sb-close').style.display = 'block'); }
function closeMobileSB() { document.getElementById('sidebar')?.classList.remove('open'); document.getElementById('sb-backdrop')?.classList.remove('show'); }
window.openMobileSB = openMobileSB;
window.closeMobileSB = closeMobileSB;

async function initApp(allowedRoles = []) {
    // Inject mobile.css dynamically
    if (!document.querySelector('link[href*="mobile.css"]')) {
        const root = getRootPath();
        const lnk = document.createElement('link');
        lnk.rel = 'stylesheet'; lnk.href = root + 'assets/css/mobile.css';
        document.head.appendChild(lnk);
    }
    const result = await checkAuth(allowedRoles);
    if (!result) return null;
    const { profile } = result;
    const sidebar = document.getElementById('sidebar-placeholder');
    if (sidebar) sidebar.outerHTML = renderSidebar(profile.role);
    // Inject hamburger into topbar if on mobile
    const topbarLeft = document.querySelector('.topbar-left');
    if (topbarLeft && !document.getElementById('hamburger-btn')) {
        const hb = document.createElement('button');
        hb.id = 'hamburger-btn'; hb.className = 'hamburger';
        hb.innerHTML = '<span class="material-icons-round">menu</span>';
        hb.onclick = openMobileSB;
        topbarLeft.prepend(hb);
    }
    const tbUser = document.getElementById('tb-username');
    if (tbUser) tbUser.textContent = profile.full_name;
    return result;
}

// ── UTILITIES ────────────────────────────────────────────────
function formatMoney(n) {
    return 'K ' + parseFloat(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function formatDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
function timeAgo(d) {
    if (!d) return '';
    const s = Math.floor((Date.now() - new Date(d)) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return Math.floor(s / 60) + 'm ago';
    if (s < 86400) return Math.floor(s / 3600) + 'h ago';
    return Math.floor(s / 86400) + 'd ago';
}
function getGrade(marks, max = 100) {
    const p = (marks / max) * 100;
    if (p >= 90) return { l: 'A+', c: 'success' };
    if (p >= 80) return { l: 'A', c: 'success' };
    if (p >= 70) return { l: 'B', c: 'info' };
    if (p >= 60) return { l: 'C', c: 'warning' };
    if (p >= 50) return { l: 'D', c: 'warning' };
    return { l: 'F', c: 'danger' };
}
function feeStatus(paid, total) {
    if (!total || total == 0) return '<span class="badge badge-neutral">No Fees</span>';
    const pct = (paid / total) * 100;
    if (pct >= 100) return '<span class="badge badge-success"><span class="material-icons-round" style="font-size:13px;vertical-align:middle">check_circle</span> Paid</span>';
    if (pct > 0) return '<span class="badge badge-warning"><span class="material-icons-round" style="font-size:13px;vertical-align:middle">timelapse</span> Partial</span>';
    return '<span class="badge badge-danger"><span class="material-icons-round" style="font-size:13px;vertical-align:middle">cancel</span> Unpaid</span>';
}
function genAdmissionNo() {
    return 'BJ-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 9000) + 1000);
}
function initials(name) {
    return (name || 'U').split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

// ── TOASTS ───────────────────────────────────────────────────
let _toastWrap;
function getToastWrap() {
    if (!_toastWrap) {
        _toastWrap = document.createElement('div');
        _toastWrap.className = 'toast-wrap';
        document.body.appendChild(_toastWrap);
    }
    return _toastWrap;
}
function showToast(msg, type = 'success', duration = 3500) {
    const icons = { success: 'check_circle', error: 'error', info: 'info', warning: 'warning' };
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `<span class="material-icons-round">${icons[type] || 'info'}</span>
    <span class="toast-msg">${msg}</span>
    <button class="toast-close material-icons-round" onclick="this.parentElement.remove()">close</button>`;
    getToastWrap().appendChild(el);
    setTimeout(() => el.remove(), duration);
}

// ── MODALS ───────────────────────────────────────────────────
function openModal(id) { const el = document.getElementById(id); if (el) { el.classList.add('open'); el.style.display = 'flex'; } }
function closeModal(id) { const el = document.getElementById(id); if (el) { el.classList.remove('open'); el.style.display = ''; } }

// Close modal on overlay click
document.addEventListener('click', e => {
    if (e.target.classList.contains('overlay')) {
        e.target.classList.remove('open');
        e.target.style.display = '';
    }
});

// ── CSV EXPORT ───────────────────────────────────────────────
function exportCSV(rows, filename, headers) {
    const hdr = headers.join(',');
    const body = rows.map(r => headers.map(h => {
        const v = String(r[h.toLowerCase().replace(/ /g, '_')] ?? '').replace(/"/g, '""');
        return `"${v}"`;
    }).join(',')).join('\n');
    const blob = new Blob([hdr + '\n' + body], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), { href: url, download: filename });
    a.click(); URL.revokeObjectURL(url);
}

// ── PRINT REPORT ─────────────────────────────────────────────
function printReport() { window.print(); }

// ── ACTIVITY LOGGER ──────────────────────────────────────────
async function logActivity(action, entity, entityId, details) {
    try {
        const uid = window._currentProfile?.id;
        if (!uid) return;
        await db.from('activity_log').insert({ user_id: uid, action, entity, entity_id: entityId, details });
    } catch (_) { }
}

// ── CONFIRMATION DIALOG ──────────────────────────────────────
function confirmAction(msg, onConfirm) {
    const div = document.createElement('div');
    div.className = 'overlay open';
    div.style.zIndex = '9999';
    div.innerHTML = `
    <div class="modal" style="max-width:400px">
      <div class="modal-header">
        <span class="material-icons-round" style="color:var(--danger);font-size:22px">warning</span>
        <div class="modal-title">Confirm Action</div>
      </div>
      <div class="modal-body"><p style="font-size:14px;color:var(--text-2)">${msg}</p></div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="this.closest('.overlay').remove()">Cancel</button>
        <button class="btn btn-danger" id="conf-yes">Yes, Proceed</button>
      </div>
    </div>`;
    document.body.appendChild(div);
    div.querySelector('#conf-yes').addEventListener('click', () => { div.remove(); onConfirm(); });
}

// Expose globally
window.db = db;
window.initApp = initApp;
window.signOut = signOut;
window.showToast = showToast;
window.openModal = openModal;
window.closeModal = closeModal;
window.formatMoney = formatMoney;
window.formatDate = formatDate;
window.timeAgo = timeAgo;
window.getGrade = getGrade;
window.feeStatus = feeStatus;
window.genAdmissionNo = genAdmissionNo;
window.initials = initials;
window.exportCSV = exportCSV;
window.printReport = printReport;
window.logActivity = logActivity;
window.confirmAction = confirmAction;
window.ROLE_LABELS = ROLE_LABELS;
window.ROLE_COLORS = ROLE_COLORS;
