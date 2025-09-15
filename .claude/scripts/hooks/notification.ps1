# Claude Code Hooks - Notification
# Logs notifications and optionally sends system alerts

param(
    [switch]$Notify
)

# Read JSON input
$jsonInput = [Console]::In.ReadToEnd()
$data = $jsonInput | ConvertFrom-Json

$message = $data.message
$sessionId = $data.session_id

# Log notification using shared utility
$detailsObj = @{
    message = $message
}
$details = $detailsObj | ConvertTo-Json -Compress
& "$PSScriptRoot\send_log.ps1" -SessionId $sessionId -Level "DEBUG" -Message "{`"Notification`": $jsonInput}"
& "$PSScriptRoot\send_event.ps1" -SessionId $sessionId -Operation "Notification" -Details $details

# Send system notification if flag is set
if ($Notify) {
    # Windows Toast Notification
    if ($PSVersionTable.Platform -eq 'Win32NT' -or $null -eq $PSVersionTable.Platform) {
        Add-Type -AssemblyName System.Windows.Forms
        $notification = New-Object System.Windows.Forms.NotifyIcon
        $notification.Icon = [System.Drawing.SystemIcons]::Information
        $notification.BalloonTipTitle = "Claude Code"
        $notification.BalloonTipText = $message
        $notification.Visible = $true
        $notification.ShowBalloonTip(5000)
    }
    # macOS notification
    elseif ($PSVersionTable.Platform -eq 'Unix' -and (Get-Command osascript -ErrorAction SilentlyContinue)) {
        & osascript -e "display notification `"$message`" with title `"Claude Code`" sound name `"Glass`""
    }
    # Linux notification
    elseif (Get-Command notify-send -ErrorAction SilentlyContinue) {
        & notify-send "Claude Code" $message
    }
}
exit 0