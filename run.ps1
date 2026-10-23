$Host.UI.RawUI.WindowTitle = "Daily Document Generator"
$env:Path = "$env:USERPROFILE\nodejs;" + $env:Path
Set-Location -Path $PSScriptRoot

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "      Daily Document Generator — AI Test Case Tool      " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Access application at: " -NoNewline
Write-Host "http://localhost:3000" -ForegroundColor Green
Write-Host ""

node server/index.js
