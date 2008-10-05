using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Text;

namespace Doufu.JSON
{
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

                subObjStr += skey + ": " + kv.Value.ToString();

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
