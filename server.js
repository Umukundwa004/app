// server.js - Enhanced with all services
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const path = require('path');
const session = require('express-session');
const nodemailer = require('nodemailer');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'rwanda-eats-reserve-secret-key';
const BCRYPT_ROUNDS = 12;

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'public/uploads/restaurants';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'image' || file.fieldname === 'images') {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    } else if (file.fieldname === 'video') {
        if (file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Only video files are allowed!'), false);
        }
    } else {
        cb(null, true);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB max file size
    }
});

// Email configuration (for demo - in production use real SMTP)
let emailTransporter;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    // Use provided SMTP credentials (e.g., Gmail app password)
    emailTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
} else {
    // Fallback to ethereal-like logging transporter for development
    emailTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: process.env.ETHEREAL_USER || 'your-email@ethereal.email',
            pass: process.env.ETHEREAL_PASS || 'your-password'
        }
    });
}

// Verify email transporter when possible and log result
if (emailTransporter) {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        emailTransporter.verify()
            .then(() => console.log('Email transporter verified and ready to send messages.'))
            .catch(err => console.error('Email transporter verification failed:', err));
    } else {
        console.log('Email transporter configured for development/fallback mode. Set EMAIL_USER and EMAIL_PASS to enable real SMTP.');
    }
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/views', express.static('views')); // Serve views folder for images
app.use(session({
    secret: 'rwanda-eats-reserve-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Database connection pool
// IMPORTANT: Update the password to match your MySQL root password
// Common defaults: '' (empty), 'root', 'password', or your custom password
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: process.env.DB_PASSWORD || 'vestine004', // ← set DB_PASSWORD env var or update this default
    database: process.env.DB_NAME || 'rwanda_eats_reserve',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Utility Functions
const generateToken = () => crypto.randomBytes(32).toString('hex');
const hashPassword = async (password) => await bcrypt.hash(password, BCRYPT_ROUNDS);
const verifyPassword = async (password, hash) => await bcrypt.compare(password, hash);

// Authentication Middleware
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const [users] = await db.execute('SELECT id, name, email, user_type FROM users WHERE id = ?', [decoded.userId]);
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        req.user = users[0];
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};

const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
};

const requireSystemAdmin = (req, res, next) => {
    if (!req.session.user || req.session.user.user_type !== 'system_admin') {
        return res.status(403).json({ error: 'System admin access required' });
    }
    next();
};

const requireRestaurantAdmin = (req, res, next) => {
    if (!req.session.user || req.session.user.user_type !== 'restaurant_admin') {
        return res.status(403).json({ error: 'Restaurant admin access required' });
    }
    next();
};

const isAuthenticated = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
};

// Notification Service
class NotificationService {
    static async sendEmail(to, subject, html) {
        try {
            // In production, this would send real emails
            console.log(`[EMAIL] To: ${to}, Subject: ${subject}`);
            console.log(`[EMAIL CONTENT] ${html}`);

            // Attempt to send using configured transporter
            await emailTransporter.sendMail({
                from: process.env.EMAIL_FROM || `"Rwanda Eats Reserve" <${process.env.EMAIL_USER || 'noreply@rwandaeats.com'}>`,
                to: to,
                subject: subject,
                html: html
            });

            return true;
        } catch (error) {
            console.error('Email sending error:', error);
            return false;
        }
    }

    static async sendSMS(to, message) {
        try {
            // In production, this would integrate with SMS gateway
            console.log(`[SMS] To: ${to}, Message: ${message}`);
            return true;
        } catch (error) {
            console.error('SMS sending error:', error);
            return false;
        }
    }

    static async createNotification(userId, title, message, type = 'system', channel = 'in_app', relatedReservationId = null) {
        try {
            const [result] = await db.execute(
                'INSERT INTO notifications (user_id, title, message, type, channel, related_reservation_id) VALUES (?, ?, ?, ?, ?, ?)',
                [userId, title, message, type, channel, relatedReservationId]
            );

            // If it's an email or SMS notification, send it immediately
            if (channel === 'email' || channel === 'sms') {
                const user = await this.getUser(userId);
                if (user) {
                    if (channel === 'email') {
                        await this.sendEmail(user.email, title, message);
                    } else if (channel === 'sms' && user.phone) {
                        await this.sendSMS(user.phone, message);
                    }
                    
                    // Mark as sent
                    await db.execute('UPDATE notifications SET is_sent = TRUE, sent_at = NOW() WHERE id = ?', [result.insertId]);
                }
            }

            return result.insertId;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }

    static async getUser(userId) {
        const [users] = await db.execute('SELECT id, name, email, phone FROM users WHERE id = ?', [userId]);
        return users.length > 0 ? users[0] : null;
    }

    static async sendWelcomeEmail(user) {
        const template = await this.getEmailTemplate('welcome');
        if (!template) return false;

        const verificationUrl = `http://localhost:3000/verify-email?token=${user.verification_token}`;
        const emailBody = template.body
            .replace('{{name}}', user.name)
            .replace('{{verification_url}}', verificationUrl);

        return await this.sendEmail(user.email, template.subject, emailBody);
    }

    static async sendReservationConfirmation(reservation, user, restaurant) {
        const template = await this.getEmailTemplate('reservation_confirmation');
        if (!template) return false;

        const emailBody = template.body
            .replace('{{customer_name}}', user.name)
            .replace('{{restaurant_name}}', restaurant.name)
            .replace('{{reservation_date}}', new Date(reservation.reservation_date).toLocaleDateString())
            .replace('{{reservation_time}}', reservation.reservation_time)
            .replace('{{party_size}}', reservation.party_size)
            .replace('{{restaurant_location}}', restaurant.location);

        const emailSent = await this.sendEmail(user.email, template.subject, emailBody);
        
        // Also send SMS if user has phone
        if (user.phone) {
            const smsTemplate = await this.getSmsTemplate('reservation_confirmation_sms');
            if (smsTemplate) {
                const smsMessage = smsTemplate.message
                    .replace('{{restaurant_name}}', restaurant.name)
                    .replace('{{reservation_date}}', new Date(reservation.reservation_date).toLocaleDateString())
                    .replace('{{reservation_time}}', reservation.reservation_time)
                    .replace('{{party_size}}', reservation.party_size);
                
                await this.sendSMS(user.phone, smsMessage);
            }
        }

        return emailSent;
    }

    static async getEmailTemplate(name) {
        const [templates] = await db.execute('SELECT * FROM email_templates WHERE name = ? AND is_active = TRUE', [name]);
        return templates.length > 0 ? templates[0] : null;
    }

    static async getSmsTemplate(name) {
        const [templates] = await db.execute('SELECT * FROM sms_templates WHERE name = ? AND is_active = TRUE', [name]);
        return templates.length > 0 ? templates[0] : null;
    }
}

// Audit Log Service
class AuditLogService {
    static async logAction(userId, action, resourceType = null, resourceId = null, details = null, req = null) {
        try {
            await db.execute(
                'INSERT INTO audit_logs (user_id, action, resource_type, resource_id, ip_address, user_agent, details) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [userId, action, resourceType, resourceId, req?.ip, req?.get('User-Agent'), details ? JSON.stringify(details) : null]
            );
        } catch (error) {
            console.error('Error logging action:', error);
        }
    }
}

// Routes

// Serve pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'customer.html'));
});

app.get('/admin', requireAuth, (req, res) => {
    if (req.session.user.user_type === 'system_admin') {
        res.sendFile(path.join(__dirname, 'views', 'system-admin.html'));
    } else if (req.session.user.user_type === 'restaurant_admin') {
        res.sendFile(path.join(__dirname, 'views', 'restaurant-admin.html'));
    } else {
        res.redirect('/');
    }
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

app.get('/verify-email', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'verify-email.html'));
});

// Identification & Authentication Services

// User Registration (FR 3.1)
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, phone, user_type = 'customer' } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
        }

        // Check if user already exists
        const [existingUsers] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        // Hash password
        const passwordHash = await hashPassword(password);
        const verificationToken = generateToken();
        const verificationTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Create user (store verification token and expiry)
        const [result] = await db.execute(
            'INSERT INTO users (name, email, password_hash, phone, user_type, verification_token, verification_token_expires) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, email, passwordHash, phone, user_type, verificationToken, verificationTokenExpires]
        );

        const userId = result.insertId;

        // Create session
        req.session.user = {
            id: userId,
            name: name,
            email: email,
            user_type: user_type
        };

        // Send welcome email with verification
        const user = { id: userId, name, email, phone, verification_token: verificationToken };
        await NotificationService.sendWelcomeEmail(user);

        // Log the action
        await AuditLogService.logAction(userId, 'USER_REGISTER', 'user', userId, { email, user_type }, req);

        res.json({ 
            message: 'Registration successful. Please check your email for verification.', 
            user: req.session.user 
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Get user with password hash
        const [users] = await db.execute(
            'SELECT id, name, email, password_hash, user_type, email_verified, account_locked, login_attempts FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];

        // Check if account is locked
        if (user.account_locked) {
            return res.status(423).json({ error: 'Account is locked. Please reset your password.' });
        }

        // Verify password
        const isValidPassword = await verifyPassword(password, user.password_hash);
        
        if (!isValidPassword) {
            // Increment login attempts
            const newAttempts = user.login_attempts + 1;
            const lockAccount = newAttempts >= 5;
            
            await db.execute(
                'UPDATE users SET login_attempts = ?, account_locked = ? WHERE id = ?',
                [newAttempts, lockAccount, user.id]
            );

            return res.status(401).json({ 
                error: lockAccount ? 
                    'Account locked due to too many failed attempts. Please reset your password.' : 
                    'Invalid credentials' 
            });
        }

        // Reset login attempts on successful login
        await db.execute(
            'UPDATE users SET login_attempts = 0, last_login = NOW() WHERE id = ?',
            [user.id]
        );

        // Create session
        req.session.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            user_type: user.user_type
        };

        // Generate JWT token for API access
        const token = jwt.sign(
            { userId: user.id, email: user.email, userType: user.user_type },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Log the action
        await AuditLogService.logAction(user.id, 'USER_LOGIN', 'user', user.id, { email }, req);

        res.json({ 
            message: 'Login successful', 
            user: req.session.user,
            token: token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Email Verification
app.post('/api/auth/verify-email', async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ error: 'Verification token is required' });
        }

        const [users] = await db.execute(
            'SELECT id, name, email FROM users WHERE verification_token = ? AND email_verified = FALSE AND verification_token_expires > NOW()',
            [token]
        );

        if (users.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired verification token' });
        }

        const user = users[0];

        // Verify email and clear token + expiry
        await db.execute(
            'UPDATE users SET email_verified = TRUE, verification_token = NULL, verification_token_expires = NULL WHERE id = ?',
            [user.id]
        );

        // Send confirmation notification
        await NotificationService.createNotification(
            user.id,
            'Email Verified',
            'Your email has been successfully verified. You can now enjoy all features of Rwanda Eats Reserve.',
            'verification',
            'in_app'
        );

        // Log the action
        await AuditLogService.logAction(user.id, 'EMAIL_VERIFIED', 'user', user.id, {}, req);

        res.json({ message: 'Email verified successfully' });
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Password Reset Request
app.post('/api/auth/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const [users] = await db.execute('SELECT id, name, email FROM users WHERE email = ?', [email]);
        
        if (users.length > 0) {
            const user = users[0];
            // Generate 6-digit verification code and store only its hash
            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            const resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
            const resetTokenHash = crypto.createHash('sha256').update(verificationCode).digest('hex');

            await db.execute(
                'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
                [resetTokenHash, resetTokenExpires, user.id]
            );

            // Send verification code email using NotificationService
            const subject = 'Password Reset Verification Code';
            const html = `
                <h2>Password Reset Request</h2>
                <p>Your password reset code is: <strong>${verificationCode}</strong></p>
                <p>This code will expire in 15 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `;

            try {
                await NotificationService.sendEmail(user.email, subject, html);
            } catch (e) {
                console.error('Error sending reset email:', e);
            }

            // Log the action
            await AuditLogService.logAction(user.id, 'PASSWORD_RESET_REQUEST', 'user', user.id, {}, req);
            
            res.json({ message: 'Verification code sent to your email' });
        } else {
            // Return success even if user not found (security best practice)
            res.json({ message: 'Verification code sent to your email' });
        }
    } catch (error) {
        console.error('Password reset request error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Verify Reset Code
app.post('/api/auth/verify-reset-code', async (req, res) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({ error: 'Email and code are required' });
        }

        const codeHash = crypto.createHash('sha256').update(code).digest('hex');
        const [users] = await db.execute(
            'SELECT id FROM users WHERE email = ? AND reset_token = ? AND reset_token_expires > NOW()',
            [email, codeHash]
        );

        if (users.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired verification code' });
        }

        res.json({ message: 'Code verified successfully' });
    } catch (error) {
        console.error('Code verification error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Password Reset
app.post('/api/auth/reset-password', async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;

        if (!email || !code || !newPassword) {
            return res.status(400).json({ error: 'Email, code and new password are required' });
        }

        const codeHash = crypto.createHash('sha256').update(code).digest('hex');
        const [users] = await db.execute(
            'SELECT id FROM users WHERE email = ? AND reset_token = ? AND reset_token_expires > NOW()',
            [email, codeHash]
        );

        if (users.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired verification code' });
        }

        const user = users[0];
        const passwordHash = await hashPassword(newPassword);

        await db.execute(
            'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL, account_locked = FALSE, login_attempts = 0 WHERE id = ?',
            [passwordHash, user.id]
        );

        // Log the action
        await AuditLogService.logAction(user.id, 'PASSWORD_RESET', 'user', user.id, {}, req);

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Logout
app.post('/api/auth/logout', requireAuth, (req, res) => {
    // Log the action
    AuditLogService.logAction(req.session.user.id, 'USER_LOGOUT', 'user', req.session.user.id, {}, req);
    
    req.session.destroy();
    res.json({ message: 'Logout successful' });
});

// Get current user
app.get('/api/auth/me', requireAuth, (req, res) => {
    res.json({ loggedIn: true, user: req.session.user });
});

// Enhanced API Routes with Authentication

// Alias for current user (for client compatibility)
app.get('/api/user', requireAuth, (req, res) => {
    res.json({ loggedIn: true, user: req.session.user });
});

// Get current user's profile details
app.get('/api/user/profile', requireAuth, async (req, res) => {
    try {
        const userId = req.session.user.id;
        const [rows] = await db.execute(
            'SELECT id, name, email, phone, created_at FROM users WHERE id = ?',
            [userId]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update current user's profile
app.put('/api/user/profile', requireAuth, async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { name, email, phone } = req.body || {};

        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required' });
        }

        // Ensure email is unique (excluding current user)
        const [existing] = await db.execute(
            'SELECT id FROM users WHERE email = ? AND id <> ?',
            [email, userId]
        );
        if (existing.length > 0) {
            return res.status(409).json({ error: 'Email is already in use' });
        }

        await db.execute(
            'UPDATE users SET name = ?, email = ?, phone = ?, updated_at = NOW() WHERE id = ?',
            [name, email, phone || null, userId]
        );

        // Update session user to keep UI in sync
        req.session.user.name = name;
        req.session.user.email = email;
        req.session.user.phone = phone || null;

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Reservation stats for current user
app.get('/api/user/reservation-stats', requireAuth, async (req, res) => {
    try {
        const userId = req.session.user.id;

        const [[total]] = await db.execute(
            'SELECT COUNT(*) AS cnt FROM reservations WHERE customer_id = ?',
            [userId]
        );

        const [[upcoming]] = await db.execute(
            `SELECT COUNT(*) AS cnt
             FROM reservations 
             WHERE customer_id = ?
               AND status IN ("pending", "confirmed")
               AND CONCAT(reservation_date, ' ', reservation_time) >= NOW()`,
            [userId]
        );

        const [[visited]] = await db.execute(
            `SELECT COUNT(DISTINCT restaurant_id) AS cnt
             FROM reservations 
             WHERE customer_id = ?
               AND status IN ("confirmed", "completed")`,
            [userId]
        );

        res.json({
            totalReservations: total.cnt || 0,
            upcomingReservations: upcoming.cnt || 0,
            restaurantsVisited: visited.cnt || 0
        });
    } catch (error) {
        console.error('Error fetching reservation stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get restaurants with filters
app.get('/api/restaurants', async (req, res) => {
    try {
        const { search, location, cuisine, price_range, limit } = req.query;
        
        let query = `
            SELECT r.*, u.name as admin_name 
            FROM restaurants r 
            LEFT JOIN users u ON r.restaurant_admin_id = u.id 
            WHERE r.is_active = TRUE
        `;
        const params = [];
        
        if (search) {
            query += ' AND (r.name LIKE ? OR r.description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }
        
        if (location) {
            query += ' AND r.location LIKE ?';
            params.push(`%${location}%`);
        }
        
        if (cuisine) {
            query += ' AND r.cuisine_type = ?';
            params.push(cuisine);
        }
        
        if (price_range) {
            query += ' AND r.price_range = ?';
            params.push(price_range);
        }
        
        query += ' ORDER BY r.name ASC';
        
        // MySQL may not accept parameter placeholders for LIMIT; inline a sanitized integer
        if (limit !== undefined && limit !== null && limit !== '' && !isNaN(parseInt(limit))) {
            const safeLimit = Math.max(0, parseInt(limit, 10));
            query += ` LIMIT ${safeLimit}`;
        }
        
        const [restaurants] = await db.execute(query, params);
        res.json(restaurants);
    } catch (error) {
        console.error('Error fetching restaurants:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get single restaurant by ID
app.get('/api/restaurants/:id', async (req, res) => {
    try {
        const [restaurants] = await db.execute(
            'SELECT * FROM restaurants WHERE id = ? AND is_active = TRUE',
            [req.params.id]
        );
        
        if (restaurants.length === 0) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }
        
        res.json(restaurants[0]);
    } catch (error) {
        console.error('Error fetching restaurant:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get restaurant menu
app.get('/api/restaurants/:id/menu', async (req, res) => {
    try {
        const [menuItems] = await db.execute(
            'SELECT * FROM menu_items WHERE restaurant_id = ? AND is_available = TRUE ORDER BY category, name',
            [req.params.id]
        );
        res.json(menuItems);
    } catch (error) {
        console.error('Error fetching menu:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// NEW: Get time-slot availability for a restaurant on a given date
// Response format: [{ time_slot: 'HH:MM:SS', available_tables: number }]
app.get('/api/restaurants/:id/availability', async (req, res) => {
    try {
        const restaurantId = req.params.id;
        const { date } = req.query; // Expect YYYY-MM-DD

        if (!date) {
            return res.status(400).json({ error: 'date query parameter is required (YYYY-MM-DD)' });
        }

        // Fetch restaurant opening/closing to constrain slots (fallback to 10:00-22:00)
        const [restaurants] = await db.execute('SELECT opening_time, closing_time, tables_count FROM restaurants WHERE id = ?', [restaurantId]);
        if (restaurants.length === 0) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }
        const { opening_time, closing_time, tables_count } = restaurants[0];

        // Load explicit availability overrides if provided
        const [overrides] = await db.execute(
            'SELECT time_slot, available_tables FROM table_availability WHERE restaurant_id = ? AND date = ? ORDER BY time_slot',
            [restaurantId, date]
        );

        // Build base slots every 30 minutes
        const baseOpen = opening_time || '10:00:00';
        const baseClose = closing_time || '22:00:00';
        const slots = [];
        const [openHour, openMinute] = baseOpen.split(':').map(Number);
        const [closeHour, closeMinute] = baseClose.split(':').map(Number);

        // Helper to compare times
        function timeLE(h, m, ch, cm) {
            return (h < ch) || (h === ch && m <= cm);
        }

        for (let h = openHour; h <= closeHour; h++) {
            for (let m = (h === openHour ? openMinute : 0); m < 60; m += 30) {
                if (!timeLE(h, m, closeHour, closeMinute)) break;
                const slotStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`;
                // Look for override
                const override = overrides.find(o => o.time_slot === slotStr);
                let available = override ? override.available_tables : tables_count;

                // Subtract already confirmed reservations for this slot
                const [reservations] = await db.execute(
                    `SELECT COUNT(*) AS confirmed_count
                     FROM reservations 
                     WHERE restaurant_id = ? AND reservation_date = ? AND reservation_time = ? AND status = 'confirmed'`,
                    [restaurantId, date, slotStr]
                );
                const confirmedCount = reservations[0].confirmed_count;
                available = Math.max(0, available - confirmedCount);

                slots.push({ time_slot: slotStr, available_tables: available });
            }
        }

        res.json(slots);
    } catch (error) {
        console.error('Error fetching availability:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create reservation with notifications
app.post('/api/reservations', async (req, res) => {
    try {
        const { customer_name, customer_email, customer_phone, restaurant_id, reservation_date, reservation_time, party_size, occasion, special_requests } = req.body;
        
        let customerId;
        
        // Check if customer exists
        const [existingCustomers] = await db.execute('SELECT id FROM users WHERE email = ?', [customer_email]);
        
        if (existingCustomers.length > 0) {
            customerId = existingCustomers[0].id;
        } else {
            // Create new customer account
            const passwordHash = await hashPassword(generateToken()); // Random password
            const [result] = await db.execute(
                'INSERT INTO users (name, email, password_hash, phone, user_type) VALUES (?, ?, ?, ?, "customer")',
                [customer_name, customer_email, passwordHash, customer_phone]
            );
            customerId = result.insertId;
            
            // Log the action
            await AuditLogService.logAction(customerId, 'USER_AUTO_CREATED', 'user', customerId, { email: customer_email }, req);
        }
        
        // Create reservation
        const [reservationResult] = await db.execute(
            'INSERT INTO reservations (customer_id, restaurant_id, reservation_date, reservation_time, party_size, occasion, special_requests) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [customerId, restaurant_id, reservation_date, reservation_time, party_size, occasion, special_requests]
        );
        
        const reservationId = reservationResult.insertId;
        
        // Get restaurant and customer details for notifications
        const [restaurants] = await db.execute('SELECT * FROM restaurants WHERE id = ?', [restaurant_id]);
        const [customers] = await db.execute('SELECT * FROM users WHERE id = ?', [customerId]);
        
        if (restaurants.length > 0 && customers.length > 0) {
            const restaurant = restaurants[0];
            const customer = customers[0];
            
            // Notify restaurant admin
            await NotificationService.createNotification(
                restaurant.restaurant_admin_id,
                'New Reservation Request',
                `New reservation request from ${customer_name} for ${reservation_date} at ${reservation_time}`,
                'new_reservation',
                'in_app',
                reservationId
            );
            
            // Notify customer
            await NotificationService.createNotification(
                customerId,
                'Reservation Request Sent',
                `Your reservation request at ${restaurant.name} has been received and is pending confirmation.`,
                'reservation_status',
                'in_app',
                reservationId
            );
        }
        
        // Log the action
        await AuditLogService.logAction(customerId, 'RESERVATION_CREATED', 'reservation', reservationId, { restaurant_id, reservation_date, reservation_time }, req);
        
        res.json({ 
            message: 'Reservation created successfully', 
            reservation_id: reservationId 
        });
    } catch (error) {
        console.error('Error creating reservation:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user's reservations
app.get('/api/user/reservations', isAuthenticated, async (req, res) => {
    try {
        const type = req.query.type || 'upcoming';
        const userId = req.session.user.id;
        
        let whereClause = 'WHERE r.customer_id = ?';
        const params = [userId];
        
        if (type === 'upcoming') {
            whereClause += ` AND r.status IN ('pending', 'confirmed') AND r.reservation_date >= CURDATE()`;
        } else if (type === 'past') {
            whereClause += ` AND (r.status = 'completed' OR r.reservation_date < CURDATE())`;
        } else if (type === 'cancelled') {
            whereClause += ` AND r.status IN ('cancelled', 'rejected')`;
        }
        
        const [reservations] = await db.execute(`
            SELECT 
                r.*,
                rest.name AS restaurant_name,
                rest.location AS restaurant_location,
                rest.contact_phone AS restaurant_phone,
                rest.contact_email AS restaurant_email
            FROM reservations r
            JOIN restaurants rest ON r.restaurant_id = rest.id
            ${whereClause}
            ORDER BY r.reservation_date DESC, r.reservation_time DESC
        `, params);
        
        res.json(reservations);
    } catch (error) {
        console.error('Error fetching user reservations:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update reservation status with notifications
app.put('/api/reservations/:id/status', requireAuth, async (req, res) => {
    try {
        const { status } = req.body;
        
        // Get current reservation details
        const [reservations] = await db.execute(
            `SELECT r.*, u.name as customer_name, u.email as customer_email, u.phone as customer_phone, 
                    rest.name as restaurant_name, rest.restaurant_admin_id
             FROM reservations r
             JOIN users u ON r.customer_id = u.id
             JOIN restaurants rest ON r.restaurant_id = rest.id
             WHERE r.id = ?`,
            [req.params.id]
        );
        
        if (reservations.length === 0) {
            return res.status(404).json({ error: 'Reservation not found' });
        }
        
        const reservation = reservations[0];
        
        // Update reservation status
        await db.execute('UPDATE reservations SET status = ? WHERE id = ?', [status, req.params.id]);
        
        // Notify customer
        let notificationTitle, notificationMessage;
        
        switch(status) {
            case 'confirmed':
                notificationTitle = 'Reservation Confirmed!';
                notificationMessage = `Your reservation at ${reservation.restaurant_name} has been confirmed for ${reservation.reservation_date} at ${reservation.reservation_time}.`;
                
                // Send email and SMS confirmation
                await NotificationService.sendReservationConfirmation(
                    reservation,
                    { name: reservation.customer_name, email: reservation.customer_email, phone: reservation.customer_phone },
                    { name: reservation.restaurant_name, location: reservation.location }
                );
                break;
                
            case 'rejected':
                notificationTitle = 'Reservation Declined';
                notificationMessage = `Unfortunately, your reservation at ${reservation.restaurant_name} for ${reservation.reservation_date} has been declined.`;
                break;
                
            case 'cancelled':
                notificationTitle = 'Reservation Cancelled';
                notificationMessage = `Your reservation at ${reservation.restaurant_name} has been cancelled.`;
                break;
        }
        
        if (notificationTitle) {
            await NotificationService.createNotification(
                reservation.customer_id,
                notificationTitle,
                notificationMessage,
                'reservation_status',
                'in_app',
                req.params.id
            );
        }
        
        // Log the action
        await AuditLogService.logAction(req.session.user.id, 'RESERVATION_STATUS_UPDATED', 'reservation', req.params.id, { status }, req);
        
        res.json({ message: 'Reservation status updated successfully' });
    } catch (error) {
        console.error('Error updating reservation status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user notifications
app.get('/api/notifications', requireAuth, async (req, res) => {
    try {
        const [notifications] = await db.execute(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
            [req.session.user.id]
        );
        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Mark notification as read
app.put('/api/notifications/:id/read', requireAuth, async (req, res) => {
    try {
        await db.execute(
            'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
            [req.params.id, req.session.user.id]
        );
        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error('Error updating notification:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Background job for sending reminders (simplified version)
setInterval(async () => {
    try {
        // Find reservations happening in the next 24 hours that haven't had reminders sent
        const [upcomingReservations] = await db.execute(`
            SELECT r.*, u.name as customer_name, u.email as customer_email, u.phone as customer_phone,
                   rest.name as restaurant_name, rest.location as restaurant_location
            FROM reservations r
            JOIN users u ON r.customer_id = u.id
            JOIN restaurants rest ON r.restaurant_id = rest.id
            WHERE r.status = 'confirmed' 
            AND r.reservation_date = CURDATE() + INTERVAL 1 DAY
            AND r.reminder_sent = FALSE
        `);
        
        for (const reservation of upcomingReservations) {
            // Send reminder
            await NotificationService.createNotification(
                reservation.customer_id,
                'Reservation Reminder',
                `Reminder: You have a reservation at ${reservation.restaurant_name} tomorrow at ${reservation.reservation_time}`,
                'reminder',
                'in_app',
                reservation.id
            );
            
            // Mark as reminder sent
            await db.execute('UPDATE reservations SET reminder_sent = TRUE WHERE id = ?', [reservation.id]);
        }
    } catch (error) {
        console.error('Error sending reminders:', error);
    }
}, 60 * 60 * 1000); // Run every hour
// Debug route to send a test email from the running server
// Protect this endpoint in production by setting `DEBUG_EMAIL_SECRET`
app.post('/api/debug/send-test-email', async (req, res) => {
    try {
        // Optional guard: require header when DEBUG_EMAIL_SECRET is set
        if (process.env.DEBUG_EMAIL_SECRET) {
            const provided = req.headers['x-debug-secret'] || req.body?.debug_secret;
            if (!provided || provided !== process.env.DEBUG_EMAIL_SECRET) {
                return res.status(403).json({ error: 'Forbidden' });
            }
        }

        const { to, subject, html } = req.body || {};
        const recipient = to || process.env.EMAIL_TEST_TO || 'your-test-recipient@example.com';
        const mailSubject = subject || 'Test Email from Rwanda Eats Reserve';
        const mailHtml = html || `<p>This is a test email sent at ${new Date().toISOString()}</p>`;

        const ok = await NotificationService.sendEmail(recipient, mailSubject, mailHtml);
        if (ok) {
            return res.json({ message: 'Test email sent', to: recipient });
        } else {
            return res.status(500).json({ error: 'Failed to send test email' });
        }
    } catch (err) {
        console.error('Test email error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Customer interface: http://localhost:${PORT}`);
    console.log(`Admin login: http://localhost:${PORT}/login`);
});
// Add this route to serve the registration page
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

// User Registration (FR 3.1)
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, phone, user_type = 'customer' } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
        }

        // Check if user already exists
        const [existingUsers] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        // Hash password
        const passwordHash = await hashPassword(password);
        const verificationToken = generateToken();

        // Create user
        const [result] = await db.execute(
            'INSERT INTO users (name, email, password_hash, phone, user_type, verification_token) VALUES (?, ?, ?, ?, ?, ?)',
            [name, email, passwordHash, phone, user_type, verificationToken]
        );

        const userId = result.insertId;

        // Create session
        req.session.user = {
            id: userId,
            name: name,
            email: email,
            user_type: user_type
        };

        // Send welcome email with verification
        const user = { id: userId, name, email, phone, verification_token: verificationToken };
        await NotificationService.sendWelcomeEmail(user);

        // Log the action
        await AuditLogService.logAction(userId, 'USER_REGISTER', 'user', userId, { email, user_type }, req);

        res.json({ 
            message: 'Registration successful. Please check your email for verification.', 
            user: req.session.user 
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Serve static pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'customer.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// NEW: Registration page route
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

// NEW: Email verification page route
app.get('/verify-email', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'verify-email.html'));
});

app.get('/admin', requireAuth, (req, res) => {
    if (req.session.user.user_type === 'system_admin') {
        res.sendFile(path.join(__dirname, 'views', 'system-admin.html'));
    } else if (req.session.user.user_type === 'restaurant_admin') {
        res.sendFile(path.join(__dirname, 'views', 'restaurant-admin.html'));
    } else {
        res.redirect('/');
    }
});

// Enhanced server.js with complete API routes

// Restaurant Admin API Routes
app.get('/api/restaurant-admin/dashboard-stats', requireRestaurantAdmin, async (req, res) => {
    try {
        const userId = req.session.user.id;
        
        const queries = {
            pendingReservations: `
                SELECT COUNT(*) as count FROM reservations r 
                JOIN restaurants rest ON r.restaurant_id = rest.id 
                WHERE rest.restaurant_admin_id = ? AND r.status = 'pending'
            `,
            confirmedToday: `
                SELECT COUNT(*) as count FROM reservations r 
                JOIN restaurants rest ON r.restaurant_id = rest.id 
                WHERE rest.restaurant_admin_id = ? AND r.status = 'confirmed' 
                AND r.reservation_date = CURDATE()
            `,
            totalRestaurants: `
                SELECT COUNT(*) as count FROM restaurants 
                WHERE restaurant_admin_id = ?
            `,
            occupancyRate: `
                SELECT COALESCE(AVG(
                    CASE WHEN r.status = 'confirmed' AND r.reservation_date = CURDATE() THEN 1 ELSE 0 END
                ) * 100, 0) as rate
                FROM reservations r 
                JOIN restaurants rest ON r.restaurant_id = rest.id 
                WHERE rest.restaurant_admin_id = ?
            `
        };

        const results = {};
        let completed = 0;
        const totalQueries = Object.keys(queries).length;

        Object.keys(queries).forEach(key => {
            db.execute(queries[key], [userId], (err, result) => {
                if (err) {
                    console.error(`Error in ${key}:`, err);
                } else {
                    results[key] = result[0].count || result[0].rate;
                }
                completed++;
                if (completed === totalQueries) {
                    res.json(results);
                }
            });
        });
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/restaurant-admin/reservations', requireRestaurantAdmin, async (req, res) => {
    try {
        const { status, restaurant_id, limit } = req.query;
        const userId = req.session.user.id;
        
        let query = `
            SELECT r.*, u.name as customer_name, u.email as customer_email, u.phone as customer_phone,
                   rest.name as restaurant_name
            FROM reservations r
            JOIN users u ON r.customer_id = u.id
            JOIN restaurants rest ON r.restaurant_id = rest.id
            WHERE rest.restaurant_admin_id = ?
        `;
        const params = [userId];
        
        if (status && status !== 'all') {
            query += ' AND r.status = ?';
            params.push(status);
        }
        
        if (restaurant_id && restaurant_id !== 'all') {
            query += ' AND r.restaurant_id = ?';
            params.push(restaurant_id);
        }
        
        query += ' ORDER BY r.reservation_date DESC, r.reservation_time DESC';
        
        // Inline sanitized LIMIT to avoid placeholder issues
        if (limit !== undefined && limit !== null && limit !== '' && !isNaN(parseInt(limit))) {
            const safeLimit = Math.max(0, parseInt(limit, 10));
            query += ` LIMIT ${safeLimit}`;
        }
        
        const [reservations] = await db.execute(query, params);
        res.json(reservations);
    } catch (error) {
        console.error('Error loading reservations:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/restaurant-admin/restaurants', requireRestaurantAdmin, async (req, res) => {
    try {
        const [restaurants] = await db.execute(
            'SELECT * FROM restaurants WHERE restaurant_admin_id = ? ORDER BY name',
            [req.session.user.id]
        );
        res.json(restaurants);
    } catch (error) {
        console.error('Error loading restaurants:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/restaurant-admin/restaurants', requireRestaurantAdmin, upload.fields([{ name: 'images', maxCount: 10 }, { name: 'video', maxCount: 1 }]), async (req, res) => {
    try {
        const { name, description, location, contact_phone, contact_email, opening_time, closing_time, cuisine_type, price_range, tables_count } = req.body;
        
        let video_url = null;
        
        if (req.files && req.files.video && req.files.video[0]) {
            video_url = '/uploads/restaurants/' + req.files.video[0].filename;
        }
        
        // Insert restaurant (without image_url for now, will use primary from restaurant_images)
        const [result] = await db.execute(
            `INSERT INTO restaurants (name, description, location, contact_phone, contact_email, 
             opening_time, closing_time, cuisine_type, price_range, tables_count, restaurant_admin_id, video_url) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, description, location, contact_phone, contact_email, opening_time, closing_time, 
             cuisine_type, price_range, tables_count, req.session.user.id, video_url]
        );
        
        const restaurantId = result.insertId;
        
        // Handle multiple images
        if (req.files && req.files.images && req.files.images.length > 0) {
            for (let i = 0; i < req.files.images.length; i++) {
                const image_url = '/uploads/restaurants/' + req.files.images[i].filename;
                const is_primary = i === 0; // First image is primary
                const display_order = i;
                
                await db.execute(
                    `INSERT INTO restaurant_images (restaurant_id, image_url, is_primary, display_order) 
                     VALUES (?, ?, ?, ?)`,
                    [restaurantId, image_url, is_primary, display_order]
                );
            }
            
            // Update restaurant with primary image URL for backward compatibility
            const primaryImageUrl = '/uploads/restaurants/' + req.files.images[0].filename;
            await db.execute(
                `UPDATE restaurants SET image_url = ? WHERE id = ?`,
                [primaryImageUrl, restaurantId]
            );
        }
        
        res.json({ message: 'Restaurant created successfully', id: restaurantId });
    } catch (error) {
        console.error('Error creating restaurant:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/restaurants/:id', requireRestaurantAdmin, upload.fields([{ name: 'images', maxCount: 10 }, { name: 'video', maxCount: 1 }]), async (req, res) => {
    try {
        const { name, description, location, contact_phone, contact_email, opening_time, closing_time, cuisine_type, price_range, tables_count } = req.body;
        
        // Verify ownership
        const [ownership] = await db.execute(
            'SELECT * FROM restaurants WHERE id = ? AND restaurant_admin_id = ?',
            [req.params.id, req.session.user.id]
        );
        
        if (ownership.length === 0) {
            return res.status(403).json({ error: 'Permission denied' });
        }
        
        let updateQuery = `UPDATE restaurants SET name = ?, description = ?, location = ?, contact_phone = ?, 
             contact_email = ?, opening_time = ?, closing_time = ?, cuisine_type = ?, price_range = ?, 
             tables_count = ?`;
        let updateParams = [name, description, location, contact_phone, contact_email, opening_time, closing_time, 
             cuisine_type, price_range, tables_count];
        
        // Handle video upload
        if (req.files && req.files.video && req.files.video[0]) {
            const video_url = '/uploads/restaurants/' + req.files.video[0].filename;
            updateQuery += ', video_url = ?';
            updateParams.push(video_url);
        }
        
        updateQuery += ' WHERE id = ?';
        updateParams.push(req.params.id);
        
        await db.execute(updateQuery, updateParams);
        
        // Handle new images upload
        if (req.files && req.files.images && req.files.images.length > 0) {
            // Get the current max display_order
            const [maxOrder] = await db.execute(
                'SELECT COALESCE(MAX(display_order), -1) as max_order FROM restaurant_images WHERE restaurant_id = ?',
                [req.params.id]
            );
            
            let nextOrder = maxOrder[0].max_order + 1;
            let firstNewImage = null;
            
            for (let i = 0; i < req.files.images.length; i++) {
                const image_url = '/uploads/restaurants/' + req.files.images[i].filename;
                
                // If this is the first new image and no images exist, make it primary
                const [existingImages] = await db.execute(
                    'SELECT COUNT(*) as count FROM restaurant_images WHERE restaurant_id = ?',
                    [req.params.id]
                );
                
                const is_primary = existingImages[0].count === 0 && i === 0;
                
                await db.execute(
                    `INSERT INTO restaurant_images (restaurant_id, image_url, is_primary, display_order) 
                     VALUES (?, ?, ?, ?)`,
                    [req.params.id, image_url, is_primary, nextOrder + i]
                );
                
                if (i === 0 && is_primary) {
                    firstNewImage = image_url;
                }
            }
            
            // Update restaurant's image_url if this is the first image
            if (firstNewImage) {
                await db.execute(
                    'UPDATE restaurants SET image_url = ? WHERE id = ?',
                    [firstNewImage, req.params.id]
                );
            }
        }
        
        res.json({ message: 'Restaurant updated successfully' });
    } catch (error) {
        console.error('Error updating restaurant:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Restaurant Images API
app.get('/api/restaurants/:id/images', async (req, res) => {
    try {
        const [images] = await db.execute(
            'SELECT * FROM restaurant_images WHERE restaurant_id = ? ORDER BY display_order',
            [req.params.id]
        );
        res.json(images);
    } catch (error) {
        console.error('Error loading restaurant images:', error && error.stack ? error.stack : error);
        // Return empty array so clients expecting an array don't break the UI
        res.json([]);
    }
});

// Delete a restaurant image
app.delete('/api/restaurants/:restaurantId/images/:imageId', requireRestaurantAdmin, async (req, res) => {
    try {
        const { restaurantId, imageId } = req.params;
        
        // Verify ownership
        const [ownership] = await db.execute(
            'SELECT * FROM restaurants WHERE id = ? AND restaurant_admin_id = ?',
            [restaurantId, req.session.user.id]
        );
        
        if (ownership.length === 0) {
            return res.status(403).json({ error: 'Permission denied' });
        }
        
        // Check if this is the primary image
        const [image] = await db.execute(
            'SELECT * FROM restaurant_images WHERE id = ? AND restaurant_id = ?',
            [imageId, restaurantId]
        );
        
        if (image.length === 0) {
            return res.status(404).json({ error: 'Image not found' });
        }
        
        const wasPrimary = image[0].is_primary;
        
        // Delete the image
        await db.execute(
            'DELETE FROM restaurant_images WHERE id = ?',
            [imageId]
        );
        
        // If it was primary, set another image as primary
        if (wasPrimary) {
            const [remainingImages] = await db.execute(
                'SELECT * FROM restaurant_images WHERE restaurant_id = ? ORDER BY display_order LIMIT 1',
                [restaurantId]
            );
            
            if (remainingImages.length > 0) {
                await db.execute(
                    'UPDATE restaurant_images SET is_primary = TRUE WHERE id = ?',
                    [remainingImages[0].id]
                );
                
                // Update restaurant's image_url
                await db.execute(
                    'UPDATE restaurants SET image_url = ? WHERE id = ?',
                    [remainingImages[0].image_url, restaurantId]
                );
            } else {
                // No images left, clear restaurant's image_url
                await db.execute(
                    'UPDATE restaurants SET image_url = NULL WHERE id = ?',
                    [restaurantId]
                );
            }
        }
        
        res.json({ message: 'Image deleted successfully' });
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Set primary image
app.put('/api/restaurants/:restaurantId/images/:imageId/primary', requireRestaurantAdmin, async (req, res) => {
    try {
        const { restaurantId, imageId } = req.params;
        
        // Verify ownership
        const [ownership] = await db.execute(
            'SELECT * FROM restaurants WHERE id = ? AND restaurant_admin_id = ?',
            [restaurantId, req.session.user.id]
        );
        
        if (ownership.length === 0) {
            return res.status(403).json({ error: 'Permission denied' });
        }
        
        // Verify the image belongs to this restaurant
        const [image] = await db.execute(
            'SELECT * FROM restaurant_images WHERE id = ? AND restaurant_id = ?',
            [imageId, restaurantId]
        );
        
        if (image.length === 0) {
            return res.status(404).json({ error: 'Image not found' });
        }
        
        // Unset all primary flags for this restaurant
        await db.execute(
            'UPDATE restaurant_images SET is_primary = FALSE WHERE restaurant_id = ?',
            [restaurantId]
        );
        
        // Set this image as primary
        await db.execute(
            'UPDATE restaurant_images SET is_primary = TRUE WHERE id = ?',
            [imageId]
        );
        
        // Update restaurant's image_url for backward compatibility
        await db.execute(
            'UPDATE restaurants SET image_url = ? WHERE id = ?',
            [image[0].image_url, restaurantId]
        );
        
        res.json({ message: 'Primary image updated successfully' });
    } catch (error) {
        console.error('Error setting primary image:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Menu Items API
app.get('/api/menu-items', async (req, res) => {
    try {
        const { restaurant_id } = req.query;
        let query = 'SELECT * FROM menu_items WHERE 1=1';
        const params = [];
        
        if (restaurant_id) {
            query += ' AND restaurant_id = ?';
            params.push(restaurant_id);
        }
        
        query += ' ORDER BY category, name';
        
        const [menuItems] = await db.execute(query, params);
        res.json(menuItems);
    } catch (error) {
        console.error('Error loading menu items:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/menu-items', requireRestaurantAdmin, async (req, res) => {
    try {
        const { name, description, price, category, cuisine, restaurant_id } = req.body;
        
        // Verify ownership
        const [ownership] = await db.execute(
            'SELECT * FROM restaurants WHERE id = ? AND restaurant_admin_id = ?',
            [restaurant_id, req.session.user.id]
        );
        
        if (ownership.length === 0) {
            return res.status(403).json({ error: 'Permission denied' });
        }
        
        const [result] = await db.execute(
            'INSERT INTO menu_items (name, description, price, category, cuisine, restaurant_id) VALUES (?, ?, ?, ?, ?, ?)',
            [name, description, price, category, cuisine, restaurant_id]
        );
        
        res.json({ message: 'Menu item created successfully', id: result.insertId });
    } catch (error) {
        console.error('Error creating menu item:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/menu-items/:id', requireRestaurantAdmin, async (req, res) => {
    try {
        const { name, description, price, category, cuisine } = req.body;
        
        // Verify ownership through restaurant
        const [ownership] = await db.execute(`
            SELECT m.* FROM menu_items m 
            JOIN restaurants r ON m.restaurant_id = r.id 
            WHERE m.id = ? AND r.restaurant_admin_id = ?
        `, [req.params.id, req.session.user.id]);
        
        if (ownership.length === 0) {
            return res.status(403).json({ error: 'Permission denied' });
        }
        
        await db.execute(
            'UPDATE menu_items SET name = ?, description = ?, price = ?, category = ?, cuisine = ? WHERE id = ?',
            [name, description, price, category, cuisine, req.params.id]
        );
        
        res.json({ message: 'Menu item updated successfully' });
    } catch (error) {
        console.error('Error updating menu item:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/menu-items/:id', requireRestaurantAdmin, async (req, res) => {
    try {
        // Verify ownership through restaurant
        const [ownership] = await db.execute(`
            SELECT m.* FROM menu_items m 
            JOIN restaurants r ON m.restaurant_id = r.id 
            WHERE m.id = ? AND r.restaurant_admin_id = ?
        `, [req.params.id, req.session.user.id]);
        
        if (ownership.length === 0) {
            return res.status(403).json({ error: 'Permission denied' });
        }
        
        await db.execute('DELETE FROM menu_items WHERE id = ?', [req.params.id]);
        
        res.json({ message: 'Menu item deleted successfully' });
    } catch (error) {
        console.error('Error deleting menu item:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Table Availability API
app.post('/api/table-availability', requireRestaurantAdmin, async (req, res) => {
    try {
        const { restaurant_id, date, availability } = req.body;
        
        // Verify ownership
        const [ownership] = await db.execute(
            'SELECT * FROM restaurants WHERE id = ? AND restaurant_admin_id = ?',
            [restaurant_id, req.session.user.id]
        );
        
        if (ownership.length === 0) {
            return res.status(403).json({ error: 'Permission denied' });
        }
        
        // Delete existing availability for the date
        await db.execute(
            'DELETE FROM table_availability WHERE restaurant_id = ? AND date = ?',
            [restaurant_id, date]
        );
        
        // Insert new availability
        for (const slot of availability) {
            await db.execute(
                'INSERT INTO table_availability (restaurant_id, date, time_slot, available_tables) VALUES (?, ?, ?, ?)',
                [restaurant_id, date, slot.time_slot, slot.available_tables]
            );
        }
        
        res.json({ message: 'Table availability updated successfully' });
    } catch (error) {
        console.error('Error updating table availability:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Restaurant Admin Reports API
app.get('/api/restaurant-admin/reports', requireRestaurantAdmin, async (req, res) => {
    try {
        const { restaurant_id, start_date, end_date } = req.query;
        const userId = req.session.user.id;
        
        // Build where clause
        let whereClause = 'r.restaurant_id IN (SELECT id FROM restaurants WHERE restaurant_admin_id = ?)';
        const params = [userId];
        
        if (restaurant_id && restaurant_id !== 'all') {
            whereClause += ' AND r.restaurant_id = ?';
            params.push(restaurant_id);
        }
        
        if (start_date && end_date) {
            whereClause += ' AND r.reservation_date BETWEEN ? AND ?';
            params.push(start_date, end_date);
        }
        
        // Get status summary
        const [statusSummary] = await db.execute(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
            FROM reservations r
            WHERE ${whereClause}
        `, params);
        
        // Get daily data
        const [dailyData] = await db.execute(`
            SELECT 
                reservation_date as date,
                COUNT(*) as total_reservations,
                SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
                ROUND((SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) / COUNT(*) * 100), 2) as occupancy_rate
            FROM reservations r
            WHERE ${whereClause}
            GROUP BY reservation_date
            ORDER BY reservation_date
        `, params);
        
        res.json({
            statusSummary: statusSummary[0],
            dailyData: dailyData
        });
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// System Admin API Routes
app.get('/api/system-admin/stats', requireSystemAdmin, async (req, res) => {
    try {
        // Execute all queries in parallel using Promise.all
        const [
            [totalUsersResult],
            [totalRestaurantsResult],
            [totalReservationsResult],
            [pendingReservationsResult],
            [totalMenuItemsResult],
            [activeRestaurantsResult],
            [recentReservationsResult]
        ] = await Promise.all([
            db.execute('SELECT COUNT(*) as count FROM users'),
            db.execute('SELECT COUNT(*) as count FROM restaurants'),
            db.execute('SELECT COUNT(*) as count FROM reservations'),
            db.execute('SELECT COUNT(*) as count FROM reservations WHERE status = "pending"'),
            db.execute('SELECT COUNT(*) as count FROM menu_items'),
            db.execute('SELECT COUNT(*) as count FROM restaurants WHERE is_active = TRUE'),
            db.execute(`
                SELECT r.*, rest.name as restaurant_name, u.name as customer_name
                FROM reservations r
                JOIN restaurants rest ON r.restaurant_id = rest.id
                JOIN users u ON r.customer_id = u.id
                ORDER BY r.created_at DESC
                LIMIT 5
            `)
        ]);
        
        // Get user counts by type
        const [usersByType] = await db.execute(`
            SELECT 
                user_type,
                COUNT(*) as count
            FROM users
            GROUP BY user_type
        `);
        
        // Get reservation stats by status
        const [reservationsByStatus] = await db.execute(`
            SELECT 
                status,
                COUNT(*) as count
            FROM reservations
            GROUP BY status
        `);
        
        res.json({
            totalUsers: totalUsersResult[0].count,
            totalRestaurants: totalRestaurantsResult[0].count,
            totalReservations: totalReservationsResult[0].count,
            pendingReservations: pendingReservationsResult[0].count,
            totalMenuItems: totalMenuItemsResult[0].count,
            activeRestaurants: activeRestaurantsResult[0].count,
            usersByType: usersByType.reduce((acc, row) => {
                acc[row.user_type] = row.count;
                return acc;
            }, {}),
            reservationsByStatus: reservationsByStatus.reduce((acc, row) => {
                acc[row.status] = row.count;
                return acc;
            }, {}),
            recentReservations: recentReservationsResult
        });
    } catch (error) {
        console.error('Error loading system stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/system-admin/users', requireSystemAdmin, async (req, res) => {
    try {
        const { type, status, limit } = req.query;
        
        let query = 'SELECT id, name, email, phone, user_type, email_verified, account_locked, created_at FROM users WHERE 1=1';
        const params = [];
        
        if (type && type !== 'all') {
            query += ' AND user_type = ?';
            params.push(type);
        }
        
        if (status && status !== 'all') {
            if (status === 'locked') {
                query += ' AND account_locked = TRUE';
            } else if (status === 'active') {
                query += ' AND account_locked = FALSE AND email_verified = TRUE';
            } else if (status === 'inactive') {
                query += ' AND email_verified = FALSE';
            }
        }
        
        query += ' ORDER BY created_at DESC';
        
        // Inline sanitized LIMIT to avoid placeholder issues
        if (limit !== undefined && limit !== null && limit !== '' && !isNaN(parseInt(limit))) {
            const safeLimit = Math.max(0, parseInt(limit, 10));
            query += ` LIMIT ${safeLimit}`;
        }
        
        const [users] = await db.execute(query, params);
        res.json(users);
    } catch (error) {
        console.error('Error loading users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/system-admin/users', requireSystemAdmin, async (req, res) => {
    try {
        const { name, email, phone, user_type, password } = req.body;
        
        // Check if user already exists
        const [existingUsers] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }
        
        const passwordHash = await hashPassword(password || 'default123');
        
        const [result] = await db.execute(
            'INSERT INTO users (name, email, phone, user_type, password_hash, email_verified) VALUES (?, ?, ?, ?, ?, TRUE)',
            [name, email, phone, user_type, passwordHash]
        );
        
        res.json({ message: 'User created successfully', id: result.insertId });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/system-admin/users/:id', requireSystemAdmin, async (req, res) => {
    try {
        const { name, email, phone, user_type, password } = req.body;
        
        let query = 'UPDATE users SET name = ?, email = ?, phone = ?, user_type = ?';
        const params = [name, email, phone, user_type];
        
        if (password) {
            const passwordHash = await hashPassword(password);
            query += ', password_hash = ?';
            params.push(passwordHash);
        }
        
        query += ' WHERE id = ?';
        params.push(req.params.id);
        
        await db.execute(query, params);
        
        res.json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/system-admin/users/:id', requireSystemAdmin, async (req, res) => {
    try {
        // Prevent deleting your own account
        if (parseInt(req.params.id) === req.session.user.id) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }
        
        await db.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
        
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/system-admin/users/:id/unlock', requireSystemAdmin, async (req, res) => {
    try {
        await db.execute(
            'UPDATE users SET account_locked = FALSE, login_attempts = 0 WHERE id = ?',
            [req.params.id]
        );
        
        res.json({ message: 'User unlocked successfully' });
    } catch (error) {
        console.error('Error unlocking user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/system-admin/restaurants', requireSystemAdmin, async (req, res) => {
    try {
        const { status, cuisine } = req.query;
        
        let query = `
            SELECT r.*, u.name as admin_name 
            FROM restaurants r 
            LEFT JOIN users u ON r.restaurant_admin_id = u.id 
            WHERE 1=1
        `;
        const params = [];
        
        if (status && status !== 'all') {
            if (status === 'active') {
                query += ' AND r.is_active = TRUE';
            } else if (status === 'inactive') {
                query += ' AND r.is_active = FALSE';
            }
        }
        
        if (cuisine && cuisine !== 'all') {
            query += ' AND r.cuisine_type = ?';
            params.push(cuisine);
        }
        
        query += ' ORDER BY r.name';
        
        const [restaurants] = await db.execute(query, params);
        res.json(restaurants);
    } catch (error) {
        console.error('Error loading restaurants:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/system-admin/restaurants/:id/status', requireSystemAdmin, async (req, res) => {
    try {
        const { active } = req.body;
        
        await db.execute(
            'UPDATE restaurants SET is_active = ? WHERE id = ?',
            [active, req.params.id]
        );
        
        res.json({ message: `Restaurant ${active ? 'activated' : 'deactivated'} successfully` });
    } catch (error) {
        console.error('Error updating restaurant status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// System Admin - Create Restaurant
app.post('/api/system-admin/restaurants', requireSystemAdmin, upload.fields([{ name: 'images', maxCount: 10 }, { name: 'video', maxCount: 1 }, { name: 'menu_pdf', maxCount: 1 }]), async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Accept frontend field names (location, contact_phone, contact_email, cuisine_type, price_range, tables_count)
        const { name, description, location, contact_phone, contact_email, opening_time, closing_time, cuisine_type, price_range, tables_count, operating_hours, menu, create_new_admin, admin_name, admin_email, admin_login_email, admin_phone, admin_password } = req.body;
        
        let adminId;
        
        // This logic assumes if an admin email is provided, we're creating a new admin.
        if (admin_email && admin_password) {
            if (!admin_email || !admin_password) {
                await connection.rollback();
                return res.status(400).json({ error: 'Admin email and password are required for new admin creation' });
            }
            
            // Check if email already exists
            const [existingUser] = await connection.execute('SELECT id FROM users WHERE email = ?', [admin_email]);
            if (existingUser.length > 0) {
                await connection.rollback();
                return res.status(409).json({ error: 'A user with this email already exists' });
            }
            
            // Create the restaurant admin user
            const passwordHash = await hashPassword(admin_password);
            const [adminResult] = await connection.execute(
                'INSERT INTO users (name, email, password_hash, user_type, email_verified) VALUES (?, ?, ?, ?, ?)',
                // Use email as name if name is not provided
                [admin_email, admin_email, passwordHash, 'restaurant_admin', true]
            );
            
            adminId = adminResult.insertId;
            
            // Log the admin creation
            await AuditLogService.logAction(req.session.user.id, 'USER_CREATED', 'user', adminId, { user_type: 'restaurant_admin' }, req, connection);
        }
        
        let video_url = null;
        let menu_pdf_url = null;

        if (req.files && req.files.video && req.files.video[0]) {
            video_url = '/uploads/restaurants/' + req.files.video[0].filename;
        }

        if (req.files && req.files.menu_pdf && req.files.menu_pdf[0]) {
            menu_pdf_url = '/uploads/restaurants/' + req.files.menu_pdf[0].filename;
        }
        
        // Insert restaurant (include new fields if available)
        const [result] = await connection.execute(
            `INSERT INTO restaurants (name, description, location, contact_phone, contact_email, opening_time, closing_time, cuisine_type, price_range, tables_count, operating_hours, menu, menu_pdf, restaurant_admin_id, video_url) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, description || null, location || null, contact_phone || null, contact_email || null, opening_time || null, closing_time || null, cuisine_type || null, price_range || '2', tables_count || 10, operating_hours ? JSON.stringify(operating_hours) : null, menu || null, menu_pdf_url || null, adminId || null, video_url || null]
        );
        
        const restaurantId = result.insertId;
        
        // Handle multiple images
        if (req.files && req.files.images && req.files.images.length > 0) {
            try {
                for (let i = 0; i < req.files.images.length; i++) {
                    const image_url = '/uploads/restaurants/' + req.files.images[i].filename;
                    const is_primary = i === 0; // First image is primary
                    const display_order = i;
                    
                    await connection.execute(
                        `INSERT INTO restaurant_images (restaurant_id, image_url, is_primary, display_order) 
                         VALUES (?, ?, ?, ?)`,
                        [restaurantId, image_url, is_primary, display_order]
                    );
                }
                
                // Update restaurant with primary image URL for backward compatibility
                const primaryImageUrl = '/uploads/restaurants/' + req.files.images[0].filename;
                await connection.execute(
                    `UPDATE restaurants SET image_url = ? WHERE id = ?`,
                    [primaryImageUrl, restaurantId]
                );
            } catch (imgError) {
                if (imgError.code === 'ER_NO_SUCH_TABLE') {
                    console.warn('`restaurant_images` table not found, skipping image processing.');
                } else {
                    throw imgError; // re-throw other errors
                }
            }
        }

        await AuditLogService.logAction(req.session.user.id, 'RESTAURANT_CREATED', 'restaurant', restaurantId, { name }, req, connection);

        await connection.commit();
        
        res.status(201).json({ message: 'Restaurant created successfully', id: restaurantId });
        
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error creating restaurant:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        if (connection) connection.release();
    }
});

// System Admin - Update Restaurant
app.put('/api/system-admin/restaurants/:id', requireSystemAdmin, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }, { name: 'menu_pdf', maxCount: 1 }]), async (req, res) => {
    try {
        const { name, description, location, contact_phone, contact_email, opening_time, closing_time, cuisine_type, price_range, tables_count, restaurant_admin_id, operating_hours, menu } = req.body;
        
        let updateQuery = `UPDATE restaurants SET name = ?, description = ?, location = ?, contact_phone = ?, 
             contact_email = ?, opening_time = ?, closing_time = ?, cuisine_type = ?, price_range = ?, 
             tables_count = ?`;
        let updateParams = [name, description, location, contact_phone, contact_email, opening_time, closing_time, 
             cuisine_type, price_range, tables_count];
        
        // Handle file uploads (image, video, menu_pdf)
        if (req.files) {
            if (req.files.image && req.files.image[0]) {
                const image_url = '/uploads/restaurants/' + req.files.image[0].filename;
                updateQuery += ', image_url = ?';
                updateParams.push(image_url);
            }
            if (req.files.video && req.files.video[0]) {
                const video_url = '/uploads/restaurants/' + req.files.video[0].filename;
                updateQuery += ', video_url = ?';
                updateParams.push(video_url);
            }
            if (req.files.menu_pdf && req.files.menu_pdf[0]) {
                const menu_pdf_url = '/uploads/restaurants/' + req.files.menu_pdf[0].filename;
                updateQuery += ', menu_pdf = ?';
                updateParams.push(menu_pdf_url);
            }
        }

        // Support updating menu text and operating hours
        if (typeof menu !== 'undefined') {
            updateQuery += ', menu = ?';
            updateParams.push(menu || null);
        }
        if (typeof operating_hours !== 'undefined') {
            updateQuery += ', operating_hours = ?';
            try {
                updateParams.push(operating_hours ? JSON.stringify(operating_hours) : null);
            } catch (e) {
                updateParams.push(null);
            }
        }
        
        updateQuery += ' WHERE id = ?';
        updateParams.push(req.params.id);
        
        await db.execute(updateQuery, updateParams);
        
        res.json({ message: 'Restaurant updated successfully' });
    } catch (error) {
        console.error('Error updating restaurant:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// System Admin - Delete Restaurant (and optionally its admin user)
app.delete('/api/system-admin/restaurants/:id', requireSystemAdmin, async (req, res) => {
    try {
        const restaurantId = req.params.id;

        // Get the restaurant and associated admin id
        const [restaurants] = await db.execute('SELECT * FROM restaurants WHERE id = ?', [restaurantId]);
        if (restaurants.length === 0) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }

        const restaurant = restaurants[0];
        const adminId = restaurant.restaurant_admin_id;

        // Delete related images (some deployments may not have this table)
        try {
            await db.execute('DELETE FROM restaurant_images WHERE restaurant_id = ?', [restaurantId]);
        } catch (err) {
            if (err && err.code === 'ER_NO_SUCH_TABLE') {
                console.warn('restaurant_images table missing, skipping image cleanup');
            } else {
                throw err;
            }
        }

        // Delete reservations for the restaurant (if table exists)
        try {
            await db.execute('DELETE FROM reservations WHERE restaurant_id = ?', [restaurantId]);
        } catch (err) {
            if (err && err.code === 'ER_NO_SUCH_TABLE') {
                console.warn('reservations table missing, skipping reservations cleanup');
            } else {
                throw err;
            }
        }

        // Finally delete the restaurant
        await db.execute('DELETE FROM restaurants WHERE id = ?', [restaurantId]);

        // If an admin was attached, decide whether to delete the user account
        if (adminId) {
            // Check if this admin is assigned to other restaurants
            const [other] = await db.execute('SELECT COUNT(*) as cnt FROM restaurants WHERE restaurant_admin_id = ?', [adminId]);
            if (other[0].cnt === 0) {
                // Safe to delete the user (only a restaurant_admin should be deleted)
                await db.execute('DELETE FROM users WHERE id = ? AND user_type = "restaurant_admin"', [adminId]);
            } else {
                // If admin is still assigned elsewhere, do nothing (orphaning shouldn't happen here)
                await db.execute('UPDATE restaurants SET restaurant_admin_id = NULL WHERE id = ?', [restaurantId]);
            }
        }

        // Log the action
        await AuditLogService.logAction(req.session.user.id, 'RESTAURANT_DELETED', 'restaurant', restaurantId, { adminDeleted: !!adminId }, req);

        res.json({ message: 'Restaurant and related data deleted successfully' });
    } catch (error) {
        console.error('Error deleting restaurant:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/system-admin/reservations', requireSystemAdmin, async (req, res) => {
    try {
        const { status, restaurant_id, date } = req.query;
        
        let query = `
            SELECT r.*, u.name as customer_name, u.email as customer_email, 
                   rest.name as restaurant_name
            FROM reservations r
            JOIN users u ON r.customer_id = u.id
            JOIN restaurants rest ON r.restaurant_id = rest.id
            WHERE 1=1
        `;
        const params = [];
        
        if (status && status !== 'all') {
            query += ' AND r.status = ?';
            params.push(status);
        }
        
        if (restaurant_id && restaurant_id !== 'all') {
            query += ' AND r.restaurant_id = ?';
            params.push(restaurant_id);
        }
        
        if (date) {
            query += ' AND r.reservation_date = ?';
            params.push(date);
        }
        
        query += ' ORDER BY r.reservation_date DESC, r.reservation_time DESC';
        
        const [reservations] = await db.execute(query, params);
        res.json(reservations);
    } catch (error) {
        console.error('Error loading reservations:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/system-admin/audit-logs', requireSystemAdmin, async (req, res) => {
    try {
        const { action, user_id, date } = req.query;
        
        let query = `
            SELECT a.*, u.name as user_name, u.email as user_email
            FROM audit_logs a
            LEFT JOIN users u ON a.user_id = u.id
            WHERE 1=1
        `;
        const params = [];
        
        if (action && action !== 'all') {
            query += ' AND a.action LIKE ?';
            params.push(`%${action}%`);
        }
        
        if (user_id && user_id !== 'all') {
            query += ' AND a.user_id = ?';
            params.push(user_id);
        }
        
        if (date) {
            query += ' AND DATE(a.created_at) = ?';
            params.push(date);
        }
        
        query += ' ORDER BY a.created_at DESC LIMIT 100';
        
        const [logs] = await db.execute(query, params);
        res.json(logs);
    } catch (error) {
        console.error('Error loading audit logs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// System Admin - Reset a user's password (only password field)
app.put('/api/system-admin/users/:id/password', requireSystemAdmin, async (req, res) => {
    try {
        const { password } = req.body;
        if (!password || password.length < 6) {
            return res.status(400).json({ error: 'Password is required and must be at least 6 characters' });
        }

        const passwordHash = await hashPassword(password);
        await db.execute('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, req.params.id]);

        // Log the action
        await AuditLogService.logAction(req.session.user.id, 'USER_PASSWORD_RESET', 'user', req.params.id, {}, req);

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error resetting user password:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});