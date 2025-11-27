# Unlock Locked Accounts in TiDB Production

## Run this script to unlock accounts that were locked due to too many failed login attempts

### Usage:

```powershell
# Set TiDB connection details
$env:DB_HOST = "gateway01.eu-central-1.prod.aws.tidbcloud.com"
$env:DB_PORT = "4000"
$env:DB_USER = "3Nhz53ESuRkZyeE.root"
$env:DB_PASSWORD = "<your-tidb-password>"
$env:DB_NAME = "test"
$env:DB_SSL = "true"

# Run unlock script
node backend/scripts/unlock-all-accounts-tidb.js
```

### What it does:
- Lists all locked accounts
- Unlocks all accounts
- Resets login attempt counters to 0

### Common scenarios:
- Account locked after password changes
- Too many login attempts with old passwords
- Testing that triggered account lockout
