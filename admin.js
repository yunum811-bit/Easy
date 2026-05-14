// ============================================================
// Authentication
// ============================================================
// เปลี่ยนรหัสผ่านได้ที่นี่ (ในระบบจริงควรใช้ backend + hash)
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin1234'
};

const loginScreen = document.getElementById('loginScreen');
const sidebarEl = document.getElementById('sidebar');
const mainContent = document.getElementById('mainContent');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');

function isLoggedIn() {
    return sessionStorage.getItem('accpro_admin_logged_in') === 'true';
}

function showAdmin() {
    loginScreen.style.display = 'none';
    sidebarEl.style.display = 'flex';
    mainContent.style.display = 'block';
}

function showLogin() {
    loginScreen.style.display = 'flex';
    sidebarEl.style.display = 'none';
    mainContent.style.display = 'none';
}

function logout() {
    sessionStorage.removeItem('accpro_admin_logged_in');
    showLogin();
}

// Check session on load
if (isLoggedIn()) {
    showAdmin();
}

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        sessionStorage.setItem('accpro_admin_logged_in', 'true');
        loginError.style.display = 'none';
        showAdmin();
    } else {
        loginError.style.display = 'block';
    }
});

// Service label mapping
const serviceLabels = {
    monthly: 'ทำบัญชีรายเดือน',
    tax: 'ยื่นภาษี',
    closing: 'ปิดงบการเงิน',
    audit: 'ตรวจสอบบัญชี',
    register: 'จดทะเบียนบริษัท',
    system: 'วางระบบบัญชี',
    other: 'อื่นๆ'
};

// Status label mapping
const statusLabels = {
    pending: 'รอดำเนินการ',
    'in-progress': 'กำลังดำเนินการ',
    completed: 'เสร็จสิ้น',
    cancelled: 'ยกเลิก'
};

// Initialize requests from localStorage
function getRequests() {
    const data = localStorage.getItem('accpro_requests');
    return data ? JSON.parse(data) : [];
}

function saveRequests(requests) {
    localStorage.setItem('accpro_requests', JSON.stringify(requests));
}

// Page Navigation
const navItems = document.querySelectorAll('.nav-item[data-page]');
const pages = document.querySelectorAll('.page');
const pageTitle = document.getElementById('pageTitle');

const pageTitles = {
    dashboard: 'แดชบอร์ด',
    requests: 'คำขอใช้บริการ',
    completed: 'ดำเนินการแล้ว',
    settings: 'ตั้งค่าข้อมูลติดต่อ',
    content: 'จัดการเนื้อหาเว็บ'
};

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const page = item.dataset.page;

        navItems.forEach(n => n.classList.remove('active'));
        item.classList.add('active');

        pages.forEach(p => p.classList.remove('active'));
        document.getElementById(`page-${page}`).classList.add('active');

        pageTitle.textContent = pageTitles[page] || '';
        renderAll();
    });
});

// Sidebar toggle (mobile)
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.getElementById('sidebar');

sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
});

// Filter
const filterService = document.getElementById('filterService');
filterService.addEventListener('change', () => {
    renderRequestsTable();
});

// Render functions
function renderAll() {
    renderStats();
    renderRecentTable();
    renderRequestsTable();
    renderCompletedTable();
    updatePendingCount();
}

function renderStats() {
    const requests = getRequests();
    document.getElementById('statTotal').textContent = requests.length;
    document.getElementById('statPending').textContent = requests.filter(r => r.status === 'pending').length;
    document.getElementById('statInProgress').textContent = requests.filter(r => r.status === 'in-progress').length;
    document.getElementById('statCompleted').textContent = requests.filter(r => r.status === 'completed').length;
}

function updatePendingCount() {
    const requests = getRequests();
    const pending = requests.filter(r => r.status === 'pending').length;
    document.getElementById('pendingCount').textContent = pending;
}

function renderRecentTable() {
    const requests = getRequests();
    const recent = requests.slice(-5).reverse();
    const tbody = document.getElementById('recentTableBody');

    if (recent.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-light);padding:40px;">ยังไม่มีคำขอ</td></tr>';
        return;
    }

    tbody.innerHTML = recent.map(req => `
        <tr>
            <td>${formatDate(req.date)}</td>
            <td>${escapeHtml(req.name)}</td>
            <td>${serviceLabels[req.service] || req.service}</td>
            <td><span class="status-badge status-${req.status}">${statusLabels[req.status]}</span></td>
            <td>
                <button class="action-btn btn-view" onclick="viewDetail('${req.id}')">ดูรายละเอียด</button>
            </td>
        </tr>
    `).join('');
}

function renderRequestsTable() {
    const requests = getRequests();
    const filterValue = filterService.value;
    let filtered = requests.filter(r => r.status === 'pending' || r.status === 'in-progress');

    if (filterValue) {
        filtered = filtered.filter(r => r.service === filterValue);
    }

    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    const tbody = document.getElementById('requestsTableBody');
    const emptyState = document.getElementById('emptyRequests');

    if (filtered.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    tbody.innerHTML = filtered.map(req => `
        <tr>
            <td>${formatDate(req.date)}</td>
            <td>${escapeHtml(req.name)}</td>
            <td>${escapeHtml(req.phone)}</td>
            <td>${escapeHtml(req.email)}</td>
            <td>${serviceLabels[req.service] || req.service}</td>
            <td><span class="status-badge status-${req.status}">${statusLabels[req.status]}</span></td>
            <td>
                <button class="action-btn btn-view" onclick="viewDetail('${req.id}')">ดู</button>
                <button class="action-btn btn-reply" onclick="openReplyModal('${req.id}')">✉️</button>
                ${req.status === 'pending' ? `<button class="action-btn btn-progress" onclick="updateStatus('${req.id}', 'in-progress')">รับงาน</button>` : ''}
                ${req.status === 'in-progress' ? `<button class="action-btn btn-complete" onclick="updateStatus('${req.id}', 'completed')">เสร็จสิ้น</button>` : ''}
                <button class="action-btn btn-cancel" onclick="updateStatus('${req.id}', 'cancelled')">ยกเลิก</button>
            </td>
        </tr>
    `).join('');
}

function renderCompletedTable() {
    const requests = getRequests();
    const completed = requests.filter(r => r.status === 'completed' || r.status === 'cancelled');
    completed.sort((a, b) => new Date(b.date) - new Date(a.date));

    const tbody = document.getElementById('completedTableBody');
    const emptyState = document.getElementById('emptyCompleted');

    if (completed.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    tbody.innerHTML = completed.map(req => `
        <tr>
            <td>${formatDate(req.date)}</td>
            <td>${escapeHtml(req.name)}</td>
            <td>${escapeHtml(req.phone)}</td>
            <td>${escapeHtml(req.email)}</td>
            <td>${serviceLabels[req.service] || req.service}</td>
            <td><span class="status-badge status-${req.status}">${statusLabels[req.status]}</span></td>
        </tr>
    `).join('');
}

// Update status
function updateStatus(id, newStatus) {
    const requests = getRequests();
    const index = requests.findIndex(r => r.id === id);
    if (index !== -1) {
        requests[index].status = newStatus;
        if (newStatus === 'completed' || newStatus === 'cancelled') {
            requests[index].completedDate = new Date().toISOString();
        }
        saveRequests(requests);
        renderAll();
        closeModal();
    }
}

// ============================================================
// EmailJS Configuration
// ============================================================
// วิธีตั้งค่า EmailJS (ฟรี 200 อีเมล/เดือน):
// 1. สมัครที่ https://www.emailjs.com/
// 2. สร้าง Email Service (เชื่อมกับ Gmail/Outlook)
// 3. สร้าง Email Template ใส่ตัวแปร:
//    - {{to_name}} = ชื่อลูกค้า
//    - {{to_email}} = อีเมลลูกค้า
//    - {{subject}} = หัวข้อ
//    - {{message}} = ข้อความตอบกลับ
//    - {{service_type}} = ประเภทบริการ
// 4. ใส่ค่า Public Key, Service ID, Template ID ด้านล่าง
// ============================================================

const EMAILJS_CONFIG = {
    publicKey: 'YOUR_PUBLIC_KEY',       // ← ใส่ Public Key จาก EmailJS
    serviceId: 'YOUR_SERVICE_ID',       // ← ใส่ Service ID
    templateId: 'YOUR_TEMPLATE_ID'      // ← ใส่ Template ID
};

// Initialize EmailJS
if (typeof emailjs !== 'undefined') {
    emailjs.init(EMAILJS_CONFIG.publicKey);
}

// View detail modal
const modalOverlay = document.getElementById('modalOverlay');
const modalBody = document.getElementById('modalBody');
const modalFooter = document.getElementById('modalFooter');
const modalClose = document.getElementById('modalClose');

function viewDetail(id) {
    const requests = getRequests();
    const req = requests.find(r => r.id === id);
    if (!req) return;

    const replies = req.replies || [];
    const repliesHtml = replies.length > 0 ? `
        <div class="detail-row">
            <span class="detail-label">ตอบกลับ:</span>
            <span class="detail-value">${replies.length} ครั้ง 
                <button class="action-btn btn-view" onclick="viewHistory('${req.id}')" style="margin-left:8px;">ดูประวัติ</button>
            </span>
        </div>
    ` : '';

    modalBody.innerHTML = `
        <div class="detail-row">
            <span class="detail-label">ชื่อ:</span>
            <span class="detail-value">${escapeHtml(req.name)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">เบอร์โทร:</span>
            <span class="detail-value">${escapeHtml(req.phone)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">อีเมล:</span>
            <span class="detail-value">${escapeHtml(req.email)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">บริการ:</span>
            <span class="detail-value">${serviceLabels[req.service] || req.service}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">ข้อความ:</span>
            <span class="detail-value">${escapeHtml(req.message) || '-'}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">วันที่ส่ง:</span>
            <span class="detail-value">${formatDate(req.date)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">สถานะ:</span>
            <span class="detail-value"><span class="status-badge status-${req.status}">${statusLabels[req.status]}</span></span>
        </div>
        ${repliesHtml}
    `;

    let footerHtml = `<button class="action-btn btn-reply" onclick="openReplyModal('${req.id}')">✉️ ตอบกลับ</button>`;
    if (req.status === 'pending') {
        footerHtml += `
            <button class="action-btn btn-progress" onclick="updateStatus('${req.id}', 'in-progress')">รับงาน</button>
            <button class="action-btn btn-cancel" onclick="updateStatus('${req.id}', 'cancelled')">ยกเลิก</button>
        `;
    } else if (req.status === 'in-progress') {
        footerHtml += `
            <button class="action-btn btn-complete" onclick="updateStatus('${req.id}', 'completed')">เสร็จสิ้น</button>
            <button class="action-btn btn-cancel" onclick="updateStatus('${req.id}', 'cancelled')">ยกเลิก</button>
        `;
    }
    modalFooter.innerHTML = footerHtml;

    modalOverlay.classList.add('active');
}

function closeModal() {
    modalOverlay.classList.remove('active');
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
});

// ============================================================
// Reply Modal
// ============================================================
const replyModalOverlay = document.getElementById('replyModalOverlay');
const replyModalClose = document.getElementById('replyModalClose');
const replyForm = document.getElementById('replyForm');
const replyRecipient = document.getElementById('replyRecipient');
let currentReplyId = null;

function openReplyModal(id) {
    const requests = getRequests();
    const req = requests.find(r => r.id === id);
    if (!req) return;

    currentReplyId = id;
    replyRecipient.innerHTML = `
        <strong>ถึง:</strong> ${escapeHtml(req.name)} &lt;${escapeHtml(req.email)}&gt;<br>
        <strong>บริการ:</strong> ${serviceLabels[req.service] || req.service}
    `;

    // Pre-fill subject
    document.getElementById('replySubject').value = `ตอบกลับ: คำขอบริการ${serviceLabels[req.service] || ''} - AccPro`;
    document.getElementById('replyMessage').value = '';

    closeModal();
    replyModalOverlay.classList.add('active');
}

function closeReplyModal() {
    replyModalOverlay.classList.remove('active');
    currentReplyId = null;
}

replyModalClose.addEventListener('click', closeReplyModal);
replyModalOverlay.addEventListener('click', (e) => {
    if (e.target === replyModalOverlay) closeReplyModal();
});

// Send reply email
replyForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const requests = getRequests();
    const req = requests.find(r => r.id === currentReplyId);
    if (!req) return;

    const subject = document.getElementById('replySubject').value;
    const message = document.getElementById('replyMessage').value;
    const btnText = document.querySelector('.btn-send-text');
    const btnLoading = document.querySelector('.btn-send-loading');
    const btnSend = document.getElementById('btnSendReply');

    // Show loading state
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';
    btnSend.disabled = true;

    try {
        // Send email via EmailJS
        if (typeof emailjs !== 'undefined' && EMAILJS_CONFIG.publicKey !== 'YOUR_PUBLIC_KEY') {
            await emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, {
                to_name: req.name,
                to_email: req.email,
                subject: subject,
                message: message,
                service_type: serviceLabels[req.service] || req.service
            });
        } else {
            // Fallback: open mailto link if EmailJS not configured
            const mailtoLink = `mailto:${encodeURIComponent(req.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
            window.open(mailtoLink, '_blank');
        }

        // Save reply to request history
        const index = requests.findIndex(r => r.id === currentReplyId);
        if (index !== -1) {
            if (!requests[index].replies) {
                requests[index].replies = [];
            }
            requests[index].replies.push({
                date: new Date().toISOString(),
                subject: subject,
                message: message
            });
            saveRequests(requests);
        }

        // Show success
        showNotification('ส่งอีเมลตอบกลับเรียบร้อยแล้ว ✅');
        closeReplyModal();
        renderAll();

    } catch (error) {
        console.error('Email send error:', error);
        showNotification('เกิดข้อผิดพลาดในการส่งอีเมล ❌ กรุณาตรวจสอบการตั้งค่า EmailJS', 'error');
    } finally {
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
        btnSend.disabled = false;
    }
});

// ============================================================
// Reply History Modal
// ============================================================
const historyModalOverlay = document.getElementById('historyModalOverlay');
const historyModalClose = document.getElementById('historyModalClose');
const historyModalBody = document.getElementById('historyModalBody');

function viewHistory(id) {
    const requests = getRequests();
    const req = requests.find(r => r.id === id);
    if (!req || !req.replies || req.replies.length === 0) return;

    historyModalBody.innerHTML = req.replies.map((reply, i) => `
        <div class="reply-item">
            <div class="reply-header">
                <span class="reply-number">#${i + 1}</span>
                <span class="reply-date">${formatDate(reply.date)}</span>
            </div>
            <div class="reply-subject"><strong>หัวข้อ:</strong> ${escapeHtml(reply.subject)}</div>
            <div class="reply-body">${escapeHtml(reply.message)}</div>
        </div>
    `).join('');

    closeModal();
    historyModalOverlay.classList.add('active');
}

function closeHistoryModal() {
    historyModalOverlay.classList.remove('active');
}

historyModalClose.addEventListener('click', closeHistoryModal);
historyModalOverlay.addEventListener('click', (e) => {
    if (e.target === historyModalOverlay) closeHistoryModal();
});

// ============================================================
// Notification Toast
// ============================================================
function showNotification(message, type = 'success') {
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Utility functions
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Initial render
renderAll();

// ============================================================
// Contact Settings
// ============================================================
const defaultContactInfo = {
    address1: '123 อาคารสำนักงาน ชั้น 5',
    address2: 'ถนนสุขุมวิท แขวงคลองเตย',
    address3: 'เขตคลองเตย กรุงเทพฯ 10110',
    phone1: '02-xxx-xxxx',
    phone2: '08x-xxx-xxxx',
    email: 'info@accpro.co.th',
    hours1: '9:00 - 18:00',
    hours2: '9:00 - 12:00',
    facebook: '',
    line: '',
    instagram: ''
};

function getContactInfo() {
    const data = localStorage.getItem('accpro_contact_info');
    return data ? JSON.parse(data) : defaultContactInfo;
}

function saveContactInfo(info) {
    localStorage.setItem('accpro_contact_info', JSON.stringify(info));
}

// Load settings into form
function loadSettingsForm() {
    const info = getContactInfo();
    document.getElementById('settingAddress1').value = info.address1 || '';
    document.getElementById('settingAddress2').value = info.address2 || '';
    document.getElementById('settingAddress3').value = info.address3 || '';
    document.getElementById('settingPhone1').value = info.phone1 || '';
    document.getElementById('settingPhone2').value = info.phone2 || '';
    document.getElementById('settingEmail').value = info.email || '';
    document.getElementById('settingHours1').value = info.hours1 || '';
    document.getElementById('settingHours2').value = info.hours2 || '';
    document.getElementById('settingFacebook').value = info.facebook || '';
    document.getElementById('settingLine').value = info.line || '';
    document.getElementById('settingInstagram').value = info.instagram || '';
}

// Save settings
const contactSettingsForm = document.getElementById('contactSettingsForm');
contactSettingsForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const info = {
        address1: document.getElementById('settingAddress1').value,
        address2: document.getElementById('settingAddress2').value,
        address3: document.getElementById('settingAddress3').value,
        phone1: document.getElementById('settingPhone1').value,
        phone2: document.getElementById('settingPhone2').value,
        email: document.getElementById('settingEmail').value,
        hours1: document.getElementById('settingHours1').value,
        hours2: document.getElementById('settingHours2').value,
        facebook: document.getElementById('settingFacebook').value,
        line: document.getElementById('settingLine').value,
        instagram: document.getElementById('settingInstagram').value
    };

    saveContactInfo(info);
    showNotification('บันทึกข้อมูลติดต่อเรียบร้อยแล้ว ✅');
});

// Preview contact info
function previewContact() {
    const info = {
        address1: document.getElementById('settingAddress1').value,
        address2: document.getElementById('settingAddress2').value,
        address3: document.getElementById('settingAddress3').value,
        phone1: document.getElementById('settingPhone1').value,
        phone2: document.getElementById('settingPhone2').value,
        email: document.getElementById('settingEmail').value,
        hours1: document.getElementById('settingHours1').value,
        hours2: document.getElementById('settingHours2').value
    };

    const previewCard = document.getElementById('previewCard');
    const previewContent = document.getElementById('previewContent');

    previewContent.innerHTML = `
        <div class="preview-item">
            <span class="preview-icon">📍</span>
            <div>
                <strong>ที่อยู่</strong><br>
                ${escapeHtml(info.address1)}<br>
                ${escapeHtml(info.address2)}<br>
                ${escapeHtml(info.address3)}
            </div>
        </div>
        <div class="preview-item">
            <span class="preview-icon">📞</span>
            <div>
                <strong>โทรศัพท์</strong><br>
                ${escapeHtml(info.phone1)}<br>
                ${escapeHtml(info.phone2)}
            </div>
        </div>
        <div class="preview-item">
            <span class="preview-icon">✉️</span>
            <div>
                <strong>อีเมล</strong><br>
                ${escapeHtml(info.email)}
            </div>
        </div>
        <div class="preview-item">
            <span class="preview-icon">⏰</span>
            <div>
                <strong>เวลาทำการ</strong><br>
                จันทร์ - ศุกร์: ${escapeHtml(info.hours1)}<br>
                เสาร์: ${escapeHtml(info.hours2)}
            </div>
        </div>
    `;

    previewCard.style.display = 'block';
}

// Load settings on page load
loadSettingsForm();

// ============================================================
// Content Management
// ============================================================

// Default content data
const defaultContent = {
    hero: {
        title: 'บริการรับทำบัญชี\nครบวงจร มืออาชีพ',
        subtitle: 'ดูแลงานบัญชีของคุณอย่างมืออาชีพ ถูกต้องตามกฎหมาย\nให้คุณมีเวลาโฟกัสกับการเติบโตของธุรกิจ',
        stat1Num: '500+', stat1Label: 'ลูกค้าที่ไว้วางใจ',
        stat2Num: '15+', stat2Label: 'ปีประสบการณ์',
        stat3Num: '100%', stat3Label: 'ถูกต้องตามกฎหมาย'
    },
    services: {
        title: 'บริการของเรา',
        desc: 'เราให้บริการด้านบัญชีครบวงจร ตอบโจทย์ทุกความต้องการของธุรกิจคุณ',
        items: [
            { icon: '📒', name: 'ทำบัญชีรายเดือน', desc: 'บันทึกบัญชีรายรับ-รายจ่าย จัดทำงบการเงิน รายงานภาษีประจำเดือน' },
            { icon: '📋', name: 'ยื่นภาษี', desc: 'ยื่นภาษีมูลค่าเพิ่ม ภาษีหัก ณ ที่จ่าย ภาษีเงินได้นิติบุคคล ครบทุกประเภท' },
            { icon: '📑', name: 'ปิดงบการเงิน', desc: 'จัดทำงบการเงินประจำปี งบดุล งบกำไรขาดทุน พร้อมหมายเหตุประกอบงบ' },
            { icon: '🔍', name: 'ตรวจสอบบัญชี', desc: 'ตรวจสอบบัญชีโดยผู้สอบบัญชีรับอนุญาต (CPA) พร้อมรายงานผู้สอบบัญชี' },
            { icon: '🏢', name: 'จดทะเบียนบริษัท', desc: 'จดทะเบียนจัดตั้งบริษัท ห้างหุ้นส่วน จดทะเบียนภาษีมูลค่าเพิ่ม' },
            { icon: '💼', name: 'วางระบบบัญชี', desc: 'ออกแบบและวางระบบบัญชีให้เหมาะสมกับธุรกิจ พร้อมอบรมการใช้งาน' }
        ]
    },
    whyus: {
        title: 'ทำไมต้องเลือกเรา',
        desc: 'เราพร้อมดูแลงานบัญชีของคุณด้วยความเชี่ยวชาญและความใส่ใจ',
        items: [
            { name: 'ทีมงานมืออาชีพ', desc: 'นักบัญชีที่มีใบอนุญาตและประสบการณ์มากกว่า 15 ปี พร้อมอัปเดตความรู้ด้านกฎหมายภาษีอยู่เสมอ' },
            { name: 'ราคาเป็นธรรม', desc: 'ค่าบริการที่เหมาะสมกับขนาดธุรกิจ ไม่มีค่าใช้จ่ายแอบแฝง โปร่งใสทุกรายการ' },
            { name: 'ตรงเวลาเสมอ', desc: 'ส่งงานตรงเวลา ยื่นภาษีไม่เคยล่าช้า ไม่ต้องกังวลเรื่องค่าปรับ' },
            { name: 'ให้คำปรึกษาฟรี', desc: 'พร้อมให้คำปรึกษาด้านบัญชีและภาษีฟรี ตอบทุกข้อสงสัยอย่างรวดเร็ว' }
        ]
    },
    pricing: {
        title: 'แพ็กเกจราคา',
        desc: 'เลือกแพ็กเกจที่เหมาะกับธุรกิจของคุณ',
        packages: [
            { name: 'Starter', desc: 'สำหรับธุรกิจขนาดเล็ก', price: '3,500', featured: false, features: 'บันทึกบัญชีรายเดือน\nยื่น ภ.พ.30 รายเดือน\nยื่น ภ.ง.ด.1, 3, 53\nเอกสารไม่เกิน 30 รายการ/เดือน\nปรึกษาด้านบัญชีฟรี' },
            { name: 'Business', desc: 'สำหรับธุรกิจขนาดกลาง', price: '7,500', featured: true, features: 'ทุกอย่างใน Starter\nปิดงบการเงินประจำปี\nยื่น ภ.ง.ด.50, 51\nเอกสารไม่เกิน 100 รายการ/เดือน\nจัดทำรายงานภาษีประจำปี\nที่ปรึกษาด้านภาษีส่วนตัว' },
            { name: 'Enterprise', desc: 'สำหรับธุรกิจขนาดใหญ่', price: '15,000', featured: false, features: 'ทุกอย่างใน Business\nตรวจสอบบัญชีประจำปี\nวางระบบบัญชี\nเอกสารไม่จำกัด\nทีมบัญชีเฉพาะ\nรายงานวิเคราะห์การเงิน' }
        ]
    }
};

function getContent() {
    const data = localStorage.getItem('accpro_content');
    return data ? JSON.parse(data) : defaultContent;
}

function saveContent(content) {
    localStorage.setItem('accpro_content', JSON.stringify(content));
}

// Toggle section editor
function toggleSection(section) {
    const editor = document.getElementById(`editor-${section}`);
    const isHidden = editor.style.display === 'none';
    editor.style.display = isHidden ? 'block' : 'none';
    if (isHidden) {
        loadContentEditor(section);
    }
}

// Load content into editors
function loadContentEditor(section) {
    const content = getContent();

    if (section === 'hero') {
        const h = content.hero;
        document.getElementById('heroTitle').value = h.title || '';
        document.getElementById('heroSubtitle').value = h.subtitle || '';
        document.getElementById('heroStat1Num').value = h.stat1Num || '';
        document.getElementById('heroStat1Label').value = h.stat1Label || '';
        document.getElementById('heroStat2Num').value = h.stat2Num || '';
        document.getElementById('heroStat2Label').value = h.stat2Label || '';
        document.getElementById('heroStat3Num').value = h.stat3Num || '';
        document.getElementById('heroStat3Label').value = h.stat3Label || '';
    }

    if (section === 'services') {
        document.getElementById('servicesSectionTitle').value = content.services.title || '';
        document.getElementById('servicesSectionDesc').value = content.services.desc || '';
        renderServicesEditor(content.services.items);
    }

    if (section === 'whyus') {
        document.getElementById('whyusSectionTitle').value = content.whyus.title || '';
        document.getElementById('whyusSectionDesc').value = content.whyus.desc || '';
        renderWhyUsEditor(content.whyus.items);
    }

    if (section === 'pricing') {
        document.getElementById('pricingSectionTitle').value = content.pricing.title || '';
        document.getElementById('pricingSectionDesc').value = content.pricing.desc || '';
        renderPricingEditor(content.pricing.packages);
    }
}

// Render services editor items
function renderServicesEditor(items) {
    const container = document.getElementById('servicesEditorList');
    container.innerHTML = items.map((item, i) => `
        <div class="editor-item">
            <div class="editor-item-header">
                <span class="editor-item-num">บริการ #${i + 1}</span>
                <button type="button" class="action-btn btn-cancel" onclick="removeServiceItem(${i})">🗑️ ลบ</button>
            </div>
            <div class="form-row">
                <div class="form-group" style="flex:0 0 80px;">
                    <label>ไอคอน</label>
                    <input type="text" class="svc-icon" value="${item.icon}" placeholder="📒">
                </div>
                <div class="form-group">
                    <label>ชื่อบริการ</label>
                    <input type="text" class="svc-name" value="${escapeHtml(item.name)}" placeholder="ชื่อบริการ">
                </div>
            </div>
            <div class="form-group">
                <label>คำอธิบาย</label>
                <input type="text" class="svc-desc" value="${escapeHtml(item.desc)}" placeholder="รายละเอียดบริการ">
            </div>
        </div>
    `).join('');
}

function addServiceItem() {
    const content = getContent();
    content.services.items.push({ icon: '📌', name: '', desc: '' });
    saveContent(content);
    renderServicesEditor(content.services.items);
}

function removeServiceItem(index) {
    const content = getContent();
    content.services.items.splice(index, 1);
    saveContent(content);
    renderServicesEditor(content.services.items);
}

// Render why-us editor items
function renderWhyUsEditor(items) {
    const container = document.getElementById('whyusEditorList');
    container.innerHTML = items.map((item, i) => `
        <div class="editor-item">
            <div class="editor-item-header">
                <span class="editor-item-num">เหตุผล #${i + 1}</span>
                <button type="button" class="action-btn btn-cancel" onclick="removeWhyUsItem(${i})">🗑️ ลบ</button>
            </div>
            <div class="form-group">
                <label>หัวข้อ</label>
                <input type="text" class="why-name" value="${escapeHtml(item.name)}" placeholder="หัวข้อ">
            </div>
            <div class="form-group">
                <label>คำอธิบาย</label>
                <textarea class="why-desc" rows="2" placeholder="รายละเอียด">${escapeHtml(item.desc)}</textarea>
            </div>
        </div>
    `).join('');
}

function addWhyUsItem() {
    const content = getContent();
    content.whyus.items.push({ name: '', desc: '' });
    saveContent(content);
    renderWhyUsEditor(content.whyus.items);
}

function removeWhyUsItem(index) {
    const content = getContent();
    content.whyus.items.splice(index, 1);
    saveContent(content);
    renderWhyUsEditor(content.whyus.items);
}

// Render pricing editor
function renderPricingEditor(packages) {
    const container = document.getElementById('pricingEditorList');
    container.innerHTML = packages.map((pkg, i) => `
        <div class="editor-item">
            <div class="editor-item-header">
                <span class="editor-item-num">แพ็กเกจ #${i + 1} ${pkg.featured ? '⭐ แนะนำ' : ''}</span>
                <label class="featured-toggle">
                    <input type="checkbox" class="pkg-featured" ${pkg.featured ? 'checked' : ''}> แนะนำ
                </label>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>ชื่อแพ็กเกจ</label>
                    <input type="text" class="pkg-name" value="${escapeHtml(pkg.name)}" placeholder="Starter">
                </div>
                <div class="form-group">
                    <label>ราคา (บาท/เดือน)</label>
                    <input type="text" class="pkg-price" value="${escapeHtml(pkg.price)}" placeholder="3,500">
                </div>
            </div>
            <div class="form-group">
                <label>คำอธิบาย</label>
                <input type="text" class="pkg-desc" value="${escapeHtml(pkg.desc)}" placeholder="สำหรับธุรกิจขนาดเล็ก">
            </div>
            <div class="form-group">
                <label>รายการ (แต่ละบรรทัดคือ 1 รายการ)</label>
                <textarea class="pkg-features" rows="5" placeholder="บันทึกบัญชีรายเดือน&#10;ยื่น ภ.พ.30">${escapeHtml(pkg.features)}</textarea>
            </div>
        </div>
    `).join('');
}

// Save content section
function saveContentSection(section) {
    const content = getContent();

    if (section === 'hero') {
        content.hero = {
            title: document.getElementById('heroTitle').value,
            subtitle: document.getElementById('heroSubtitle').value,
            stat1Num: document.getElementById('heroStat1Num').value,
            stat1Label: document.getElementById('heroStat1Label').value,
            stat2Num: document.getElementById('heroStat2Num').value,
            stat2Label: document.getElementById('heroStat2Label').value,
            stat3Num: document.getElementById('heroStat3Num').value,
            stat3Label: document.getElementById('heroStat3Label').value
        };
    }

    if (section === 'services') {
        content.services.title = document.getElementById('servicesSectionTitle').value;
        content.services.desc = document.getElementById('servicesSectionDesc').value;
        const items = [];
        document.querySelectorAll('#servicesEditorList .editor-item').forEach(el => {
            items.push({
                icon: el.querySelector('.svc-icon').value,
                name: el.querySelector('.svc-name').value,
                desc: el.querySelector('.svc-desc').value
            });
        });
        content.services.items = items;
    }

    if (section === 'whyus') {
        content.whyus.title = document.getElementById('whyusSectionTitle').value;
        content.whyus.desc = document.getElementById('whyusSectionDesc').value;
        const items = [];
        document.querySelectorAll('#whyusEditorList .editor-item').forEach(el => {
            items.push({
                name: el.querySelector('.why-name').value,
                desc: el.querySelector('.why-desc').value
            });
        });
        content.whyus.items = items;
    }

    if (section === 'pricing') {
        content.pricing.title = document.getElementById('pricingSectionTitle').value;
        content.pricing.desc = document.getElementById('pricingSectionDesc').value;
        const packages = [];
        document.querySelectorAll('#pricingEditorList .editor-item').forEach(el => {
            packages.push({
                name: el.querySelector('.pkg-name').value,
                desc: el.querySelector('.pkg-desc').value,
                price: el.querySelector('.pkg-price').value,
                featured: el.querySelector('.pkg-featured').checked,
                features: el.querySelector('.pkg-features').value
            });
        });
        content.pricing.packages = packages;
    }

    saveContent(content);
    showNotification('บันทึกเนื้อหาเรียบร้อยแล้ว ✅ รีเฟรชหน้าเว็บเพื่อดูผลลัพธ์');
}
