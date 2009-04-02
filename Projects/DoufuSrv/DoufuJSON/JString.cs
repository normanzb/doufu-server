using System;
using System.Collections.Generic;
using System.Text;

namespace Doufu.JSON
{
    public class JString : Doufu.JSON.JObjectBase<string>, IJSONObject
    {

        public JString(string value)
        {
            this.Value = value;
        }

        public JString()
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

        public override string ToJSON()
        {
            return "\"" + this.Value.ToString().Replace("\"", "\\\"") + "\"";
        }

        public static implicit operator JString(string sString)
        {
            return new JString(sString);
        }

    }
}
