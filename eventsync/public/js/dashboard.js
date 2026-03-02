// ================================
// EventSync Dashboard - ULTIMATE VERSION (FIXED undefined)
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
let allAlerts = [];
let allConsumers = [];
const userRole = user.role || 'user';

// ✅ YOUR PERFECT 6 CATEGORIES
const CATEGORIES = [
    { value: '', label: 'No Category' },
    { value: 'Tech', label: '💻 Tech' },
    { value: 'Birthday', label: '🎂 Birthday' },
    { value: 'Family', label: '👨‍👩‍👧‍👦 Family' },
    { value: 'Wedding', label: '💒 Wedding' },
    { value: 'Business', label: '💼 Business' },
    { value: 'Entertainment', label: '🎉 Entertainment' }
];

// Socket.io Integration
const socket = io();
socket.on('connect', () => {
    const syncStatus = document.getElementById('syncStatus');
    if (syncStatus) syncStatus.innerHTML = '<i class="fas fa-circle"></i> 🟢 Live';
});
socket.on('eventCreated', (newEvent) => {
    allEvents.unshift(newEvent);
    renderEvents();
    loadStats();
    showToast('🎉 New event created!');
});
socket.on('eventUpdated', () => { loadEvents(); showToast('🔄 Event updated!'); });
socket.on('eventDeleted', ({ id }) => {
    allEvents = allEvents.filter(event => event.id != id);
    renderEvents();
    loadStats();
    showToast('🗑️ Event deleted!');
});
socket.on('newAlert', (alert) => {
    allAlerts.unshift(alert);
    renderAlerts();
});

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    const profile = document.querySelector('.user-profile');
    if (profile) profile.innerHTML = `<i class="fas fa-user-circle"></i> ${user.name || user.email}`;
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '/';
    });
    
    handleRoleBasedSections();
    setupNavigation();
    setupEventListeners();
    loadInitialData();
});

// Event Listeners Setup
function setupEventListeners() {
    const createEventBtn = document.getElementById('createEventBtn');
    if (createEventBtn) createEventBtn.addEventListener('click', () => showEventModal(null));
    
    const refreshConsumers = document.getElementById('refreshConsumers');
    if (refreshConsumers) refreshConsumers.addEventListener('click', loadConsumers);
    
    const alertFilter = document.getElementById('alertFilter');
    if (alertFilter) alertFilter.addEventListener('change', (e) => filterAlerts(e.target.value));
}

// Load All Initial Data
async function loadInitialData() {
    Promise.all([
        loadStats(),
        loadEvents(),
        loadConsumers(),
        loadAlerts(),
        loadUserRegistrations()
    ]).catch(console.error);
}

// Navigation
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-menu li[data-section]');
    const sections = document.querySelectorAll('.section');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const target = item.dataset.section;
            const targetSection = document.getElementById(`${target}Section`);
            if (!targetSection) return;
            
            navItems.forEach(i => i.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            item.classList.add('active');
            targetSection.classList.add('active');
            
            if (target === 'events') loadEvents();
            if (target === 'consumers') loadConsumers();
            if (target === 'alerts') loadAlerts();
        });
    });
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
        const heroEventsLive = document.getElementById('heroEventsLive');
        const heroLatency = document.getElementById('heroLatency');
        const heroUptime = document.getElementById('heroUptime');
        
        if (heroEventsLive) heroEventsLive.textContent = stats.eventsPerSec || '12K';
        if (heroLatency) heroLatency.textContent = stats.avgLatency || '0.8ms';
        if (heroUptime) heroUptime.textContent = stats.uptime || '99.99%';
        
        const statIds = ['totalEvents', 'totalRegistrations', 'activeUsers'];
        const statValues = [stats.totalEvents, stats.totalRegistrations, stats.activeUsers];
        statIds.forEach((id, index) => {
            const el = document.getElementById(id);
            if (el) el.textContent = statValues[index] || 0;
        });
    } catch (error) {
        console.error('Stats load failed:', error);
    }
}

async function loadEvents() {
    try {
        const events = await apiRequest('/api/events');
        console.log('✅ Events loaded:', events); // DEBUG
        allEvents = events || [];
        renderEvents();
    } catch (error) {
        console.error('Events load failed:', error);
        renderEmptyState('eventsGrid', 'fa-calendar-plus', 'No Events', 'Create your first event stream');
    }
}

async function loadConsumers() {
    try {
        allConsumers = await apiRequest('/api/consumers');
        renderConsumers();
        const totalConsumers = document.getElementById('totalConsumers');
        const activeConsumers = document.getElementById('activeConsumers');
        if (totalConsumers) totalConsumers.textContent = allConsumers.length;
        if (activeConsumers) activeConsumers.textContent = allConsumers.filter(c => c.isActive).length;
    } catch (error) {
        renderEmptyState('consumersGrid', 'fa-users', 'No Consumers', 'No active consumer groups');
    }
}

async function loadAlerts() {
    try {
        allAlerts = await apiRequest('/api/alerts');
        renderAlerts();
    } catch (error) {
        renderEmptyState('alertsList', 'fa-bell-slash', 'No Alerts', 'System running smoothly');
    }
}

async function loadUserRegistrations() {
    try {
        userRegistrations = await apiRequest(`/api/user-registrations/${user.id}`);
    } catch (error) {
        console.error('Registrations load failed:', error);
    }
}

// ✅ FIXED EVENT MODAL - No more undefined!
function showEventModal(eventToEdit = null) {
    const isEdit = !!eventToEdit;
    const title = isEdit ? `Edit ${eventToEdit?.title || 'Event'}` : 'Create New Event';
    
    // ✅ FIXED Date parsing - SAFE!
    let dateValue = '';
    if (eventToEdit?.event_date && eventToEdit.event_date !== 'undefined') {
        try {
            const date = new Date(eventToEdit.event_date);
            if (!isNaN(date.getTime())) {
                dateValue = date.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
            }
        } catch (e) {
            console.log('Date parse failed, using empty:', e);
        }
    }
    
    const categoryOptions = CATEGORIES.map(cat => 
        `<option value="${cat.value}" ${eventToEdit?.category === cat.value ? 'selected' : ''}>${cat.label}</option>`
    ).join('');
    
    const modalHTML = `
        <div class="modal-overlay" id="eventModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${isEdit ? '<i class="fas fa-edit"></i>' : '<i class="fas fa-plus"></i>'} ${title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="eventForm">
                        <div class="form-group">
                            <label><i class="fas fa-heading"></i> Event Title *</label>
                            <input type="text" id="eventTitle" value="${escapeHtml(eventToEdit?.title || '')}" required>
                        </div>
                        <div class="form-group">
                            <label><i class="fas fa-tag"></i> Category</label>
                            <select id="eventCategory">${categoryOptions}</select>
                        </div>
                        <div class="form-group">
                            <label><i class="fas fa-align-left"></i> Description</label>
                            <textarea id="eventDesc">${escapeHtml(eventToEdit?.description || '')}</textarea>
                        </div>
                        <div class="form-group">
                            <label><i class="fas fa-calendar-alt"></i> Date & Time *</label>
                            <input type="datetime-local" id="eventDateTime" value="${dateValue}" step="60" required>
                        </div>
                        <div class="form-group">
                            <label><i class="fas fa-map-marker-alt"></i> Location</label>
                            <input type="text" id="eventLocation" value="${escapeHtml(eventToEdit?.location || '')}">
                        </div>
                    </form>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary modal-close">Cancel</button>
                    <button type="submit" class="btn btn-primary" form="eventForm">
                        ${isEdit ? '<i class="fas fa-save"></i> Update' : '<i class="fas fa-rocket"></i> Create'}
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Event handlers
    const modal = document.getElementById('eventModal');
    const form = document.getElementById('eventForm');
    
    const handleClose = () => {
        if (modal) modal.remove();
    };
    
    document.querySelector('.modal-overlay')?.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) handleClose();
    });
    document.querySelector('.modal-close')?.addEventListener('click', handleClose);
    
    // ✅ FIXED Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const eventDateTime = document.getElementById('eventDateTime').value;
        if (!eventDateTime) {
            showToast('❌ Please select date and time!');
            return;
        }
        
        const formData = {
            title: document.getElementById('eventTitle').value.trim(),
            category: document.getElementById('eventCategory').value === '' ? null : document.getElementById('eventCategory').value,
            description: document.getElementById('eventDesc').value.trim() || null,
            event_date: eventDateTime,  // ✅ EXACT datetime-local value
            location: document.getElementById('eventLocation').value.trim() || null
        };
        
        console.log('🚀 SAVING:', formData); // DEBUG
        
        try {
            if (isEdit) {
                await apiRequest(`/api/events/${eventToEdit.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(formData)
                });
                showToast('✅ Event updated successfully!');
            } else {
                const newEvent = await apiRequest('/api/events', {
                    method: 'POST',
                    body: JSON.stringify(formData)
                });
                showToast('🎉 Event created successfully!');
            }
            
            handleClose();
            loadEvents(); // ✅ REFRESH
        } catch (error) {
            console.error('Save error:', error);
            showToast('❌ ' + (error.message || 'Failed to save'));
        }
    });
}

// ✅ FIXED Event Card - No undefined!
function createEventCard(event) {
    const isRegistered = userRegistrations.some(reg => reg.event_id == event.id);
    
    // ✅ SAFE Date Display
    let dateDisplay = 'Live Event';
    if (event.event_date && event.event_date !== 'undefined' && event.event_date !== null) {
        const date = new Date(event.event_date);
        if (!isNaN(date.getTime())) {
            dateDisplay = date.toLocaleDateString('en-IN', { 
                weekday: 'short',
                day: 'numeric', 
                month: 'short', 
                year: 'numeric',
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true
            });
        } else {
            dateDisplay = 'Invalid date';
        }
    }
    
    return `
        <div class="event-card" data-id="${event.id}">
            ${event.category ? `<div class="badge ${event.category}">${event.category}</div>` : ''}
            <h3>${escapeHtml(event.title || 'Untitled')}</h3>
            <p>${escapeHtml(event.description || 'No description')}</p>
            <div class="timestamp">
                📅 <strong>${dateDisplay}</strong>
                ${event.location ? `<br><i class="fas fa-map-marker-alt"></i> ${escapeHtml(event.location)}` : ''}
                ${event.created_by_name ? `<br><small><i class="fas fa-user"></i> ${escapeHtml(event.created_by_name)}</small>` : ''}
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
                <button class="btn ${isRegistered ? 'btn-secondary' : 'btn-success'} btn-sm register-btn ${isRegistered ? 'registered' : ''}" data-id="${event.id}">
                    ${isRegistered ? '<i class="fas fa-check"></i> Subscribed' : '<i class="fas fa-user-plus"></i> Subscribe'}
                </button>
            </div>
        </div>
    `;
}

function renderEvents() {
    const container = document.getElementById('eventsGrid');
    if (!container) return;
    
    if (!allEvents.length) {
        renderEmptyState('eventsGrid', 'fa-calendar-plus', 'No Events', 'Create your first event stream');
        return;
    }
    
    container.innerHTML = allEvents.map(event => createEventCard(event)).join('');
    
    // Add event listeners SAFELY
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const eventId = btn.dataset.id;
            const event = allEvents.find(e => e.id == eventId);
            if (event) showEventModal(event);
        });
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteEvent(parseInt(btn.dataset.id)));
    });
    document.querySelectorAll('.register-btn').forEach(btn => {
        btn.addEventListener('click', () => toggleRegistration(parseInt(btn.dataset.id)));
    });
}

function renderConsumers() {
    const container = document.getElementById('consumersGrid');
    if (!container || !allConsumers.length) {
        renderEmptyState('consumersGrid', 'fa-users', 'No Consumers', 'No active consumer groups');
        return;
    }
    
    container.innerHTML = allConsumers.map(consumer => `
        <div class="consumer-card">
            <div class="consumer-header">
                <h4>${escapeHtml(consumer.name)}</h4>
                <span class="status ${consumer.isActive ? 'active' : 'inactive'}">
                    ${consumer.isActive ? '🟢 Live' : '🔴 Offline'}
                </span>
            </div>
            <p>${consumer.topic} - ${consumer.consumers || 0} members</p>
        </div>
    `).join('');
}

function renderAlerts() {
    const container = document.getElementById('alertsList');
    if (!container || !allAlerts.length) {
        renderEmptyState('alertsList', 'fa-bell-slash', 'No Alerts', 'System running smoothly');
        return;
    }
    
    container.innerHTML = allAlerts.map(alert => `
        <div class="alert-item ${alert.type}">
            <div class="alert-icon">
                <i class="fas fa-${alert.icon || 'info-circle'}"></i>
            </div>
            <div class="alert-content">
                <h4>${escapeHtml(alert.title)}</h4>
                <p>${escapeHtml(alert.message)}</p>
                <small>${new Date(alert.timestamp).toLocaleString()}</small>
            </div>
        </div>
    `).join('');
}

function filterAlerts(type) {
    const filtered = type === 'all' ? allAlerts : allAlerts.filter(a => a.type === type);
    const container = document.getElementById('alertsList');
    if (!container) return;
    
    container.innerHTML = filtered.length ? 
        filtered.map(alert => `
            <div class="alert-item ${alert.type}">
                <div class="alert-icon">
                    <i class="fas fa-${alert.icon || 'info-circle'}"></i>
                </div>
                <div class="alert-content">
                    <h4>${escapeHtml(alert.title)}</h4>
                    <p>${escapeHtml(alert.message)}</p>
                    <small>${new Date(alert.timestamp).toLocaleString()}</small>
                </div>
            </div>
        `).join('') : 
        '<div class="empty-state"><i class="fas fa-bell-slash"></i><h3>No matching alerts</h3></div>';
}

function renderEmptyState(containerId, icon, title, message) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas ${icon}"></i>
                <h3>${title}</h3>
                <p>${message}</p>
            </div>
        `;
    }
}

// CRUD Operations
async function deleteEvent(id) {
    if (!confirm('Delete this event permanently?')) return;
    
    try {
        await apiRequest(`/api/events/${id}`, { method: 'DELETE' });
        showToast('✅ Event deleted successfully!');
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
        showToast('✅ Registration updated!');
        await loadUserRegistrations();
        renderEvents();
    } catch (error) {
        showToast(error.error || '❌ Registration failed');
    }
}

// Utilities
function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return text ? text.replace(/[&<>"']/g, m => map[m]) : '';
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast && toast.remove(), 400);
    }, 3500);
}
