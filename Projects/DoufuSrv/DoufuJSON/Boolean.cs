using System;
using System.Collections.Generic;
using System.Text;

namespace Doufu.JSON
{
    public class Boolean:Object<System.Boolean>, IJSONObject
    {

        public Boolean()
        {
            this.Value = false;
        }

        public Boolean(bool value)
        {
            this.Value = value;
        }

        private System.Boolean _value;

        public override System.Boolean Value
        {
            get
            {
                return this._value;
            }
            set
            {
                this._value = value;
            }
        }

        public override string ToString()
        {
            return this.Value.ToString().ToLower();
        }
    }
}
