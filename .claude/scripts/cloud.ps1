<#
.SYNOPSIS
    Cloud storage management tool for VTTTools.

.DESCRIPTION
    Provides commands for managing Azure Blob Storage resources.
    Connection strings are read from user-secrets (Data project).

.PARAMETER SyncMetadata
    Syncs resource metadata from database to blob storage.
    Requires a ResourceId argument (GUID or "all").

.EXAMPLE
    .\cloud.ps1 -SyncMetadata "019a0363-9294-749d-9323-b759664a5436"
    Syncs metadata for a specific resource.

.EXAMPLE
    .\cloud.ps1 -SyncMetadata all
    Syncs metadata for all resources.
#>

param(
    [string]$SyncMetadata,
    [string]$ContainerName = "media"
)

$ErrorActionPreference = "Stop"

# Get connection strings from user-secrets (Media service)
$userSecretsId = "d44012eb-cfbb-4b28-93d2-785a1d880f9d"
$secretsPath = "$env:APPDATA\Microsoft\UserSecrets\$userSecretsId\secrets.json"

if (-not (Test-Path $secretsPath)) {
    Write-Error "User secrets not found at: $secretsPath`nRun 'dotnet user-secrets set ConnectionStrings:database ""..."" --project Source/Media' to configure."
    exit 1
}

try {
    $secrets = Get-Content $secretsPath -Raw | ConvertFrom-Json
    $databaseConnectionString = $secrets.ConnectionStrings.database
    $blobConnectionString = $secrets.ConnectionStrings.blobs
} catch {
    Write-Error "Could not parse user-secrets: $_"
    exit 1
}

if ([string]::IsNullOrWhiteSpace($databaseConnectionString)) {
    Write-Error "ConnectionStrings:database not found in user-secrets."
    exit 1
}

if ([string]::IsNullOrWhiteSpace($blobConnectionString)) {
    Write-Error "ConnectionStrings:blobs not found in user-secrets."
    exit 1
}

# Normalize database connection string for System.Data.SqlClient compatibility
$databaseConnectionString = $databaseConnectionString -replace 'Trust Server Certificate\s*=', 'TrustServerCertificate='
$databaseConnectionString = $databaseConnectionString -replace 'Application Intent\s*=', 'ApplicationIntent='
$databaseConnectionString = $databaseConnectionString -replace 'Multi Subnet Failover\s*=', 'MultiSubnetFailover='
$databaseConnectionString = $databaseConnectionString -replace 'Connect Timeout\s*=', 'Connection Timeout='
$databaseConnectionString = $databaseConnectionString -replace 'Encrypt\s*=\s*Optional', 'Encrypt=False'

function Invoke-SyncMetadata {
    param([string]$ResourceId)

    Write-Host "=== Sync Blob Metadata ===" -ForegroundColor Cyan
    Write-Host "Container: $ContainerName"
    Write-Host ""

    # Install required module if not present
    if (-not (Get-Module -ListAvailable -Name Az.Storage)) {
        Write-Host "Installing Az.Storage module..." -ForegroundColor Yellow
        Install-Module -Name Az.Storage -Scope CurrentUser -Force -AllowClobber
    }

    Import-Module Az.Storage

    # Create storage context
    Write-Host "Connecting to Azure Blob Storage..." -ForegroundColor Cyan
    $storageContext = New-AzStorageContext -ConnectionString $blobConnectionString

    # Build SQL query
    $query = @"
SELECT
    Id,
    Path,
    ContentType,
    FileName,
    FileLength,
    Width,
    Height,
    Duration,
    OwnerId
FROM Resources
"@

    if ($ResourceId -ne "all") {
        $query += " WHERE Id = '$ResourceId'"
    }

    Write-Host "Querying database for resources..." -ForegroundColor Cyan

    # Execute SQL query
    $connection = New-Object System.Data.SqlClient.SqlConnection($databaseConnectionString)
    $connection.Open()

    $command = $connection.CreateCommand()
    $command.CommandText = $query

    $reader = $command.ExecuteReader()

    $resources = @()
    while ($reader.Read()) {
        $resources += [PSCustomObject]@{
            Id = $reader["Id"]
            Path = $reader["Path"]
            ContentType = $reader["ContentType"]
            FileName = $reader["FileName"]
            FileLength = $reader["FileLength"]
            Width = $reader["Width"]
            Height = $reader["Height"]
            Duration = $reader["Duration"]
            OwnerId = $reader["OwnerId"]
        }
    }

    $reader.Close()
    $connection.Close()

    Write-Host "Found $($resources.Count) resources to process." -ForegroundColor Cyan
    Write-Host ""

    $successCount = 0
    $errorCount = 0
    $skippedCount = 0

    foreach ($resource in $resources) {
        $blobPath = $resource.Path
        Write-Host "Processing: $($resource.Id)" -ForegroundColor White
        Write-Host "  Path: $blobPath"

        try {
            # Get existing blob
            $blob = Get-AzStorageBlob -Container $ContainerName -Blob $blobPath -Context $storageContext -ErrorAction SilentlyContinue

            if ($null -eq $blob) {
                Write-Host "  Status: SKIPPED (blob not found)" -ForegroundColor Yellow
                $skippedCount++
                continue
            }

            # Prepare metadata
            $metadata = @{
                "GeneratedContentType" = $resource.ContentType
                "FileName" = $resource.FileName
                "FileLength" = $resource.FileLength.ToString()
                "Width" = $resource.Width.ToString()
                "Height" = $resource.Height.ToString()
                "Duration" = $resource.Duration.ToString()
                "OwnerId" = $resource.OwnerId.ToString()
            }

            Write-Host "  Metadata to set:"
            foreach ($key in $metadata.Keys) {
                Write-Host "    $key = $($metadata[$key])" -ForegroundColor Gray
            }

            # Update blob metadata
            $blob.ICloudBlob.Metadata.Clear()
            foreach ($key in $metadata.Keys) {
                $blob.ICloudBlob.Metadata[$key] = $metadata[$key]
            }
            $blob.ICloudBlob.SetMetadata()

            Write-Host "  Status: UPDATED" -ForegroundColor Green
            $successCount++
        }
        catch {
            Write-Host "  Status: ERROR - $($_.Exception.Message)" -ForegroundColor Red
            $errorCount++
        }

        Write-Host ""
    }

    Write-Host "=== Summary ===" -ForegroundColor Cyan
    Write-Host "Total resources: $($resources.Count)"
    Write-Host "Successful: $successCount" -ForegroundColor Green
    Write-Host "Skipped (blob not found): $skippedCount" -ForegroundColor Yellow
    Write-Host "Errors: $errorCount" -ForegroundColor $(if ($errorCount -gt 0) { "Red" } else { "Green" })
}

# Command dispatcher
if ($SyncMetadata) {
    Invoke-SyncMetadata -ResourceId $SyncMetadata
}
else {
    Write-Host "VTTTools Cloud Storage Management" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Available commands:" -ForegroundColor Yellow
    Write-Host "  -SyncMetadata <id|all>  Sync resource metadata from DB to blob storage"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host "  .\cloud.ps1 -SyncMetadata all"
    Write-Host "  .\cloud.ps1 -SyncMetadata `"019a0363-9294-749d-9323-b759664a5436`""
}
