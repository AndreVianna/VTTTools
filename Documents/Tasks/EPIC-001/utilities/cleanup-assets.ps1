# Cleanup Test Assets
# This script deletes test assets to allow re-seeding with updated data
# Usage: pwsh -ExecutionPolicy Bypass -File cleanup-assets.ps1 [-UserId <guid>] [-ApiUrl <url>]

param(
    [string]$UserId = "550e8400-e29b-41d4-a716-446655440000", # Default dev user GUID
    [string]$ApiUrl = "http://localhost:5173/api"
)

# Convert GUID to .NET-compatible base64url for x-user header
function ConvertTo-NetGuidBase64 {
    param([string]$Guid)

    $parts = $Guid.Split('-')
    $bytes = New-Object byte[] 16

    # Data1 (4 bytes) - little endian
    $data1 = [uint32]"0x$($parts[0])"
    $bytes[0] = $data1 -band 0xFF
    $bytes[1] = ($data1 -shr 8) -band 0xFF
    $bytes[2] = ($data1 -shr 16) -band 0xFF
    $bytes[3] = ($data1 -shr 24) -band 0xFF

    # Data2 (2 bytes) - little endian
    $data2 = [uint16]"0x$($parts[1])"
    $bytes[4] = $data2 -band 0xFF
    $bytes[5] = ($data2 -shr 8) -band 0xFF

    # Data3 (2 bytes) - little endian
    $data3 = [uint16]"0x$($parts[2])"
    $bytes[6] = $data3 -band 0xFF
    $bytes[7] = ($data3 -shr 8) -band 0xFF

    # Data4 (8 bytes) - big endian
    $data4 = $parts[3] + $parts[4]
    for ($i = 0; $i -lt 8; $i++) {
        $bytes[8 + $i] = [byte]"0x$($data4.Substring($i * 2, 2))"
    }

    # Convert to base64url
    $base64 = [Convert]::ToBase64String($bytes)
    return $base64.Replace('+', '-').Replace('/', '_').TrimEnd('=')
}

Write-Host "🧹 Cleaning up test assets..." -ForegroundColor Yellow
Write-Host "User ID: $UserId" -ForegroundColor Cyan
Write-Host "API URL: $ApiUrl" -ForegroundColor Cyan

$xUserHeader = ConvertTo-NetGuidBase64 -Guid $UserId
Write-Host "x-user header: $xUserHeader" -ForegroundColor Cyan

try {
    # Get all assets
    $response = Invoke-WebRequest -Uri "$ApiUrl/assets" -Headers @{'x-user' = $xUserHeader} -UseBasicParsing
    $assets = $response.Content | ConvertFrom-Json

    Write-Host "`nFound $($assets.Count) assets" -ForegroundColor Cyan

    $deleted = 0
    foreach ($asset in $assets) {
        try {
            $null = Invoke-WebRequest -Uri "$ApiUrl/assets/$($asset.id)" -Method DELETE -Headers @{'x-user' = $xUserHeader} -UseBasicParsing
            Write-Host "✅ Deleted: $($asset.name)" -ForegroundColor Green
            $deleted++
        }
        catch {
            Write-Host "❌ Failed to delete: $($asset.name) - $($_.Exception.Message)" -ForegroundColor Red
        }
    }

    Write-Host "`n📊 Summary:" -ForegroundColor Cyan
    Write-Host "  Deleted: $deleted assets" -ForegroundColor Yellow
}
catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
