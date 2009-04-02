using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Text;

namespace Doufu.JSON
{
    public class JArray : Doufu.JSON.JObjectBase<Collection<IJSONObject>>, IJSONObject
    {
        public class JArrayDictionary: Dictionary<string, IJSONObject>
        {
            private Collection<IJSONObject> myArray;

            public JArrayDictionary(Collection<IJSONObject> collection)
            {
                this.myArray = collection;
            }

            private bool GetNumber(string sNumber, out int iNumber)
            {
                bool bParsed = false;
                iNumber = 0;
                try
                {
                    iNumber = Int32.Parse(sNumber);
                    bParsed = true;
                }
                catch (Exception)
                {
                    bParsed = false;
                }

                return bParsed;
            }

            /// <summary>
            /// 
            /// </summary>
            /// <param name="key"></param>
            /// <returns></returns>
            public new IJSONObject this[string key]
            {
                get
                {
                    IJSONObject ret;
                    bool bParsed = false;
                    int index = 0;
                    bParsed = GetNumber(key, out index);

                    if (bParsed)
                    {
                        return this[index];
                    }
                    else
                    {
                        return base[key];
                    }

                }
                set
                {
                    bool bParsed = false;
                    int index = 0;
                    bParsed = GetNumber(key, out index);
                    if (bParsed)
                    {
                        this[index] = value;
                    }
                    else
                    {
                        base[key] = value;
                    }
                }
            }

            /// <summary>
            /// 
            /// </summary>
            /// <param name="index"></param>
            /// <returns></returns>
            public IJSONObject this[int index]
            {
                get
                {
                    return myArray[index];
                }

                set
                {
                    myArray[index] = value;
                }
            }
        }

        private JArrayDictionary myJArrayDictionary;

        public JArray()
        {
            this.Value = new Collection<IJSONObject>();
            myJArrayDictionary = new JArrayDictionary(this.Value);
        }

        public JArray(Collection<IJSONObject> value)
        {
            this.Value = value;
            myJArrayDictionary = new JArrayDictionary(this.Value);
        }

        public JArray(IJSONObject[] value)
        {
            Collection<IJSONObject> cllctValue = new Collection<IJSONObject>();
            for (int i = 0; i < value.Length; i++)
            {
                cllctValue.Add(value[i]);
            }

            this.Value = cllctValue;
            myJArrayDictionary = new JArrayDictionary(this.Value);
        }

        // hide items
        public new JArrayDictionary Items
        {
            get
            {
                return myJArrayDictionary;
            }
        }

        public IJSONObject this[int index]
        {
            get
            {
                return myJArrayDictionary[index];
            }
            set
            {
                myJArrayDictionary[index] = value;
            }
        }

        public override IJSONObject this[string key]
        {
            get
            {
                return myJArrayDictionary[key];
            }
            set
            {
                myJArrayDictionary[key] = value;
            }
        }

        public override string ToJSON()
        {
            string sRet = "[";
            bool bFirstElement = true;
            foreach (IJSONObject o in this.Value)
            {
                if (!bFirstElement)
                {
                    sRet += ",";
                }
                sRet += o.ToJSON();
                bFirstElement = false;
            }
            return sRet + "]";
        }

        public static implicit operator JArray(IJSONObject[] jsonObjects)
        {
            return new JArray(jsonObjects);
        }

        public static implicit operator JArray(Collection<IJSONObject> jsonCollection)
        {
            return new JArray(jsonCollection);
        }
    }
}
