using System;
using System.Collections.Generic;
using System.Text;

namespace Doufu.JSON.UnitTest
{
    class Program
    {
        static void Main(string[] args)
        {
            // positive tests

            Doufu.JSON.Object<Doufu.JSON.IJSONObject> p_number1 = Doufu.JSON.Helpers.Parse(@"{""test"":23423}");
            Doufu.JSON.Object<Doufu.JSON.IJSONObject> p_number2_blank = Doufu.JSON.Helpers.Parse(@"  {  ""test""   :  23423  }   ");

            Doufu.JSON.Object<Doufu.JSON.IJSONObject> p_string1 = Doufu.JSON.Helpers.Parse(@"{""test"":""23423""}");
            Doufu.JSON.Object<Doufu.JSON.IJSONObject> p_string2 = Doufu.JSON.Helpers.Parse(@"{""test"":'23423'}");
            Doufu.JSON.Object<Doufu.JSON.IJSONObject> p_string3 = Doufu.JSON.Helpers.Parse(@"{""test"":'23423\0'}");
            Doufu.JSON.Object<Doufu.JSON.IJSONObject> p_bool1 = Doufu.JSON.Helpers.Parse(@"{""test"":false}");
            Doufu.JSON.Object<Doufu.JSON.IJSONObject> p_bool2 = Doufu.JSON.Helpers.Parse(@"{""test"":true}");


            // TODO: multiple object
            Doufu.JSON.Object<Doufu.JSON.IJSONObject> p_multipleObject1 = Doufu.JSON.Helpers.Parse(@"{""test"":23423,""test2"":234}");
            Doufu.JSON.Object<Doufu.JSON.IJSONObject> p_multipleObject2 = Doufu.JSON.Helpers.Parse(@"{""X"":350,""Y"":500,""Z"":9}");

            // TODO: mixed types
            Doufu.JSON.Object<Doufu.JSON.IJSONObject> p_mixTypes1 = Doufu.JSON.Helpers.Parse(@"{""test"":23423,""test2"":""sdf"",""test3"":false,""test4"":234}");

            // TODO: dupilcated variable names

            // TODO: nested
            Doufu.JSON.Object<Doufu.JSON.IJSONObject> p_nested1 = Doufu.JSON.Helpers.Parse(@"{""test"":{""test2"":234,""test3"":""sdf""}}");
            Doufu.JSON.Object<Doufu.JSON.IJSONObject> p_nested2 = Doufu.JSON.Helpers.Parse(@"  {  ""test"" :   {    ""test2""  :   {  ""test4""  :  false  }   , ""test3""  :  ""sdf""  }   }     ");

            // TODO: string escape test
            Doufu.JSON.Object<Doufu.JSON.IJSONObject> p_variableNameEscape_1 = Doufu.JSON.Helpers.Parse(@"  {  ""t\nest""   :  23423  }   ");
            Doufu.JSON.Object<Doufu.JSON.IJSONObject> p_variableNameEscape_2 = Doufu.JSON.Helpers.Parse(@"  {  ""t\0est""   :  23423  }   ");

            // negative tests

            Doufu.JSON.Object<Doufu.JSON.IJSONObject> n = Doufu.JSON.Helpers.Parse(@"{""test"":23423a}");
            Doufu.JSON.Object<Doufu.JSON.IJSONObject> n2 = Doufu.JSON.Helpers.Parse(@"{""test"":false1}");

        }
    }
}
