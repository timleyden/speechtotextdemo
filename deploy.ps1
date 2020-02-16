#Login-AzAccount

$rg = New-AzResourceGroup -Name "SpeechToTextDemo" -Location "australiaeast" -Force `
        -Tag @{project='speechtotext'; owner='timleyden'} -Verbose

New-AzResourceGroupDeployment -Name "demodeployment" -ResourceGroupName $rg.ResourceGroupName -Mode Incremental -TemplateFile .\azuredeploy.json -Verbose
