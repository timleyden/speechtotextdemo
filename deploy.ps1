#Login-AzAccount

$rg = new-azresourcegroup -Name "SpeechToTextDemo" -Location "australiaeast" -force
New-AzResourceGroupDeployment -Name "demodeployment" -ResourceGroupName $rg.ResourceGroupName -Mode Incremental -TemplateFile .\azuredeploy.json

