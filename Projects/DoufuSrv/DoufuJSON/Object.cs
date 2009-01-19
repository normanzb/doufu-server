using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Text;

namespace Doufu.JSON
{
    /// <summary>
    /// The base object for all Doufu.JSON objects
    /// </summary>
    /// <typeparam name="T">Specify the corresponding c# object</typeparam>
    public class Object<T>: IJSONObject
    {
        private Dictionary<string, IJSONObject> _items = new Dictionary<string, IJSONObject>();
        private T _value;

        public Dictionary<string, IJSONObject> Items
        {
            get
            {
                return this._items;
            }
        }

        public virtual T Value
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

        /// <summary>
        /// Stringify this object to JSON string.
        /// </summary>
        /// <returns>JSON string</returns>
        public override string ToString()
        {
            string subObjStr = string.Empty;
            bool firstItem = true;


            foreach (System.Collections.Generic.KeyValuePair<string, IJSONObject> kv in this.Items)
            {
                if (!firstItem)
                {
                    subObjStr += ", ";
                }
                else
                {
                    subObjStr += "{";
                }

                string skey = kv.Key.ToString().Trim() == string.Empty ? "\"\"" : kv.Key.ToString().Trim();

                subObjStr += System.String.Format(@"""{0}"": {1}", skey, kv.Value.ToString());

                firstItem = false;
            }

            if (this.Items.Count != 0 && subObjStr.Trim() != string.Empty)
            {
                subObjStr += "}";
                return subObjStr;
            }
            else if (this.Value != null)
            {
                return this.Value.ToString();
            }
            else
            {
                return "null";
            }
        }

    }
}
