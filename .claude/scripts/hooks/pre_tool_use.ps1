# Claude Code Hooks - Pre-Tool Use
# Security validation and tool call logging

param()

# Read JSON input
$jsonInput = [Console]::In.ReadToEnd()
$data = $jsonInput | ConvertFrom-Json

$toolName = $data.tool_name
$toolInput = $data.tool_input
$sessionId = $data.session_id

# Security checks - block dangerous commands
$dangerousPatterns = @(
    'rm\s+.*-[rf]',           # rm -rf variants
    'Remove-Item.*-Recurse',   # PowerShell recursive delete
    'del\s+/[sf]',            # Windows del with force/subdirs
    'format\s+[a-z]:',        # Format drive
    '>\s*/etc/',              # Writing to system directories
    '>\s*\$env:SystemRoot'    # Writing to Windows system
)

$blockedFiles = @(
    '.env',
    'secrets.json',
    'credentials.xml',
    '*.key',
    '*.pem',
    '.git/config'
)

# Check for dangerous commands
if ($toolName -eq "Bash" -or $toolName -eq "PowerShell") {
    $command = $toolInput.command
    
    foreach ($pattern in $dangerousPatterns) {
        if ($command -match $pattern) {
            # Log security block
            $blockDetailsObj = @{
                tool = $toolName
                reason = "dangerous pattern '$pattern' detected"
                command = $command
            }
            $blockDetails = $blockDetailsObj | ConvertTo-Json -Compress
            & "$PSScriptRoot\send_event.ps1" -SessionId $sessionId -Operation "SecurityBlock" -Details $blockDetails
            
            Write-Error "BLOCKED: Dangerous command pattern detected: $pattern"
            exit 2  # Exit code 2 blocks the tool execution
        }
    }
}

# Check for sensitive file access
if ($toolName -in @("Edit", "Write", "Read", "MultiEdit")) {
    $filePath = $toolInput.file_path
    
    foreach ($blocked in $blockedFiles) {
        if ($filePath -like $blocked) {
            # Log security block
            $blockDetailsObj = @{
                tool = $toolName
                reason = "access to sensitive file denied"
                file_path = $filePath
            }
            $blockDetails = $blockDetailsObj | ConvertTo-Json -Compress
            & "$PSScriptRoot\send_event.ps1" -SessionId $sessionId -Operation "SecurityBlock" -Details $blockDetails
            
            Write-Error "BLOCKED: Access to sensitive file denied: $filePath"
            exit 2
        }
    }
}

# Format tool arguments as compact JSON
$detailsObj = @{}

switch ($toolName) {
    "Read" { 
        $detailsObj.file_path = $toolInput.file_path
        if ($toolInput.offset) { $detailsObj.offset = $toolInput.offset }
        if ($toolInput.limit) { $detailsObj.limit = $toolInput.limit }
    }
    "Write" { 
        $detailsObj.file_path = $toolInput.file_path
        $detailsObj.content = if ($toolInput.content.Length -gt 100) { $toolInput.content.Substring(0, 100) + "..." } else { $toolInput.content }
    }
    "Edit" { 
        $detailsObj.file_path = $toolInput.file_path
        $detailsObj.old_string = if ($toolInput.old_string.Length -gt 50) { $toolInput.old_string.Substring(0, 50) + "..." } else { $toolInput.old_string }
        $detailsObj.new_string = if ($toolInput.new_string.Length -gt 50) { $toolInput.new_string.Substring(0, 50) + "..." } else { $toolInput.new_string }
        if ($toolInput.replace_all) { $detailsObj.replace_all = $toolInput.replace_all }
    }
    "MultiEdit" {
        $detailsObj.file_path = $toolInput.file_path
        $detailsObj.edits_count = $toolInput.edits.Count
    }
    "Bash" { 
        $detailsObj.command = $toolInput.command
        if ($toolInput.description) { $detailsObj.description = $toolInput.description }
    }
    "Glob" { 
        $detailsObj.pattern = $toolInput.pattern
        if ($toolInput.path) { $detailsObj.path = $toolInput.path }
    }
    "Grep" { 
        $detailsObj.pattern = $toolInput.pattern
        if ($toolInput.path) { $detailsObj.path = $toolInput.path }
        if ($toolInput.glob) { $detailsObj.glob = $toolInput.glob }
        if ($toolInput.output_mode) { $detailsObj.output_mode = $toolInput.output_mode }
    }
    "Task" { 
        $detailsObj.subagent_type = $toolInput.subagent_type
        $detailsObj.description = if ($toolInput.prompt.Length -gt 100) { $toolInput.prompt.Substring(0, 100) + "..." } else { $toolInput.prompt }
    }
    default { 
        # For other tools, use full input object
        $detailsObj = $toolInput
    }
}

# Convert to compact JSON
$details = $detailsObj | ConvertTo-Json -Compress

# Log the tool use
& "$PSScriptRoot\send_event.ps1" -SessionId $sessionId -Operation $toolName -Details $details

Write-Host "✓ Tool use validated: $toolName"
exit 0