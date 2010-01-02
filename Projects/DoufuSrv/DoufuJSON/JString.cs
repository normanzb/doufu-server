using System;
using System.Collections.Generic;
using System.Text;

namespace Doufu.JSON
{
    public class JString : Doufu.JSON.JObjectBase<string>, IJSONObject
    {
        #region static methods and properties

        private static JString _empty = new JString(string.Empty);
        /// <summary>
        /// Return the empty string object
        /// </summary>
        public static JString Empty
        {
            get
            {
                return _empty ;
            }
        }

        /// <summary>
        /// return true if the passed in jstring is null or empty
        /// </summary>
        /// <param name="jStr"></param>
        /// <returns></returns>
        public static bool IsNullOrEmpty(JString jStr)
        {
            if (jStr == Empty || String.IsNullOrEmpty(jStr.Value))
            {
                return true;
            }

            return false;
        }

        #endregion

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
            string ret = string.Empty;

            if (this.Value == null)
            {
                ret = "null";
            }
            else
            {
                ret = Value.ToString();
                ret = ret.Replace("\\", "\\\\");
                ret = ret.Replace("\n", "\\n");
                ret = ret.Replace("\r", "\\r");
                ret = ret.Replace("\t", "\\t");
                ret = ret.Replace("\"", "\\\"");
                ret = "\"" + ret + "\"";
            }

            return ret;
        }

        public override string ToString()
        {
            return this.Value;
        }

        #region Jstring implicity conversion

        public static implicit operator JString(string sString)
        {
            return new JString(sString);
        }

        public static implicit operator JString(JNumber iNumber)
        {
            return (JString)(iNumber.Value);
        }

        public static implicit operator JString(Int64 iInt)
        {
            return new JString(iInt.ToString());
        }

        public static JString operator +(JString str1, JString str2)
        {
            return new JString(str1.Value + str2.Value);
        }
        #endregion
    }
}
