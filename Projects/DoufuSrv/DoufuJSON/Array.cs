using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Text;

namespace Doufu.JSON
{
    public class Array : Doufu.JSON.Object<Collection<IJSONObject>>, IJSONObject
    {
        public Array()
        {

        }

        public Array(Collection<IJSONObject> value)
        {
            this.Value = value;
        }

        public Array(IJSONObject[] value)
        {
            Collection<IJSONObject> cllctValue = new Collection<IJSONObject>();
            for (int i = 0; i < value.Length; i++)
            {
                cllctValue.Add(value[i]);
            }

            this.Value = cllctValue;
        }

        public override string ToString()
        {
            string sRet = "[";
            bool bFirstElement = true;
            foreach (IJSONObject o in this.Value)
            {
                if (!bFirstElement)
                {
                    sRet += ",";
                }
                sRet += o.ToString();
                bFirstElement = false;
            }
            return sRet + "]";
        }
    }
}