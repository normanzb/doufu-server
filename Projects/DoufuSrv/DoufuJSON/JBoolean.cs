using System;
using System.Collections.Generic;
using System.Text;

namespace Doufu.JSON
{
    public class JBoolean:JObjectBase<System.Boolean>, IJSONObject
    {

        public JBoolean()
        {
            this.Value = false;
        }

        public JBoolean(bool value)
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

        public override string ToJSON()
        {
            return this.Value.ToString().ToLower();
        }

        public static implicit operator JBoolean(bool boolean)
        {
            return new JBoolean(boolean);
        }
    }
}
