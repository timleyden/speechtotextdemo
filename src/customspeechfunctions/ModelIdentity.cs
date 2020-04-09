using System;
using System.Collections.Generic;
using System.Text;

namespace cut60secondsaudio
{
    using System;

    public sealed class ModelIdentity
    {
        private ModelIdentity(Guid id)
        {
            this.Id = id;
        }

        public Guid Id { get; private set; }

        public static ModelIdentity Create(Guid Id)
        {
            return new ModelIdentity(Id);
        }
    }
}
