# Fix all TypeScript errors in VTTTools frontend

Write-Host "Fixing TypeScript errors..." -ForegroundColor Cyan

# 1. Fix WallDrawingTool.integration.test.tsx - unused 'index' parameter
$file = "src/components/encounter/drawing/WallDrawingTool.integration.test.tsx"
$content = Get-Content $file -Raw
$content = $content -replace "updateSegment: vi\.fn\(\(index,", "updateSegment: vi.fn((_index,"
Set-Content $file $content -NoNewline
Write-Host "Fixed: $file (unused parameter)" -ForegroundColor Green

# 2. Fix SourceRenderer.tsx - implicit 'any' type
$file = "src/components/encounter/rendering/SourceRenderer.tsx"
$content = Get-Content $file -Raw
$content = $content -replace "drawGradient\s*=\s*\(context\)\s*=>", "drawGradient = (context: CanvasRenderingContext2D) =>"
Set-Content $file $content -NoNewline
Write-Host "Fixed: $file (implicit any)" -ForegroundColor Green

# 3. Fix CampaignDetailPage.tsx - missing 'style' property
$file = "src/features/content-library/pages/CampaignDetailPage.tsx"
$content = Get-Content $file -Raw
$content = $content -replace "createAdventure\(\{\s*name:\s*newAdventureName,\s*description:\s*''\s*\}\)", "createAdventure({ name: newAdventureName, description: '', style: AdventureStyle.Generic })"
# Add import if not present
if ($content -notmatch "import.*AdventureStyle.*from") {
    $content = $content -replace "(import.*from '@/types/domain';)", "`$1`nimport { AdventureStyle } from '@/types/domain';"
}
Set-Content $file $content -NoNewline
Write-Host "Fixed: $file (missing style)" -ForegroundColor Green

Write-Host "TypeScript error fixes applied successfully!" -ForegroundColor Green
