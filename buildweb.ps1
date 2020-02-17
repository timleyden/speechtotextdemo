Push-Location ./webapp/transcriptionviewer

npm install --only=dev
npm install

# Build the SPA for prod distribution
#ng build --prod
npm run-script build

# Rewrite the Application Insights INSTRUMENTATION_KEY
(Get-Content ./dist/transcriptionviewer/index.html).replace('INSTRUMENTATION_KEY', $env:APPINSIGHTSIKEY) `
    | Set-Content ./dist/transcriptionviewer/index.html

Pop-Location