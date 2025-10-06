param(
    [switch]$Notify
)
$jsonInput = ''
try {
    if (-not [Console]::IsInputRedirected) {
        exit 0
    }
    $readTask = [Console]::In.ReadToEndAsync()
    if ($readTask.IsCompleted -or $readTask.Wait(500)) {
        $jsonInput = $readTask.Result
    }
    if ([string]::IsNullOrWhiteSpace($jsonInput)) {
        exit 0
    }

}
catch {
    exit 0
}

$data = $jsonInput | ConvertFrom-Json
$message = $data.message
$sessionId = $data.session_id


$detailsObj = @{
    message = $message
}
$details = $detailsObj | ConvertTo-Json -Compress
& "$PSScriptRoot\send_event.ps1" -SessionId $sessionId -Operation "Notification" -Details $details

if ($Notify) {
    if ($PSVersionTable.Platform -eq 'Win32NT' -or $null -eq $PSVersionTable.Platform) {
        Add-Type -AssemblyName System.Windows.Forms
        $notification = New-Object System.Windows.Forms.NotifyIcon
        $notification.Icon = [System.Drawing.SystemIcons]::Information
        $notification.BalloonTipTitle = "Claude Code"
        $notification.BalloonTipText = $message
        $notification.Visible = $true
        $notification.ShowBalloonTip(5000)
    }
    elseif ($PSVersionTable.Platform -eq 'Unix' -and (Get-Command osascript -ErrorAction SilentlyContinue)) {
        & osascript -e "display notification `"$message`" with title `"Claude Code`" sound name `"Glass`""
    }
    elseif (Get-Command notify-send -ErrorAction SilentlyContinue) {
        & notify-send "Claude Code" $message
    }
}
exit 0