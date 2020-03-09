[CmdletBinding()]
param (
    [Parameter()] [String] $RG = 'speechtotext-rg',
    [Parameter()] [String] $Location = 'australiaeast'
)

$ErrorActionPreference = 'Stop'
# Login-AzAccount

$rg = New-AzResourceGroup -Name $RG -Location $Location -Force `
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
