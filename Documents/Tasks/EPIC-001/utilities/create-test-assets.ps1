# Create Test Assets for Scene Editor
# Run this script after the Aspire AppHost is running

# API URL from Vite proxy configuration
$apiUrl = "https://localhost:7171/api/assets"
Write-Host "Creating test assets at: $apiUrl" -ForegroundColor Cyan

# Asset definitions
$assets = @(
    @{
        type = "Wall"
        category = "Static"
        name = "Stone Wall"
        description = "An immovable stone wall segment"
        imageUrl = "https://via.placeholder.com/100/9E9E9E/FFFFFF?text=Wall"
        isPublic = $true
        isPublished = $true
    },
    @{
        type = "Door"
        category = "Static"
        name = "Wooden Door"
        description = "A locked structural door"
        imageUrl = "https://via.placeholder.com/100/8D6E63/FFFFFF?text=Door"
        isPublic = $true
        isPublished = $true
    },
    @{
        type = "Object"
        category = "Passive"
        name = "Wooden Crate"
        description = "A moveable wooden crate"
        imageUrl = "https://via.placeholder.com/100/795548/FFFFFF?text=Crate"
        isPublic = $true
        isPublished = $true
    },
    @{
        type = "Object"
        category = "Passive"
        name = "Treasure Chest"
        description = "A chest containing loot"
        imageUrl = "https://via.placeholder.com/100/FFC107/FFFFFF?text=Chest"
        isPublic = $true
        isPublished = $true
    },
    @{
        type = "Character"
        category = "Active"
        name = "Hero Character"
        description = "A playable hero character"
        imageUrl = "https://via.placeholder.com/100/4CAF50/FFFFFF?text=Hero"
        isPublic = $true
        isPublished = $true
    },
    @{
        type = "Creature"
        category = "Active"
        name = "Goblin"
        description = "A hostile goblin enemy"
        imageUrl = "https://via.placeholder.com/100/F44336/FFFFFF?text=Goblin"
        isPublic = $true
        isPublished = $true
    }
)

# Skip SSL certificate validation for localhost development (PowerShell 7+)
if ($PSVersionTable.PSVersion.Major -ge 6) {
    $PSDefaultParameterValues['Invoke-RestMethod:SkipCertificateCheck'] = $true
}

# Create assets
$successCount = 0
$failCount = 0

foreach ($asset in $assets) {
    $body = $asset | ConvertTo-Json
    try {
        $response = Invoke-RestMethod -Uri $apiUrl -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
        Write-Host "✅ Created: $($asset.name) (ID: $($response.id))" -ForegroundColor Green
        $successCount++
    }
    catch {
        $errorMsg = $_.Exception.Message
        if ($_.ErrorDetails.Message) {
            $errorMsg = $_.ErrorDetails.Message
        }
        Write-Host "❌ Failed: $($asset.name)" -ForegroundColor Red
        Write-Host "   Error: $errorMsg" -ForegroundColor Yellow
        $failCount++
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "✨ Asset Creation Complete!" -ForegroundColor Cyan
Write-Host "   Success: $successCount" -ForegroundColor Green
Write-Host "   Failed: $failCount" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Green" })
Write-Host "`n💡 Open the Scene Editor to see your assets:" -ForegroundColor Cyan
Write-Host "   http://localhost:5173/scene-editor" -ForegroundColor White
Write-Host "========================================`n" -ForegroundColor Cyan
