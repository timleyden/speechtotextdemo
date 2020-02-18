az storage blob upload-batch --account-name $env:WEBSTORAGEACCOUNTNAME `
    -d '$web' -s ./webapp/transcriptionviewer/dist/transcriptionviewer

# Get the Web endpoint for the storage account
$webUrl = ( az storage account show -n $env:WEBSTORAGEACCOUNTNAME | ConvertFrom-Json ).primaryEndpoints.web

start $webUrl
