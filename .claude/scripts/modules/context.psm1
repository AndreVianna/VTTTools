#requires -version 5.1

# Context Management Module for CLAUDE.md Processing
# Provides shared functionality for context analysis and optimization

# Logger functions will be imported by the calling script

#region File Validation Functions

function Test-ContextFile {
    <#
    .SYNOPSIS
    Validates that a CLAUDE.md file exists and is accessible.
    
    .PARAMETER Path
    The path to the CLAUDE.md file to validate
    
    .OUTPUTS
    Returns $true if valid, exits with error if invalid
    #>
    param([string]$Path)
    
    if (-not (Test-Path $Path)) {
        Write-ErrorMessage "File not found: $Path"
        exit 1
    }
    
    if (-not $Path.EndsWith('.md')) {
        Write-WarningMessage "File does not appear to be a markdown file: $Path"
    }
    
    return $true
}

function Get-ContextFileContent {
    <#
    .SYNOPSIS
    Safely reads the content of a CLAUDE.md file.
    
    .PARAMETER Path
    The path to the file to read
    
    .OUTPUTS
    Returns array of file lines
    #>
    param([string]$Path)
    
    Test-ContextFile -Path $Path
    
    try {
        return Get-Content $Path -ErrorAction Stop
    }
    catch {
        Write-ErrorMessage "Failed to read file: $($_.Exception.Message)"
        exit 1
    }
}

#endregion

#region Section Analysis Functions

function Get-SectionAnalysis {
    <#
    .SYNOPSIS
    Analyzes CLAUDE.md sections and their priorities.
    
    .PARAMETER Lines
    Array of file lines to analyze
    
    .OUTPUTS
    Returns hashtable of section analysis data
    #>
    param([string[]]$Lines)
    
    $sections = @{}
    $currentSection = "HEADER"
    $currentPriority = "UNKNOWN"
    
    foreach ($line in $Lines) {
        # Detect priority markers
        if ($line -match '## \[PRIORITY:(HIGH|MEDIUM|LOW)\]') {
            $currentPriority = $matches[1]
            $currentSection = "$currentPriority"
        }
        # Detect regular sections  
        elseif ($line -match '^## (.+)$') {
            $currentSection = $matches[1] -replace '\[.*?\]', ''
        }
        
        # Count lines for current section
        if (-not $sections.ContainsKey($currentSection)) {
            $sections[$currentSection] = @{
                Lines = 0
                Priority = $currentPriority
                Content = @()
            }
        }
        
        if ($line.Trim() -ne '') {
            $sections[$currentSection].Lines++
            $sections[$currentSection].Content += $line
        }
    }
    
    return $sections
}

function Get-PriorityMetrics {
    <#
    .SYNOPSIS
    Calculates priority-based metrics for context budget analysis.
    
    .PARAMETER Sections
    Section analysis data from Get-SectionAnalysis
    
    .PARAMETER MaxLines
    Maximum allowed lines for budget calculation
    
    .OUTPUTS
    Returns hashtable with priority metrics
    #>
    param(
        [hashtable]$Sections,
        [int]$MaxLines = 200
    )
    
    $highPriorityLines = 0
    $mediumPriorityLines = 0  
    $lowPriorityLines = 0
    
    foreach ($section in $Sections.Keys) {
        $sectionData = $Sections[$section]
        
        switch ($sectionData.Priority) {
            "HIGH" { $highPriorityLines += $sectionData.Lines }
            "MEDIUM" { $mediumPriorityLines += $sectionData.Lines }
            "LOW" { $lowPriorityLines += $sectionData.Lines }
        }
    }
    
    # Priority budget targets
    $highTarget = $MaxLines * 0.6    # 60% for high priority
    $mediumTarget = $MaxLines * 0.3  # 30% for medium priority
    $lowTarget = $MaxLines * 0.1     # 10% for low priority
    
    return @{
        HighPriorityLines = $highPriorityLines
        MediumPriorityLines = $mediumPriorityLines
        LowPriorityLines = $lowPriorityLines
        HighTarget = $highTarget
        MediumTarget = $mediumTarget
        LowTarget = $lowTarget
        HighBudgetOk = $highPriorityLines -le $highTarget
        MediumBudgetOk = $mediumPriorityLines -le $mediumTarget
        LowBudgetOk = $lowPriorityLines -le $lowTarget
    }
}

#endregion

#region Information Analysis Functions

function Get-InformationDensity {
    <#
    .SYNOPSIS
    Analyzes information density of content lines.
    
    .PARAMETER Lines
    Array of lines to analyze
    
    .OUTPUTS
    Returns average information density score
    #>
    param([string[]]$Lines)
    
    $totalInfo = 0
    $nonEmptyLines = 0
    
    foreach ($line in $Lines) {
        if ($line.Trim() -ne '' -and -not $line.StartsWith('#')) {
            $nonEmptyLines++
            
            # Count information indicators
            $infoCount = 0
            $infoCount += ($line -split '\|').Count - 1  # Pipe-separated data
            $infoCount += ($line -split ':').Count - 1   # Key-value pairs
            $infoCount += ($line -split ',').Count - 1   # Comma-separated lists
            # Template variables
            if ($line -match '\{.*?\}') {
                $infoCount += 1
            }
            
            # Minimum 1 piece of info per non-empty line
            $totalInfo += [Math]::Max(1, $infoCount)
        }
    }
    
    if ($nonEmptyLines -gt 0) {
        return [Math]::Round($totalInfo / $nonEmptyLines, 2)
    } else {
        return 0
    }
}

function Get-TemplateVariableAnalysis {
    <#
    .SYNOPSIS
    Analyzes template variable usage and opportunities.
    
    .PARAMETER Lines
    Array of lines to analyze
    
    .OUTPUTS
    Returns hashtable with template analysis data
    #>
    param([string[]]$Lines)
    
    $variables = @()
    $missingTemplates = @()
    
    foreach ($line in $Lines) {
        # Find existing template variables
        $matchResults = [regex]::Matches($line, '\{([^}]+)\}')
        foreach ($match in $matchResults) {
            $variables += $match.Groups[1].Value
        }
        
        # Detect opportunities for template variables
        if ($line -match '^(mvn|npm|gradle|make|cmake|docker)') {
            $missingTemplates += "Line could use {BUILD_COMMAND} template: $($line.Substring(0, [Math]::Min(50, $line.Length)))"
        }
    }
    
    # Ensure we have arrays even if empty
    $uniqueVariables = if ($variables.Count -gt 0) { 
        $variables | Sort-Object | Get-Unique 
    } else { 
        @() 
    }
    
    return @{
        ExistingVariables = $uniqueVariables
        MissingOpportunities = $missingTemplates
    }
}

#endregion

#region Compression Analysis Functions

function Test-CompressionOpportunities {
    <#
    .SYNOPSIS
    Identifies opportunities for content compression and optimization.
    
    .PARAMETER Lines
    Array of lines to analyze
    
    .OUTPUTS
    Returns array of optimization opportunities
    #>
    param([string[]]$Lines)
    
    $opportunities = @()
    
    # Check for verbose patterns
    $verbosePatterns = @(
        @{ Pattern = '^- .+: .+$'; Issue = "Bullet lists could be compressed to pipe format" }
        @{ Pattern = '^```.*?```'; Issue = "Code blocks consume significant context" }
        @{ Pattern = '^\s*#.*tree.*structure'; Issue = "ASCII diagrams could be referenced externally" }
        @{ Pattern = 'sycoph|condescend|agree'; Issue = "Repeated behavioral instructions detected" }
    )
    
    for ($i = 0; $i -lt $Lines.Count; $i++) {
        $line = $Lines[$i]
        foreach ($pattern in $verbosePatterns) {
            if ($line -match $pattern.Pattern) {
                $opportunities += @{
                    Line = $i + 1
                    Content = $line.Substring(0, [Math]::Min(50, $line.Length))
                    Issue = $pattern.Issue
                }
            }
        }
    }
    
    return $opportunities
}

function Get-ContextScore {
    <#
    .SYNOPSIS
    Calculates overall context optimization score.
    
    .PARAMETER TotalLines
    Total number of lines in the file
    
    .PARAMETER MaxLines
    Maximum allowed lines
    
    .PARAMETER PriorityMetrics
    Priority analysis from Get-PriorityMetrics
    
    .PARAMETER Density
    Information density from Get-InformationDensity
    
    .PARAMETER Opportunities
    Compression opportunities from Test-CompressionOpportunities
    
    .PARAMETER TemplateAnalysis
    Template analysis from Get-TemplateVariableAnalysis
    
    .OUTPUTS
    Returns context optimization score (0-100)
    #>
    param(
        [int]$TotalLines,
        [int]$MaxLines,
        [hashtable]$PriorityMetrics,
        [double]$Density,
        [array]$Opportunities,
        [hashtable]$TemplateAnalysis
    )
    
    $score = 100
    
    # Deduct points for various issues
    if ($TotalLines -gt $MaxLines) { $score -= 30 }
    if (-not $PriorityMetrics.HighBudgetOk) { $score -= 20 }
    if ($Density -lt 2) { $score -= 20 }
    if ($Opportunities.Count -gt 5) { $score -= 15 }
    if ($TemplateAnalysis.ExistingVariables.Count -eq 0) { $score -= 15 }
    
    return [Math]::Max(0, $score)
}

#endregion

#region Content Processing Functions

function Get-BasicMetrics {
    <#
    .SYNOPSIS
    Calculates basic file metrics for context analysis.
    
    .PARAMETER Lines
    Array of file lines
    
    .PARAMETER MaxLines
    Maximum allowed lines for budget calculation
    
    .OUTPUTS
    Returns hashtable with basic metrics
    #>
    param(
        [string[]]$Lines,
        [int]$MaxLines = 200
    )
    
    $totalLines = ($Lines | Where-Object { $_.Trim() -ne '' }).Count
    $budgetPercent = [Math]::Round(($totalLines / $MaxLines) * 100, 1)
    $isOverBudget = $totalLines -gt $MaxLines
    $overBudgetBy = if ($isOverBudget) { $totalLines - $MaxLines } else { 0 }
    
    return @{
        TotalLines = $totalLines
        MaxLines = $MaxLines
        BudgetPercent = $budgetPercent
        IsOverBudget = $isOverBudget
        OverBudgetBy = $overBudgetBy
    }
}

#endregion

# Export all public functions
Export-ModuleMember -Function @(
    'Test-ContextFile',
    'Get-ContextFileContent', 
    'Get-SectionAnalysis',
    'Get-PriorityMetrics',
    'Get-InformationDensity',
    'Get-TemplateVariableAnalysis',
    'Test-CompressionOpportunities',
    'Get-ContextScore',
    'Get-BasicMetrics'
)