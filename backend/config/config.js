// config.js - Configuration settings
module.exports = {
    // Database Configuration
    db: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'vestine004',
        database: process.env.DB_NAME || 'rwanda_eats_reserve', // Added env var for flexibility
        port: process.env.DB_PORT || 3306, // Added Port (TiDB uses 4000)
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        // 👇 REQUIRED FOR TIDB CLOUD 👇
        ssl: {
            minVersion: 'TLSv1.2',
            rejectUnauthorized: true
        }
    },

    // Server Configuration
    server: {
        port: process.env.PORT || 3000
    },

    // Security Configuration
    security: {
        jwtSecret: process.env.JWT_SECRET || 'rwanda-eats-reserve-secret-key',
        sessionSecret: process.env.SESSION_SECRET || 'rwanda-eats-reserve-session-secret',
        bcryptRounds: 12
    },

    // Email Configuration (for production use real SMTP)
    email: {
        host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
        port: process.env.EMAIL_PORT || 587,
        user: process.env.EMAIL_USER || 'your-email@ethereal.email',
        pass: process.env.EMAIL_PASSWORD || 'your-password'
    }
};