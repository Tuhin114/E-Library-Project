$ErrorActionPreference = "Stop"

Write-Host "Running E-Library M3 automated tests..." -ForegroundColor Cyan
npm install
npm run generate:m3-files
npx newman run .\ELibrary_M3_Automated.postman_collection.json `
  -e .\ELibrary_M3.postman_environment.json `
  --working-dir .
