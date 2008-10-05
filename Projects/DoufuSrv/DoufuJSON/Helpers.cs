using System;
using System.Collections.Generic;
using System.Text;

namespace Doufu.JSON.Helpers
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
}
