$ErrorActionPreference = 'Stop'

# Login-AzAccount


$rg = New-AzResourceGroup -Name "speechtotext-rg" -Location "australiaeast" -Force `
        -Tag @{project='speechtotext'; owner='timleyden'} -Verbose

$deployment = New-AzResourceGroupDeployment -Name "$($rg.ResourceGroupName)-$(New-Guid)" `
                -ResourceGroupName $rg.ResourceGroupName `
                -Mode Incremental -TemplateFile .\azuredeploy.json -Verbose

# Set env vars to be used by the deploy scripts
$env:APPINSIGHTSIKEY = $deployment.Outputs.appInsightsIKey.Value
$env:WEBSTORAGEACCOUNTNAME = $deployment.Outputs.webStorageAccountName.Value
$env:AUDIOSTORAGEACCOUNTNAME = $deployment.Outputs.audioStorageAccountName.Value




# TEARDOWN
# Remove-AzResourceGroup -Name "speechtotext-rg" -Force -Verbose
