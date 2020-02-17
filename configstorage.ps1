# Add the Storage Preview extension
az extension add --name storage-preview

# Enable static website
az storage blob service-properties update --account-name $env:WEBSTORAGEACCOUNTNAME --static-website `
    --index-document 'index.html'    
    # --404-document <error-document-name> 

# Get the Web endpoint for the storage account
# Trim the trailing slash 🙄
$webHostname = ( az storage account show -n $env:WEBSTORAGEACCOUNTNAME | ConvertFrom-Json ).primaryEndpoints.web.TrimEnd('/')


# Enable CORS
# az storage cors add is not idempotent 🙄
$cors = ( az storage cors list --account-name $env:AUDIOSTORAGEACCOUNTNAME | ConvertFrom-Json )

$allowedHeaders = '*'
$allowedMethods = 'GET', 'HEAD', 'OPTIONS'
$corsExists = $false

foreach ($rule in $cors)
{
    # Hash the rule properties together to determine if the rule exists
    if ("$($rule.Service)|$($rule.AllowedHeaders)|$($rule.AllowedMethods)|$($rule.AllowedOrigins)" -eq "blob|$allowedHeaders|$($allowedMethods -join ', ')|$webHostname")
    {
        $corsExists = $true
        break
    }
}

if (!$corsExists)
{
    Write-Host "Enabling CORS on storage account $env:AUDIOSTORAGEACCOUNTNAME for host $webHostname"
    az storage cors add --account-name $env:AUDIOSTORAGEACCOUNTNAME --methods $allowedMethods `
        --origins $webHostname --services 'b' --allowed-headers $allowedHeaders
}
