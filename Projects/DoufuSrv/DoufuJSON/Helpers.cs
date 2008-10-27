using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Text;
using System.Text.RegularExpressions;

namespace Doufu.JSON
{
    public class Helpers
    {
        public class JSONResponder
        {
            private System.Web.HttpContext _context;

            public JSONResponder()
            {
                this.Context = System.Web.HttpContext.Current;
                this.Context.Response.ContentType = "text/plain";
                this.Context.Response.Buffer = false;
            }

            /// <summary>
            /// Set or get the http context which used for responding json data.
            /// </summary>
            public System.Web.HttpContext Context
            {
                get
                {
                    return this._context;
                }
                private set
                {
                    this._context = value;
                }
            }

            /// <summary>
            /// Using this.Context to respond specified json data
            /// </summary>
            /// <param name="oJson"></param>
            public void RespondJSON(Doufu.JSON.IJSONObject oJson)
            {
                this.Context.Response.Write(oJson.ToString());
                this.Context.Response.Flush();
                this.Context.Response.Close();
            }

            /// <summary>
            /// Response json data but not close the response
            /// </summary>
            /// <param name="oJson"></param>
            public void RespondComet(Doufu.JSON.IJSONObject oJson)
            {
                this.RespondComet(oJson, null);
            }

            /// <summary>
            /// Response json data but not close the response
            /// </summary>
            /// <param name="oJson"></param>
            public void RespondComet(Doufu.JSON.IJSONObject oJson, string sCallback)
            {
                if (sCallback != null)
                {
                    this.Context.Response.Write(sCallback + "(" + oJson.ToString() + ");" + "\r\n\r\n");
                }
                else
                {
                    this.Context.Response.Write(oJson.ToString() + "\r\n\r\n");
                }
                this.Context.Response.Flush();
            }
        }

        private enum ParsingStatus
        {
            Unstarted = 0,
            ExpectStartBracket = 1,
            ExpectEndBracket = 2,
            ExpectStartBrace = 4,
            ExpectEndBrace = 8,
            ExpectVariableName = 16,
            ExpectVariableValue = 32,
            ExpectCommas = 64,
            ExpectBlank = 128,
            ExpectEOS = 256,
        }

        private enum JSONTypesStatus
        {
            Unknown = 0,
            ExpectQuote = 1,
            ExpectLetter = 2,
            ExpectNumber = 3,
            
        }

        private const char BRACKET_START = '{';
        private const char BRACKET_END = '}';
        private const char BRACE_START = '[';
        private const char BRACE_END = ']';
        private const char NAME_VALUE_SEPARATOR = ':';
           

        public static Doufu.JSON.Object<IJSONObject> Parse(string sJSON)
        {
            sJSON = sJSON.Trim();

            if (sJSON[0] != BRACKET_START || sJSON[sJSON.Length - 1] != BRACKET_END)
            {
                throw new Exception("Incorrect format");
            }

            // remove brackets
            sJSON = sJSON.Substring(1, sJSON.Length - 2);

            sJSON = sJSON.Trim();

            Object<IJSONObject> jsonRet = new Object<IJSONObject>();
            Regex reVariableName = new Regex(@"^""[a-zA-Z$]+[a-zA-Z0-9_\$]""$", RegexOptions.None);
            Regex reIsLetter = new Regex(@"^[a-zA-Z]*$", RegexOptions.None);
            Regex reIsNumber = new Regex(@"^[0-9]*$", RegexOptions.None);

            string sVariableName = string.Empty;
            IJSONObject oVariableValue;

            ParsingStatus iStatus = ParsingStatus.Unstarted;

            Collection<char> cStartSymbs = new Collection<char>();
            Collection<char> cEndSymbs = new Collection<char>();

            iStatus = ParsingStatus.ExpectVariableName;

            int iConditionMet = 1;

            for (int i = 0; i < sJSON.Length; )
            {
                if (iConditionMet <= 0)
                {
                    throw new Exception("Incorrect format");
                }
                else
                {
                    iConditionMet = 0;
                }

                if (iStatus == (iStatus | ParsingStatus.ExpectStartBracket))
                {
                    // is start symbol?
                    if (BRACKET_START == sJSON[i])
                    {
                        StringBuilder sInnerJSON =new StringBuilder();
                        int j;
                        for (j = i; j < sJSON.Length; j++)
                        {

                            sInnerJSON.Append(sJSON[j]);

                            if (sJSON[j] == BRACKET_END)
                            {
                                break;
                            }

                            
                        }

                        oVariableValue = Parse(sInnerJSON.ToString());

                        // add value
                        jsonRet.Items.Add(sVariableName, oVariableValue);

                        i = j++;
                        
                        iStatus = ParsingStatus.ExpectCommas |
                            ParsingStatus.ExpectEOS;
                        iConditionMet++;
                        continue;
                    }
                }
                   
                if (iStatus == (iStatus | ParsingStatus.ExpectEndBracket))
                {

                }
                if (iStatus == (iStatus | ParsingStatus.ExpectStartBrace))
                {

                }
                if (iStatus == (iStatus | ParsingStatus.ExpectEndBrace))
                {
                }
                if (iStatus == (iStatus | ParsingStatus.ExpectVariableName))
                {

                    StringBuilder sName =new StringBuilder();
                    string sActualName;
                    bool bBroke = false;
                    int j;
                    for (j = i; j < sJSON.Length; j++)
                    {
                        if (sJSON[j] == NAME_VALUE_SEPARATOR)
                        {
                            bBroke = true;
                            break;
                        }

                        sName.Append(sJSON[j]);
                    }

                    sActualName = sName.ToString();
                    sActualName = sActualName.Trim();

                    if (reVariableName.IsMatch(sActualName.ToString()) && bBroke == true)
                    {
                        // TODO: string escape
                        sActualName = sActualName.Substring(1, sActualName.Length - 2);
                        sVariableName = sActualName;
                        i = ++j;
                        iStatus = ParsingStatus.ExpectVariableValue |
                            ParsingStatus.ExpectStartBrace |
                            ParsingStatus.ExpectStartBracket |
                            ParsingStatus.ExpectBlank;
                        iConditionMet++;
                        continue;
                    }
                }
                if (iStatus == (iStatus | ParsingStatus.ExpectVariableValue))
                {

                    if (sJSON[i] == '"' || sJSON[i] == '\'')
                    {
                        StringBuilder sValue = new StringBuilder();
                        bool bBroke = false;
                        int j;
                        for (j = i + 1; j < sJSON.Length; j++)
                        {
                            if (sJSON[j] == sJSON[i] && sJSON[j-1] != '\\')
                            {
                                bBroke = true;
                                break;
                            }

                            sValue.Append(sJSON[j]);
                        }

                        if (bBroke == true)
                        {
                            oVariableValue = new String(sValue.ToString());

                            // add value
                            jsonRet.Items.Add(sVariableName, oVariableValue);

                            i = j + 1;

                            iStatus = ParsingStatus.ExpectEOS |
                                ParsingStatus.ExpectCommas |
                                ParsingStatus.ExpectBlank;

                            iConditionMet++;
                            continue;
                        }
                    }
                    else if (reIsLetter.IsMatch(sJSON[i].ToString()))
                    {
                        StringBuilder sBool = new StringBuilder();
                        bool bFound = false;
                        int j;

                        for (j = 0; j < 5; j++)
                        {
                            sBool.Append(sJSON[i + j]);

                            if (j == 3 && sBool.ToString() == "true")
                            {
                                bFound = true;
                                break;
                            }
                            else if (j == 4 && sBool.ToString() == "false")
                            {
                                bFound = true;
                                break;
                            }
                        }

                        if (bFound == true)
                        {

                            oVariableValue = new Boolean(bool.Parse(sBool.ToString()));

                            // add value
                            jsonRet.Items.Add(sVariableName, oVariableValue);

                            i += j + 1;

                            iStatus = ParsingStatus.ExpectEOS |
                                ParsingStatus.ExpectCommas |
                                ParsingStatus.ExpectBlank;

                            iConditionMet++;
                            continue;
                        }

                    }
                    else if (reIsNumber.IsMatch(sJSON[i].ToString()))
                    {
                        StringBuilder sNumber = new StringBuilder();
                        int j;

                        for (j = i; j < sJSON.Length; j++)
                        {
                            if (reIsNumber.IsMatch(sJSON[j].ToString()))
                            {
                                sNumber.Append(sJSON[j]);
                            }
                            else 
                            {
                                if (sJSON[j] != '.')
                                {
                                    break;
                                }
                                sNumber.Append(sJSON[j]);
                            }
                        }

                        if (j == sJSON.Length || sJSON[j] == ',' || sJSON[j] == ' ')
                        {
                            oVariableValue = new Number(Int32.Parse(sNumber.ToString()));

                            // add value
                            jsonRet.Items.Add(sVariableName, oVariableValue);

                            i = j;

                            iStatus = ParsingStatus.ExpectEOS |
                                ParsingStatus.ExpectCommas |
                                ParsingStatus.ExpectBlank;

                            iConditionMet++;
                            continue;
                        }
                    }
                }

                if (iStatus == (iStatus | ParsingStatus.ExpectBlank))
                {
                    if (i < sJSON.Length && sJSON[i] == ' ')
                    {
                        i++;
                        iConditionMet++;
                        continue;
                    }
                }

                if (iStatus == (iStatus | ParsingStatus.ExpectCommas))
                {

                    if (i < sJSON.Length && sJSON[i] == ',')
                    {
                        i++;
                        iStatus = ParsingStatus.ExpectVariableName |
                            ParsingStatus.ExpectBlank;
                        iConditionMet++;
                        continue;
                    }
                }

                if (iStatus == (iStatus | ParsingStatus.ExpectEOS))
                {
                    if (i == sJSON.Length)
                    {
                        iConditionMet++;
                        continue;
                    }
                }


                
            }

            return jsonRet;

        }
    }
}