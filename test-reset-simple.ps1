# Simple Password Reset Test
Write-Host "Testing Password Reset Flow" -ForegroundColor Cyan

# 1. Register test user
Write-Host "`n1. Registering test user..." -ForegroundColor Yellow
$registerData = @{
    name = "Recovery Test"
    email = "recovery@test.com"
    password = "OldPass123"
    phone = "0781111111"
    user_type = "customer"
    recovery_code = "4567"
}

$json1 = $registerData | ConvertTo-Json
$result1 = Invoke-WebRequest -Uri "http://localhost:9000/api/auth/register" -Method POST -Body $json1 -ContentType "application/json" -UseBasicParsing

if ($result1.StatusCode -eq 201 -or $result1.StatusCode -eq 200) {
    Write-Host "SUCCESS: User registered" -ForegroundColor Green
}
else {
    Write-Host "Note: User may already exist (continuing test)" -ForegroundColor Yellow
}

# 2. Reset password
Write-Host "`n2. Resetting password..." -ForegroundColor Yellow
$resetData = @{
    email = "recovery@test.com"
    recovery_code = "4567"
    new_password = "NewSecurePass@2025"
}

$json2 = $resetData | ConvertTo-Json
$result2 = Invoke-WebRequest -Uri "http://localhost:9000/api/auth/reset-password" -Method POST -Body $json2 -ContentType "application/json" -UseBasicParsing

if ($result2.StatusCode -eq 200) {
    Write-Host "SUCCESS: Password reset completed" -ForegroundColor Green
    $response = $result2.Content | ConvertFrom-Json
    Write-Host "  User: $($response.user.name)" -ForegroundColor Cyan
}
else {
    Write-Host "FAILED: Password reset failed" -ForegroundColor Red
    exit 1
}

# 3. Login with new password
Write-Host "`n3. Testing login with new password..." -ForegroundColor Yellow
$loginData = @{
    email = "recovery@test.com"
    password = "NewSecurePass@2025"
}

$json3 = $loginData | ConvertTo-Json
$result3 = Invoke-WebRequest -Uri "http://localhost:9000/api/auth/login" -Method POST -Body $json3 -ContentType "application/json" -UseBasicParsing

if ($result3.StatusCode -eq 200) {
    Write-Host "SUCCESS: Login with new password works!" -ForegroundColor Green
    $loginResp = $result3.Content | ConvertFrom-Json
    Write-Host "  Logged in as: $($loginResp.user.name)" -ForegroundColor Cyan
}
else {
    Write-Host "FAILED: Cannot login with new password" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== ALL TESTS PASSED ===" -ForegroundColor Green
Write-Host "`nPassword reset feature is working correctly!" -ForegroundColor Cyan
Write-Host "Forgot password page: http://localhost:9000/forgot-password" -ForegroundColor White
