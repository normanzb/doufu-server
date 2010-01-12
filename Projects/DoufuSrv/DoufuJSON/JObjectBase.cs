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
    public class JObjectBase<T>: JSONObject
    {
        private Dictionary<string, JSONObject> _items = new Dictionary<string, JSONObject>();
        private T _value;

        public Dictionary<string, JSONObject> Items
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

        public virtual JSONObject this[string key]
        {
            get
            {
            	JSONObject ret = null;
            	try
            	{
            		ret = this.Items[key];
            	}
            	catch(Exception)
            	{
            	}
                return ret;
            }
            set
            {
                this.Items[key] = value;
            }
        }

        /// <summary>
        /// Stringify this object to JSON string.
        /// </summary>
        /// <returns>JSON string</returns>
        public override string ToJSON()
        {
            string subObjStr = string.Empty;
            bool firstItem = true;


            foreach (System.Collections.Generic.KeyValuePair<string, JSONObject> kv in this.Items)
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

                string valueStr = "null";
                if (kv.Value != null)
                {
                    valueStr = kv.Value.ToJSON();
                }

                subObjStr += System.String.Format(@"""{0}"": {1}", skey, valueStr);

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
