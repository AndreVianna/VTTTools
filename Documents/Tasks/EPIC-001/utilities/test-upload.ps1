$resourceId = [Guid]::NewGuid().ToString()
$xUserHeader = "AIQOVZvi1EGnFkRmVUQAAA"
$svgFile = Get-Item "C:\Projects\Personal\VTTTools\Source\WebClientApp\public\assets\tokens\goblin.svg"

Write-Host "Testing resource upload..."
Write-Host "Resource ID: $resourceId"
Write-Host "File: $($svgFile.Name)"

try {
    $response = Invoke-WebRequest -Uri 'https://localhost:7174/api/resources' `
        -Method POST `
        -Headers @{'x-user' = $xUserHeader} `
        -Form @{
            id = $resourceId
            type = 'asset'
            resource = 'Test Goblin'
            file = $svgFile
        } `
        -SkipCertificateCheck `
        -UseBasicParsing

    Write-Host "✅ Success!" -ForegroundColor Green
    Write-Host "Status: $($response.StatusCode)"
    Write-Host "Response: $($response.Content)"
}
catch {
    Write-Host "❌ Failed!" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)"
    }
}
