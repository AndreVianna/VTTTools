# PowerShell script to mimic powerlevel10k_modern theme for Claude Code status line
# Simple and reliable version focused on compatibility
param()

# Set strict mode for better error detection
Set-StrictMode -Version Latest

# Function to safely get environment variable with validation
function Get-SafeEnvironmentVariable {
    param([string]$VariableName)
    
    try {
        $value = [System.Environment]::GetEnvironmentVariable($VariableName)
        if ([string]::IsNullOrEmpty($value)) {
            return ""
        }
        return $value
    }
    catch {
        return ""
    }
}

# Function to safely execute git commands
function Get-GitInformation {
    param([string]$WorkingDirectory)
    
    $gitInfo = @{
        IsRepository = $false
        Branch = ""
    }
    
    try {
        Push-Location -Path $WorkingDirectory -ErrorAction Stop
        
        $gitCommand = Get-Command -Name "git" -ErrorAction SilentlyContinue
        if (-not $gitCommand) {
            return $gitInfo
        }
        
        $gitCheck = & git rev-parse --is-inside-work-tree 2>$null
        if ($LASTEXITCODE -eq 0) {
            $gitInfo.IsRepository = $true
            $branch = & git branch --show-current 2>$null
            if ($LASTEXITCODE -eq 0 -and $branch) {
                $gitInfo.Branch = $branch.Trim()
            }
        }
    }
    catch {
        # Ignore git errors
    }
    finally {
        try {
            Pop-Location -ErrorAction SilentlyContinue
        }
        catch {
            # Ignore location restore errors
        }
    }
    
    return $gitInfo
}

# Main script execution
try {
    # Get current directory
    $currentDir = $PWD.Path
    
    # Get home directory and create display path
    $homePath = Get-SafeEnvironmentVariable -VariableName "USERPROFILE"
    $displayDir = $currentDir
    
    if ($homePath -and $currentDir.StartsWith($homePath, [System.StringComparison]::OrdinalIgnoreCase)) {
        $displayDir = $currentDir.Replace($homePath, "~")
    }
    
    # Convert path separators
    $displayDir = $displayDir.Replace('\', '/')
    
    # Get git information
    $gitInfo = Get-GitInformation -WorkingDirectory $currentDir
    
    # Get system information
    $username = Get-SafeEnvironmentVariable -VariableName "USERNAME"
    $hostname = Get-SafeEnvironmentVariable -VariableName "COMPUTERNAME"
    
    # Provide fallbacks
    if ([string]::IsNullOrEmpty($username)) {
        $username = "user"
    }
    if ([string]::IsNullOrEmpty($hostname)) {
        $hostname = "localhost"
    }
    
    # Force enable ANSI/VT100 mode for color support
    $esc = [char]27
    
    # Build status line with ANSI escape sequences, initialize it by resetting the previous state
    $statusLine = "$esc[0m"
    # Directory segment (Dark Gray background, White text)
    $statusLine += "$esc[100m$esc[97m $displayDir "
    # Git branch segment (Green background, Black text)
    if ($gitInfo.IsRepository -and $gitInfo.Branch) {
        $statusLine += "$esc[42m$esc[30m  $($gitInfo.Branch) "
    }
    # 	Reset previous state
    $statusLine += "$esc[0m"
    
    # Output the status line
    Write-Output $statusLine
}
catch {
    # Simple fallback
    $fallbackTime = [System.DateTime]::Now.ToString("HH:mm")
    $fallbackUser = [System.Environment]::UserName
    $fallbackHost = [System.Environment]::MachineName
    $fallbackDir = Split-Path -Leaf $PWD.Path
    
    Write-Host "$fallbackUser@$fallbackHost $fallbackDir $fallbackTime"
}