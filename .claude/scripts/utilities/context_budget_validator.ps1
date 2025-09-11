# Context Budget Validator for AI-Optimized CLAUDE.md
# Analyzes CLAUDE.md files for context efficiency and budget compliance

param(
    [Parameter(Mandatory=$true)]
    [string]$FilePath,
    
    [Parameter(Mandatory=$false)]
    [int]$MaxLines = 200,
    
    [Parameter(Mandatory=$false)]
    [switch]$Detailed
)

# Set strict mode for better error detection
Set-StrictMode -Version Latest

# Import modules for consistent messaging and context processing
Import-Module (Join-Path $PSScriptRoot "modules\logger.psm1") -Force
Import-Module (Join-Path $PSScriptRoot "modules\context.psm1") -Force

# Note: Validation and analysis functions are now provided by the context.psm1 module

# Main validation logic
function Invoke-ContextValidation {
    param([string]$FilePath)
    
    # Use context module functions for file validation and content reading
    $lines = Get-ContextFileContent -Path $FilePath
    
    Write-InfoMessage "🔍 Analyzing context budget for: $FilePath"
    Write-Host ""
    
    # Get basic metrics using context module
    $basicMetrics = Get-BasicMetrics -Lines $lines -MaxLines $MaxLines
    $totalLines = $basicMetrics.TotalLines
    
    # Basic metrics
    Write-Host "📊 BASIC METRICS" -ForegroundColor White
    Write-Host "─" * 40
    Write-Host "Total Lines: $totalLines / $MaxLines" -NoNewline
    if ($totalLines -le $MaxLines) { 
        Write-SuccessMessage " ✓" 
    } else { 
        Write-ErrorMessage " ✗ OVER BUDGET by $($totalLines - $MaxLines) lines" 
    }
    
    $budgetPercent = [Math]::Round(($totalLines / $MaxLines) * 100, 1)
    Write-Host "Budget Usage: $budgetPercent%"
    
    # Section analysis using context module
    $sections = Get-SectionAnalysis -Lines $lines
    Write-Host ""
    Write-Host "📋 SECTION ANALYSIS" -ForegroundColor White
    Write-Host "─" * 40
    
    # Display section breakdown
    foreach ($section in $sections.Keys) {
        $sectionData = $sections[$section]
        $percentage = [Math]::Round(($sectionData.Lines / $totalLines) * 100, 1)
        
        Write-Host "$($section): $($sectionData.Lines) lines ($percentage%)" -NoNewline
        
        switch ($sectionData.Priority) {
            "HIGH" { Write-Host " [HIGH]" -ForegroundColor Red }
            "MEDIUM" { Write-Host " [MEDIUM]" -ForegroundColor Yellow }
            "LOW" { Write-Host " [LOW]" -ForegroundColor Green }
            default { Write-Host " [UNMARKED]" -ForegroundColor Gray }
        }
    }
    
    # Priority budget analysis using context module
    $priorityMetrics = Get-PriorityMetrics -Sections $sections -MaxLines $MaxLines
    
    Write-Host ""
    Write-Host "🎯 PRIORITY BUDGET ANALYSIS" -ForegroundColor White
    Write-Host "─" * 40
    Write-Host "High Priority: $($priorityMetrics.HighPriorityLines) / $($priorityMetrics.HighTarget) lines" -NoNewline
    if ($priorityMetrics.HighBudgetOk) { 
        Write-SuccessMessage " ✓" 
    } else { 
        Write-WarningMessage " ! Over budget" 
    }
    
    Write-Host "Medium Priority: $($priorityMetrics.MediumPriorityLines) / $($priorityMetrics.MediumTarget) lines" -NoNewline  
    if ($priorityMetrics.MediumBudgetOk) { 
        Write-SuccessMessage " ✓" 
    } else { 
        Write-WarningMessage " ! Over budget" 
    }
    
    Write-Host "Low Priority: $($priorityMetrics.LowPriorityLines) / $($priorityMetrics.LowTarget) lines" -NoNewline
    if ($priorityMetrics.LowBudgetOk) { 
        Write-SuccessMessage " ✓" 
    } else { 
        Write-WarningMessage " ! Over budget" 
    }
    
    # Information density analysis using context module
    $density = Get-InformationDensity -Lines $lines
    Write-Host ""
    Write-Host "🧬 INFORMATION DENSITY" -ForegroundColor White
    Write-Host "─" * 40
    Write-Host "Average Info/Line: $density" -NoNewline
    if ($density -ge 3) { 
        Write-SuccessMessage " ✓ Excellent" 
    } elseif ($density -ge 2) { 
        Write-SuccessMessage " ✓ Good" 
    } else { 
        Write-WarningMessage " ! Could be improved" 
    }
    
    # Template variable analysis using context module
    $templateAnalysis = Get-TemplateVariableAnalysis -Lines $lines
    Write-Host ""
    Write-Host "🔧 TEMPLATE OPTIMIZATION" -ForegroundColor White
    Write-Host "─" * 40
    $variableCount = if ($templateAnalysis.ExistingVariables) { $templateAnalysis.ExistingVariables.Count } else { 0 }
    Write-Host "Template Variables Found: $variableCount"
    if ($variableCount -gt 0) {
        Write-Host "Variables: $($templateAnalysis.ExistingVariables -join ', ')" -ForegroundColor Cyan
    }
    
    # Compression opportunities using context module
    $opportunities = Test-CompressionOpportunities -Lines $lines
    if ($opportunities.Count -gt 0) {
        Write-Host ""
        Write-Host "💡 COMPRESSION OPPORTUNITIES" -ForegroundColor White
        Write-Host "─" * 40
        foreach ($opp in $opportunities[0..4]) {  # Show first 5
            Write-WarningMessage "Line $($opp.Line): $($opp.Issue)"
            if ($Detailed) {
                Write-Host "   Content: $($opp.Content)..." -ForegroundColor Gray
            }
        }
        if ($opportunities.Count -gt 5) {
            Write-Host "   ... and $($opportunities.Count - 5) more opportunities"
        }
    }
    
    # Overall score
    Write-Host ""
    Write-Host "🏆 OVERALL ASSESSMENT" -ForegroundColor White  
    Write-Host "─" * 40
    
    # Calculate overall score using context module
    $score = Get-ContextScore -TotalLines $totalLines -MaxLines $MaxLines -PriorityMetrics $priorityMetrics -Density $density -Opportunities $opportunities -TemplateAnalysis $templateAnalysis
    
    Write-Host "Context Optimization Score: $score/100" -NoNewline
    if ($score -ge 90) { 
        Write-SuccessMessage " ✓ Excellent" 
    } elseif ($score -ge 70) { 
        Write-SuccessMessage " ✓ Good" 
    } elseif ($score -ge 50) { 
        Write-WarningMessage " ! Needs improvement" 
    } else { 
        Write-ErrorMessage " ✗ Poor - Requires optimization" 
    }
    
    return $score
}

# Execute validation
try {
    $score = Invoke-ContextValidation -FilePath $FilePath
    if ($score -ge 70) { exit 0 } else { exit 1 }
}
catch {
    Write-Host "[ERROR] Validation failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}