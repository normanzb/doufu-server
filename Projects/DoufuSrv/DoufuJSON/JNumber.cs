using System;
using System.Collections.Generic;
using System.Text;

namespace Doufu.JSON
{
    /// <summary>
    /// JSON Number mimic class
    /// </summary>
    public class JNumber : JObjectBase<System.Int32>, IJSONObject
    {
        public JNumber()
        {

        }

        public JNumber(int value)
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

        public override string ToJSON()
        {
            return this.Value.ToString();
        }

        public static implicit operator JNumber(int iNumber)
        {
            return new JNumber(iNumber);
        }
    }
}
