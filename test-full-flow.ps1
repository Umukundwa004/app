# test-full-flow.ps1
# NOTE: Update these credentials to match your actual admin credentials

# --- Configuration ---
$baseUrl = "http://localhost:3000"
$adminCreds = @{
    email    = "your-admin@example.com"  # Update this
    password = "your-secure-password"     # Update this
}

# Generate unique data for the new restaurant and admin
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$restaurantName = "Test-Flow-R-$timestamp"
$adminEmail = "test-admin-$timestamp@example.com"
$initialPassword = "Password123!"
$newPassword = "NewPassword456!"

# --- Script ---
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$ErrorActionPreference = "Stop"

try {
    # 1. Login as System Admin
    Write-Host "1. Logging in as System Admin..."
    Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body (ConvertTo-Json $adminCreds) -ContentType 'application/json' -WebSession $session | Out-Null
    Write-Host "   ...Logged in successfully."

    # 2. Create a new restaurant and admin user
    Write-Host "2. Creating new restaurant '$restaurantName'..."
    $createBody = @{
        name            = $restaurantName
        description     = "A test restaurant for the full flow."
        address         = "123 Test Street"
        phone_number    = "555-0101"
        opening_time    = "09:00"
        closing_time    = "21:00"
        admin_email     = $adminEmail
        admin_password  = $initialPassword
    }
    $createResponse = Invoke-RestMethod -Uri "$baseUrl/api/system-admin/restaurants" -Method POST -Body (ConvertTo-Json $createBody) -ContentType 'application/json' -WebSession $session
    $newRestaurantId = $createResponse.id
    Write-Host "   ...Restaurant created with ID: $newRestaurantId"

    # 3. Find the new restaurant and its admin ID
    Write-Host "3. Verifying restaurant creation and finding admin user ID..."
    $allRestaurants = Invoke-RestMethod -Uri "$baseUrl/api/system-admin/restaurants" -Method GET -WebSession $session
    $newRestaurant = $allRestaurants | Where-Object { $_.id -eq $newRestaurantId }
    if (-not $newRestaurant) {
        throw "Could not find the newly created restaurant with ID $newRestaurantId"
    }
    $adminUserId = $newRestaurant.restaurant_admin_id
    Write-Host "   ...Found restaurant. Admin User ID is: $adminUserId"

    # 4. Reset the new admin's password
    Write-Host "4. Resetting password for admin user ID: $adminUserId..."
    $resetBody = @{
        password = $newPassword
    }
    $resetResponse = Invoke-RestMethod -Uri "$baseUrl/api/system-admin/users/$adminUserId/password" -Method PUT -Body (ConvertTo-Json $resetBody) -ContentType 'application/json' -WebSession $session
    Write-Host "   ...Password reset successful: $($resetResponse.message)"

    # 5. Delete the restaurant
    Write-Host "5. Deleting restaurant ID: $newRestaurantId..."
    $deleteResponse = Invoke-RestMethod -Uri "$baseUrl/api/system-admin/restaurants/$newRestaurantId" -Method DELETE -WebSession $session
    Write-Host "   ...Restaurant deleted successfully: $($deleteResponse.message)"

    Write-Host ""
    Write-Host "✅ Full flow (Create -> Reset Password -> Delete) completed successfully!"

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
    # Clean up session
    if ($session) {
        $session = $null
    }
    $ErrorActionPreference = "Continue"
}
