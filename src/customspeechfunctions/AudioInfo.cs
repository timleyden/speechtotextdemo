using System;
using System.Collections.Generic;
using System.Text;

namespace cut60secondsaudio
{
    public class AudioInfo
    {
        
        public AudioInfo ()
        {
            AudioChunks = new List<AudioChunk>();
        }
        

        public List<AudioChunk> AudioChunks;
    }

    public class AudioChunk
    {

        public AudioChunk ()
        {
            Text = "";
            start = 0;
            stop = 0;
        }

        public string Text { get; set; }
        public float start { get; set; }
        public float stop { get; set; }

    }

}


