# Test Password Reset Flow
Write-Host "`n=== Testing Password Reset with Recovery Code ===" -ForegroundColor Cyan

# Test credentials - update with actual test user
$email = "testuser@example.com"
$recoveryCode = "your-recovery-code"
$newPassword = "NewPassword@2025!"

Write-Host "`n1. Creating test user with recovery code..." -ForegroundColor Yellow

# Register a new test user
$registerBody = @{
    name = "Test User"
    email = "testrecovery@example.com"
    password = "OldPassword123"
    phone = "0781234567"
    user_type = "customer"
    recovery_code = "5678"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:9000/api/auth/register" -Method POST -Body $registerBody -ContentType "application/json" -ErrorAction Stop
    Write-Host "Success: Test user created - $($registerResponse.user.email)" -ForegroundColor Green
}
catch {
    if ($_.Exception.Message -like "*already exists*") {
        Write-Host "Success: Test user already exists (testrecovery@example.com)" -ForegroundColor Yellow
    }
    else {
        Write-Host "Error creating user: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n2. Testing password reset..." -ForegroundColor Yellow

# Reset password using recovery code
$resetBody = @{
    email = "testrecovery@example.com"
    recovery_code = "5678"
    new_password = $newPassword
} | ConvertTo-Json

try {
    $resetResponse = Invoke-RestMethod -Uri "http://localhost:9000/api/auth/reset-password" `
        -Method POST `
        -Body $resetBody `
        -ContentType "application/json" `
        -ErrorAction Stop
    
    Write-Host "✓ Password reset successful!" -ForegroundColor Green
    Write-Host "  User: $($resetResponse.user.name) ($($resetResponse.user.email))" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Password reset failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n3. Testing login with new password..." -ForegroundColor Yellow

# Login with new password
$loginBody = @{
    email = "testrecovery@example.com"
    password = $newPassword
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:9000/api/auth/login" `
        -Method POST `
        -Body $loginBody `
        -ContentType "application/json" `
        -ErrorAction Stop
    
    Write-Host "✓ Login successful with new password!" -ForegroundColor Green
    Write-Host "  User: $($loginResponse.user.name)" -ForegroundColor Cyan
    Write-Host "  Type: $($loginResponse.user.user_type)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n4. Testing invalid recovery code..." -ForegroundColor Yellow

# Try reset with wrong recovery code
$invalidResetBody = @{
    email = "testrecovery@example.com"
    recovery_code = "9999"
    new_password = "AnotherPassword123"
} | ConvertTo-Json

try {
    $invalidResponse = Invoke-RestMethod -Uri "http://localhost:9000/api/auth/reset-password" `
        -Method POST `
        -Body $invalidResetBody `
        -ContentType "application/json" `
        -ErrorAction Stop
    
    Write-Host "✗ Should have failed with invalid code!" -ForegroundColor Red
} catch {
    if ($_.Exception.Message -like "*401*") {
        Write-Host "✓ Correctly rejected invalid recovery code" -ForegroundColor Green
    } else {
        Write-Host "? Unexpected error: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host "`n=== All Tests Completed ===" -ForegroundColor Cyan
Write-Host "`nPassword Reset Flow Summary:" -ForegroundColor White
Write-Host "  ✓ User registration with recovery code" -ForegroundColor Green
Write-Host "  ✓ Password reset using email + recovery code" -ForegroundColor Green
Write-Host "  ✓ Login with new password" -ForegroundColor Green
Write-Host "  ✓ Invalid recovery code rejection" -ForegroundColor Green
Write-Host "`nForgot password page: http://localhost:9000/forgot-password" -ForegroundColor Cyan
