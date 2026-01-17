<#
.SYNOPSIS
    Starts Azurite if not already running.
.DESCRIPTION
    Checks if Azurite is already listening on the blob port.
    If running, exits successfully. If not, starts Azurite.
#>
param(
    [string]$Location = ".azurite",
    [int]$BlobPort = 10000,
    [int]$QueuePort = 10001,
    [int]$TablePort = 10002
)

$ErrorActionPreference = "Stop"

# Check if blob port is already in use
$connection = Get-NetTCPConnection -LocalPort $BlobPort -State Listen -ErrorAction SilentlyContinue

if ($connection) {
    Write-Host "Azurite is already running on port $BlobPort (PID: $($connection.OwningProcess))"
    # Keep the script running so Aspire doesn't think it failed
    while ($true) {
        Start-Sleep -Seconds 60
    }
}

Write-Host "Starting Azurite..."
& azurite --silent --location $Location --blobPort $BlobPort --queuePort $QueuePort --tablePort $TablePort
