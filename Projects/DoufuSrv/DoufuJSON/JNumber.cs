using System;
using System.Collections.Generic;
using System.Text;

namespace Doufu.JSON
{
    /// <summary>
    /// JSON Number mimic class
    /// </summary>
    public class JNumber : JObjectBase<System.Int64>, IJSONObject
    {
        public JNumber()
        {

        }

        public JNumber(Int64 value)
        {
            this.Value = value;
        }

        private System.Int64 _value;

        public override System.Int64 Value
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

        /// <summary>
        /// The object which stands for not a number
        /// </summary>
        public static JNaN JNaN = new JNaN();

        #region implicit conversion

        public static implicit operator JNumber(Int32 iNumber)
        {
            return new JNumber((Int64)iNumber);
        }

        public static implicit operator JNumber(Int64 iNumber)
        {
            return new JNumber(iNumber);
        }

        public static implicit operator JNumber(JString sString)
        {
            return (JNumber)(sString.Value);
        }

        public static implicit operator JNumber(string sString)
        {
            bool isParsed = true;
            Int64 result = 0;

            try
            {
                result = Int64.Parse(sString);
            }
            catch (Exception)
            {
                isParsed = false;
            }

            if (isParsed)
            {
                return new JNumber(result);
            }
            else
            {
                return JNaN;
            }
        }

        #endregion

        #region operator overloadings...

        public static JNumber operator +(JNumber num1, JNumber num2)
        {
            return new JNumber(num1.Value + num2.Value);
        }

        public static JNumber operator -(JNumber num1, JNumber num2)
        {
            return new JNumber(num1.Value - num2.Value);
        }

        public static JNumber operator *(JNumber num1, JNumber num2)
        {
            return new JNumber(num1.Value * num2.Value);
        }

        public static JNumber operator %(JNumber num1, JNumber num2)
        {
            return new JNumber(num1.Value % num2.Value);
        }

        #endregion
    }
}
