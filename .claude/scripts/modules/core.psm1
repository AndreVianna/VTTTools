#requires -version 5.1

Import-Module "$PSScriptRoot\Logger.psm1" -Force

function Test-VPNConnectivity {
    [CmdletBinding()]
    param()
    
    try {
        # Hardcoded corporate hosts for simplicity
        $testHosts = @(
            "srvottodrepo01.rossvideo.com",
            "srvottdockreg02.rossvideo.com"
        )
        
        Write-InfoMessage "Testing corporate network connectivity..."
        
        foreach ($hostname in $testHosts) {
            $pingResult = Test-Connection -ComputerName $hostname -Count 1 -Quiet -ErrorAction SilentlyContinue
            if (-not $pingResult) {
                Write-WarningMessage "Corporate host $hostname not accessible"
                return $false
            }
        }
        
        Write-SuccessMessage "Corporate network connectivity confirmed"
        return $true
    }
    catch {
        Write-WarningMessage "VPN connectivity check failed: $($_.Exception.Message)"
        return $false
    }
}

Export-ModuleMember -Function Test-VPNConnectivity