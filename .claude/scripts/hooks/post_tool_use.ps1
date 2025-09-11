# Claude Code Hooks - Post Tool Use  
# Simplified post-tool logging (optional)

param()

# Read JSON input
$jsonInput = [Console]::In.ReadToEnd()
$data = $jsonInput | ConvertFrom-Json

# Optional: Uncomment the lines below if you want to log tool completions
# $toolName = $data.tool_name
# $sessionId = $data.session_id
# $details = "completed successfully"
# & "$PSScriptRoot\send_event.ps1" -SessionId $sessionId -Operation "ToolComplete" -Details "tool: $toolName, status: success"

Write-Host "✓ Tool completed: $($data.tool_name)"
exit 0