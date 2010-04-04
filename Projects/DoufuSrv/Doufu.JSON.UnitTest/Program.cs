using System;
using System.Collections.Generic;
using System.Text;
using Doufu.JSON;

namespace UnitTest
{
    class Program
    {
        static void Main(string[] args)
        {
            if (false)
            {
                /////////////////////////
                // Stringifier Test
                /////////////////////////

                // implicity conversion

                JArray jArrTest = new JArray();
                jArrTest.Value.Add("jArrTest primitive string");

                Console.WriteLine(jArrTest.ToJSON());

                JString jStrTest = null;
                jStrTest = "primitive string test";

                Console.WriteLine(jStrTest.ToJSON());

                // Null tests
                JString jstr = new JString(null);
                Console.WriteLine(jstr.ToJSON());

                // string with a backward slash
                JString jstrslash = new JString("\\\\n\n");
                JObject jobjslash = new JObject();
                jobjslash.Items.Add("\r\n\\\n", jstrslash);
                Console.WriteLine(jobjslash.ToJSON());

                // stringify a jstring that contain break line
                JString breakstr = new JString("abc \n cba");
                Console.WriteLine(breakstr.ToJSON());

                JObject jNullObj = new JObject();
                jNullObj["test1"] = new JNumber(23);
                jNullObj["test2"] = null;
                jNullObj["test3"] = new JString(null);
                jNullObj["test4"] = new JArray();
                ((JArray)jNullObj["test4"]).Value.Add(new JNumber(234));
                ((JArray)jNullObj["test4"]).Value.Add(null);
                ((JArray)jNullObj["test4"]).Value.Add(new JString("sdf"));
                Console.WriteLine(jNullObj.ToJSON());

                // Array tests
                JObject testObject = new JObject();
                testObject.Items.Add("key1", new JBoolean(false));
                testObject.Items.Add("key2", new JNumber(333));
                JArray testArray = new JArray(new JSONObject[] { 
                new JBoolean(false), 
                new JBoolean(true),
                new JNumber(20),
                new JString("test"),
                testObject,
                new JNumber(0)
            });
                Console.WriteLine(testArray.ToJSON());

                // test JArray.this[int index]
                Console.WriteLine(((JNumber)testArray[2]).Value.ToString());
                Console.WriteLine(((JNumber)testArray[2]).Value = 556);
                Console.WriteLine(testArray.ToJSON());

                // test JArray.this[string key]
                testArray["alimali"] = new JString("alimali");
                Console.WriteLine(testArray["alimali"].ToJSON());
                Console.WriteLine(testArray.ToJSON());

                // test implicit convert from int to JNumber
                Console.WriteLine((testArray[2] = (JNumber)234).ToJSON());
                Console.WriteLine(testArray.ToJSON());

                // test implicit convert from string to JString
                Console.WriteLine((testArray[2] = (JString)"jstring converted!").ToJSON());
                Console.WriteLine(testArray.ToJSON());
            }
            else
            {
                /////////////////////////
                // Parser Test
                /////////////////////////

                // unicode tests

                JArray unicode1 = (JArray)Helpers.Parse(@"['HR\u9762\u8bd5',3,3,4]");

                // array tests

                JArray array = (JArray)Helpers.Parse(@"[1,3,3,4]");

                JObject array2 = (JObject)Helpers.Parse(@"{'Processes':['20ed6436-5b44-47f8-8642-1184811d4a99']}");

                JObject array3 = (JObject)Helpers.Parse(@"{'Processes':['20ed6436-5b44-47f8-8642-1184811d4a99','20ed6436-5b44-47f8-8642-1184811d4a99']}");

                JObject array4 = (JObject)Helpers.Parse(@"{'name': 'asfdasf', 'items': [{'name': 'HR\u9762\u8bd5'},{'name': '\u4f53\u68c0'},{'name': '\u5165\u804c'},{'name': '\u5ba2\u6237\u9762\u8bd5'},{'name': '\u7b7e\u7f72OFFER'},{'name': '\u90e8\u95e8\u9762\u8bd5'}]}");

                // positive tests

                JObject p_number1 = (JObject)Helpers.Parse(@"{""test"":23423}");
                JObject p_number2_blank = (JObject)Helpers.Parse(@"  {  ""test""   :  23423  }   ");
                JObject p_number3 = (JObject)Helpers.Parse(@"{""test"":-23}"); // negative number

                JObject p_string1 = (JObject)Helpers.Parse(@"{""test"":""23423""}");
                JObject p_string2 = (JObject)Helpers.Parse(@"{""test"":'23423'}");
                JObject p_string3 = (JObject)Helpers.Parse(@"{""test"":'23423\0'}");
                JObject p_string4 = (JObject)Helpers.Parse(@"{""test"":'23""423\0'}");
                JObject p_string5 = (JObject)Helpers.Parse(@"{""test"":""23'423\0""}");
                JObject p_string6 = (JObject)Helpers.Parse(@"{""test"":""23\""423\0""}");
                JObject p_string7 = (JObject)Helpers.Parse(@"{""test"":'23\""423\0'}");

                JObject p_bool1 = (JObject)Helpers.Parse(@"{""test"":false}");
                JObject p_bool2 = (JObject)Helpers.Parse(@"{""test"":true}");

                // variable name tests
                JObject p_variable1 = (JObject)Helpers.Parse(@"{""test"":true}");
                JObject p_variable2 = (JObject)Helpers.Parse(@"{'test':false}");

                // TODO: multiple object
                JObject p_multipleObject1 = (JObject)Helpers.Parse(@"{""test"":23423,""test2"":234}");
                JObject p_multipleObject2 = (JObject)Helpers.Parse(@"{""X"":350,""Y"":500,""Z"":9}");

                // TODO: mixed types
                JObject p_mixTypes1 = (JObject)Helpers.Parse(@"{""test"":23423,""test2"":""sdf"",""test3"":false,""test4"":234}");

                // TODO: dupilcated variable names

                // TODO: nested
                JObject p_nested1 = (JObject)Helpers.Parse(@"{""test"":{""test2"":234,""test3"":""sdf""}}");
                JObject p_nested2 = (JObject)Helpers.Parse(@"  {  ""test"" :   {    ""test2""  :   {  ""test4""  :  false  }   , ""test3""  :  ""sdf""  }   }     ");

                // TODO: string escape test

                // Expected pass
                JObject p_variableNameEscape_1 = (JObject)Helpers.Parse(@"  {  ""t\nest""   :  23423  }   ", true);
                JObject p_variableNameEscape_2 = (JObject)Helpers.Parse(@"  {  ""t\0est""   :  23423  }   ", true);
                JObject p_variableNameEscape_3 = (JObject)Helpers.Parse(@"  {  ""t\0est""   :  ""sdfsdf\0sdfsdf\""df""  }   ", true);

                // Expected error
                JObject n_variableNameEscape_1 = (JObject)Helpers.Parse(@"  {  ""t\nest""   :  23423  }   ");
                JObject n_variableNameEscape_2 = (JObject)Helpers.Parse(@"  {  ""t\0est""   :  23423  }   ", false);

                // negative tests

                JObject n = (JObject)Helpers.Parse(@"{""test"":23423a}");
                JObject n2 = (JObject)Helpers.Parse(@"{""test"":false1}");
                JObject n3 = (JObject)Helpers.Parse(@"{""test':false1}");
            }

        }
    }
}
