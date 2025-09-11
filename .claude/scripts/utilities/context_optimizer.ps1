# Context Optimizer for AI-Optimized CLAUDE.md
# Automatically applies compression techniques to reduce context bloat

param(
    [Parameter(Mandatory=$true)]
    [string]$FilePath,
    
    [Parameter(Mandatory=$false)]
    [int]$TargetLines = 200,
    
    [Parameter(Mandatory=$false)]
    [switch]$DryRun,
    
    [Parameter(Mandatory=$false)]
    [switch]$Aggressive
)

Set-StrictMode -Version Latest

# Import modules for consistent messaging and context processing
Import-Module (Join-Path $PSScriptRoot "modules\logger.psm1") -Force
Import-Module (Join-Path $PSScriptRoot "modules\context.psm1") -Force

function Compress-BulletLists {
    param([string[]]$Lines)
    
    $optimized = @()
    $currentList = @()
    $inList = $false
    
    for ($i = 0; $i -lt $Lines.Count; $i++) {
        $line = $Lines[$i]
        
        if ($line -match '^\s*- (.+):\s*(.+)$') {
            # Bullet list item with description
            $currentList += "$($matches[1])|$($matches[2])"
            $inList = $true
        } elseif ($inList -and $currentList.Count -gt 2) {
            # End of list with multiple items - compress it
            $compressed = ($currentList -join ', ') -replace '\|', ':'
            $optimized += "**COMPRESSED**: $compressed"
            $currentList = @()
            $inList = $false
            $optimized += $line
        } else {
            # Not in a compressible list
            if ($currentList.Count -gt 0) {
                # Add uncompressed list items
                foreach ($item in $currentList) {
                    $parts = $item -split '\|'
                    $optimized += "- $($parts[0]): $($parts[1])"
                }
                $currentList = @()
            }
            $inList = $false
            $optimized += $line
        }
    }
    
    # Handle any remaining list items
    if ($currentList.Count -gt 2) {
        $compressed = ($currentList -join ', ') -replace '\|', ':'
        $optimized += "**COMPRESSED**: $compressed"
    } elseif ($currentList.Count -gt 0) {
        foreach ($item in $currentList) {
            $parts = $item -split '\|'
            $optimized += "- $($parts[0]): $($parts[1])"
        }
    }
    
    return $optimized
}

function Compress-CodeBlocks {
    param([string[]]$Lines)
    
    $optimized = @()
    $inCodeBlock = $false
    $codeBlockLines = @()
    $blockType = ""
    
    foreach ($line in $Lines) {
        if ($line -match '^``````(.*)$') {
            if (-not $inCodeBlock) {
                # Start of code block
                $inCodeBlock = $true
                $blockType = $matches[1]
                $codeBlockLines = @($line)
            } else {
                # End of code block
                $codeBlockLines += $line
                
                # Compress if block is too long
                if ($codeBlockLines.Count -gt 10) {
                    $optimized += "``````$blockType"
                    $optimized += "# Code block compressed - see external documentation"
                    $optimized += "# Original had $($codeBlockLines.Count - 2) lines"
                    $optimized += "``````"
                } else {
                    $optimized += $codeBlockLines
                }
                
                $inCodeBlock = $false
                $codeBlockLines = @()
                $blockType = ""
            }
        } elseif ($inCodeBlock) {
            $codeBlockLines += $line
        } else {
            $optimized += $line
        }
    }
    
    # Handle unclosed code block
    if ($inCodeBlock) {
        $optimized += $codeBlockLines
    }
    
    return $optimized
}

function Remove-RedundantSections {
    param([string[]]$Lines)
    
    $optimized = @()
    $seenBehavioralGuidelines = $false
    $behavioralKeywords = @('sycoph', 'condescend', 'never act', 'always check', 'avoid agree')
    
    foreach ($line in $Lines) {
        $isBehavioral = $false
        
        foreach ($keyword in $behavioralKeywords) {
            if ($line -match $keyword) {
                $isBehavioral = $true
                break
            }
        }
        
        if ($isBehavioral) {
            if (-not $seenBehavioralGuidelines) {
                $optimized += $line
                $seenBehavioralGuidelines = $true
            }
            # Skip subsequent behavioral guidelines
        } else {
            $optimized += $line
        }
    }
    
    return $optimized
}

function Optimize-VersionNumbers {
    param([string[]]$Lines)
    
    # Simply replace version numbers with generic patterns
    $optimized = @()
    foreach ($line in $Lines) {
        $optimized += ($line -replace '\b\d+\.\d+(\.\d+)?\b', 'X.Y')
    }
    
    return $optimized
}

function Compress-FilePaths {
    param([string[]]$Lines)
    
    $optimized = @()
    
    foreach ($line in $Lines) {
        # Replace long file path examples with patterns
        $processed = $line -replace 'src/main/java/com/[^/]+/[^/]+/[^/]+/', 'src/main/java/{package}/'
        $processed = $processed -replace 'ProjectRoot/plugins/[^/]+/', 'ProjectRoot/plugins/{plugin}/'
        $processed = $processed -replace 'UI-Testing/src/test/resources/features/[^/]+/', 'UI-Testing/src/test/resources/features/{domain}/'
        
        $optimized += $processed
    }
    
    return $optimized
}

function Apply-AggressiveOptimization {
    param([string[]]$Lines)
    
    $optimized = @()
    $skipNextEmpty = $false
    
    foreach ($line in $Lines) {
        # Remove example sections if aggressive
        if ($line -match '^#+ Examples?$|^#+ Sample') {
            # Skip example sections
            continue
        }
        
        # Compress verbose explanations
        if ($line -match '^(.+):\s*$' -and $line.Length -gt 50) {
            $ellipsis = '...'
            $optimized += $line.Substring(0, 50) + $ellipsis
            continue
        }
        
        # Remove excessive empty lines
        if ($line.Trim() -eq '' -and $skipNextEmpty) {
            continue
        }
        
        $skipNextEmpty = $line.Trim() -eq ''
        $optimized += $line
    }
    
    return $optimized
}

function Invoke-ContextOptimization {
    param([string]$FilePath)
    
    # Use context module for file validation and reading
    $lines = Get-ContextFileContent -Path $FilePath
    
    Write-InfoMessage "🔧 Optimizing context for: $FilePath"
    
    $originalLineCount = $lines.Count
    $currentLines = $lines
    
    Write-InfoMessage "📊 Original: $originalLineCount lines"
    
    # Apply optimization techniques in order
    Write-InfoMessage "🔄 Compressing bullet lists..."
    $currentLines = Compress-BulletLists -Lines $currentLines
    $listOptimizedCount = $currentLines.Count
    
    Write-InfoMessage "🔄 Optimizing code blocks..."
    $currentLines = Compress-CodeBlocks -Lines $currentLines
    $codeOptimizedCount = $currentLines.Count
    
    Write-InfoMessage "🔄 Removing redundant sections..."
    $currentLines = Remove-RedundantSections -Lines $currentLines
    $redundancyOptimizedCount = $currentLines.Count
    
    Write-InfoMessage "🔄 Optimizing version numbers..."
    $currentLines = Optimize-VersionNumbers -Lines $currentLines
    $versionOptimizedCount = $currentLines.Count
    
    Write-InfoMessage "🔄 Compressing file paths..."
    $currentLines = Compress-FilePaths -Lines $currentLines
    $pathOptimizedCount = $currentLines.Count
    
    # Apply aggressive optimization if needed or requested
    if ($Aggressive -or $currentLines.Count -gt $TargetLines) {
        Write-InfoMessage "🔄 Applying aggressive optimization..."
        $currentLines = Apply-AggressiveOptimization -Lines $currentLines
    }
    
    $finalLineCount = $currentLines.Count
    $totalReduction = $originalLineCount - $finalLineCount
    $reductionPercent = [Math]::Round(($totalReduction / $originalLineCount) * 100, 1)
    
    # Report optimization results
    Write-Host ""
    Write-Host "📈 OPTIMIZATION RESULTS" -ForegroundColor White
    Write-Host "─" * 40
    Write-Host "Original Lines: $originalLineCount"
    Write-Host "After List Compression: $listOptimizedCount (-$($originalLineCount - $listOptimizedCount))"
    Write-Host "After Code Block Opt: $codeOptimizedCount (-$($listOptimizedCount - $codeOptimizedCount))"
    Write-Host "After Redundancy Removal: $redundancyOptimizedCount (-$($codeOptimizedCount - $redundancyOptimizedCount))"
    Write-Host "After Version Opt: $versionOptimizedCount (-$($redundancyOptimizedCount - $versionOptimizedCount))"
    Write-Host "After Path Compression: $pathOptimizedCount (-$($versionOptimizedCount - $pathOptimizedCount))"
    Write-Host "Final Lines: $finalLineCount"
    Write-Host ""
    Write-Host "Total Reduction: $totalReduction lines ($reductionPercent%)" -NoNewline
    
    if ($finalLineCount -le $TargetLines) {
        Write-SuccessMessage " ✓ Within budget"
    } else {
        Write-WarningMessage " ! Still over budget by $($finalLineCount - $TargetLines) lines"
    }
    
    # Save optimized content
    if (-not $DryRun) {
        $backupPath = $FilePath + ".backup"
        Copy-Item $FilePath $backupPath
        Write-InfoMessage "📋 Created backup: $backupPath"
        
        $currentLines | Out-File -FilePath $FilePath -Encoding UTF8
        Write-SuccessMessage "✓ Optimized file saved: $FilePath"
        
        # Run context budget validator if available
        $validatorPath = "$PSScriptRoot\utilities\context_budget_validator.ps1"
        if (Test-Path $validatorPath) {
            Write-InfoMessage "🔍 Running context budget validation..."
            try {
                & $validatorPath -FilePath $FilePath
            } catch {
                Write-WarningMessage "Context validation failed: $($_.Exception.Message)"
            }
        }
    } else {
        Write-InfoMessage "🔍 Dry run - no changes made"
        Write-InfoMessage "Use without -DryRun to apply optimizations"
    }
    
    return $finalLineCount -le $TargetLines
}

# Execute optimization
try {
    $success = Invoke-ContextOptimization -FilePath $FilePath
    
    if ($success) {
        Write-SuccessMessage "✓ Context optimization completed successfully"
        exit 0
    } else {
        Write-WarningMessage "⚠️ Context budget still exceeded after optimization"
        Write-WarningMessage "Consider manual review or using external reference files"
        exit 1
    }
}
catch {
    Write-Host "[ERROR] Context optimization failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}