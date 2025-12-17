<#
.SYNOPSIS
    Cleans up test job data from the VTTTools database.

.DESCRIPTION
    This script safely removes jobs, job items, and their generated assets/resources.
    Uses audit logs to find assets and resources created by a job.
    Jobs have cascade delete enabled, so JobItems are automatically deleted.

.PARAMETER JobId
    Optional. Specific job ID to clean up. If not provided, lists all jobs.

.PARAMETER DeleteAll
    Switch to delete ALL jobs (use with caution).

.EXAMPLE
    .\jobs.ps1
    # Lists all jobs without deleting

.EXAMPLE
    .\jobs.ps1 -JobId "019b2ccf-8553-727b-8d0d-7e68caf8d921"
    # Deletes a specific job and all assets/resources it generated

.EXAMPLE
    .\jobs.ps1 -DeleteAll
    # Deletes ALL jobs and their generated entities
#>

param(
    [string]$JobId,
    [switch]$DeleteAll
)

$ErrorActionPreference = "Stop"

# Get connection string from user-secrets, environment, or default
$connectionString = $null

# Try user-secrets first (Data project)
$userSecretsId = "a7da29ff-2b87-4d83-8e0f-56e167d923c0"
$secretsPath = "$env:APPDATA\Microsoft\UserSecrets\$userSecretsId\secrets.json"
if (Test-Path $secretsPath) {
    try {
        $secrets = Get-Content $secretsPath -Raw | ConvertFrom-Json
        $connectionString = $secrets.ConnectionStrings.database
        if ($connectionString) {
            Write-Host "Using connection string from user-secrets" -ForegroundColor Gray
        }
    } catch {
        Write-Host "Warning: Could not parse user-secrets: $_" -ForegroundColor Yellow
    }
}

# Fall back to environment variable
if (-not $connectionString) {
    $connectionString = $env:ConnectionStrings__database
}

# Final fallback
if (-not $connectionString) {
    Write-Host "Error: No connection string found. Set ConnectionStrings:database in user-secrets or environment." -ForegroundColor Red
    exit 1
}

Write-Host "Connecting to database..." -ForegroundColor Cyan

# Normalize connection string for System.Data.SqlClient compatibility
# Microsoft.Data.SqlClient allows spaces in keyword names, System.Data.SqlClient does not
$connectionString = $connectionString -replace 'Trust Server Certificate\s*=', 'TrustServerCertificate='
$connectionString = $connectionString -replace 'Application Intent\s*=', 'ApplicationIntent='
$connectionString = $connectionString -replace 'Multi Subnet Failover\s*=', 'MultiSubnetFailover='
$connectionString = $connectionString -replace 'Connect Timeout\s*=', 'Connection Timeout='
$connectionString = $connectionString -replace 'Encrypt\s*=\s*Optional', 'Encrypt=False'

try {
    $connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
    $connection.Open()
    Write-Host "Connected successfully." -ForegroundColor Green
    Write-Host ""

    # List all jobs
    $listQuery = @"
SELECT
    j.Id,
    j.Type,
    j.Status,
    j.StartedAt,
    j.CompletedAt,
    (SELECT COUNT(*) FROM JobItems WHERE JobId = j.Id) as ItemCount,
    (SELECT COUNT(*) FROM JobItems WHERE JobId = j.Id AND Status = 'Success') as SuccessCount,
    (SELECT COUNT(*) FROM JobItems WHERE JobId = j.Id AND Status = 'Failed') as FailedCount
FROM Jobs j
ORDER BY j.StartedAt DESC
"@

    $listCmd = $connection.CreateCommand()
    $listCmd.CommandText = $listQuery
    $reader = $listCmd.ExecuteReader()

    $jobs = @()
    while ($reader.Read()) {
        $jobs += [PSCustomObject]@{
            Id = $reader["Id"].ToString()
            Type = $reader["Type"]
            Status = $reader["Status"]
            StartedAt = if ($reader["StartedAt"] -eq [DBNull]::Value) { "N/A" } else { $reader["StartedAt"].ToString("yyyy-MM-dd HH:mm:ss") }
            ItemCount = $reader["ItemCount"]
            SuccessCount = $reader["SuccessCount"]
            FailedCount = $reader["FailedCount"]
        }
    }
    $reader.Close()

    if ($jobs.Count -eq 0) {
        Write-Host "No jobs found in the database." -ForegroundColor Yellow
        $connection.Close()
        exit 0
    }

    Write-Host "Jobs in database:" -ForegroundColor Cyan
    Write-Host "=================" -ForegroundColor Cyan
    $jobs | Format-Table -Property Id, Type, Status, StartedAt, @{L='Items';E={"$($_.SuccessCount)/$($_.ItemCount) ok, $($_.FailedCount) failed"}} -AutoSize
    Write-Host ""

    # Determine what to delete
    $jobsToDelete = @()

    if ($JobId) {
        $jobsToDelete = $jobs | Where-Object { $_.Id -eq $JobId }
        if ($jobsToDelete.Count -eq 0) {
            Write-Host "Job with ID '$JobId' not found." -ForegroundColor Red
            $connection.Close()
            exit 1
        }
    }
    elseif ($DeleteAll) {
        $jobsToDelete = $jobs
    }
    else {
        Write-Host "To delete a specific job, run:" -ForegroundColor Yellow
        Write-Host "  .\jobs.ps1 -JobId `"<job-id>`"" -ForegroundColor White
        Write-Host ""
        Write-Host "To delete ALL jobs, run:" -ForegroundColor Yellow
        Write-Host "  .\jobs.ps1 -DeleteAll" -ForegroundColor White
        $connection.Close()
        exit 0
    }

    # Count items to delete
    $totalJobItems = ($jobsToDelete | Measure-Object -Property ItemCount -Sum).Sum

    # Find generated assets and resources from audit logs
    $assetsToDelete = @()
    $resourcesToDelete = @()

    Write-Host "Searching audit logs for generated entities..." -ForegroundColor Cyan

    foreach ($job in $jobsToDelete) {
        # Find assets generated by this job
        $assetQuery = @"
SELECT EntityId
FROM AuditLogs
WHERE Action = 'Asset:Generated:ViaJob'
  AND EntityType = 'Asset'
  AND Payload LIKE '%"jobId":"$($job.Id)"%'
"@
        $assetCmd = $connection.CreateCommand()
        $assetCmd.CommandText = $assetQuery
        $assetReader = $assetCmd.ExecuteReader()

        while ($assetReader.Read()) {
            $entityId = $assetReader["EntityId"].ToString()
            if ($entityId -and $assetsToDelete -notcontains $entityId) {
                $assetsToDelete += $entityId
            }
        }
        $assetReader.Close()

        # Find resources generated by this job
        $resourceQuery = @"
SELECT EntityId
FROM AuditLogs
WHERE Action = 'Resource:Generated:ViaJob'
  AND EntityType = 'Resource'
  AND Payload LIKE '%"jobId":"$($job.Id)"%'
"@
        $resourceCmd = $connection.CreateCommand()
        $resourceCmd.CommandText = $resourceQuery
        $resourceReader = $resourceCmd.ExecuteReader()

        while ($resourceReader.Read()) {
            $entityId = $resourceReader["EntityId"].ToString()
            if ($entityId -and $resourcesToDelete -notcontains $entityId) {
                $resourcesToDelete += $entityId
            }
        }
        $resourceReader.Close()
    }

    Write-Host "Found $($assetsToDelete.Count) assets and $($resourcesToDelete.Count) resources from audit logs." -ForegroundColor Cyan
    Write-Host ""

    Write-Host "Entities to be deleted:" -ForegroundColor Yellow
    Write-Host "  - Jobs: $($jobsToDelete.Count)"
    Write-Host "  - Job Items: $totalJobItems (cascade deleted)"
    Write-Host "  - Assets: $($assetsToDelete.Count)"
    Write-Host "  - Resources: $($resourcesToDelete.Count)"
    Write-Host ""

    # Confirm deletion
    $confirm = Read-Host "Are you sure you want to delete these entities? (y/N)"
    if ($confirm -ne 'y' -and $confirm -ne 'Y') {
        Write-Host "Aborted." -ForegroundColor Yellow
        $connection.Close()
        exit 0
    }

    $deleteCmd = $connection.CreateCommand()

    # Delete resources first (they may be referenced by assets)
    if ($resourcesToDelete.Count -gt 0) {
        Write-Host "Deleting resources..." -ForegroundColor Cyan
        foreach ($resourceId in $resourcesToDelete) {
            try {
                $deleteCmd.CommandText = "DELETE FROM Resources WHERE Id = '$resourceId'"
                $deleted = $deleteCmd.ExecuteNonQuery()
                if ($deleted -gt 0) {
                    Write-Host "  Deleted resource: $resourceId" -ForegroundColor Green
                } else {
                    Write-Host "  Resource not found (may already be deleted): $resourceId" -ForegroundColor Gray
                }
            } catch {
                Write-Host "  Failed to delete resource $resourceId : $_" -ForegroundColor Red
            }
        }
    }

    # Delete assets (after resources, in case of FK constraints)
    if ($assetsToDelete.Count -gt 0) {
        Write-Host "Deleting assets..." -ForegroundColor Cyan
        foreach ($assetId in $assetsToDelete) {
            try {
                $deleteCmd.CommandText = "DELETE FROM Assets WHERE Id = '$assetId'"
                $deleted = $deleteCmd.ExecuteNonQuery()
                if ($deleted -gt 0) {
                    Write-Host "  Deleted asset: $assetId" -ForegroundColor Green
                } else {
                    Write-Host "  Asset not found (may already be deleted): $assetId" -ForegroundColor Gray
                }
            } catch {
                Write-Host "  Failed to delete asset $assetId : $_" -ForegroundColor Red
            }
        }
    }

    # Delete jobs (JobItems cascade delete automatically)
    Write-Host "Deleting jobs..." -ForegroundColor Cyan
    foreach ($job in $jobsToDelete) {
        $deleteCmd.CommandText = "DELETE FROM Jobs WHERE Id = '$($job.Id)'"
        $deleted = $deleteCmd.ExecuteNonQuery()
        Write-Host "  Deleted job: $($job.Id)" -ForegroundColor Green
    }

    Write-Host ""
    Write-Host "Cleanup completed!" -ForegroundColor Green

} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
} finally {
    if ($connection -and $connection.State -eq 'Open') {
        $connection.Close()
    }
}
