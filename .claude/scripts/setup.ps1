# ============================================================================
# MAM Scripts Setup - Simplified Version
# Configures Claude Code API keys and MCP servers with fail-fast approach
# ============================================================================

# Parameters for variable substitution and verbose mode
param()

# Detect verbose mode from PowerShell common parameters
$VerboseMode = $VerbosePreference -eq "Continue"

# Import safe logging module
Import-Module "$PSScriptRoot\modules\logger.psm1" -Force

# Get project root directory (from Windows\.claude\scripts\ to project root)
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

# Configuration files
$McpsFile = Join-Path $ProjectRoot ".claude\mcps.json"
$LocalMcpsFile = Join-Path $ProjectRoot ".claude\mcps.local.json"

function Expand-Variables {
    param([string]$Content)
    
    # Build variable dictionary with built-in and custom variables
    $variables = @{
        'PROJECT_ROOT' = $ProjectRoot
        'USER_HOME' = $env:USERPROFILE
        'CURRENT_DATETIME' = (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
    }
    
    # Replace all variables in format {VariableName}
    foreach ($var in $variables.Keys) {
        $pattern = [regex]::Escape("{$var}")
        $value = $variables[$var] -replace '\\', '\\'
        $Content = $Content -replace $pattern, $value
    }
    
    return $Content
}

function Main {
    if ($VerboseMode) { Write-InfoMessage "Starting setup..." }
    
    try {
        Test-Dependencies
        Initialize-MCPServers
        Update-StatusLineConfiguration
        
        Write-SuccessMessage "Setup completed successfully"
        exit 0
    }
    catch {
        Write-ErrorMessage "Setup failed: $($_.Exception.Message)"
        exit 1
    }
}

function Test-Dependencies {
    if ($VerboseMode) { Write-InfoMessage "Checking dependencies..." }
    
    # Check Claude CLI
    if (-not (Get-Command claude -ErrorAction SilentlyContinue)) {
        throw "Claude CLI not found. Please install Claude CLI first."
    }
    
    # Check tree command (standard on Windows)
    if (-not (Get-Command tree -ErrorAction SilentlyContinue)) {
        throw "Tree command not found. This is unusual for Windows - check PATH."
    }
    
    if ($VerboseMode) { Write-SuccessMessage "Dependencies verified" }
}

function Initialize-MCPServers {
    if ($VerboseMode) { Write-InfoMessage "Configuring MCP servers..." }
    
    # Configure project MCP servers
    if (Test-Path $McpsFile) {
        Add-MCPServersFromFile -ConfigFile $McpsFile -ConfigType "project"
        if ($VerboseMode) { Write-SuccessMessage "Project MCP servers configured" }
    } else {
        Write-WarningMessage "Project MCP config not found: $McpsFile"
    }
    
    # Configure local MCP servers  
    if (Test-Path $LocalMcpsFile) {
        Add-MCPServersFromFile -ConfigFile $LocalMcpsFile -ConfigType "local"
        if ($VerboseMode) { Write-SuccessMessage "Local MCP servers configured" }
    } else {
        if ($VerboseMode) { Write-InfoMessage "Local MCP config not found: $LocalMcpsFile (optional)" }
    }
}

function Update-StatusLineConfiguration {
    if ($VerboseMode) { Write-InfoMessage "Configuring status line..." }
    
    try {
        # Get absolute path to set_status_line.ps1
        $scriptPath = Join-Path $PSScriptRoot "utilities" "set_status_line.ps1"
        $absolutePath = Resolve-Path $scriptPath -ErrorAction Stop
        
        # Build command string with absolute path
        $command = "pwsh -ExecutionPolicy Bypass -File `"$absolutePath`""
        
        # Read, modify, and write settings.json
        $settingsPath = Join-Path $ProjectRoot ".claude\settings.json"
        if (-not (Test-Path $settingsPath)) {
            throw "Settings file not found: $settingsPath"
        }
        
        $settings = Get-Content $settingsPath -Raw | ConvertFrom-Json
        $settings.statusLine = @{
            type = "command"
            command = $command
        }
        
        $settings | ConvertTo-Json -Depth 10 | Set-Content $settingsPath
        
        if ($VerboseMode) { Write-SuccessMessage "Status line configured with: $command" }
    }
    catch {
        throw "Failed to update status line configuration: $($_.Exception.Message)"
    }
}

function Add-MCPServersFromFile {
    param([string]$ConfigFile, [string]$ConfigType)
    
    try {
        $json = Get-Content $ConfigFile -Raw | ConvertFrom-Json
        $serverNames = $json.PSObject.Properties.Name
        
        foreach ($serverName in $serverNames) {
            if ([string]::IsNullOrWhiteSpace($serverName)) { continue }
            
            if ($VerboseMode) { Write-InfoMessage "Configuring $ConfigType server: $serverName" }
            Add-MCPServer -ServerName $serverName -ConfigFile $ConfigFile
        }
    }
    catch {
        throw "Failed to parse MCP config file '$ConfigFile': $($_.Exception.Message)"
    }
}

function Add-MCPServer {
    param([string]$ServerName, [string]$ConfigFile)
    
    # Remove existing server if present
    try {
        claude mcp remove $ServerName 2>&1 | Out-Null
    } catch { }
    
    # Extract and process server configuration
    try {
        $jsonContent = Get-Content $ConfigFile -Raw
        
        # Apply variable substitution
        $jsonContent = Expand-Variables -Content $jsonContent
        
        $json = $jsonContent | ConvertFrom-Json
        $serverConfig = $json.$ServerName | ConvertTo-Json -Compress -Depth 10
        
        # Add server using claude CLI
        claude mcp add-json $ServerName $serverConfig
        if ($LASTEXITCODE -ne 0) {
            throw "Claude MCP add-json failed for server '$ServerName'"
        }
        
        if ($VerboseMode) { Write-SuccessMessage "Added MCP server: $ServerName" }
    }
    catch {
        throw "Failed to add MCP server '$ServerName': $($_.Exception.Message)"
    }
}

# Execute main function
Main