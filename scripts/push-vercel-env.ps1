# Push cloud MySQL env vars to Vercel (production).
# Usage: fill .env.vercel then run: .\scripts\push-vercel-env.ps1

$envFile = Join-Path $PSScriptRoot ".." ".env.vercel"
if (-not (Test-Path $envFile)) {
  Write-Error "Create .env.vercel from .env.vercel.example first."
  exit 1
}

$vars = @(
  "DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME",
  "DB_SSL", "DB_CONNECTION_LIMIT", "APEX_ALLOW_DEV_OTP"
)

foreach ($line in Get-Content $envFile) {
  $trimmed = $line.Trim()
  if (-not $trimmed -or $trimmed.StartsWith("#")) { continue }
  $eq = $trimmed.IndexOf("=")
  if ($eq -lt 1) { continue }
  $key = $trimmed.Substring(0, $eq).Trim()
  $val = $trimmed.Substring($eq + 1).Trim()
  if ($val.StartsWith('"') -and $val.EndsWith('"')) { $val = $val.Substring(1, $val.Length - 2) }
  Set-Variable -Name "env_$key" -Value $val -Scope Script
}

foreach ($key in $vars) {
  $varName = "env_$key"
  if (-not (Get-Variable -Name $varName -ErrorAction SilentlyContinue)) { continue }
  $value = (Get-Variable -Name $varName).Value
  if ([string]::IsNullOrWhiteSpace($value)) { continue }
  Write-Host "Setting $key ..."
  $value | npx vercel env add $key production --force 2>&1 | Out-Host
}

Write-Host "Done. Redeploy: npx vercel deploy --prod --yes"
