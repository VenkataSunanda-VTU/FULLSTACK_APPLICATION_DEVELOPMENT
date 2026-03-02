// ================================
// EventSync Dashboard - PERFECTLY FIXED (JWT PROTECTED)
// ================================

// JWT API Helper
const apiRequest = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    const config = {
        headers: { 
            'Content-Type': 'application/json', 
            ...(token && { 'Authorization': `Bearer ${token}` }) 
        },
        ...options
    };
    
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (response.status === 401 || response.status === 403) {
        localStorage.clear();
        window.location.href = '/';
        throw new Error('Token expired');
    }
    return data;
};

// Auth Guard
const user = JSON.parse(localStorage.getItem('eventsyncUser') || '{}');
const token = localStorage.getItem('token');
if (!user.id || !token) {
    localStorage.clear();
    window.location.href = '/';
}

let allEvents = [];
let userRegistrations = [];
const userRole = user.role || 'user';

// Socket.io Integration
const socket = io();
socket.on('connect', () => {
    const syncStatus = document.getElementById('syncStatus');
    if (syncStatus) syncStatus.innerHTML = '<i class="fas fa-circle"></i> 🟢 Live';
});
socket.on('disconnect', () => {
    const syncStatus = document.getElementById('syncStatus');
    if (syncStatus) syncStatus.innerHTML = '<i class="fas fa-circle"></i> 🔴 Offline';
});
socket.on('eventCreated', (newEvent) => {
    allEvents.unshift(newEvent);
    renderEvents();
    loadStats();
    showToast('✅ New stream created!');
});
socket.on('eventUpdated', () => { loadEvents(); showToast('🔄 Stream updated!'); });
socket.on('eventDeleted', ({ id }) => {
    allEvents = allEvents.filter(event => event.id != id);
    renderEvents();
    loadStats();
    showToast('🗑️ Stream deleted!');
});

// Update user profile
document.addEventListener('DOMContentLoaded', () => {
    const userInfoEl = document.querySelector('.user-profile');
    if (userInfoEl) userInfoEl.innerHTML = `<i class="fas fa-user-circle"></i> ${user.name || user.email}`;
    
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '/';
    });
});

// Hero Stats Update
function updateHeroStats(stats) {
    const heroEvents = document.getElementById('heroEventsLive');
    const heroLatency = document.getElementById('heroLatency');
    const heroUptime = document.getElementById('heroUptime');
    
    if (heroEvents) heroEvents.textContent = stats.eventsPerSec || '12K';
    if (heroLatency) heroLatency.textContent = stats.avgLatency || '0.8ms';
    if (heroUptime) heroUptime.textContent = stats.uptime || '99.99%';
    
    // Dashboard stat cards
    const statIds = ['totalEvents', 'totalRegistrations', 'activeUsers'];
    statIds.forEach((id, index) => {
        const el = document.getElementById(id);
        if (el) el.textContent = [stats.totalEvents, stats.totalRegistrations, stats.activeUsers][index] || 0;
    });
}

// Navigation - PERFECTLY FIXED
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-menu li[data-section]');
    const sections = document.querySelectorAll('.section');
    
    // Set first section active
    if (navItems[0]) {
        navItems[0].classList.add('active');
        const firstSection = document.getElementById('dashboardSection');
        if (firstSection) firstSection.classList.add('active');
    }
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const target = item.dataset.section;
            const targetSection = document.getElementById(`${target}Section`);
            if (!targetSection) return;
            
            // Remove active from all
            navItems.forEach(i => i.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            // Add active to clicked
            item.classList.add('active');
            targetSection.classList.add('active');
            
            // Load section data
            if (target === 'events') loadEvents();
            if (target === 'registrations') loadUserRegistrations();
        });
    });
}

// Hero Buttons
function setupHeroButtons() {
    document.querySelectorAll('.scroll-link').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('dashboardSection').scrollIntoView({ behavior: 'smooth' });
            document.querySelector('li[data-section="dashboard"]').click();
        });
    });
    
    const demoBtn = document.getElementById('quickDemo');
    if (demoBtn) demoBtn.addEventListener('click', () => showToast('🎬 Live demo coming soon!'));
}

// Role-based sections
function handleRoleBasedSections() {
    if (userRole !== 'admin') {
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
    }
}

// API Functions
async function loadStats() {
    try {
        const stats = await apiRequest('/api/stats');
        updateHeroStats(stats);
    } catch (error) {
        console.error('Stats load failed:', error);
    }
}

async function loadEvents() {
    try {
        const events = await apiRequest('/api/events');
        allEvents = events;
        renderEvents();
    } catch (error) {
        const container = document.getElementById('eventsGrid');
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-stream"></i>
                    <h3>No Active Streams</h3>
                    <p>Create your first event stream to get started</p>
                </div>
            `;
        }
    }
}

async function loadUserRegistrations() {
    try {
        userRegistrations = await apiRequest(`/api/user-registrations/${user.id}`);
        renderRegistrations();
    } catch (error) {
        console.error('Registrations load failed:', error);
    }
}

// Event Rendering - FIXED
function renderEvents() {
    const container = document.getElementById('eventsGrid');
    if (!container) return;
    
    if (!allEvents.length) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-stream"></i>
                <h3>No Active Streams</h3>
                <p>Create your first event stream to get started</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = allEvents.map(event => createEventCard(event)).join('');
    
    // Add event listeners
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => editEvent(parseInt(btn.dataset.id)));
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteEvent(parseInt(btn.dataset.id)));
    });
    document.querySelectorAll('.register-btn').forEach(btn => {
        btn.addEventListener('click', () => toggleRegistration(parseInt(btn.dataset.id)));
    });
}

// Event Card Template
function createEventCard(event) {
    const isRegistered = userRegistrations.some(reg => reg.event_id == event.id);
    const category = event.category || 'Tech';
    
    return `
        <div class="event-card" data-id="${event.id}">
            <div class="badge ${category}">${category}</div>
            <h3>${escapeHtml(event.title)}</h3>
            <p>${escapeHtml(event.description || 'Event stream description')}</p>
            <div class="timestamp">
                ${event.event_date ? new Date(event.event_date).toLocaleString('en-IN') : 'Live stream'}
                ${event.location ? `<br>• ${escapeHtml(event.location)}` : ''}
                ${event.created_by_name ? `<br><small>by ${escapeHtml(event.created_by_name)}</small>` : ''}
            </div>
            <div class="event-actions">
                ${(userRole === 'admin' || userRole === 'organizer') ? `
                    <button class="btn btn-primary btn-sm edit-btn" data-id="${event.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger btn-sm delete-btn" data-id="${event.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                ` : ''}
                <button class="btn btn-success btn-sm register-btn ${isRegistered ? 'registered' : ''}" data-id="${event.id}">
                    ${isRegistered ? '<i class="fas fa-check"></i> Subscribed' : '<i class="fas fa-user-plus"></i> Subscribe'}
                </button>
            </div>
        </div>
    `;
}

// Registrations Rendering
function renderRegistrations() {
    const container = document.getElementById('registrationsGrid');
    if (!container) return;
    
    if (!userRegistrations.length) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <h3>No Subscriptions</h3>
                <p>Subscribe to streams to see your registrations here</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = userRegistrations.map(reg => `
        <div class="event-card">
            <h3>${escapeHtml(reg.title)}</h3>
            <p>${new Date(reg.event_date).toLocaleString('en-IN')}</p>
            <p><strong>Location:</strong> ${escapeHtml(reg.location || 'Online')}</p>
        </div>
    `).join('');
}

// CRUD Operations
async function editEvent(id) {
    const event = allEvents.find(e => e.id == id);
    if (!event) return;
    
    const newTitle = prompt('Edit Stream Title:', event.title);
    if (!newTitle || newTitle === event.title) return;
    
    try {
        await apiRequest(`/api/events/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                title: newTitle,
                description: event.description,
                event_date: event.event_date,
                location: event.location
            })
        });
        showToast('✅ Stream updated successfully!');
        loadEvents();
    } catch (error) {
        showToast('❌ Update failed');
    }
}

async function deleteEvent(id) {
    if (!confirm('Delete this stream? This cannot be undone.')) return;
    
    try {
        await apiRequest(`/api/events/${id}`, { method: 'DELETE' });
        showToast('✅ Stream deleted successfully!');
        loadEvents();
    } catch (error) {
        showToast('❌ Delete failed');
    }
}

async function toggleRegistration(id) {
    try {
        await apiRequest('/api/register-event', {
            method: 'POST',
            body: JSON.stringify({ event_id: id })
        });
        showToast('✅ Subscription updated!');
        await loadUserRegistrations();
        renderEvents();
    } catch (error) {
        showToast(error.error || '❌ Subscription failed');
    }
}

// Create Event
async function showCreateEventModal() {
    const title = prompt('Stream Title:');
    if (!title) return;
    
    const description = prompt('Description (optional):', '');
    const event_date = prompt('Event Date (YYYY-MM-DDTHH:MM, optional):', '');
    const location = prompt('Location/Topic (optional):', '');
    
    try {
        await apiRequest('/api/events', {
            method: 'POST',
            body: JSON.stringify({
                title,
                description: description || null,
                event_date: event_date || null,
                location: location || null
            })
        });
        showToast('✅ Stream created successfully!');
        loadEvents();
    } catch (error) {
        showToast('❌ Failed to create stream');
    }
}

// Utilities
function escapeHtml(text) {
    const map = { 
        '&': '&amp;', 
        '<': '&lt;', 
        '>': '&gt;', 
        '"': '&quot;', 
        "'": '&#39;' 
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.cssText = `
        position: fixed; bottom: 2rem; right: 2rem; background: var(--primary);
        color: white; padding: 1rem 1.5rem; border-radius: 12px; z-index: 2000;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2); font-weight: 500;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.transition = 'opacity 0.3s, transform 0.3s';
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// 🔥 MAIN INITIALIZATION
document.addEventListener('DOMContentLoaded', async () => {
    handleRoleBasedSections();
    setupNavigation();
    setupHeroButtons();
    
    // Load initial data
    await Promise.all([
        loadStats(),
        loadEvents(),
        loadUserRegistrations()
    ]);
    
    // Create event button
    const createEventBtn = document.getElementById('createEventBtn');
    if (createEventBtn) {
        createEventBtn.addEventListener('click', showCreateEventModal);
    }
});

function handleRoleBasedSections() {
    if (userRole !== 'admin') {
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
    }
}
