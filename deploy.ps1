$ErrorActionPreference = 'Stop'

# Login-AzAccount


$rg = New-AzResourceGroup -Name "speechtotext-rg" -Location "australiaeast" -Force `
        -Tag @{project='speechtotext'; owner='timleyden'} -Verbose

$deployment = New-AzResourceGroupDeployment -Name "$($rg.ResourceGroupName)-$(New-Guid)" -ResourceGroupName $rg.ResourceGroupName `
                -Mode Incremental -TemplateFile .\azuredeploy.json -Verbose

# Set an env var with the web storage account name to be used by the deploy web script
$env:WEBSTORAGEACCOUNTNAME = $webStorageAccountName = $deployment.Outputs.webStorageAccountName.Value

# Add the Storage Preview extension
az extension add --name storage-preview

# Enable static website
az storage blob service-properties update --account-name $webStorageAccountName --static-website `
    --index-document 'index.html'    
    # --404-document <error-document-name> 







# TEARDOWN
# Remove-AzResourceGroup -Name "speechtotext-rg" -Force -Verbose
