#requires -version 5.1

function Write-InfoMessage {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

function Write-SuccessMessage {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-ErrorMessage {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Write-WarningMessage {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Message {
    param([string]$Message)
    try {
        $color = 'White'
        if ($Message -like '`[INFO`]*') {
            $color = 'Cyan'
        }
        elseif ($Message -like '`[SUCCESS`]*') {
            $color = 'Green'
        }
        elseif ($Message -like '`[ERROR`]*') {
            $color = 'Red'
        }
        elseif ($Message -like '`[WARNING`]*' ) {
            $color = 'Yellow'
        }
        Write-Host $Message -ForegroundColor $color
    }
    catch {
        Write-Output $Message
    }
}

# Export only the safe logging functions
Export-ModuleMember -Function Write-Message, Write-InfoMessage, Write-SuccessMessage, Write-ErrorMessage, Write-WarningMessage