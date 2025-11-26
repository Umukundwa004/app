// server.js - Enhanced with all services
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const path = require('path');
const session = require('express-session');
const { MailerSend, EmailParams, Sender, Recipient } = require('mailersend');
const axios = require('axios');
const SibApiV3Sdk = require('sib-api-v3-sdk');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 9000;

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

// MailerSend Email configuration
let mailerSend;
if (process.env.MAILERSEND_API_KEY) {
    mailerSend = new MailerSend({
        apiKey: process.env.MAILERSEND_API_KEY,
    });
    console.log('MailerSend configured successfully');
} else {
    console.log('MailerSend API key not found. Email functionality will be limited.');
}

// Brevo (Sendinblue) Email configuration
let brevoClient;
if (process.env.BREVO_API_KEY) {
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.BREVO_API_KEY;
    brevoClient = {
        transactionalEmailApi: new SibApiV3Sdk.TransactionalEmailsApi(),
        campaignsApi: new SibApiV3Sdk.EmailCampaignsApi()
    };
    console.log('Brevo configured successfully');
} else {
    console.log('Brevo API key not found.');
}

// Email verification service using MailerSend API
class EmailVerificationService {
    static async verifyEmail(email) {
        try {
            const response = await axios.post(
                `${process.env.MAILERSEND_API_URL}/email-verification/verify`,
                { email },
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.MAILERSEND_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Email verification error:', error.response?.data || error.message);
            return { valid: false, error: error.response?.data || error.message };
        }
    }
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/views', express.static('views')); // Serve views folder for images

// Serve PWA files
app.get('/manifest.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.sendFile(path.join(__dirname, 'public', 'manifest.json'));
});

app.get('/service-worker.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(path.join(__dirname, 'public', 'service-worker.js'));
});

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

// Email validation function
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

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
    console.log('requireSystemAdmin - Session:', req.session);
    console.log('requireSystemAdmin - User:', req.session.user);
    if (!req.session.user || req.session.user.user_type !== 'system_admin') {
        console.log('requireSystemAdmin - Access denied. User type:', req.session.user?.user_type);
        return res.status(403).json({ error: 'System admin access required' });
    }
    console.log('requireSystemAdmin - Access granted for user:', req.session.user.email);
    next();
};

const requireRestaurantAdmin = (req, res, next) => {
    console.log('requireRestaurantAdmin - Session:', req.session);
    console.log('requireRestaurantAdmin - User:', req.session.user);
    if (!req.session.user || req.session.user.user_type !== 'restaurant_admin') {
        console.log('requireRestaurantAdmin - Access denied. User type:', req.session.user?.user_type);
        return res.status(403).json({ error: 'Restaurant admin access required' });
    }
    console.log('requireRestaurantAdmin - Access granted for user:', req.session.user.email);
    next();
};

const isAuthenticated = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
};

// Enhanced Email Service with comprehensive error handling and logging
class EmailService {
    // Send transactional emails using Brevo (preferred) or MailerSend (fallback)
    static async sendEmail(to, subject, html) {
        const MAX_RETRIES = 2;
        let lastError = null;

        // Try Brevo first
        if (brevoClient && process.env.BREVO_API_KEY) {
            for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
                try {
                    const sendSmtpEmail = {
                        sender: {
                            name: process.env.BREVO_FROM_NAME || 'Rwanda Eats Reserve',
                            email: process.env.BREVO_FROM_EMAIL || 'noreply@rwandaeats.com'
                        },
                        to: [{ email: to }],
                        subject: subject,
                        htmlContent: html
                    };

                    const response = await brevoClient.transactionalEmailApi.sendTransacEmail(sendSmtpEmail);
                    console.log(`✅ [BREVO EMAIL SENT] To: ${to}, Subject: ${subject}, MessageID: ${response.messageId}`);
                    return { success: true, provider: 'brevo', messageId: response.messageId };
                } catch (error) {
                    lastError = error;
                    console.error(`⚠️ [BREVO ATTEMPT ${attempt + 1}/${MAX_RETRIES + 1}] Failed:`, error.message);
                    
                    if (attempt < MAX_RETRIES) {
                        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // Exponential backoff
                    }
                }
            }
        }

        // Fallback to MailerSend
        if (mailerSend && process.env.MAILERSEND_API_KEY) {
            for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
                try {
                    const sentFrom = new Sender(
                        process.env.MAILERSEND_FROM_EMAIL || 'noreply@yourdomain.com',
                        process.env.MAILERSEND_FROM_NAME || 'Rwanda Eats Reserve'
                    );

                    const recipients = [new Recipient(to)];

                    const emailParams = new EmailParams()
                        .setFrom(sentFrom)
                        .setTo(recipients)
                        .setSubject(subject)
                        .setHtml(html);

                    const response = await mailerSend.email.send(emailParams);
                    console.log(`✅ [MAILERSEND EMAIL SENT] To: ${to}, Subject: ${subject}`);
                    return { success: true, provider: 'mailersend', response };
                } catch (error) {
                    lastError = error;
                    console.error(`⚠️ [MAILERSEND ATTEMPT ${attempt + 1}/${MAX_RETRIES + 1}] Failed:`, error.message);
                    
                    if (attempt < MAX_RETRIES) {
                        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
                    }
                }
            }
        }

        // All attempts failed
        console.error('❌ [EMAIL FAILED] All providers failed:', lastError?.message || 'No providers configured');
        console.log(`📧 [EMAIL FALLBACK] To: ${to}, Subject: ${subject}`);
        console.log(`📝 [EMAIL CONTENT] ${html.substring(0, 200)}...`);
        
        return { 
            success: false, 
            error: lastError?.message || 'No email providers configured',
            fallback: true 
        };
    }

    // Create and send email campaigns using Brevo
    static async createEmailCampaign(campaignData) {
        if (!brevoClient) {
            throw new Error('Brevo not configured for campaigns');
        }

        try {
            const emailCampaign = {
                name: campaignData.name || 'Rwanda Eats Campaign',
                subject: campaignData.subject,
                sender: {
                    name: process.env.BREVO_FROM_NAME || 'Rwanda Eats Reserve',
                    email: process.env.BREVO_FROM_EMAIL || 'noreply@rwandaeats.com'
                },
                type: 'classic',
                htmlContent: campaignData.htmlContent,
                recipients: campaignData.recipients || { listIds: [] },
                scheduledAt: campaignData.scheduledAt || null
            };

            const response = await brevoClient.campaignsApi.createEmailCampaign(emailCampaign);
            console.log(`✅ [BREVO CAMPAIGN CREATED] ID: ${response.id}, Name: ${campaignData.name}`);
            return response;
        } catch (error) {
            console.error('❌ [CAMPAIGN CREATION ERROR]:', error.message);
            throw error;
        }
    }

    // Test email configuration
    static async testConfiguration() {
        const results = {
            brevo: { configured: false, working: false },
            mailersend: { configured: false, working: false }
        };

        // Test Brevo
        if (brevoClient && process.env.BREVO_API_KEY) {
            results.brevo.configured = true;
            try {
                await brevoClient.accountApi.getAccount();
                results.brevo.working = true;
                console.log('✅ Brevo configuration is working');
            } catch (error) {
                console.error('❌ Brevo configuration failed:', error.message);
            }
        }

        // Test MailerSend (basic check)
        if (mailerSend && process.env.MAILERSEND_API_KEY) {
            results.mailersend.configured = true;
            results.mailersend.working = true; // Can't easily test without sending
            console.log('✅ MailerSend is configured');
        }

        return results;
    }
}

// Enhanced email templates with better styling
const emailTemplates = {
    welcome: (name, verificationUrl) => `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f5efe7; }
                .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
                .header { background: linear-gradient(135deg, #43302b 0%, #846358 100%); padding: 40px 20px; text-align: center; }
                .logo { width: 80px; height: 80px; margin: 0 auto 20px; }
                .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
                .content { padding: 40px 30px; }
                .content h2 { color: #43302b; font-size: 24px; margin-top: 0; }
                .content p { color: #666666; line-height: 1.6; font-size: 16px; }
                .button { display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #a18072 0%, #977669 100%); color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
                .footer { background-color: #f8f3e4; padding: 30px; text-align: center; color: #666666; font-size: 14px; }
                @media only screen and (max-width: 600px) {
                    .content { padding: 30px 20px; }
                    .header h1 { font-size: 24px; }
                    .content h2 { font-size: 20px; }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🍽️ Rwanda Eats Reserve</h1>
                </div>
                <div class="content">
                    <h2>Welcome, ${name}! 🎉</h2>
                    <p>Thank you for joining Rwanda Eats Reserve. We're thrilled to have you as part of our community!</p>
                    <p>To get started and unlock all features, please verify your email address:</p>
                    <div style="text-align: center;">
                        <a href="${verificationUrl}" class="button">Verify My Email</a>
                    </div>
                    <p style="color: #999; font-size: 14px; margin-top: 30px;">If the button doesn't work, copy and paste this link into your browser:<br><a href="${verificationUrl}" style="color: #a18072;">${verificationUrl}</a></p>
                    <p style="color: #999; font-size: 14px;">This link will expire in 24 hours. If you didn't create an account, please ignore this email.</p>
                </div>
                <div class="footer">
                    <p><strong>Rwanda Eats Reserve</strong></p>
                    <p>Discover & Reserve the Best Restaurants in Rwanda</p>
                    <p style="font-size: 12px; color: #999;">© 2024 Rwanda Eats Reserve. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `,

    reservationConfirmation: (customerName, restaurantName, date, time, partySize, location) => `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f5efe7; }
                .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
                .header { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 40px 20px; text-align: center; }
                .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
                .success-icon { font-size: 64px; margin-bottom: 10px; }
                .content { padding: 40px 30px; }
                .reservation-box { background-color: #f8f3e4; border-left: 4px solid #a18072; padding: 20px; margin: 20px 0; border-radius: 8px; }
                .reservation-box h3 { color: #43302b; margin-top: 0; }
                .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e0cec7; }
                .detail-row:last-child { border-bottom: none; }
                .detail-label { color: #666666; font-weight: 500; }
                .detail-value { color: #43302b; font-weight: 600; }
                .footer { background-color: #43302b; padding: 30px; text-align: center; color: #ffffff; }
                @media only screen and (max-width: 600px) {
                    .content { padding: 30px 20px; }
                    .detail-row { flex-direction: column; gap: 5px; }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="success-icon">✅</div>
                    <h1>Reservation Confirmed!</h1>
                </div>
                <div class="content">
                    <p style="font-size: 18px; color: #43302b;">Dear ${customerName},</p>
                    <p style="color: #666666; line-height: 1.6;">Great news! Your table has been reserved at <strong>${restaurantName}</strong>.</p>
                    
                    <div class="reservation-box">
                        <h3>📅 Reservation Details</h3>
                        <div class="detail-row">
                            <span class="detail-label">Restaurant</span>
                            <span class="detail-value">${restaurantName}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Date</span>
                            <span class="detail-value">${date}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Time</span>
                            <span class="detail-value">${time}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Party Size</span>
                            <span class="detail-value">${partySize} guests</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Location</span>
                            <span class="detail-value">${location}</span>
                        </div>
                    </div>

                    <p style="color: #666666; line-height: 1.6; margin-top: 30px;">
                        <strong>Important:</strong> Please arrive on time. If you need to cancel or modify your reservation, please do so at least 2 hours in advance.
                    </p>
                </div>
                <div class="footer">
                    <p><strong>Rwanda Eats Reserve</strong></p>
                    <p style="font-size: 14px; opacity: 0.9;">We look forward to serving you!</p>
                </div>
            </div>
        </body>
        </html>
    `,

    passwordReset: (name, code) => `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f5efe7; }
                .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
                .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 20px; text-align: center; }
                .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
                .content { padding: 40px 30px; text-align: center; }
                .code-box { background-color: #f8f3e4; border: 2px dashed #a18072; padding: 30px; margin: 30px 0; border-radius: 12px; }
                .code { font-size: 48px; font-weight: bold; letter-spacing: 8px; color: #43302b; font-family: 'Courier New', monospace; }
                .warning { background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; text-align: left; border-radius: 4px; }
                @media only screen and (max-width: 600px) {
                    .code { font-size: 36px; letter-spacing: 4px; }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔐 Password Reset</h1>
                </div>
                <div class="content">
                    <h2 style="color: #43302b;">Reset Your Password</h2>
                    <p style="color: #666666; line-height: 1.6;">Hi ${name}, you requested to reset your password. Use this verification code:</p>
                    
                    <div class="code-box">
                        <div class="code">${code}</div>
                        <p style="color: #999; font-size: 14px; margin-top: 15px;">Enter this code in the app to reset your password</p>
                    </div>

                    <div class="warning">
                        <p style="margin: 0; color: #ef4444; font-weight: 600;">⚠️ Security Notice</p>
                        <p style="margin: 5px 0 0 0; color: #666;">This code expires in 15 minutes. If you didn't request this, please ignore this email and ensure your account is secure.</p>
                    </div>
                </div>
                <div style="background-color: #f8f3e4; padding: 30px; text-align: center; color: #666;">
                    <p style="font-size: 12px;">© 2024 Rwanda Eats Reserve. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `
};

// Notification Service (Updated to use new EmailService)
class NotificationService {
    static async sendEmail(to, subject, html) {
        const result = await EmailService.sendEmail(to, subject, html);
        return result.success || false; // Return boolean for backward compatibility
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
                    let sent = false;
                    if (channel === 'email') {
                        const result = await this.sendEmail(user.email, title, message);
                        sent = result; // Result is already a boolean from updated sendEmail method
                    } else if (channel === 'sms' && user.phone) {
                        sent = await this.sendSMS(user.phone, message);
                    }
                    
                    // Mark as sent only if successful
                    if (sent) {
                        await db.execute('UPDATE notifications SET is_sent = TRUE, sent_at = NOW() WHERE id = ?', [result.insertId]);
                    }
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
        const verificationUrl = `http://localhost:3000/verify-email?token=${user.verification_token}`;
        const emailHtml = emailTemplates.welcome(user.name, verificationUrl);
        
        const result = await this.sendEmail(user.email, 'Welcome to Rwanda Eats Reserve! 🎉', emailHtml);
        return result.success || false; // Return boolean for backward compatibility
    }

    static async sendReservationConfirmation(reservation, user, restaurant) {
        const emailHtml = emailTemplates.reservationConfirmation(
            user.name,
            restaurant.name,
            new Date(reservation.reservation_date).toLocaleDateString(),
            reservation.reservation_time,
            reservation.party_size,
            restaurant.location
        );

        const emailResult = await this.sendEmail(
            user.email, 
            `Reservation Confirmed at ${restaurant.name}`, 
            emailHtml
        );
        
        // Also send SMS if user has phone
        if (user.phone) {
            const smsMessage = `🎉 Reservation confirmed! ${restaurant.name} on ${new Date(reservation.reservation_date).toLocaleDateString()} at ${reservation.reservation_time} for ${reservation.party_size} guests. See you there!`;
            await this.sendSMS(user.phone, smsMessage);
        }

        return emailResult.success || false; // Return boolean for backward compatibility
    }

    static async sendPasswordResetEmail(user, resetCode) {
        const emailHtml = emailTemplates.passwordReset(user.name, resetCode);
        
        const result = await this.sendEmail(user.email, 'Password Reset Code - Rwanda Eats Reserve', emailHtml);
        return result.success || false; // Return boolean for backward compatibility
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

app.get('/profile', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'customer-profile.html'));
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

        // Validate email format
        if (!isValidEmail(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
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

// Email Verification API (using MailerSend)
app.post('/api/email/verify', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email address is required' });
        }

        // Use MailerSend email verification API
        const verificationResult = await EmailVerificationService.verifyEmail(email);

        res.json({
            email,
            valid: verificationResult.valid || false,
            result: verificationResult.result || 'unknown',
            reason: verificationResult.reason || null,
            risk: verificationResult.risk || 'unknown'
        });
    } catch (error) {
        console.error('Email verification API error:', error);
        res.status(500).json({ 
            error: 'Email verification service temporarily unavailable',
            valid: false 
        });
    }
});

// Email Token Verification (for email confirmation links)
app.post('/api/auth/verify-email-token', async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ error: 'Verification token is required' });
        }

        // Find user with this verification token
        const [users] = await db.execute(
            'SELECT id, email, verification_token_expires FROM users WHERE verification_token = ?',
            [token]
        );

        if (users.length === 0) {
            return res.status(400).json({ error: 'Invalid verification token' });
        }

        const user = users[0];

        // Check if token has expired
        if (new Date() > new Date(user.verification_token_expires)) {
            return res.status(400).json({ error: 'Verification token has expired' });
        }

        // Mark email as verified
        await db.execute(
            'UPDATE users SET email_verified = TRUE, verification_token = NULL, verification_token_expires = NULL WHERE id = ?',
            [user.id]
        );

        res.json({ message: 'Email verified successfully' });
    } catch (error) {
        console.error('Email token verification error:', error);
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

            // Send verification code email using enhanced template
            try {
                await NotificationService.sendPasswordResetEmail(user, verificationCode);
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

// Email Campaign Management (Brevo)
app.post('/api/email/campaign', requireAuth, async (req, res) => {
    try {
        // Only allow admin users to create campaigns
        if (req.session.user.user_type !== 'system_admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { name, subject, htmlContent, recipients, scheduledAt } = req.body;

        if (!subject || !htmlContent) {
            return res.status(400).json({ error: 'Subject and content are required' });
        }

        const campaignData = {
            name: name || `Campaign ${new Date().toISOString()}`,
            subject,
            htmlContent,
            recipients,
            scheduledAt
        };

        const campaign = await EmailService.createEmailCampaign(campaignData);
        
        res.json({ 
            message: 'Email campaign created successfully',
            campaignId: campaign.id,
            campaign: campaign
        });
    } catch (error) {
        console.error('Campaign creation error:', error);
        res.status(500).json({ 
            error: 'Failed to create email campaign',
            details: error.message 
        });
    }
});

// Send test email
app.post('/api/email/test', requireAuth, async (req, res) => {
    try {
        const { to, subject, content } = req.body;

        if (!to || !subject || !content) {
            return res.status(400).json({ error: 'To, subject, and content are required' });
        }

        const success = await EmailService.sendEmail(to, subject, content);

        if (success) {
            res.json({ message: 'Test email sent successfully' });
        } else {
            res.status(500).json({ error: 'Failed to send test email' });
        }
    } catch (error) {
        console.error('Test email error:', error);
        res.status(500).json({ error: 'Failed to send test email' });
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

        // If email changed, do not update email directly — require verification flow
        const [rows] = await db.execute('SELECT email FROM users WHERE id = ?', [userId]);
        const currentEmail = rows.length ? rows[0].email : null;

        if (email && currentEmail && email.toLowerCase() !== currentEmail.toLowerCase()) {
            // Update name and phone now, but initiate email-change verification separately
            await db.execute(
                'UPDATE users SET name = ?, phone = ?, updated_at = NOW() WHERE id = ?',
                [name, phone || null, userId]
            );

            return res.status(202).json({ message: 'Name/phone updated. Email change requires verification via request-email-change endpoint.' });
        }

        // No email change: update all fields
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

// Customer-specific profile endpoints
app.get('/api/customer/profile', requireAuth, async (req, res) => {
    try {
        const userId = req.session.user.id;
        const [rows] = await db.execute(
            'SELECT id, name, email, phone, created_at FROM users WHERE id = ? AND user_type = ?',
            [userId, 'customer']
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Customer profile not found' });
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching customer profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/customer/profile', requireAuth, async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { name, email, phone } = req.body || {};

        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required' });
        }

        // Verify user is a customer
        const [userCheck] = await db.execute(
            'SELECT user_type FROM users WHERE id = ?',
            [userId]
        );
        if (userCheck.length === 0 || userCheck[0].user_type !== 'customer') {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Ensure email is unique (excluding current user)
        const [existing] = await db.execute(
            'SELECT id FROM users WHERE email = ? AND id <> ?',
            [email, userId]
        );
        if (existing.length > 0) {
            return res.status(409).json({ error: 'Email is already in use' });
        }

        // Update profile
        await db.execute(
            'UPDATE users SET name = ?, email = ?, phone = ?, updated_at = NOW() WHERE id = ?',
            [name, email, phone || null, userId]
        );

        // Update session user to keep UI in sync
        req.session.user.name = name;
        req.session.user.email = email;
        req.session.user.phone = phone || null;

        res.json({ message: 'Customer profile updated successfully' });
    } catch (error) {
        console.error('Error updating customer profile:', error);
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
            SELECT r.*, u.name as admin_name,
            GROUP_CONCAT(DISTINCT rc.cuisine_name SEPARATOR ', ') as cuisine_types
            FROM restaurants r 
            LEFT JOIN users u ON r.restaurant_admin_id = u.id
            LEFT JOIN restaurant_cuisines rc ON r.id = rc.restaurant_id
            WHERE r.is_active = TRUE
        `;
        const params = [];
        
        // Enhanced search with strict location matching
        if (search) {
            const searchLower = search.toLowerCase().trim();
            
            // Check if search term matches common location keywords to apply strict filtering
            const locationKeywords = ['kigali', 'gasabo', 'kicukiro', 'nyarugenge', 'kimironko', 'remera', 
                                     'nyarutarama', 'gikondo', 'kibagabaga', 'kanombe', 'kacyiru', 'kimihurura',
                                     'gisozi', 'kagugu', 'kimironko', 'niboye', 'rebero', 'rusororo'];
            
            const isLocationSearch = locationKeywords.some(keyword => searchLower.includes(keyword));
            
            if (isLocationSearch) {
                // Strict location search - only match location, district, or sector fields
                query += ' AND (r.location LIKE ? OR r.district LIKE ? OR r.sector LIKE ?)';
                const searchTerm = `%${search}%`;
                params.push(searchTerm, searchTerm, searchTerm);
            } else {
                // General search - search across name, description, and location
                query += ' AND (r.name LIKE ? OR r.description LIKE ? OR r.location LIKE ? OR r.district LIKE ? OR r.sector LIKE ? OR rc.cuisine_name LIKE ?)';
                const searchTerm = `%${search}%`;
                params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
            }
        }
        
        // Specific location filter (for legacy support)
        if (location) {
            query += ' AND (r.location LIKE ? OR r.district LIKE ? OR r.sector LIKE ?)';
            const locationTerm = `%${location}%`;
            params.push(locationTerm, locationTerm, locationTerm);
        }
        
        if (cuisine) {
            query += ' AND rc.cuisine_name = ?';
            params.push(cuisine);
        }
        
        if (price_range) {
            query += ' AND r.price_range = ?';
            params.push(price_range);
        }
        
        query += ' GROUP BY r.id ORDER BY r.name ASC';
        
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
        
        // Validate that reservation is not in the past
        const reservationDateTime = new Date(`${reservation_date}T${reservation_time}`);
        const now = new Date();
        
        if (reservationDateTime <= now) {
            return res.status(400).json({ error: 'Cannot create reservations for past dates or times' });
        }
        
        // Check if same-day reservation and require 2-hour advance
        const reservationDate = new Date(reservation_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        reservationDate.setHours(0, 0, 0, 0);
        
        const isToday = reservationDate.getTime() === today.getTime();
        const twoHoursLater = new Date(now.getTime() + (2 * 60 * 60 * 1000));
        
        if (isToday && reservationDateTime < twoHoursLater) {
            return res.status(400).json({ error: 'Same-day reservations must be made at least 2 hours in advance' });
        }
        
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

// Update reservation (for customers to modify their reservations)
app.put('/api/reservations/:id', requireAuth, async (req, res) => {
    try {
        const reservationId = req.params.id;
        const { reservation_date, reservation_time, party_size, occasion, special_requests } = req.body;
        
        // Validate that reservation is not in the past
        const reservationDateTime = new Date(`${reservation_date}T${reservation_time}`);
        const now = new Date();
        
        if (reservationDateTime <= now) {
            return res.status(400).json({ error: 'Cannot update reservation to a past date or time' });
        }
        
        // Check if same-day reservation and require 2-hour advance
        const reservationDate = new Date(reservation_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        reservationDate.setHours(0, 0, 0, 0);
        
        const isToday = reservationDate.getTime() === today.getTime();
        const twoHoursLater = new Date(now.getTime() + (2 * 60 * 60 * 1000));
        
        if (isToday && reservationDateTime < twoHoursLater) {
            return res.status(400).json({ error: 'Same-day reservations must be made at least 2 hours in advance' });
        }
        
        // Get current reservation
        const [reservations] = await db.execute(
            'SELECT * FROM reservations WHERE id = ?',
            [reservationId]
        );
        
        if (reservations.length === 0) {
            return res.status(404).json({ error: 'Reservation not found' });
        }
        
        const reservation = reservations[0];
        
        // Check if user owns this reservation
        if (req.session.user.id !== reservation.customer_id && req.session.user.user_type !== 'system_admin') {
            return res.status(403).json({ error: 'Permission denied' });
        }
        
        // Update reservation
        await db.execute(
            'UPDATE reservations SET reservation_date = ?, reservation_time = ?, party_size = ?, occasion = ?, special_requests = ? WHERE id = ?',
            [reservation_date, reservation_time, party_size, occasion, special_requests, reservationId]
        );
        
        // Get restaurant details for notification
        const [restaurants] = await db.execute('SELECT * FROM restaurants WHERE id = ?', [reservation.restaurant_id]);
        
        if (restaurants.length > 0) {
            const restaurant = restaurants[0];
            
            // Notify restaurant admin
            await NotificationService.createNotification(
                restaurant.restaurant_admin_id,
                'Reservation Updated',
                `A reservation has been modified for ${reservation_date} at ${reservation_time}`,
                'reservation_update',
                'in_app',
                reservationId
            );
        }
        
        // Log the action
        await AuditLogService.logAction(req.session.user.id, 'RESERVATION_UPDATED', 'reservation', reservationId, { reservation_date, reservation_time }, req);
        
        res.json({ message: 'Reservation updated successfully' });
    } catch (error) {
        console.error('Error updating reservation:', error);
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
        
        // Limit to last 3 months for customers
        whereClause += ` AND r.reservation_date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)`;
        
        const [reservations] = await db.execute(`
            SELECT 
                r.*,
                rest.name AS restaurant_name,
                rest.location AS restaurant_location,
                rest.contact_phone AS restaurant_phone,
                rest.contact_email AS restaurant_email,
                rest.id AS restaurant_id,
                CASE WHEN rev.id IS NOT NULL THEN TRUE ELSE FALSE END AS has_review
            FROM reservations r
            JOIN restaurants rest ON r.restaurant_id = rest.id
            LEFT JOIN reviews rev ON rev.restaurant_id = rest.id AND rev.customer_id = r.customer_id
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

// Enhanced Email Configuration Test Endpoint
app.get('/api/email/test-config', requireSystemAdmin, async (req, res) => {
    try {
        console.log('🔍 Testing email configuration...');
        const results = await EmailService.testConfiguration();
        
        // Test sending a sample email if requested
        if (req.query.sendTest === 'true') {
            const testEmail = req.session.user.email;
            const result = await EmailService.sendEmail(
                testEmail,
                'Rwanda Eats Reserve - Email Configuration Test ✅',
                emailTemplates.welcome('Test User', '#')
            );
            
            results.testEmail = {
                sent: result.success,
                provider: result.provider,
                error: result.error || null
            };
        }
        
        res.json({
            message: 'Email configuration test completed',
            results: results,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Email configuration test failed:', error);
        res.status(500).json({ 
            error: 'Email configuration test failed',
            details: error.message 
        });
    }
});

/*
==============================================
RESTAURANT DETAILS MANAGEMENT API
==============================================
*/

// ===== REVIEWS API =====

// Get all reviews for a restaurant (customer view - approved and visible only)
app.get('/api/restaurants/:id/reviews', async (req, res) => {
    try {
        const [reviews] = await db.execute(`
            SELECT r.*, u.name as customer_name
            FROM reviews r
            LEFT JOIN users u ON r.customer_id = u.id
            WHERE r.restaurant_id = ? AND r.status = 'approved' AND r.is_visible = TRUE
            ORDER BY r.created_at DESC
        `, [req.params.id]);
        res.json(reviews);
    } catch (error) {
        console.error('Error loading reviews:', error);
        res.status(500).json({ error: 'Failed to load reviews' });
    }
});

// Get all reviews for a restaurant (admin view - all reviews)
app.get('/api/admin/restaurants/:id/reviews', requireAuth, async (req, res) => {
    try {
        const user = req.session.user;
        
        // Check if user is admin or restaurant owner
        if (user.user_type === 'restaurant_admin') {
            const [ownership] = await db.execute(
                'SELECT * FROM restaurants WHERE id = ? AND restaurant_admin_id = ?',
                [req.params.id, user.id]
            );
            if (ownership.length === 0) {
                return res.status(403).json({ error: 'Permission denied' });
            }
        } else if (user.user_type !== 'system_admin') {
            return res.status(403).json({ error: 'Permission denied' });
        }
        
        const [reviews] = await db.execute(`
            SELECT r.*, u.name as customer_name, reviewer.name as reviewed_by_name
            FROM reviews r
            LEFT JOIN users u ON r.customer_id = u.id
            LEFT JOIN users reviewer ON r.reviewed_by = reviewer.id
            WHERE r.restaurant_id = ?
            ORDER BY r.created_at DESC
        `, [req.params.id]);
        
        res.json(reviews);
    } catch (error) {
        console.error('Error loading reviews:', error);
        res.status(500).json({ error: 'Failed to load reviews' });
    }
});

// Add a new review
app.post('/api/restaurants/:id/reviews', requireAuth, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const userId = req.session.user.id;
        const restaurantId = req.params.id;
        
        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }
        
        // Check if user has already reviewed this restaurant
        const [existing] = await db.execute(
            'SELECT * FROM reviews WHERE restaurant_id = ? AND customer_id = ?',
            [restaurantId, userId]
        );
        
        if (existing.length > 0) {
            return res.status(400).json({ error: 'You have already reviewed this restaurant' });
        }
        
        // Insert review with pending status
        const [result] = await db.execute(`
            INSERT INTO reviews (restaurant_id, customer_id, rating, comment, status, is_visible)
            VALUES (?, ?, ?, ?, 'pending', FALSE)
        `, [restaurantId, userId, rating, comment || '']);
        
        res.json({ 
            message: 'Review submitted successfully. It will be visible after admin approval.',
            reviewId: result.insertId
        });
    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({ error: 'Failed to submit review' });
    }
});

// Approve a review
app.patch('/api/reviews/:id/approve', requireAuth, async (req, res) => {
    try {
        const user = req.session.user;
        const reviewId = req.params.id;
        
        // Get review details to check permissions
        const [reviews] = await db.execute(
            'SELECT r.*, rest.restaurant_admin_id FROM reviews r JOIN restaurants rest ON r.restaurant_id = rest.id WHERE r.id = ?',
            [reviewId]
        );
        
        if (reviews.length === 0) {
            return res.status(404).json({ error: 'Review not found' });
        }
        
        const review = reviews[0];
        
        // Check permissions
        if (user.user_type === 'restaurant_admin' && review.restaurant_admin_id !== user.id) {
            return res.status(403).json({ error: 'Permission denied' });
        } else if (user.user_type !== 'system_admin' && user.user_type !== 'restaurant_admin') {
            return res.status(403).json({ error: 'Permission denied' });
        }
        
        // Approve review
        await db.execute(`
            UPDATE reviews 
            SET status = 'approved', is_visible = TRUE, reviewed_by = ?, reviewed_at = NOW()
            WHERE id = ?
        `, [user.id, reviewId]);
        
        res.json({ message: 'Review approved successfully' });
    } catch (error) {
        console.error('Error approving review:', error);
        res.status(500).json({ error: 'Failed to approve review' });
    }
});

// Reject a review
app.patch('/api/reviews/:id/reject', requireAuth, async (req, res) => {
    try {
        const user = req.session.user;
        const reviewId = req.params.id;
        const { admin_notes } = req.body;
        
        // Get review details to check permissions
        const [reviews] = await db.execute(
            'SELECT r.*, rest.restaurant_admin_id FROM reviews r JOIN restaurants rest ON r.restaurant_id = rest.id WHERE r.id = ?',
            [reviewId]
        );
        
        if (reviews.length === 0) {
            return res.status(404).json({ error: 'Review not found' });
        }
        
        const review = reviews[0];
        
        // Check permissions
        if (user.user_type === 'restaurant_admin' && review.restaurant_admin_id !== user.id) {
            return res.status(403).json({ error: 'Permission denied' });
        } else if (user.user_type !== 'system_admin' && user.user_type !== 'restaurant_admin') {
            return res.status(403).json({ error: 'Permission denied' });
        }
        
        // Reject review
        await db.execute(`
            UPDATE reviews 
            SET status = 'rejected', is_visible = FALSE, reviewed_by = ?, reviewed_at = NOW(), admin_notes = ?
            WHERE id = ?
        `, [user.id, admin_notes || '', reviewId]);
        
        res.json({ message: 'Review rejected successfully' });
    } catch (error) {
        console.error('Error rejecting review:', error);
        res.status(500).json({ error: 'Failed to reject review' });
    }
});

// Delete a review
app.delete('/api/reviews/:id', requireAuth, async (req, res) => {
    try {
        const user = req.session.user;
        const reviewId = req.params.id;
        
        // Get review details to check permissions
        const [reviews] = await db.execute(
            'SELECT r.*, rest.restaurant_admin_id FROM reviews r JOIN restaurants rest ON r.restaurant_id = rest.id WHERE r.id = ?',
            [reviewId]
        );
        
        if (reviews.length === 0) {
            return res.status(404).json({ error: 'Review not found' });
        }
        
        const review = reviews[0];
        
        // Check permissions
        if (user.user_type === 'restaurant_admin' && review.restaurant_admin_id !== user.id) {
            return res.status(403).json({ error: 'Permission denied' });
        } else if (user.user_type !== 'system_admin' && user.user_type !== 'restaurant_admin') {
            return res.status(403).json({ error: 'Permission denied' });
        }
        
        // Delete review
        await db.execute('DELETE FROM reviews WHERE id = ?', [reviewId]);
        
        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ error: 'Failed to delete review' });
    }
});

// ===== AMENITIES API =====

// Get amenities for a restaurant (customer view - visible only)
app.get('/api/restaurants/:id/amenities', async (req, res) => {
    try {
        const [amenities] = await db.execute(`
            SELECT * FROM restaurant_amenities
            WHERE restaurant_id = ? AND is_visible = TRUE
            ORDER BY amenity_type
        `, [req.params.id]);
        res.json(amenities);
    } catch (error) {
        console.error('Error loading amenities:', error);
        res.json([]);
    }
});

// Get all amenities for a restaurant (admin view - all amenities)
app.get('/api/admin/restaurants/:id/amenities', requireAuth, async (req, res) => {
    try {
        const user = req.session.user;
        
        // Check if user is admin or restaurant owner
        if (user.user_type === 'restaurant_admin') {
            const [ownership] = await db.execute(
                'SELECT * FROM restaurants WHERE id = ? AND restaurant_admin_id = ?',
                [req.params.id, user.id]
            );
            if (ownership.length === 0) {
                return res.status(403).json({ error: 'Permission denied' });
            }
        } else if (user.user_type !== 'system_admin') {
            return res.status(403).json({ error: 'Permission denied' });
        }
        
        const [amenities] = await db.execute(`
            SELECT a.*, u.name as added_by_name
            FROM restaurant_amenities a
            LEFT JOIN users u ON a.added_by = u.id
            WHERE a.restaurant_id = ?
            ORDER BY a.amenity_type
        `, [req.params.id]);
        
        res.json(amenities);
    } catch (error) {
        console.error('Error loading amenities:', error);
        res.status(500).json({ error: 'Failed to load amenities' });
    }
});

// Add an amenity to a restaurant
app.post('/api/restaurants/:id/amenities', requireAuth, async (req, res) => {
    try {
        const user = req.session.user;
        const restaurantId = req.params.id;
        const { amenity_type, is_visible } = req.body;
        
        // Check permissions
        if (user.user_type === 'restaurant_admin') {
            const [ownership] = await db.execute(
                'SELECT * FROM restaurants WHERE id = ? AND restaurant_admin_id = ?',
                [restaurantId, user.id]
            );
            if (ownership.length === 0) {
                return res.status(403).json({ error: 'Permission denied' });
            }
        } else if (user.user_type !== 'system_admin') {
            return res.status(403).json({ error: 'Permission denied' });
        }
        
        // Insert amenity
        await db.execute(`
            INSERT INTO restaurant_amenities (restaurant_id, amenity_type, is_visible, added_by)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE is_visible = VALUES(is_visible)
        `, [restaurantId, amenity_type, is_visible !== false, user.id]);
        
        res.json({ message: 'Amenity added successfully' });
    } catch (error) {
        console.error('Error adding amenity:', error);
        res.status(500).json({ error: 'Failed to add amenity' });
    }
});

// Toggle amenity visibility
app.patch('/api/amenities/:id/visibility', requireAuth, async (req, res) => {
    try {
        const user = req.session.user;
        const amenityId = req.params.id;
        const { is_visible } = req.body;
        
        // Get amenity details to check permissions
        const [amenities] = await db.execute(
            'SELECT a.*, r.restaurant_admin_id FROM restaurant_amenities a JOIN restaurants r ON a.restaurant_id = r.id WHERE a.id = ?',
            [amenityId]
        );
        
        if (amenities.length === 0) {
            return res.status(404).json({ error: 'Amenity not found' });
        }
        
        const amenity = amenities[0];
        
        // Check permissions
        if (user.user_type === 'restaurant_admin' && amenity.restaurant_admin_id !== user.id) {
            return res.status(403).json({ error: 'Permission denied' });
        } else if (user.user_type !== 'system_admin' && user.user_type !== 'restaurant_admin') {
            return res.status(403).json({ error: 'Permission denied' });
        }
        
        // Update visibility
        await db.execute(
            'UPDATE restaurant_amenities SET is_visible = ? WHERE id = ?',
            [is_visible, amenityId]
        );
        
        res.json({ message: 'Amenity visibility updated successfully' });
    } catch (error) {
        console.error('Error updating amenity visibility:', error);
        res.status(500).json({ error: 'Failed to update amenity visibility' });
    }
});

// Delete an amenity
app.delete('/api/amenities/:id', requireAuth, async (req, res) => {
    try {
        const user = req.session.user;
        const amenityId = req.params.id;
        
        // Get amenity details to check permissions
        const [amenities] = await db.execute(
            'SELECT a.*, r.restaurant_admin_id FROM restaurant_amenities a JOIN restaurants r ON a.restaurant_id = r.id WHERE a.id = ?',
            [amenityId]
        );
        
        if (amenities.length === 0) {
            return res.status(404).json({ error: 'Amenity not found' });
        }
        
        const amenity = amenities[0];
        
        // Check permissions
        if (user.user_type === 'restaurant_admin' && amenity.restaurant_admin_id !== user.id) {
            return res.status(403).json({ error: 'Permission denied' });
        } else if (user.user_type !== 'system_admin' && user.user_type !== 'restaurant_admin') {
            return res.status(403).json({ error: 'Permission denied' });
        }
        
        // Delete amenity
        await db.execute('DELETE FROM restaurant_amenities WHERE id = ?', [amenityId]);
        
        res.json({ message: 'Amenity deleted successfully' });
    } catch (error) {
        console.error('Error deleting amenity:', error);
        res.status(500).json({ error: 'Failed to delete amenity' });
    }
});

// ===== RESTAURANT SETTINGS API =====

// Update restaurant display settings
app.patch('/api/restaurants/:id/settings', requireAuth, upload.fields([{ name: 'menu_pdf', maxCount: 1 }, { name: 'certificate', maxCount: 1 }]), async (req, res) => {
    try {
        const user = req.session.user;
        const restaurantId = req.params.id;
        const { rating_display, reviews_enabled, video_enabled, gallery_enabled } = req.body;
        
        // Check permissions
        if (user.user_type === 'restaurant_admin') {
            const [ownership] = await db.execute(
                'SELECT * FROM restaurants WHERE id = ? AND restaurant_admin_id = ?',
                [restaurantId, user.id]
            );
            if (ownership.length === 0) {
                return res.status(403).json({ error: 'Permission denied' });
            }
        } else if (user.user_type !== 'system_admin') {
            return res.status(403).json({ error: 'Permission denied' });
        }
        
        // Build update query dynamically
        const updates = [];
        const values = [];
        
        if (rating_display !== undefined) {
            updates.push('rating_display = ?');
            values.push(rating_display === 'true' || rating_display === true);
        }
        if (reviews_enabled !== undefined) {
            updates.push('reviews_enabled = ?');
            values.push(reviews_enabled === 'true' || reviews_enabled === true);
        }
        if (video_enabled !== undefined) {
            updates.push('video_enabled = ?');
            values.push(video_enabled === 'true' || video_enabled === true);
        }
        if (gallery_enabled !== undefined) {
            updates.push('gallery_enabled = ?');
            values.push(gallery_enabled === 'true' || gallery_enabled === true);
        }
        
        // Handle file uploads
        if (req.files) {
            if (req.files.menu_pdf && req.files.menu_pdf[0]) {
                const menu_pdf_url = '/uploads/restaurants/' + req.files.menu_pdf[0].filename;
                updates.push('menu_pdf_url = ?');
                values.push(menu_pdf_url);
            }
            if (req.files.certificate && req.files.certificate[0]) {
                const certificate_url = '/uploads/restaurants/' + req.files.certificate[0].filename;
                updates.push('certificate_url = ?');
                values.push(certificate_url);
            }
        }
        
        if (updates.length === 0) {
            return res.status(400).json({ error: 'No settings to update' });
        }
        
        values.push(restaurantId);
        
        await db.execute(
            `UPDATE restaurants SET ${updates.join(', ')} WHERE id = ?`,
            values
        );
        
        res.json({ message: 'Restaurant settings updated successfully' });
    } catch (error) {
        console.error('Error updating restaurant settings:', error);
        res.status(500).json({ error: 'Failed to update restaurant settings' });
    }
});

// Get restaurant settings
app.get('/api/restaurants/:id/settings', async (req, res) => {
    try {
        const [restaurants] = await db.execute(
            'SELECT rating_display, reviews_enabled, video_enabled, gallery_enabled, menu_pdf_url, certificate_url FROM restaurants WHERE id = ?',
            [req.params.id]
        );
        
        if (restaurants.length === 0) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }
        
        res.json(restaurants[0]);
    } catch (error) {
        console.error('Error loading restaurant settings:', error);
        res.status(500).json({ error: 'Failed to load restaurant settings' });
    }
});

// Update restaurant image visibility
app.patch('/api/restaurants/:restaurantId/images/:imageId/visibility', requireAuth, async (req, res) => {
    try {
        const user = req.session.user;
        const { restaurantId, imageId } = req.params;
        const { is_visible } = req.body;
        
        // Check permissions
        if (user.user_type === 'restaurant_admin') {
            const [ownership] = await db.execute(
                'SELECT * FROM restaurants WHERE id = ? AND restaurant_admin_id = ?',
                [restaurantId, user.id]
            );
            if (ownership.length === 0) {
                return res.status(403).json({ error: 'Permission denied' });
            }
        } else if (user.user_type !== 'system_admin') {
            return res.status(403).json({ error: 'Permission denied' });
        }
        
        await db.execute(
            'UPDATE restaurant_images SET is_visible = ? WHERE id = ? AND restaurant_id = ?',
            [is_visible, imageId, restaurantId]
        );
        
        res.json({ message: 'Image visibility updated successfully' });
    } catch (error) {
        console.error('Error updating image visibility:', error);
        res.status(500).json({ error: 'Failed to update image visibility' });
    }
});

// ===== CUISINES API =====

// Get cuisines for a restaurant
app.get('/api/restaurants/:id/cuisines', async (req, res) => {
    try {
        const [cuisines] = await db.execute(
            'SELECT * FROM restaurant_cuisines WHERE restaurant_id = ? ORDER BY cuisine_name',
            [req.params.id]
        );
        res.json(cuisines);
    } catch (error) {
        console.error('Error loading cuisines:', error);
        res.json([]);
    }
});

// Add cuisine to restaurant
app.post('/api/restaurants/:id/cuisines', requireAuth, async (req, res) => {
    try {
        const user = req.session.user;
        const restaurantId = req.params.id;
        const { cuisine_name } = req.body;
        
        // Check permissions
        if (user.user_type === 'restaurant_admin') {
            const [ownership] = await db.execute(
                'SELECT * FROM restaurants WHERE id = ? AND restaurant_admin_id = ?',
                [restaurantId, user.id]
            );
            if (ownership.length === 0) {
                return res.status(403).json({ error: 'Permission denied' });
            }
        } else if (user.user_type !== 'system_admin') {
            return res.status(403).json({ error: 'Permission denied' });
        }
        
        // Insert cuisine (ON DUPLICATE KEY handles uniqueness)
        await db.execute(
            'INSERT INTO restaurant_cuisines (restaurant_id, cuisine_name) VALUES (?, ?) ON DUPLICATE KEY UPDATE cuisine_name = VALUES(cuisine_name)',
            [restaurantId, cuisine_name]
        );
        
        res.json({ message: 'Cuisine added successfully' });
    } catch (error) {
        console.error('Error adding cuisine:', error);
        res.status(500).json({ error: 'Failed to add cuisine' });
    }
});

// Delete cuisine from restaurant
app.delete('/api/restaurants/:restaurantId/cuisines/:cuisineId', requireAuth, async (req, res) => {
    try {
        const user = req.session.user;
        const { restaurantId, cuisineId } = req.params;
        
        // Check permissions
        if (user.user_type === 'restaurant_admin') {
            const [ownership] = await db.execute(
                'SELECT * FROM restaurants WHERE id = ? AND restaurant_admin_id = ?',
                [restaurantId, user.id]
            );
            if (ownership.length === 0) {
                return res.status(403).json({ error: 'Permission denied' });
            }
        } else if (user.user_type !== 'system_admin') {
            return res.status(403).json({ error: 'Permission denied' });
        }
        
        await db.execute('DELETE FROM restaurant_cuisines WHERE id = ? AND restaurant_id = ?', [cuisineId, restaurantId]);
        
        res.json({ message: 'Cuisine removed successfully' });
    } catch (error) {
        console.error('Error deleting cuisine:', error);
        res.status(500).json({ error: 'Failed to delete cuisine' });
    }
});

/*
==============================================
END RESTAURANT DETAILS MANAGEMENT API
==============================================
*/

// Remove immediate listen; start server after verifying DB + email transporter
// Startup routine: verify DB connection and email transporter, then start listening
(async function startServer() {
    try {
        // Test DB connection
        await db.execute('SELECT 1');
        console.log('Database connection OK');
    } catch (err) {
        console.error('Failed to connect to the database. Please ensure MySQL is running and env vars are correct.');
        console.error(err);
        process.exit(1);
    }

    // Verify and test email services
    try {
        const emailResults = await EmailService.testConfiguration();
        console.log('📧 Email Service Status:');
        console.log(`   Brevo: ${emailResults.brevo.configured ? (emailResults.brevo.working ? '✅ Active' : '⚠️ Configured but not working') : '❌ Not configured'}`);
        console.log(`   MailerSend: ${emailResults.mailersend.configured ? (emailResults.mailersend.working ? '✅ Active' : '⚠️ Configured but not working') : '❌ Not configured'}`);
    } catch (error) {
        console.error('⚠️ Email service test failed:', error.message);
        console.warn('📧 Email functionality may be limited');
    }

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Customer interface: http://localhost:${PORT}`);
        console.log(`Admin login: http://localhost:${PORT}/login`);
    });
})();
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

        // Validate email format
        if (!isValidEmail(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
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
                AND r.reservation_date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
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
                AND r.reservation_date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
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
            AND r.reservation_date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
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
        const [restaurants] = await db.execute(`
            SELECT r.*, 
            GROUP_CONCAT(DISTINCT rc.cuisine_name SEPARATOR ', ') as cuisine_types
            FROM restaurants r
            LEFT JOIN restaurant_cuisines rc ON r.id = rc.restaurant_id
            WHERE r.restaurant_admin_id = ?
            GROUP BY r.id
            ORDER BY r.name
        `, [req.session.user.id]);
        res.json(restaurants);
    } catch (error) {
        console.error('Error loading restaurants:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/restaurant-admin/restaurants', requireRestaurantAdmin, upload.fields([{ name: 'images', maxCount: 10 }, { name: 'video', maxCount: 1 }, { name: 'menu_pdf', maxCount: 1 }]), async (req, res) => {
    try {
        const { name, description, location, contact_phone, contact_email, opening_time, closing_time, cuisine_type, price_range, tables_count } = req.body;
        
        let video_url = null;
        let menu_pdf_url = null;
        
        if (req.files && req.files.video && req.files.video[0]) {
            video_url = '/uploads/restaurants/' + req.files.video[0].filename;
        }
        
        if (req.files && req.files.menu_pdf && req.files.menu_pdf[0]) {
            menu_pdf_url = '/uploads/restaurants/' + req.files.menu_pdf[0].filename;
        }
        
        // Insert restaurant (without image_url for now, will use primary from restaurant_images)
        const [result] = await db.execute(
            `INSERT INTO restaurants (name, description, location, contact_phone, contact_email, 
             opening_time, closing_time, cuisine_type, price_range, tables_count, restaurant_admin_id, video_url, menu_pdf_url) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, description, location, contact_phone, contact_email, opening_time, closing_time, 
             cuisine_type, price_range, tables_count, req.session.user.id, video_url, menu_pdf_url]
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

app.put('/api/restaurants/:id', requireRestaurantAdmin, upload.fields([{ name: 'images', maxCount: 10 }, { name: 'video', maxCount: 1 }, { name: 'menu_pdf', maxCount: 1 }]), async (req, res) => {
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
        
        // Handle menu PDF/image upload
        if (req.files && req.files.menu_pdf && req.files.menu_pdf[0]) {
            const menu_pdf_url = '/uploads/restaurants/' + req.files.menu_pdf[0].filename;
            updateQuery += ', menu_pdf_url = ?';
            updateParams.push(menu_pdf_url);
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
            'SELECT * FROM restaurant_images WHERE restaurant_id = ? AND is_visible = TRUE ORDER BY display_order',
            [req.params.id]
        );
        res.json(images);
    } catch (error) {
        console.error('Error loading restaurant images:', error && error.stack ? error.stack : error);
        // Return empty array so clients expecting an array don't break the UI
        res.json([]);
    }
});

// Upload new images to a restaurant
app.post('/api/restaurants/:id/images', requireRestaurantAdmin, upload.array('images', 10), async (req, res) => {
    try {
        const { id } = req.params;
        
        // Verify ownership
        const [ownership] = await db.execute(
            'SELECT * FROM restaurants WHERE id = ? AND restaurant_admin_id = ?',
            [id, req.session.user.id]
        );
        
        if (ownership.length === 0) {
            return res.status(403).json({ error: 'Permission denied - You do not own this restaurant' });
        }
        
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No images uploaded' });
        }
        
        // Get the current max display order
        const [maxOrderResult] = await db.execute(
            'SELECT COALESCE(MAX(display_order), -1) as max_order FROM restaurant_images WHERE restaurant_id = ?',
            [id]
        );
        let displayOrder = (maxOrderResult[0]?.max_order || -1) + 1;
        
        // Insert all uploaded images
        const insertPromises = req.files.map(file => {
            const imageUrl = `/uploads/restaurants/${file.filename}`;
            return db.execute(
                'INSERT INTO restaurant_images (restaurant_id, image_url, is_visible, display_order) VALUES (?, ?, ?, ?)',
                [id, imageUrl, true, displayOrder++]
            );
        });
        
        await Promise.all(insertPromises);
        
        res.json({ 
            message: 'Images uploaded successfully', 
            count: req.files.length 
        });
    } catch (error) {
        console.error('Error uploading restaurant images:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
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
        console.error('Error details:', error.message, error.stack);
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

app.post('/api/menu-items', requireRestaurantAdmin, async (req, res) => {
    try {
        const { name, description, price, category, cuisine, restaurant_id } = req.body;
        console.log('Creating menu item - Full request body:', req.body);
        console.log('Creating menu item:', { name, restaurant_id, user: req.session.user.id });
        
        // Validate required fields
        if (!name || !price || !restaurant_id) {
            console.error('Missing required fields:', { name: !!name, price: !!price, restaurant_id: !!restaurant_id });
            return res.status(400).json({ error: 'Missing required fields: name, price, and restaurant_id are required' });
        }
        
        // Verify ownership
        const [ownership] = await db.execute(
            'SELECT * FROM restaurants WHERE id = ? AND restaurant_admin_id = ?',
            [restaurant_id, req.session.user.id]
        );
        console.log('Ownership check result:', ownership.length > 0 ? 'Authorized' : 'Not authorized');
        
        if (ownership.length === 0) {
            return res.status(403).json({ error: 'Permission denied - You do not own this restaurant' });
        }
        
        const [result] = await db.execute(
            'INSERT INTO menu_items (name, description, price, category, cuisine, restaurant_id) VALUES (?, ?, ?, ?, ?, ?)',
            [name, description || '', price, category || '', cuisine || '', restaurant_id]
        );
        
        console.log('Menu item created successfully with ID:', result.insertId);
        res.json({ message: 'Menu item created successfully', id: result.insertId });
    } catch (error) {
        console.error('Error creating menu item:', error);
        console.error('Error stack:', error.stack);
        console.error('Error message:', error.message);
        res.status(500).json({ error: 'Internal server error', details: error.message });
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
        } else {
            // Default to last 3 months if no date range specified
            whereClause += ' AND r.reservation_date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)';
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
        
        // Password is required when creating a new user
        if (!password) {
            return res.status(400).json({ error: 'Password is required when creating a new user' });
        }
        
        // Validate email format
        if (!isValidEmail(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }
        
        // Check if user already exists
        const [existingUsers] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }
        
        const passwordHash = await hashPassword(password);
        
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

// Get single user by ID
app.get('/api/system-admin/users/:id', requireSystemAdmin, async (req, res) => {
    try {
        const [users] = await db.execute(
            'SELECT id, name, email, phone, user_type, email_verified, account_locked, created_at FROM users WHERE id = ?',
            [req.params.id]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(users[0]);
    } catch (error) {
        console.error('Error fetching user:', error);
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
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        res.status(500).json({ error: 'Internal server error', details: error.message });
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
        
        console.log('Creating restaurant with data:', { name, admin_email, admin_name, create_new_admin });
        
        let adminId;
        
        // This logic assumes if an admin email is provided, we're creating a new admin.
        if (admin_email && admin_password) {
            if (!admin_email || !admin_password) {
                await connection.rollback();
                return res.status(400).json({ error: 'Admin email and password are required for new admin creation' });
            }
            
            // Validate email format
            if (!isValidEmail(admin_email)) {
                await connection.rollback();
                return res.status(400).json({ error: 'Invalid admin email format' });
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
                'INSERT INTO users (name, email, password_hash, phone, user_type, email_verified) VALUES (?, ?, ?, ?, ?, ?)',
                [admin_name || admin_email, admin_email, passwordHash, admin_phone || null, 'restaurant_admin', true]
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
            `INSERT INTO restaurants (name, description, location, contact_phone, contact_email, opening_time, closing_time, cuisine_type, price_range, tables_count, menu, menu_pdf_url, restaurant_admin_id, video_url) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, description || null, location || null, contact_phone || null, contact_email || null, opening_time || null, closing_time || null, cuisine_type || null, price_range || '2', tables_count || 10, menu || null, menu_pdf_url || null, adminId || null, video_url || null]
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
        console.error('Error stack:', error.stack);
        console.error('Error message:', error.message);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
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

// Request email change - sends verification code to new email
app.post('/api/user/request-email-change', requireAuth, async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { newEmail } = req.body || {};
        if (!newEmail) return res.status(400).json({ error: 'New email is required' });

        // ensure new email is not already taken
        const [existing] = await db.execute('SELECT id FROM users WHERE email = ? AND id <> ?', [newEmail, userId]);
        if (existing.length > 0) return res.status(409).json({ error: 'Email is already in use' });

        // generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const tokenHash = crypto.createHash('sha256').update(code).digest('hex');
        const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // store pending email and hashed token
        await db.execute('UPDATE users SET pending_email = ?, pending_email_token = ?, pending_email_expires = ? WHERE id = ?', [newEmail, tokenHash, expires, userId]);

        // send verification code to new email
        const subject = 'Confirm your new email for Rwanda Eats Reserve';
        const html = `
            <h2>Confirm Email Change</h2>
            <p>Use this verification code to confirm your new email address: <strong>${code}</strong></p>
            <p>This code expires in 15 minutes.</p>
        `;

        try { await NotificationService.sendEmail(newEmail, subject, html); } catch (e) { console.error('Error sending email change code:', e); }

        res.json({ message: 'Verification code sent to new email' });
    } catch (error) {
        console.error('Error requesting email change:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Confirm email change with code
app.post('/api/user/confirm-email-change', requireAuth, async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { code } = req.body || {};
        if (!code) return res.status(400).json({ error: 'Verification code is required' });

        const codeHash = crypto.createHash('sha256').update(code).digest('hex');
        const [rows] = await db.execute('SELECT pending_email FROM users WHERE id = ? AND pending_email_token = ? AND pending_email_expires > NOW()', [userId, codeHash]);
        if (rows.length === 0) return res.status(400).json({ error: 'Invalid or expired verification code' });

        const pendingEmail = rows[0].pending_email;

        // update email and clear pending fields
        await db.execute('UPDATE users SET email = ?, pending_email = NULL, pending_email_token = NULL, pending_email_expires = NULL, updated_at = NOW() WHERE id = ?', [pendingEmail, userId]);

        // update session
        req.session.user.email = pendingEmail;

        res.json({ message: 'Email updated successfully', email: pendingEmail });
    } catch (error) {
        console.error('Error confirming email change:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Cancel a reservation (customer or restaurant admin)
app.put('/api/reservations/:id/cancel', requireAuth, async (req, res) => {
    try {
        const reservationId = req.params.id;
        const user = req.session.user;

        // Load reservation
        const [rows] = await db.execute('SELECT * FROM reservations WHERE id = ?', [reservationId]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Reservation not found' });
        }

        const reservation = rows[0];

        // Authorization: customers can cancel their own reservations; restaurant admins can cancel for their restaurants
        if (user.user_type === 'customer') {
            if (reservation.customer_id !== user.id) {
                return res.status(403).json({ error: 'Permission denied' });
            }
        } else if (user.user_type === 'restaurant_admin') {
            const [rest] = await db.execute('SELECT restaurant_admin_id FROM restaurants WHERE id = ?', [reservation.restaurant_id]);
            if (rest.length === 0 || rest[0].restaurant_admin_id !== user.id) {
                return res.status(403).json({ error: 'Permission denied' });
            }
        } else if (user.user_type !== 'system_admin') {
            // Other user types not allowed
            return res.status(403).json({ error: 'Permission denied' });
        }

        // Disallow cancelling completed reservations
        if (reservation.status === 'completed') {
            return res.status(400).json({ error: 'Cannot cancel a completed reservation' });
        }

        if (reservation.status === 'cancelled') {
            return res.status(400).json({ error: 'Reservation already cancelled' });
        }

        // Update status
        await db.execute('UPDATE reservations SET status = ? WHERE id = ?', ['cancelled', reservationId]);

        // Notify customer
        const [customerRows] = await db.execute('SELECT id, name, email, phone FROM users WHERE id = ?', [reservation.customer_id]);
        const customer = customerRows.length ? customerRows[0] : null;

        const [restaurantRows] = await db.execute('SELECT id, name, restaurant_admin_id, location FROM restaurants WHERE id = ?', [reservation.restaurant_id]);
        const restaurant = restaurantRows.length ? restaurantRows[0] : null;

        if (customer) {
            await NotificationService.createNotification(
                customer.id,
                'Reservation Cancelled',
                `Your reservation at ${restaurant ? restaurant.name : 'the restaurant'} for ${reservation.reservation_date} ${reservation.reservation_time} has been cancelled.`,
                'reservation_status',
                'in_app',
                reservationId
            );
        }

        // Notify restaurant admin
        if (restaurant && restaurant.restaurant_admin_id) {
            await NotificationService.createNotification(
                restaurant.restaurant_admin_id,
                'Reservation Cancelled',
                `Reservation for ${customer ? customer.name : 'a customer'} at ${restaurant.name} on ${reservation.reservation_date} ${reservation.reservation_time} was cancelled.`,
                'reservation_status',
                'in_app',
                reservationId
            );
        }

        // Audit log
        await AuditLogService.logAction(user.id, 'RESERVATION_CANCELLED', 'reservation', reservationId, {}, req);

        res.json({ message: 'Reservation cancelled successfully' });
    } catch (error) {
        console.error('Error cancelling reservation:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/*
==============================================
Enhanced Email Service Integration Complete
==============================================

Features Added:
✅ Retry mechanism with exponential backoff
✅ Comprehensive error handling and logging  
✅ Dual provider support (Brevo + MailerSend)
✅ Enhanced email templates with responsive design
✅ Configuration testing endpoint
✅ Better status logging with emojis
✅ Fallback email content logging for debugging

New Endpoints:
- GET /api/email/test-config - Test email configuration (System Admin only)

Email Templates Available:
- welcome(name, verificationUrl)
- reservationConfirmation(customerName, restaurantName, date, time, partySize, location)  
- passwordReset(name, code)

Usage Examples:
- EmailService.sendEmail(to, subject, html) - Returns {success, provider, messageId/error}
- EmailService.testConfiguration() - Returns configuration status
- NotificationService.sendWelcomeEmail(user)
- NotificationService.sendReservationConfirmation(reservation, user, restaurant)
- NotificationService.sendPasswordResetEmail(user, code)
==============================================
*/