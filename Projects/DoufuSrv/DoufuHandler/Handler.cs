using System;
using System.Collections.Generic;
using System.Text;
using System.Web;

namespace DoufuHandler
{
    public class Handler: IHttpHandler
    {

        #region Local Variables

        private bool _isReusable = false;

        private HttpContext _httpContext;

        #endregion

        #region Properties

        /// <summary>
        /// Summary:
        ///    Gets a value indicating whether another request can use the System.Web.IHttpHandler
        ///    instance.
        ///
        /// Returns:
        ///     true if the System.Web.IHttpHandler instance is reusable; otherwise, false.
        /// </summary>
        public bool IsReusable
        {
            get
            {
                return this._isReusable;
            }
        }

        /// <summary>
        /// Get the instance of http context.
        /// </summary>
        public HttpContext HttpContext
        {
            get
            {
                return this._httpContext;
            }

            private set
            {
                this._httpContext = value;
            }
        }

        #endregion

        /// <summary>
        /// Summary:
        ///     Enables processing of HTTP Web requests by a custom HttpHandler that implements
        ///     the System.Web.IHttpHandler interface.
        ///
        /// Parameters:
        ///   context:
        ///     An System.Web.HttpContext object that provides references to the intrinsic
        ///     server objects (for example, Request, Response, Session, and Server) used
        ///     to service HTTP requests.
        /// </summary>
        public void ProcessRequest(HttpContext context)
        {
            this.HttpContext = context;

            context.Response.Write("just a test");
        }
    }
}
