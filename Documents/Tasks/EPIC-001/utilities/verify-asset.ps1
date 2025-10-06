$response = Invoke-WebRequest -Uri 'http://localhost:5173/api/assets' -Headers @{'x-user' = 'AIQOVZvi1EGnFkRmVUQAAA'} -UseBasicParsing
$assets = $response.Content | ConvertFrom-Json
$assets[0] | ConvertTo-Json -Depth 5
