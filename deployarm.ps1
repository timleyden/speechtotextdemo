[CmdletBinding()]
param (
    [Parameter()] [String] $ResourceGroup = 'speechtotext-rg',
    [Parameter()] [String] $Location = 'australiaeast'
)

$ErrorActionPreference = 'Stop'
# Login-AzAccount

New-AzResourceGroup -Name $ResourceGroup -Location $Location -Force `
        -Tag @{project='speechtotext'; owner='timleyden'} -Verbose

$deployment = New-AzResourceGroupDeployment -Name "$($ResourceGroup)-$(New-Guid)" `
                -ResourceGroupName $ResourceGroup `
                -Mode Incremental -TemplateFile .\azuredeploy.json -Verbose

# Set env vars to be used by the deploy scripts
$env:APPINSIGHTSIKEY = $deployment.Outputs.appInsightsIKey.Value
$env:WEBSTORAGEACCOUNTNAME = $deployment.Outputs.webStorageAccountName.Value
$env:AUDIOSTORAGEACCOUNTNAME = $deployment.Outputs.audioStorageAccountName.Value




# TEARDOWN
# Remove-AzResourceGroup -Name "speechtotext-rg" -Force -Verbose
