using System;
using System.Collections.Generic;
using System.Text;

namespace Doufu.JSON
{
    public class String : Doufu.JSON.Object<string>, IJSONObject
    {

        public String(string value)
        {
            this.Value = value;
        }

        public String()
        {

        }

        private string _value;

        public override string Value
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
            return "\"" + this.Value.ToString() + "\"";
        }
    }
}
