# Fix EditorDialogs.tsx
$content = Get-Content 'src/components/encounter/EditorDialogs.tsx' -Raw
$content = $content -replace 'import type \{ PlacedAsset, EncounterWall \} from', 'import type { PlacedAsset, EncounterWall, DisplayName, LabelPosition } from'
$content = $content -replace 'assetContextMenuPosition: \{ x: number; y: number \} \| null;', 'assetContextMenuPosition: { left: number; top: number } | null;'
$content = $content -replace 'wallContextMenuPosition: \{ x: number; y: number \} \| null;', 'wallContextMenuPosition: { left: number; top: number } | null;'
$content = $content -replace 'onAssetRename: \(assetId: string, newName: string\) => void;', 'onAssetRename: (assetId: string, newName: string) => Promise<void>;'
$content = $content -replace 'onAssetDisplayUpdate: \(assetId: string, displayName: string, labelPosition: string\) => void;', 'onAssetDisplayUpdate: (assetId: string, displayName?: DisplayName, labelPosition?: LabelPosition) => Promise<void>;'
Set-Content 'src/components/encounter/EditorDialogs.tsx' -Value $content -NoNewline
Write-Host 'Fixed EditorDialogs.tsx'

# Fix CampaignDetailPage.tsx  
$content = Get-Content 'src/features/content-library/pages/CampaignDetailPage.tsx' -Raw
$content = $content -replace "request: \{\s+name: 'New Adventure',\s+description: ''\s+\}", "request: {`n                        name: 'New Adventure',`n                        description: '',`n                        style: 'Default'`n                    }"
Set-Content 'src/features/content-library/pages/CampaignDetailPage.tsx' -Value $content -NoNewline
Write-Host 'Fixed CampaignDetailPage.tsx'
