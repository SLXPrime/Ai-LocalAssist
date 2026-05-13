$ErrorActionPreference = "Stop"

Set-Location "$PSScriptRoot\.."

if (!(Test-Path ".venv")) {
  throw "Missing .venv. Run scripts\setup.ps1 first."
}

if (Test-Path ".env") {
  Get-Content ".env" | ForEach-Object {
    if ($_ -match "^\s*#" -or $_ -notmatch "=") {
      return
    }

    $key, $value = $_ -split "=", 2
    [Environment]::SetEnvironmentVariable($key.Trim(), $value.Trim(), "Process")
  }
}

$hostName = $env:TTS_SERVICE_HOST
if (!$hostName) { $hostName = "0.0.0.0" }

$port = $env:TTS_SERVICE_PORT
if (!$port) { $port = "18001" }

.\.venv\Scripts\uvicorn.exe app.main:app --host $hostName --port $port

