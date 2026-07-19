# Sync CRON_SECRET from .env.local to GitHub Actions secrets.
# Prerequisite: gh auth login (or set GH_TOKEN with repo scope)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$EnvFile = Join-Path $Root ".env.local"

if (-not (Test-Path $EnvFile)) {
  Write-Error ".env.local not found at $EnvFile"
}

$line = Get-Content $EnvFile | Where-Object { $_ -match '^CRON_SECRET=' } | Select-Object -First 1
if (-not $line) {
  Write-Error "CRON_SECRET not found in .env.local"
}

$secret = $line -replace '^CRON_SECRET=', ''
if ([string]::IsNullOrWhiteSpace($secret)) {
  Write-Error "CRON_SECRET value is empty in .env.local"
}

gh auth status 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
  Write-Error "GitHub CLI not authenticated. Run: gh auth login"
}

gh secret set CRON_SECRET --repo Shen9008/trading100.com --body $secret
if ($LASTEXITCODE -ne 0) {
  Write-Error "Failed to set CRON_SECRET on GitHub Actions"
}

Write-Host "Updated GitHub Actions secret CRON_SECRET for Shen9008/trading100.com"
