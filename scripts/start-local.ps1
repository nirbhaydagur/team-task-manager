param(
  [switch]$SkipInstall,
  [switch]$SkipSeed
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$Pnpm = Join-Path $Root ".tools\pnpm\bin\pnpm.cjs"

function Ensure-Pnpm {
  if (Test-Path $Pnpm) {
    return
  }

  New-Item -ItemType Directory -Force -Path (Join-Path $Root ".tools") | Out-Null
  $latest = Invoke-RestMethod "https://registry.npmjs.org/pnpm/latest"
  $tarball = Join-Path $Root "pnpm.tgz"
  Invoke-WebRequest $latest.dist.tarball -OutFile $tarball
  New-Item -ItemType Directory -Force -Path (Join-Path $Root ".tools\pnpm") | Out-Null
  tar -xzf $tarball -C (Join-Path $Root ".tools\pnpm") --strip-components 1
}

Set-Location $Root
Ensure-Pnpm

if (-not $SkipInstall) {
  node $Pnpm install
}

Copy-Item apps\api\.env.example apps\api\.env -Force
Copy-Item apps\web\.env.example apps\web\.env.local -Force

docker compose up -d
node $Pnpm --filter "@team-task-manager/api" exec prisma migrate dev --name init

if (-not $SkipSeed) {
  node $Pnpm --filter "@team-task-manager/api" db:seed
}

New-Item -ItemType Directory -Force -Path logs | Out-Null
Start-Process -FilePath node -ArgumentList ".tools\pnpm\bin\pnpm.cjs","--filter","@team-task-manager/api","dev" -WorkingDirectory $Root -RedirectStandardOutput "$Root\logs\api.log" -RedirectStandardError "$Root\logs\api.err.log" -WindowStyle Hidden
Start-Process -FilePath node -ArgumentList ".tools\pnpm\bin\pnpm.cjs","--filter","@team-task-manager/web","dev" -WorkingDirectory $Root -RedirectStandardOutput "$Root\logs\web.log" -RedirectStandardError "$Root\logs\web.err.log" -WindowStyle Hidden

Write-Host "TaskFlow is starting."
Write-Host "Frontend: http://localhost:3000"
Write-Host "API:      http://localhost:4000/health"
Write-Host "Logs:     $Root\logs"

