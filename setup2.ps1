$env:PATH = 'D:\Program Files;' + $env:PATH
Set-Location $PSScriptRoot
npm run dev 2>&1
