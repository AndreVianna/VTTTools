# Seed Test Assets
# This script seeds test assets via the VTTTools API for development purposes
# Usage: pwsh -ExecutionPolicy Bypass -File seed-test-assets.ps1 [-UserId <guid>] [-ApiUrl <url>]

param(
    [string]$UserId = "550e8400-e29b-41d4-a716-446655440000", # Default dev user GUID
    [string]$ApiUrl = "http://localhost:5173/api",
    [string]$MediaApiUrl = "https://localhost:7174/api"  # Direct Media service URL
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

# Test assets to seed with their PNG files
$SEED_ASSETS = @(
    @{
        type = "Wall"
        category = "Static"
        name = "Stone Wall"
        description = "An immovable stone wall segment"
        imageFile = "stone-wall.png"
    },
    @{
        type = "Door"
        category = "Static"
        name = "Wooden Door"
        description = "A locked structural door"
        imageFile = "wooden-door.png"
    },
    @{
        type = "Object"
        category = "Passive"
        name = "Wooden Crate"
        description = "A moveable wooden crate"
        imageFile = "wooden-crate.png"
    },
    @{
        type = "Object"
        category = "Passive"
        name = "Treasure Chest"
        description = "A chest containing loot"
        imageFile = "treasure-chest.png"
    },
    @{
        type = "Character"
        category = "Active"
        name = "Hero Character"
        description = "A playable hero character"
        imageFile = "hero-character.png"
    },
    @{
        type = "Creature"
        category = "Active"
        name = "Goblin"
        description = "A hostile goblin enemy"
        imageFile = "goblin.png"
    }
)

Write-Host "🌱 Seeding test assets..." -ForegroundColor Green
Write-Host "User ID: $UserId" -ForegroundColor Cyan
Write-Host "Assets API URL: $ApiUrl" -ForegroundColor Cyan
Write-Host "Media API URL: $MediaApiUrl" -ForegroundColor Cyan

$xUserHeader = ConvertTo-NetGuidBase64 -Guid $UserId
Write-Host "x-user header: $xUserHeader" -ForegroundColor Cyan

try {
    # Get existing assets
    $response = Invoke-WebRequest -Uri "$ApiUrl/assets" -Headers @{'x-user' = $xUserHeader} -UseBasicParsing
    $existingAssets = $response.Content | ConvertFrom-Json
    $existingNames = @($existingAssets | ForEach-Object { $_.name })

    Write-Host "`nExisting assets: $($existingAssets.Count)" -ForegroundColor Yellow

    $created = 0
    $skipped = 0
    $svgBasePath = "$PSScriptRoot\..\..\..\..\Source\WebClientApp\public\assets\tokens"

    foreach ($asset in $SEED_ASSETS) {
        if ($existingNames -contains $asset.name) {
            Write-Host "⏭️  Skipping: $($asset.name)" -ForegroundColor Gray
            $skipped++
            continue
        }

        try {
            # Step 1: Upload image file to create Resource
            $imagePath = Join-Path $svgBasePath $asset.imageFile
            if (-not (Test-Path $imagePath)) {
                Write-Host "⚠️  Image file not found: $imagePath" -ForegroundColor Yellow
                continue
            }

            $resourceId = [Guid]::NewGuid().ToString()
            $imageFile = Get-Item $imagePath

            # Upload resource using PowerShell's -Form parameter
            $uploadResult = Invoke-WebRequest -Uri "$MediaApiUrl/resources" -Method POST `
                -Headers @{ 'x-user' = $xUserHeader } `
                -Form @{
                    id = $resourceId
                    type = 'asset'
                    resource = $asset.name
                    file = $imageFile
                } `
                -SkipCertificateCheck `
                -UseBasicParsing

            Write-Host "  📤 Uploaded resource: $($asset.imageFile) (ID: $resourceId)" -ForegroundColor Cyan

            # Step 2: Create Asset with resourceId
            $assetBody = @{
                type = $asset.type
                category = $asset.category
                name = $asset.name
                description = $asset.description
                resourceId = $resourceId
            } | ConvertTo-Json

            Write-Host "  Creating asset with resourceId: $resourceId" -ForegroundColor DarkGray

            $assetResult = Invoke-WebRequest -Uri "$ApiUrl/assets" -Method POST `
                -Headers @{
                    'x-user' = $xUserHeader
                    'Content-Type' = 'application/json'
                } `
                -Body $assetBody `
                -UseBasicParsing

            Write-Host "✅ Created asset: $($asset.name)" -ForegroundColor Green
            $created++
        }
        catch {
            Write-Host "❌ Failed to create: $($asset.name)" -ForegroundColor Red
            Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
            if ($_.ErrorDetails.Message) {
                Write-Host "   Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
            }
        }
    }

    Write-Host "`n📊 Summary:" -ForegroundColor Cyan
    Write-Host "  Created: $created" -ForegroundColor Green
    Write-Host "  Skipped: $skipped" -ForegroundColor Yellow
    Write-Host "  Total: $($existingAssets.Count + $created)" -ForegroundColor Cyan
}
catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
