# Password Recovery System - Documentation

## Overview
The password recovery system allows customers to reset their passwords using their email address and a 4-digit recovery code that they set during registration.

## Features

### 1. Recovery Code Registration
- **Location**: Customer registration form (`/register`)
- **Requirement**: Customers must provide a 4-digit numeric code during signup
- **Validation**: Code must be exactly 4 digits (0000-9999)
- **Storage**: Saved in `users.recovery_code` column (VARCHAR(4))

### 2. Password Reset Flow
- **Location**: Forgot password page (`/forgot-password`)
- **Process**:
  1. User enters their email address
  2. User enters their 4-digit recovery code
  3. User creates a new password (min 6 characters)
  4. User confirms the new password
   5. System verifies email + recovery code match
   6. Password is updated and you can log in immediately

### 3. Security Features
- (Deprecated) Account unlocking: The app no longer locks accounts
- Login attempt tracking removed
- **Password Hashing**: New password hashed with bcrypt (12 rounds)
- **Audit Logging**: All password resets are logged with timestamp and IP
- **Validation**: Recovery code must be exact 4-digit match

## User Interface

### Registration Form
```
Frontend: /frontend/views/register.html
Fields:
- Name
- Email
- Password
- Phone
- 4-Digit Recovery Code (new)
```

### Forgot Password Form
```
Frontend: /frontend/views/forgot-password.html
Fields:
- Email Address
- 4-Digit Recovery Code
- New Password
- Confirm New Password

Validation:
- Email format validation
- Recovery code: exactly 4 digits
- Password: min 6 characters
- Passwords must match
```

### Profile Management (System Admin)
```
Frontend: /frontend/views/system-admin.html
Features:
- Change email (requires current password)
- Change password (requires current password, min 6 chars)
- View current profile information
```

## API Endpoints

### POST /api/auth/register
**Purpose**: Register new customer with recovery code

**Request Body**:
```json
{
  "name": "Your Name",
  "email": "user@example.com",
  "password": "YourSecurePassword123",
  "phone": "0781234567",
  "user_type": "customer",
  "recovery_code": "your-4-digit-code"
}
```

**Response** (201):
```json
{
  "message": "Registration successful",
  "user": {
    "id": 15,
    "name": "Your Name",
    "email": "user@example.com",
    "user_type": "customer"
  }
}
```

**Validation**:
- recovery_code required for customers
- Must be 4 digits
- All standard registration validations apply

---

### POST /api/auth/reset-password
**Purpose**: Reset password using email and recovery code

**Request Body**:
```json
{
  "email": "user@example.com",
  "recovery_code": "your-code",
  "new_password": "YourNewSecurePassword@2025"
}
```

**Response** (200):
```json
{
  "message": "Password reset successful",
  "user": {
    "name": "Your Name",
    "email": "user@example.com"
  }
}
```

**Error Responses**:
- 400: Missing required fields
- 400: Invalid recovery code format (not 4 digits)
- 400: Password too short (less than 6 characters)
- 401: Invalid email or recovery code
- 500: Server error

**Side Effects**:
- Updates `password_hash` with bcrypt-hashed new password
- Logs action to audit log

---

### PUT /api/profile/email
**Purpose**: Change user's email address (System Admin)

**Request Body**:
```json
{
  "new_email": "newemail@example.com",
  "confirm_email": "newemail@example.com",
  "current_password": "CurrentPassword123"
}
```

**Response** (200):
```json
{
  "message": "Email updated successfully",
  "user": {
    "email": "newemail@example.com"
  }
}
```

**Authentication**: Requires active session

---

### PUT /api/profile/password
**Purpose**: Change user's password (System Admin)

**Request Body**:
```json
{
  "current_password": "OldPassword123",
  "new_password": "NewSecurePass@2025",
  "confirm_password": "NewSecurePass@2025"
}
```

**Response** (200):
```json
{
  "message": "Password updated successfully"
}
```

**Authentication**: Requires active session

---

## Database Schema

### users table - New Column
```sql
ALTER TABLE users 
ADD COLUMN recovery_code VARCHAR(4) NULL 
AFTER password_hash;
```

**Column Details**:
- **Name**: `recovery_code`
- **Type**: VARCHAR(4)
- **Nullable**: YES (NULL for admin users who don't need recovery codes)
- **Purpose**: Store 4-digit recovery code for password reset
- **Validation**: Should contain only digits 0-9

### Migration Files
1. `backend/migrations/add-recovery-code.sql` - Adds recovery_code column
2. `backend/scripts/add-recovery-code-column.js` - Script to run migration

## Testing

### Manual Testing Steps

#### Test 1: Register with Recovery Code
1. Navigate to http://localhost:9000/register
2. Fill in all fields including 4-digit recovery code
3. Submit form
4. Verify user created successfully

#### Test 2: Password Reset Flow
1. Navigate to http://localhost:9000/forgot-password
2. Enter registered email
3. Enter correct 4-digit recovery code
4. Enter new password (min 6 chars)
5. Confirm password
6. Submit form
7. Verify success message
8. Navigate to /login
9. Login with new password
10. Verify successful login

#### Test 3: Invalid Recovery Code
1. Navigate to http://localhost:9000/forgot-password
2. Enter valid email
3. Enter WRONG 4-digit code
4. Enter new password
5. Submit form
6. Verify error: "Invalid email or recovery code"

#### Test 4: Profile Password Change
1. Login as system admin
2. Click Profile tab
3. Click "Change Password"
4. Enter current password
5. Enter new password (6+ chars)
6. Confirm new password
7. Submit
8. Verify success message

### Automated Testing
Run the test script:
```powershell
.\test-reset-simple.ps1
```

Expected output:
```
✓ User registered
✓ Password reset completed
✓ Login with new password works
✓ ALL TESTS PASSED
```

## Security Considerations

### Strengths
✓ Recovery code separate from password
✓ No email required (code is stored at registration)
✓ Account automatically unlocked on reset
✓ Bcrypt hashing (12 rounds)
✓ Audit trail of all resets
✓ Server-side validation

### Limitations
⚠ Recovery code stored in plain text (consider encryption)
⚠ No rate limiting on reset attempts
⚠ No email notification when password is reset
⚠ Code is permanent (no expiration)

### Recommendations for Production
1. **Encrypt recovery codes** in database
2. **Add rate limiting** to prevent brute force attacks
3. **Send email notifications** when password is reset
4. **Implement CAPTCHA** on forgot password form
5. **Add password strength requirements** (uppercase, lowercase, numbers, symbols)
6. **Consider SMS verification** as additional factor
7. **Log IP addresses** of reset attempts
8. **Add cooldown period** between reset attempts

## User Guide

### For Customers

**Setting Up Recovery Code**
1. During registration, you'll be asked to create a 4-digit recovery code
2. This code should be:
   - Easy to remember
   - Not the same as your PIN or password
   - Kept confidential
3. Write down your code in a safe place

**Forgot Your Password?**
1. Click "Forgot Password?" on the login page
2. Enter your email address
3. Enter your 4-digit recovery code
4. Create a new password (at least 6 characters)
5. Confirm your new password
6. Click "Reset Password"
7. You can now login with your new password

**Changing Your Password (While Logged In)**
1. Login to your account
2. Go to your profile settings
3. Click "Change Password"
4. Enter your current password
5. Enter your new password (min 6 characters)
6. Confirm your new password
7. Click "Update Password"

### For Administrators

**Viewing Recovery Codes**
```sql
-- View recovery codes for all customers
SELECT id, name, email, recovery_code, created_at 
FROM users 
WHERE user_type = 'customer' 
AND recovery_code IS NOT NULL;
```

**Manually Resetting a User's Password**
```sql
-- Update password hash for a user
-- First, generate bcrypt hash with 12 rounds
-- Then update:
UPDATE users 
SET password_hash = 'BCRYPT_HASH_HERE'
WHERE email = 'user@example.com';
```

**Checking Audit Logs**
```sql
SELECT * FROM audit_logs 
WHERE action_type = 'PASSWORD_RESET' 
ORDER BY created_at DESC 
LIMIT 20;
```

## File Structure

```
backend/
  ├── server.js
  │   ├── GET /forgot-password - Serve forgot password page
  │   ├── POST /api/auth/register - Register with recovery code
  │   ├── POST /api/auth/reset-password - Reset password
  │   ├── PUT /api/profile/email - Change email
  │   └── PUT /api/profile/password - Change password
  ├── migrations/
  │   └── add-recovery-code.sql - Add recovery_code column
  └── scripts/
      └── add-recovery-code-column.js - Run migration script

frontend/
  ├── views/
  │   ├── register.html - Registration with recovery code
  │   ├── forgot-password.html - Password reset page
  │   ├── system-admin.html - Admin profile management
  │   └── login.html - Login (link to forgot password)
  └── public/
      └── js/
          └── system-admin.js - Profile change handlers
```

## Deployment Checklist

### Local Database
- [x] Add recovery_code column
- [x] Test registration with recovery code
- [x] Test password reset flow
- [x] Verify audit logging works

### TiDB Cloud (Production)
- [ ] Run migration: `add-recovery-code-column.js`
- [ ] Verify column exists: `SHOW COLUMNS FROM users LIKE 'recovery_code'`
- [ ] Export local database with recovery codes
- [ ] Import to TiDB Cloud
- [ ] Test password reset on production

### Render.com Deployment
- [ ] Deploy latest code to Render.com
- [ ] Verify /forgot-password route is accessible
- [ ] Test complete flow on production site
- [ ] Monitor audit logs for password resets

## Support & Troubleshooting

### Issue: "Invalid email or recovery code"
**Cause**: Email or recovery code doesn't match database
**Solution**: 
1. Verify email is correct
2. Check recovery code (4 digits)
3. Query database: `SELECT recovery_code FROM users WHERE email = 'user@example.com'`

### Issue: "Password must be at least 6 characters"
**Cause**: New password too short
**Solution**: Use password with 6+ characters

### Issue: Recovery code field not showing on registration
**Cause**: Old cached version of registration page
**Solution**: Hard refresh browser (Ctrl + F5)

### Issue: Database column missing
**Cause**: Migration not run on database
**Solution**: 
```bash
cd backend
node scripts/add-recovery-code-column.js
```

## Future Enhancements

1. **Two-Factor Authentication (2FA)**
   - SMS verification code
   - Authenticator app support
   - Backup codes

2. **Password Strength Meter**
   - Visual feedback on password strength
   - Requirements display
   - Common password blacklist

3. **Recovery Code Management**
   - Allow users to change recovery code
   - Generate random code option
   - Code history tracking

4. **Email Verification for Password Reset**
   - Send verification email before allowing reset
   - Time-limited reset links
   - Double verification (email + recovery code)

5. **Account Recovery Options**
   - Security questions
   - Phone number verification
   - ID document upload

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Author**: Rwanda Eats Reserve Development Team
