//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE.md file in the project root for full license information.
//

namespace SpeechToTextDemo
{
    using System;

    public sealed class ServiceDetails
    {
        private ServiceDetails()
        {

        }
        private static ServiceDetails instance = null;
        public string storageAccountName { get; set; }
        public string sASToken { get; set; }
        public string sASTokenReadOnly { get; set; }
        public string audioStorageContainerName { get; set; }
        public string transcriptStorageContainerName { get; set; }
        public string region { get; set; }
        public string serviceKey { get; set; }
        public string trainUrl { get; set; }
        public string CallbackFunctionUrl { get; set; }
        
        public static ServiceDetails GetServiceDetails()
        {
            if (instance == null)
            {
                ServiceDetails result = new ServiceDetails();
                //storage
                result.storageAccountName = Environment.GetEnvironmentVariable("StorageAccountName");
                result.sASToken = Environment.GetEnvironmentVariable("SASToken");
                result.sASTokenReadOnly = Environment.GetEnvironmentVariable("SASTokenReadOnly");
                result.audioStorageContainerName = Environment.GetEnvironmentVariable("AudioContainer");
                result.transcriptStorageContainerName = Environment.GetEnvironmentVariable("TranscriptContainer");
                //cris
                result.region = Environment.GetEnvironmentVariable("Region");
                result.serviceKey = Environment.GetEnvironmentVariable("SubscriptionKey");
                result.trainUrl = Environment.GetEnvironmentVariable("TrainingFunctionUrl");
                result.CallbackFunctionUrl = Environment.GetEnvironmentVariable("CallbackFunctionUrl");
               
                instance = result;
            }
            return instance;
        }

    }
}
