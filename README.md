# Speech to Text Accelerator

**Disclaimer**: This content is not officially endorsed by *Microsoft*. This is not end to end solution, rather a starting point for your own azure speech solution. Navigate to [Azure Application Architecture Guide](https://docs.microsoft.com/en-us/azure/architecture/guide/) to learn how to build solutions on Azure that are scalable, secure, resilient, and highly available.

## Introduction
This speech solution was put together to help customers test and use azure cognitive speech services. It has 2 components:
* Transcription Viewer
* Custom Speech data preparation. 


## Solution Architecture
![](Architecture2.PNG)


1. User can upload audio via Transcription vewer portal, view the transcripts/edit the transcript and upload data for custom training;
2. User can select existing audio recordings from the storage account blob or upload a new recording;
3. To not expose the Azure Speech Service keys via Transcription service, the request to cognitive service goes via  azure function proxy;
4. Once the transcription is complete, the viewer surfaces the transcript from cognitive service storage blob;
5. Train button on transcription viewer posts the transcript to Cutter Azure Function which using ffmpeg library prepares the data for custom training and uploads the zip to azure storage;
6. UploadForCustomSpeecg Azure function uploads the audio and text zip as custom speech data set using speech cognitive service.  Once the data is successfully uploaded,  DataUploadCompleteHttpTrigger is triggered and starts training using the custom data set uploaded. 


## Solution Deployment 

The solution is deployed through the Azure Resource Manager. Azure Resource Manager allows you to provision your applications using a declarative template. In a single template, you can deploy multiple services along with their dependencies. You use the same template to repeatedly deploy your application during every stage of the application life cycle. [Learn More](https://docs.microsoft.com/en-au/azure/azure-resource-manager/resource-group-overview).

* [![Deploy to Azure](http://azuredeploy.net/deploybutton.png)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Ftimleyden%2Fspeechtotextdemo%2Ftranscriptionviewerv3%2Fazuredeploy.json) Original deploy via portal.azure.com - working
* [![Viszualize](http://armviz.io/visualizebutton.png)](http://armviz.io/#/?load=https%3A%2F%2Fraw.githubusercontent.com%2Ftimleyden%2Fspeechtotextdemo%2ftranscriptionviewerv3%2Fazuredeploy.json) 



## Local Development 
Use [ngrock](https://ngrok.com/) to expose DataUploadCompleteTriggrt function as a public url and add the URL to application settings.



## Webapp location azuredeploy.json

Node.js app has location hardcoded in azuredeploy.json file due to limitation encountered during development. It limits you to deploy windows and linux plans in same location in the same resources group.

## Resources created
The arm template stands up the following resources 
* Storage account 
* App Service
* App Service Plan
* Cognitive Service 
* Application Insights 


## Cost

To stand up and provision the resources, the template creates a Basic (Dedicated environment for dev/test) App service plan, which is than automatically scales down to Free Tier. 

* App Service Plan Free Tier - FREE
* App Service Plan BASIC Dedicated environment for dev/test - $0.130/hour [pricing](https://azure.microsoft.com/en-us/pricing/details/app-service/windows/)
* Speech Cognitive Service pricing - Standard ($1.373 per audio hour), Custom ($1.923 per audio hour, endpoint hosting: $0.0738 per model per hour) [pricing](https://azure.microsoft.com/en-us/pricing/details/cognitive-services/speech-services/)
* Azure Storage - $0.00112/GB per month [pricing](https://azure.microsoft.com/en-us/pricing/details/storage/)
* Application Insights (Application Insights is billed based on the volume of telemetry data that your application sends and the number of web tests that you choose to run) - $4.586 per GB. [pricing](https://azure.microsoft.com/en-us/pricing/details/monitor/)


## External Libraries 

To slice up the audio and transcript the accelerator uses [FFmpeg library](https://ffmpeg.org/). There are other libraries that you can use intsead such as [LibROSA](https://librosa.github.io/librosa/), [pysox](https://pypi.org/project/pysox/), [pydub](https://pypi.org/project/pydub/).
