Write-Host "------------------ HIFPB SCRAPER ------------------"
$curDir = Get-Location
$filePath = "$curDir\dist\index.js"
node $filePath
pause