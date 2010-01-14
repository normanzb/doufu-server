using System;
using System.Collections.Generic;
using System.Text;

namespace Doufu.JSON
{
    public class JNaN:JNumber
    {
        internal JNaN()
        {
            this.Value = Int32.MinValue;
        }

        public override string ToJSON()
        {
            return "NaN";
        }
    }
}
