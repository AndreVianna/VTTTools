param(
    [Parameter(Mandatory = $true)]
    [string]$SessionId,

    [Parameter(Mandatory = $true)]
    [string]$Operation,

    [Parameter(Mandatory = $true)]
    [string]$Details
)

$logsDir = Join-Path $PSScriptRoot '..' '..' 'logs'
if (-not (Test-Path $logsDir)) {
    New-Item -ItemType Directory -Path $logsDir -Force | Out-Null
}

$shortSessionId = $SessionId.Substring(0, 8)
$dateStamp = Get-Date -Format 'yyyyMMdd'
$fileExists = Get-ChildItem -Path $logsDir -Filter "$dateStamp-*-$shortSessionId.log" -ErrorAction SilentlyContinue
$sameDateFiles = Get-ChildItem -Path $logsDir -Filter "$dateStamp-*.log" -ErrorAction SilentlyContinue
$sequenceNumber = 1

if (-not $fileExists -and $sameDateFiles) {
    $sequences = @()
    foreach ($file in $sameDateFiles) {
        if ($file.Name -match "$dateStamp-(\d+)-.*") {
            $sequences += [int]$matches[1]
        }
    }

    if ($sequences.Count -gt 0) {
        $sequenceNumber = [int](($sequences | Measure-Object -Maximum).Maximum + 1)
    }
}

if ($fileExists) {
    $sequenceNumber = [int]$fileExists.Name.Split('-')[1]
}

$sequenceString = '{0:D3}' -f $sequenceNumber
$sessionLogFile = Join-Path $logsDir "$dateStamp-$sequenceString-$shortSessionId.log"

$timeStamp = Get-Date -Format 'HH:mm:ss'
$logEntry = "$timeStamp [$Operation] $Details"

Add-Content -Path $sessionLogFile -Value $logEntry -Encoding UTF8
exit 0