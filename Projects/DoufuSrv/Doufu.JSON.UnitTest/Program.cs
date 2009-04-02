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
            /////////////////////////
            // Stringifier Test
            /////////////////////////

            // Array tests
            JObject testObject = new JObject();
            testObject.Items.Add("key1", new JBoolean(false));
            testObject.Items.Add("key2", new JNumber(333));
            JArray testArray = new JArray(new IJSONObject[] { 
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

            /////////////////////////
            // Parser Test
            /////////////////////////

            // positive tests

            JObject p_number1 = Helpers.Parse(@"{""test"":23423}");
            JObject p_number2_blank = Helpers.Parse(@"  {  ""test""   :  23423  }   ");

            JObject p_string1 = Helpers.Parse(@"{""test"":""23423""}");
            JObject p_string2 = Helpers.Parse(@"{""test"":'23423'}");
            JObject p_string3 = Helpers.Parse(@"{""test"":'23423\0'}");
            JObject p_string4 = Helpers.Parse(@"{""test"":'23""423\0'}");
            JObject p_string5 = Helpers.Parse(@"{""test"":""23'423\0""}");
            JObject p_string6 = Helpers.Parse(@"{""test"":""23\""423\0""}");
            JObject p_string7 = Helpers.Parse(@"{""test"":'23\""423\0'}");

            JObject p_bool1 = Helpers.Parse(@"{""test"":false}");
            JObject p_bool2 = Helpers.Parse(@"{""test"":true}");

            // variable name tests
            JObject p_variable1 = Helpers.Parse(@"{""test"":true}");
            JObject p_variable2 = Helpers.Parse(@"{'test':false}");

            // TODO: multiple object
            JObject p_multipleObject1 = Helpers.Parse(@"{""test"":23423,""test2"":234}");
            JObject p_multipleObject2 = Helpers.Parse(@"{""X"":350,""Y"":500,""Z"":9}");

            // TODO: mixed types
            JObject p_mixTypes1 = Helpers.Parse(@"{""test"":23423,""test2"":""sdf"",""test3"":false,""test4"":234}");

            // TODO: dupilcated variable names

            // TODO: nested
            JObject p_nested1 = Helpers.Parse(@"{""test"":{""test2"":234,""test3"":""sdf""}}");
            JObject p_nested2 = Helpers.Parse(@"  {  ""test"" :   {    ""test2""  :   {  ""test4""  :  false  }   , ""test3""  :  ""sdf""  }   }     ");

            // TODO: string escape test

            // Expected pass
            JObject p_variableNameEscape_1 = Helpers.Parse(@"  {  ""t\nest""   :  23423  }   ", true);
            JObject p_variableNameEscape_2 = Helpers.Parse(@"  {  ""t\0est""   :  23423  }   ", true);
            JObject p_variableNameEscape_3 = Helpers.Parse(@"  {  ""t\0est""   :  ""sdfsdf\0sdfsdf\""df""  }   ", true);

            // Expected error
            JObject n_variableNameEscape_1 = Helpers.Parse(@"  {  ""t\nest""   :  23423  }   ");
            JObject n_variableNameEscape_2 = Helpers.Parse(@"  {  ""t\0est""   :  23423  }   ", false);

            // negative tests

            JObject n = Helpers.Parse(@"{""test"":23423a}");
            JObject n2 = Helpers.Parse(@"{""test"":false1}");
            JObject n3 = Helpers.Parse(@"{""test':false1}");

        }
    }
}
