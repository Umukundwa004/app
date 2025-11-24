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
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'vestine004', // ← set DB_PASSWORD env var or update this default
    database: process.env.DB_NAME || 'rwanda_eats_reserve',
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_CONN_LIMIT, 10) || 10,
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
            'SELECT id FROM users WHERE email = ? AND reset_token = ? AND reset_token_EXPIRES > NOW()',
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
