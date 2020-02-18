# FastTrack mini-hack 2020

Azure Governance mini-hack. You have been tasked with getting [speechtotextdemo] into production. The
business have asked for the following non-functional requirements:

1. Automated deployment of resources
1. High availability - 99.9% uptime. 1 hour recovery time objective (RTO)
1. Good governance in place. Tags, policies, role-based access controls (RBAC)
1. Good security practices must be followed. PII data must be protected
1. Monitoring in place

## Getting started

    git clone https://github.com/DanielLarsenNZ/speechtotextdemo.git
    cd ./speechtotextdemo
    git checkout transcriptionviewer
    code .

* Open [ARM Template Viewer] to help visualize what is being deployed.
* Outline view in VS Code
* Availability: Will this deployment meet business requirements for uptime and RTO? 
    * [Azure Storage SLA]
    * [Azure Functions SLA]
    * [Uptime is 99.9%]

## Deploy Azure resources

    ./deploy.ps1
    
* Tags on Resource Group deployment
* Output variables and Environment variables
* Add a policy for Australia East only

## Build and deploy SPA

    ./buildweb.ps1
    ./deployweb.ps1

* Grant _reader_ access to dev team to the Resource Group

## Security

* Appropriate RBAC
* Azure Security Center standard turned on
* HTTPS only for Storage Account (default?) and [Functions](https://microsoft.github.io/AzureTipsAndTricks/blog/tip62.html)
* Storage Service Encryption on (default)


Allows https traffic only to storage service if sets to true. The default value is `true` since API version 
2019-04-01.
<https://docs.microsoft.com/en-us/azure/templates/microsoft.storage/2019-04-01/storageaccounts#storageaccountpropertiescreateparameters-object>

## Monitoring

* Application Insights keys set as envrionment vars
* App Insights code added to index.html

## Links and references

Static website hosting in Azure Storage: <https://docs.microsoft.com/en-us/azure/storage/blobs/storage-blob-static-website>

Host a static website in Azure Storage: <https://docs.microsoft.com/en-us/azure/storage/blobs/storage-blob-static-website-how-to?tabs=azure-cli>

Azure CLI Storage Preview Extension: <https://github.com/Azure/azure-cli-extensions/tree/master/src/storage-preview#static-website>






[speechtotextdemo]:https://github.com/DanielLarsenNZ/speechtotextdemo/tree/transcriptionviewer
[ARM Template Viewer]:https://marketplace.visualstudio.com/items?itemName=bencoleman.armview
[Azure Storage SLA]:https://azure.microsoft.com/en-au/support/legal/sla/storage/v1_5/
[Azure Functions SLA]:https://azure.microsoft.com/en-au/support/legal/sla/functions/v1_1/
[Uptime is 99.9%]:https://uptime.is/99.9