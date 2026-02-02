let isLoggedIn = false;
let currentUser = null;
let selectedEvent = null;
let userRegistrations = [];

let events = [
  { id: 1, title: "🤖 AI & ML Workshop", date: "12 Mar 2026", time: "10AM-2PM", venue: "Seminar Hall A", category: "Workshop", spots: 50 },
  { id: 2, title: "💻 National Hackathon", date: "20 Mar 2026", time: "9AM-8PM", venue: "Innovation Lab", category: "Competition", spots: 100 },
  { id: 3, title: "🎤 Tech Fest Debate", date: "25 Mar 2026", time: "3PM-6PM", venue: "Auditorium", category: "Debate", spots: 30 }
];

let students = [
  { name: "Aarav Kumar", id: "CSE101", dept: "CSE", email: "aarav@college.edu", events: 3, password: "pass123" },
  { name: "Meera Rao", id: "ECE102", dept: "ECE", email: "meera@college.edu", events: 2, password: "pass456" }
];

// DOM Elements
let studentsTableBody, eventsContainer, registrationsTableBody;

function initDOMElements() {
  studentsTableBody = document.querySelector('#studentsTable tbody');
  eventsContainer = document.getElementById('eventsContainer');
  registrationsTableBody = document.querySelector('#registrationsTable tbody');
}

// ✅ FIXED LOGIN - Proper validation
function login(email, password) {
  const user = students.find(s => s.email === email && s.password === password);
  
  if (!user) {
    showNotification('❌ Wrong email or password!', 'error');
    return false;
  }
  
  isLoggedIn = true;
  currentUser = user;
  updateUIAfterLogin();
  closeModal('loginModal');
  showNotification(`✅ Welcome ${user.name}!`, 'success');
}

// ✅ FIXED REGISTRATION - Direct input access (NO FormData)
function registerStudent(name, id, dept, email, password) {
  // Check duplicate email
  if (students.find(s => s.email === email)) {
    showNotification(`❌ "${email}" already registered! Login instead.`, 'error');
    closeModal('registerModal');
    setTimeout(() => openModal('loginModal'), 800);
    return;
  }
  
  // Create new student
  const newStudent = {
    name: name,
    id: id,
    dept: dept,
    email: email,
    events: 0,
    password: password
  };
  
  students.push(newStudent);
  currentUser = newStudent;
  isLoggedIn = true;
  
  updateUIAfterLogin();
  closeModal('registerModal');
  showNotification(`✅ Welcome ${name}! Registered successfully`, 'success');
}

function updateUIAfterLogin() {
  document.getElementById('loginLi').style.display = 'none';
  document.getElementById('logoutLi').style.display = 'block';
  document.getElementById('userStatus').style.display = 'block';
  document.getElementById('userName').textContent = currentUser.name;
  
  document.querySelectorAll('.locked, .locked-section').forEach(el => {
    el.classList.remove('locked', 'locked-section');
  });
  
  renderAll();
}

function renderAll() {
  renderStudents();
  renderEvents();
  renderRegistrations();
}

function logout() {
  isLoggedIn = false;
  currentUser = null;
  document.getElementById('loginLi').style.display = 'block';
  document.getElementById('logoutLi').style.display = 'none';
  document.getElementById('userStatus').style.display = 'none';
  
  document.querySelectorAll('#events, #students, #registrations').forEach(el => {
    el.classList.add('locked-section');
  });
  showSection('dashboard');
}

function showEventDetails(eventId) {
  if (!isLoggedIn) return openModal('loginModal');
  selectedEvent = events.find(e => e.id == eventId);
  document.getElementById('eventTitle').textContent = selectedEvent.title;
  document.getElementById('eventDetails').innerHTML = `
    <p><strong>Date:</strong> ${selectedEvent.date}</p>
    <p><strong>Time:</strong> ${selectedEvent.time}</p>
    <p><strong>Venue:</strong> ${selectedEvent.venue}</p>
  `;
  openModal('eventModal');
}

function registerForEvent() {
  if (userRegistrations.find(r => r.eventId == selectedEvent.id)) {
    return showNotification('Already registered!', 'error');
  }
  userRegistrations.push({
    eventId: selectedEvent.id,
    eventName: selectedEvent.title,
    date: selectedEvent.date
  });
  currentUser.events++;
  renderAll();
  closeModal('eventModal');
  showNotification('✅ Event registered!', 'success');
}

function showSection(id) {
  if (!isLoggedIn && id != 'dashboard') return openModal('loginModal');
  
  document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  
  document.querySelectorAll('.navbar a').forEach(a => a.classList.remove('active'));
  document.querySelector(`a[onclick="showSection('${id}')"]`)?.classList.add('active');
}

function openModal(id) { document.getElementById(id).style.display = 'block'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

window.onclick = e => {
  if (e.target.classList.contains('modal')) e.target.style.display = 'none';
};

function showNotification(msg, type) {
  const note = document.createElement('div');
  note.style.cssText = `
    position:fixed;top:20px;right:20px;z-index:10000;
    padding:1rem 1.5rem;border-radius:8px;color:white;font-weight:600;
    background:${type=='success'?'#10b981':'#ef4444'};
    box-shadow:0 4px 12px rgba(0,0,0,0.3);
    transform:translateX(300px);transition:all 0.3s;
  `;
  note.textContent = msg;
  document.body.appendChild(note);
  
  setTimeout(() => note.style.transform = 'translateX(0)', 50);
  setTimeout(() => {
    note.style.transform = 'translateX(300px)';
    setTimeout(() => document.body.removeChild(note), 300);
  }, 3000);
}

// ✅ FIXED RENDER FUNCTIONS
function renderStudents() {
  if (!studentsTableBody) return;
  studentsTableBody.innerHTML = '';
  
  students.forEach(student => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><i class="fas fa-user"></i> ${student.name}</td>
      <td>${student.id}</td>
      <td>${student.dept}</td>
      <td>${student.email}</td>
      <td style="color:#10b981;font-weight:600;">${student.events}</td>
    `;
    studentsTableBody.appendChild(row);
  });
}

function renderEvents() {
  if (!isLoggedIn || !eventsContainer) return;
  eventsContainer.innerHTML = '';
  events.forEach(event => {
    const card = document.createElement('div');
    card.className = 'card event-card';
    card.onclick = () => showEventDetails(event.id);
    card.innerHTML = `
      <h3 style="color:#60a5fa;">${event.title}</h3>
      <p><i class="fas fa-calendar"></i> ${event.date}</p>
      <p>${event.venue}</p>
    `;
    eventsContainer.appendChild(card);
  });
}

function renderRegistrations() {
  if (!isLoggedIn || !registrationsTableBody) return;
  registrationsTableBody.innerHTML = userRegistrations.length ? 
    userRegistrations.map(r => `
      <tr>
        <td>${r.eventName}</td>
        <td>${r.date}</td>
        <td style="color:#10b981;">Confirmed</td>
        <td><button onclick="showEventDetails(${r.eventId})">View</button></td>
      </tr>
    `).join('') : 
    '<tr><td colspan="4" style="text-align:center;color:#94a3b8;">No registrations</td></tr>';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initDOMElements();
  
  // ✅ FIXED: Direct input access - NO MORE UNDEFINED!
  document.getElementById('registerForm').onsubmit = e => {
    e.preventDefault();
    const inputs = e.target.elements;
    registerStudent(inputs[0].value, inputs[1].value, inputs[2].value, inputs[3].value, inputs[4].value);
    e.target.reset();
  };
  
  document.getElementById('loginForm').onsubmit = e => {
    e.preventDefault();
    const inputs = e.target.elements;
    login(inputs[0].value, inputs[1].value);
    e.target.reset();
  };
});
