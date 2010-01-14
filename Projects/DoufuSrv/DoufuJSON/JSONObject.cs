using System;
using System.Collections.Generic;
using System.Text;

namespace Doufu.JSON
{
    public class JSONObject:IJSONObject
    {
        public virtual string ToJSON()
        {
            return "{}";
        }

        public static implicit operator JSONObject(bool boolean)
        {
            return new JBoolean(boolean);
        }

        public static implicit operator JSONObject(string sString)
        {
            return new JString(sString);
        }

        public static implicit operator JSONObject(long iInt)
        {
            return new JNumber(iInt);
        }
    }
}
