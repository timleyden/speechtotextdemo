using System;
using System.Collections.Generic;
using System.Text;

namespace cut60secondsaudio
{
    class DataUploadCompleteHttpTriggerHelper
    {
        /*
         Call to send data for model training after import data completeion 
         API: https://[region].cris.ai/api/speechtotext/v3.0-beta1/models
         Method: POST
             */
        public class ModelTraining
        {

            public ModelTraining(string name, string displayName, string description, string locale, ProjectModelTraining project,
                PropertiesModelTraining properties, CustompropertiesModelTraining customProperties, DatasetModelTraining[] datasets, BasemodelModelTraining baseModel,
                ModelpropertiesModelTraining modelProperties)
            {

                this.name = name;
                this.displayName = displayName;
                this.description = description;
                this.locale = locale;
                this.project = project;
                this.properties = properties;
                this.customProperties = customProperties;
                this.datasets = datasets;
                this.baseModel = baseModel;
                this.modelProperties = modelProperties;

            }



            public string displayName { get; set; }
            public string description { get; set; }
            public string locale { get; set; }
            public ProjectModelTraining project { get; set; }
            public PropertiesModelTraining properties { get; set; }
            public CustompropertiesModelTraining customProperties { get; set; }
            public DatasetModelTraining[] datasets { get; set; }
            public BasemodelModelTraining baseModel { get; set; }
            public ModelpropertiesModelTraining modelProperties { get; set; }
        }

        public class ProjectModelTraining
        {
            public ProjectModelTraining( string self)
            {

                this.self = self;
            }

            public string self { get; set; }
        }

        public class PropertiesModelTraining
        {

            public PropertiesModelTraining() { PortalAPIVersion = "3"; }

            public PropertiesModelTraining(string PortalAPIVersion)
            {
                this.PortalAPIVersion = PortalAPIVersion;
            }

            public string PortalAPIVersion { get; set; }
        }

        public class CustompropertiesModelTraining
        {
            public CustompropertiesModelTraining() { PortalAPIVersion = "3"; }

            public CustompropertiesModelTraining(string PortalAPIVersion)
            {
                this.PortalAPIVersion = PortalAPIVersion;
            }
            public string PortalAPIVersion { get; set; }
        }

        public class BasemodelModelTraining
        {

            public BasemodelModelTraining(string self)
            {

                this.self = self;
            }

            public string self { get; set; }
        }

        public class ModelpropertiesModelTraining
        {
            public ModelpropertiesModelTraining()
            {
                email = null;
            }

            public ModelpropertiesModelTraining(string email)
            {
                this.email = email;
            }

            public object email { get; set; }
        }

        public class DatasetModelTraining
        {

            public DatasetModelTraining(string self)
            {
             
                this.self = self;
            }


            public string self { get; set; }
        }




        /*
         Get all details about the uploaded dataset
         API:https://[region].cris.ai/api/speechtotext/v3.0-beta1/datasets/[datasetId]
         Method: GET
             */
        public class DataSetobject
        {
            public string self { get; set; }
            public string dataImportKind { get; set; }
            public LinksDataSet links { get; set; }
            public ProjectDataSet project { get; set; }
            public PropertiesDataSet properties { get; set; }
            public DateTime lastActionDateTime { get; set; }
            public string status { get; set; }
            public DateTime createdDateTime { get; set; }
            public string locale { get; set; }
            public string displayName { get; set; }
            public string description { get; set; }
            public CustompropertiesDataSet customProperties { get; set; }
        }

        public class LinksDataSet
        {
            public string files { get; set; }
        }

        public class ProjectDataSet
        {
            public string self { get; set; }
        }

        public class PropertiesDataSet
        {
            public int acceptedLineCount { get; set; }
            public int rejectedLineCount { get; set; }
            public string duration { get; set; }
        }

        public class CustompropertiesDataSet
        {
            public string PortalAPIVersion { get; set; }
        }





        /*
         getting the response 
             */



        public class objectResponse
        {
            public string self { get; set; }
           
        }

        public class PropertiesResp
        {
            public string PortalAPIVersion { get; set; }
            public string Duration { get; set; }
            public string SuitableForAdaptation { get; set; }
            public string AcceptedLines { get; set; }
            public string RejectedLines { get; set; }
            public string AcousticDataAudioFilesUrl { get; set; }
        }



        public class dataSetParam
        {
            public string self { get; set; }
            public string dataImportKind { get; set; }
            public Links links { get; set; }
            public DataSetProject project { get; set; }
            public DataSetProperties properties { get; set; }
            public DateTime lastActionDateTime { get; set; }
            public string status { get; set; }
            public DateTime createdDateTime { get; set; }
            public string locale { get; set; }
            public string displayName { get; set; }
            public string description { get; set; }
            public DataSetCustomproperties customProperties { get; set; }
        }

        public class Links
        {
            public string files { get; set; }
        }

        public class DataSetProject
        {
            public string self { get; set; }
        }

        public class DataSetProperties
        {
            public int acceptedLineCount { get; set; }
            public int rejectedLineCount { get; set; }
            public string duration { get; set; }
        }

        public class DataSetCustomproperties
        {
            public string PortalAPIVersion { get; set; }
        }


        /*
         Class for basline speech to text model to get IDs for all avaiable baseline models
         API:https://[region].cris.ai/api/speechtotext/v3.0-beta1/models/base/
         Method: GET
             */
        public class ObjectBaseModel
        {
            public ValueBaseModel[] values { get; set; }
            public string nextLink { get; set; }
        }

        public class ValueBaseModel
        {
            public string self { get; set; }
            public object[] datasets { get; set; }
            public LinksBaseModel links { get; set; }
            public PropertiesBaseModel properties { get; set; }
            public DateTime lastActionDateTime { get; set; }
            public string status { get; set; }
            public DateTime createdDateTime { get; set; }
            public string locale { get; set; }
            public string displayName { get; set; }
            public string description { get; set; }
            public CustompropertiesBaseModel customProperties { get; set; }
        }

        public class LinksBaseModel
        {
            public string endpointManifest { get; set; }
        }

        public class PropertiesBaseModel
        {
            public string deprecatedFeatures { get; set; }
        }

        public class CustompropertiesBaseModel
        {
        }

    }
}
