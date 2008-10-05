using System;
using System.Collections.Generic;
using System.Text;
using Doufu.Display.Drawing;

namespace Doufu.Game
{
    public class Helpers
    {
        public static bool IsRectangleCollided(Rectangle oRectangle1, Rectangle oRectangle2)
        {
            if (oRectangle1.X > (oRectangle2.X + oRectangle2.Width) || (oRectangle1.X + oRectangle1.Width) < oRectangle2.X)
            {
                return false;
            }

            if (oRectangle1.Y > (oRectangle2.Y + oRectangle2.Height) || (oRectangle1.Y + oRectangle1.Height) < oRectangle2.Y)
            {
                return false;
            }

            return true;
        }
    }
}
