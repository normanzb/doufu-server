using System;
using System.Collections.Generic;
using System.Text;

namespace Doufu.JSON
{
    public class Number : Object<System.Int32>, IJSONObject
    {
        public Number()
        {

        }

        public Number(int value)
        {
            this.Value = value;
        }

        private System.Int32 _value;

        public override System.Int32 Value
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
            return this.Value.ToString();
        }
    }
}
