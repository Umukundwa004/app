# test-add-user.ps1

# --- Configuration ---
$baseUrl = "http://localhost:3000"
$adminCreds = @{
    email    = "admin@rwandaeats.com"
    password = "admin123"
}

# Generate unique data for the new user
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$userName = "TestUser-$timestamp"
$userEmail = "test-user-$timestamp@example.com"
$userPassword = "UserPass123!"

# --- Script ---
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$ErrorActionPreference = "Stop"

try {
    # 1. Login as System Admin
    Write-Host "1. Logging in as System Admin..."
    Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body (ConvertTo-Json $adminCreds) -ContentType 'application/json' -WebSession $session | Out-Null
    Write-Host "   ...Logged in successfully."

    # 2. Create a new user
    Write-Host "2. Creating new user '$userEmail'..."
    $createBody = @{
        name = $userName
        email = $userEmail
        phone = "555-0202"
        user_type = "customer"
        password = $userPassword
    }
    $createResponse = Invoke-RestMethod -Uri "$baseUrl/api/system-admin/users" -Method POST -Body (ConvertTo-Json $createBody) -ContentType 'application/json' -WebSession $session
    $newUserId = $createResponse.id
    Write-Host "   ...User created with ID: $newUserId"

    # 3. Verify the new user via GET (search by email)
    Write-Host "3. Verifying user creation by querying users list..."
    $allUsers = Invoke-RestMethod -Uri "$baseUrl/api/system-admin/users" -Method GET -WebSession $session
    $created = $allUsers | Where-Object { $_.email -eq $userEmail }
    if (-not $created) {
        throw "Could not find the newly created user with email $userEmail"
    }
    Write-Host "   ...User verified in users list."

    # 4. Cleanup - delete the test user
    Write-Host "4. Deleting the test user ID: $newUserId..."
    Invoke-RestMethod -Uri "$baseUrl/api/system-admin/users/$newUserId" -Method DELETE -WebSession $session | Out-Null
    Write-Host "   ...User deleted successfully."

    Write-Host ""
    Write-Host "✅ Add User flow tested successfully (create -> verify -> delete)."

} catch {
    Write-Host ""
    Write-Host "❌ An error occurred:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.Exception.Response) {
        $responseStream = $_.Exception.Response.GetResponseStream()
        $streamReader = New-Object System.IO.StreamReader($responseStream)
        $responseBody = $streamReader.ReadToEnd()
        $streamReader.Close()
        Write-Host "   Response Body: $responseBody" -ForegroundColor Yellow
    }
} finally {
    if ($session) { $session = $null }
    $ErrorActionPreference = "Continue"
}
