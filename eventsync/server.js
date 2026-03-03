require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const db = require('./config/db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// JWT SECRET
const JWT_SECRET = 'eventsync-veltech-cse2023-secret-2026';

// ---------------------------
// Middleware
// ---------------------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ✅ JWT MIDDLEWARE - Only verified users
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// ---------------------------
// SOCKET.IO - Real-time Events
// ---------------------------
io.on('connection', (socket) => {
    console.log('🟢 User connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('🔴 User disconnected:', socket.id);
    });
});

// ---------------------------
// AUTH ROUTES
// ---------------------------
// Register
app.post('/api/register', async (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role)
        return res.status(400).json({ message: "All fields are required" });

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.query(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
            [name, email, hashedPassword, role],
            (err, result) => {
                if (err) {
                    console.error('Register error:', err);
                    if (err.code === 'ER_DUP_ENTRY') {
                        return res.status(400).json({ message: "Email already registered" });
                    }
                    return res.status(500).json({ message: "Registration failed" });
                }
                io.emit('userRegistered', { name, message: `${name} registered!` });
                res.json({ message: "User registered successfully" });
            }
        );
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// Login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ message: "Email and password are required" });

    db.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        async (err, results) => {
            if (err) {
                console.error('Login DB error:', err);
                return res.status(500).json({ message: "Server error" });
            }
            if (results.length === 0)
                return res.status(400).json({ message: "User not found" });

            const user = results[0];
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch)
                return res.status(400).json({ message: "Invalid credentials" });

            const token = jwt.sign(
                { 
                    id: user.id, 
                    name: user.name, 
                    email: user.email, 
                    role: user.role 
                }, 
                JWT_SECRET, 
                { expiresIn: '24h' }
            );

            res.json({
                message: "Login successful",
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        }
    );
});

// ---------------------------
// EVENTS ROUTES - COMPLETE CRUD (PROTECTED)
// ---------------------------
// ✅ Get all events
app.get('/api/events', authenticateToken, (req, res) => {
    db.query(`
        SELECT e.*, u.name as created_by_name 
        FROM events e 
        LEFT JOIN users u ON e.created_by = u.id 
        ORDER BY e.created_at DESC
    `, (err, results) => {
        if (err) {
            console.error('Events fetch error:', err);
            return res.status(500).json({ error: err.message });
        }
        console.log('📅 Events loaded:', results.length); // DEBUG
        res.json(results);
    });
});

// ✅ FIXED: Create event - Perfect DateTime + Category!
// ✅ CREATE - Date/Time SAVED
app.post('/api/events', authenticateToken, (req, res) => {
    const { title, category, description, event_date, location } = req.body;
    
    console.log('🆕 CREATE TIME:', event_date); // DEBUG
    
    db.query(
        `INSERT INTO events (title, category, description, event_date, location, created_by) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [title, category || null, description || null, event_date, location || null, req.user.id],
        (err, result) => {
            if (err) {
                console.error('CREATE ERROR:', err);
                return res.status(500).json({ error: err.message });
            }
            
            // Return NEW event immediately
            db.query(
                `SELECT e.*, u.name as created_by_name 
                 FROM events e LEFT JOIN users u ON e.created_by = u.id 
                 WHERE e.id = ?`,
                [result.insertId],
                (err, newEvent) => {
                    res.json(newEvent[0]);
                }
            );
        }
    );
});

// ✅ UPDATE - Date/Time SAVED + RELOAD
app.put('/api/events/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { title, category, description, event_date, location } = req.body;
    
    console.log('✏️ UPDATE TIME:', event_date); // DEBUG
    
    db.query(
        `UPDATE events 
         SET title=?, category=?, description=?, event_date=?, location=? 
         WHERE id=?`,
        [title, category || null, description || null, event_date, location || null, id],
        (err, result) => {
            if (err) {
                console.error('UPDATE ERROR:', err);
                return res.status(500).json({ error: err.message });
            }
            
            console.log('✅ UPDATED:', result.affectedRows, 'rows');
            
            // Return UPDATED event
            db.query(
                `SELECT e.*, u.name as created_by_name 
                 FROM events e LEFT JOIN users u ON e.created_by = u.id 
                 WHERE e.id = ?`,
                [id],
                (err, updatedEvent) => {
                    res.json(updatedEvent[0]);
                }
            );
        }
    );
});


// ✅ Delete event
app.delete('/api/events/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM events WHERE id=? AND (created_by=? OR role='admin')", [id, req.user.id], (err) => {
        if (err) {
            console.error('Event delete error:', err);
            return res.status(500).json({ error: err.message });
        }
        // Delete related registrations
        db.query("DELETE FROM registrations WHERE event_id=?", [id]);
        io.emit('eventDeleted', { id });
        res.json({ success: true });
    });
});

// ---------------------------
// REGISTRATION ROUTES (PROTECTED)
// ---------------------------
app.post('/api/register-event', authenticateToken, (req, res) => {
    const { event_id } = req.body;
    db.query(
        "INSERT IGNORE INTO registrations (user_id, event_id) VALUES (?, ?)",
        [req.user.id, event_id],
        (err) => {
            if (err) {
                console.error('Registration error:', err);
                return res.status(500).json({ error: err.message });
            }
            io.emit('newRegistration', { user_id: req.user.id, event_id });
            res.json({ success: true, message: 'Registered successfully!' });
        }
    );
});

app.get('/api/user-registrations/:user_id', authenticateToken, (req, res) => {
    const { user_id } = req.params;
    db.query(
        `SELECT r.*, e.title, e.event_date, e.location
         FROM registrations r 
         JOIN events e ON r.event_id = e.id 
         WHERE r.user_id = ?`,
        [user_id],
        (err, results) => {
            if (err) return res.status(500).json(err);
            res.json(results);
        }
    );
});

// ---------------------------
// DASHBOARD STATS (PROTECTED)
// ---------------------------
app.get('/api/stats', authenticateToken, (req, res) => {
    db.query(
        `SELECT 
            (SELECT COUNT(*) FROM events) as totalEvents,
            (SELECT COUNT(*) FROM registrations) as totalRegistrations,
            (SELECT COUNT(DISTINCT user_id) FROM registrations) as activeUsers,
            (SELECT COUNT(*) FROM users WHERE DATE(created_at) = CURDATE()) as todayUsers
        `,
        (err, results) => {
            if (err) {
                console.error('Stats error:', err);
                return res.status(500).json(err);
            }
            res.json({
                totalEvents: results[0].totalEvents || 0,
                totalRegistrations: results[0].totalRegistrations || 0,
                activeUsers: results[0].activeUsers || 0,
                todayUsers: results[0].todayUsers || 0,
                eventsPerSec: '12K', // Demo
                avgLatency: '0.8ms',
                uptime: '99.99%'
            });
        }
    );
});

// ---------------------------
// CONSUMERS & ALERTS (DEMO)
// ---------------------------
app.get('/api/consumers', authenticateToken, (req, res) => {
    res.json([
        { name: 'FlashMob Group', topic: 'flashmob-2026', consumers: 15, isActive: true },
        { name: 'Birthday Stream', topic: 'birthdays', consumers: 8, isActive: true },
        { name: 'Wedding Alerts', topic: 'weddings', consumers: 3, isActive: false }
    ]);
});

app.get('/api/alerts', authenticateToken, (req, res) => {
    res.json([
        { id: 1, title: 'System Live', message: 'All services running perfectly', type: 'success', icon: 'check-circle', timestamp: new Date().toISOString() },
        { id: 2, title: 'New Event Created', message: 'Sunanda Birthday added', type: 'info', icon: 'bell', timestamp: new Date(Date.now() - 3600000).toISOString() }
    ]);
});

// ---------------------------
// Serve HTML pages
// ---------------------------
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'auth.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'dashboard.html'));
});

// ---------------------------
// Start server
// ---------------------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 EventSync Server running on http://localhost:${PORT}`);
    console.log(`🔐 JWT Protected: /api/events, /api/stats`);
    console.log(`📅 DateTime + Category SUPPORTED!`);
});
