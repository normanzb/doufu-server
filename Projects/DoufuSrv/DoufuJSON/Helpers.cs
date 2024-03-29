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
                this.Context.Response.ContentType = "application/json";
                this.Context.Response.Charset = "";
                this.Context.Response.Cache.SetCacheability(System.Web.HttpCacheability.NoCache);
                this.Context.Response.BinaryWrite(new byte[] { 0xEF, 0xBB, 0xBF });
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
            public void RespondJSON(IJSONObject oJson)
            {
                RespondJSON(oJson, null);
            }

            /// <summary>
            /// Using this.Context to respond specified json data
            /// </summary>
            /// <param name="oJson"></param>
            /// <param name="sCallback">Callback function name</param>
            public void RespondJSON(IJSONObject oJson, string sCallback)
            {
                this.Context.Response.Buffer = true;

                string retJString = string.Empty;
                if (sCallback == null || sCallback.Trim() == string.Empty)
                {
                    retJString = oJson.ToJSON();
                }
                else
                {
                    retJString = sCallback + "(" + oJson.ToJSON() + ");" + "\r\n\r\n";

                }

                this.Context.Response.Write(retJString);
                this.Context.ApplicationInstance.CompleteRequest();
            }

            /// <summary>
            /// Response json data but not close the response
            /// </summary>
            /// <param name="oJson"></param>
            public void RespondComet(IJSONObject oJson)
            {
                this.RespondComet(oJson, null);
            }

            /// <summary>
            /// Response json data but not close the response
            /// </summary>
            /// <param name="oJson"></param>
            public void RespondComet(IJSONObject oJson, string sCallback)
            {
                this.Context.Response.Buffer = false;

                if (sCallback != null)
                {
                    this.Context.Response.Write(sCallback + "(" + oJson.ToJSON() + ");" + "\r\n\r\n");
                }
                else
                {
                    this.Context.Response.Write(oJson.ToJSON() + "\r\n\r\n");
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

        /// <summary>
        /// Parse a JSON string to a doufu json object.
        /// (Do not allow non-standard variable name)
        /// </summary>
        /// <param name="sJSON">JSON string</param>
        /// <param name="bAllowNonStandardVariableName">True to allow non-standard variable name, for example {"foo\0\nfoo":"str"} is allowed.
        /// Otherwise incorrect format exception will be thrown.</param>
        /// <returns>Return a doufu json object</returns>
        public static JSONObject Parse(string sJSON)
        {
            return Parse(sJSON, false);
        }

        /// <summary>
        /// Parse a JSON string to a doufu json object
        /// </summary>
        /// <param name="sJSON">JSON string</param>
        /// <param name="bAllowNonStandardVariableName">True to allow non-standard variable name, for example {"foo\0\nfoo":"str"} is allowed.
        /// Otherwise incorrect format exception will be thrown.</param>
        /// <returns>Return a doufu json object</returns>
        public static JSONObject Parse(string sJSON, bool bAllowNonStandardVariableName)
        {
            sJSON = sJSON.Trim();

            // indicate current json is array format
            bool isArray = false;

            if (sJSON[0] == BRACKET_START)
            {
                if (sJSON[sJSON.Length - 1] != BRACKET_END)
                {
                    throw new Exception("Incorrect format, json starts with { but not ends with }");
                }
            }
            else if (sJSON[0] == BRACE_START)
            {
                if (sJSON[sJSON.Length - 1] != BRACE_END)
                {
                    throw new Exception("Incorrect format, json starts with [ but not ends with ]");
                }
                isArray = true;
            }
            else
            {
                throw new Exception("Incorrect format, json should starts with { or [");
            }


            // remove brackets
            sJSON = sJSON.Substring(1, sJSON.Length - 2);

            sJSON = sJSON.Trim();

            JObject jsonRet = new JObject();
            JArray jsonArrRet = new JArray();
            Regex reVariableName = new Regex(@"^[""|'][a-zA-Z$]+[a-zA-Z0-9_\$]*[""|']$", RegexOptions.None);

            if (bAllowNonStandardVariableName)
            {
                reVariableName = new Regex(@"^[""|'].*[""|']$", RegexOptions.None);
            }

            Regex reIsLetter = new Regex(@"^[a-zA-Z]*$", RegexOptions.None);
            Regex reIsNumberChar = new Regex(@"^-?[0-9]*$", RegexOptions.None);
            Regex reIsNumber = new Regex(@"^-?[0-9]+$", RegexOptions.None);

            string sVariableName = string.Empty;
            JSONObject oVariableValue;

            ParsingStatus iStatus = ParsingStatus.Unstarted;

            Collection<char> cStartSymbs = new Collection<char>();
            Collection<char> cEndSymbs = new Collection<char>();

            if (isArray)
            {
                iStatus = ParsingStatus.ExpectVariableValue |
                    ParsingStatus.ExpectStartBracket |
                    ParsingStatus.ExpectStartBrace;
            }
            else
            {
                iStatus = ParsingStatus.ExpectVariableName;
            }

            // indicate whether the last loop exited with error.
            // if there were error, the iConditionMet would be 0
            int iConditionMet = 1;

            for (int i = 0; i < sJSON.Length; )
            {
                if (iConditionMet <= 0)
                {
                    throw new Exception("Incorrect format: Expected " + iStatus.ToString() + " position: " + i.ToString());
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
                        StringBuilder sInnerJSON = new StringBuilder();
                        int iBracketCounter = 0;
                        int j;
                        for (j = i; j < sJSON.Length; j++)
                        {

                            sInnerJSON.Append(sJSON[j]);

                            if (sJSON[j] == BRACKET_START)
                            {
                                iBracketCounter++;
                            }
                            else if (sJSON[j] == BRACKET_END)
                            {
                                iBracketCounter--;
                            }

                            if (iBracketCounter == 0)
                            {
                                break;
                            }

                        }

                        oVariableValue = Parse(sInnerJSON.ToString());

                        // add value
                        if (isArray)
                        {
                            jsonArrRet.Value.Add(oVariableValue);
                        }
                        else
                        {
                            jsonRet.Items.Add(sVariableName, oVariableValue);
                        }

                        i = ++j;

                        iStatus = ParsingStatus.ExpectCommas |
                            ParsingStatus.ExpectEOS |
                            ParsingStatus.ExpectBlank;
                        iConditionMet++;
                        continue;
                    }
                }

                if (iStatus == (iStatus | ParsingStatus.ExpectEndBracket))
                {

                }
                if (iStatus == (iStatus | ParsingStatus.ExpectStartBrace))
                {
                    // check if it is "["
                    if (BRACE_START == sJSON[i])
                    {

                        StringBuilder sInnerJSON = new StringBuilder();
                        int iBracketCounter = 0;
                        int j;
                        for (j = i; j < sJSON.Length; j++)
                        {

                            sInnerJSON.Append(sJSON[j]);

                            if (sJSON[j] == BRACE_START)
                            {
                                iBracketCounter++;
                            }
                            else if (sJSON[j] == BRACE_END)
                            {
                                iBracketCounter--;
                            }

                            if (iBracketCounter == 0)
                            {
                                break;
                            }

                        }

                        oVariableValue = Parse(sInnerJSON.ToString());

                        // add value
                        if (isArray)
                        {
                            jsonArrRet.Value.Add(oVariableValue);
                        }
                        else
                        {
                            jsonRet.Items.Add(sVariableName, oVariableValue);
                        }

                        i = ++j;

                        iStatus = ParsingStatus.ExpectCommas |
                            ParsingStatus.ExpectEOS |
                            ParsingStatus.ExpectBlank;
                        iConditionMet++;
                        continue;
                    }
                }
                if (iStatus == (iStatus | ParsingStatus.ExpectEndBrace))
                {
                }
                if (iStatus == (iStatus | ParsingStatus.ExpectVariableName))
                {

                    StringBuilder sName = new StringBuilder();
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
                            if (sJSON[j] == sJSON[i] && sJSON[j - 1] != '\\')
                            {
                                bBroke = true;
                                break;
                            }

                            // process escaped unicode
                            if (sJSON[j] == '\\')
                            {
                                if (j + 5 < sJSON.Length && sJSON[j+1] == 'u')
                                {
                                    string hex = sJSON.Substring(j + 2, 4);
                                    sValue.Append((char)Int16.Parse(hex, System.Globalization.NumberStyles.HexNumber));
                                    j += 5;
                                    continue;
                                }
                            }

                            sValue.Append(sJSON[j]);
                        }

                        if (bBroke == true)
                        {

                            string sFinalValue = sValue.ToString();
                            sFinalValue = sFinalValue.Replace("\\\"", "\"");
                            sFinalValue = sFinalValue.Replace("\\\'", "\'");
                            oVariableValue = new JString(sFinalValue);

                            // add value
                            if (isArray)
                            {
                                jsonArrRet.Value.Add(oVariableValue);
                            }
                            else
                            {
                                jsonRet.Items.Add(sVariableName, oVariableValue);
                            }

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

                            oVariableValue = new JBoolean(bool.Parse(sBool.ToString()));

                            // add value
                            if (isArray)
                            {
                                jsonArrRet.Value.Add(oVariableValue);
                            }
                            else
                            {
                                jsonRet.Items.Add(sVariableName, oVariableValue);
                            }

                            i += j + 1;

                            iStatus = ParsingStatus.ExpectEOS |
                                ParsingStatus.ExpectCommas |
                                ParsingStatus.ExpectBlank;

                            iConditionMet++;
                            continue;
                        }

                    }
                    else if (reIsNumberChar.IsMatch(sJSON[i].ToString()))
                    {
                        // check if negative number
                        if (sJSON[i].ToString() == "-" && !reIsNumber.IsMatch(sJSON[i].ToString() + sJSON[i + 1].ToString()))
                        {
                            break;
                        }
                        StringBuilder sNumber = new StringBuilder();
                        int j;

                        for (j = i; j < sJSON.Length; j++)
                        {
                            if (reIsNumberChar.IsMatch(sJSON[j].ToString()))
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
                            oVariableValue = new JNumber(Int32.Parse(sNumber.ToString()));

                            // add value
                            if (isArray)
                            {
                                jsonArrRet.Value.Add(oVariableValue);
                            }
                            else
                            {
                                jsonRet.Items.Add(sVariableName, oVariableValue);
                            }

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
                        if (isArray)
                        {
                            iStatus = ParsingStatus.ExpectVariableValue |
                                ParsingStatus.ExpectStartBracket |
                                ParsingStatus.ExpectStartBrace |
                                ParsingStatus.ExpectBlank;
                        }
                        else
                        {
                            iStatus = ParsingStatus.ExpectVariableName |
                                ParsingStatus.ExpectBlank;
                        }
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

            if (isArray)
            {
                return jsonArrRet;
            }
            else
            {
                return jsonRet;
            }

        }

        /// <summary>
        /// return true if the obj is not a number
        /// </summary>
        /// <param name="obj"></param>
        /// <returns></returns>
        public static bool IsNaN(IJSONObject obj)
        {
            if (obj == JNumber.JNaN)
            {
                return true;
            }

            return false;
        }
    }
}