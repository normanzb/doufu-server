using System;
using System.Collections.Generic;
using System.Text;

namespace Doufu.Display.Drawing
{
    public class Drawable
    {

    }
    public class Point : Drawable
    {
        private long _y;
        private long _x;

        public long Y
        {
            get
            {
                return this._y;
            }
            set
            {
                this._y = value;
            }
        }

        public long X
        {
            get
            {
                return this._x;
            }
            set
            {
                this._x = value;
            }
        }
    }

    public class Rectangle : Point
    {
        private long _width;
        private long _height;

        public long Width
        {
            get
            {
                return this._width;
            }
            set
            {
                this._width = value;
            }
        }

        public long Height
        {
            get
            {
                return this._height;
            }
            set
            {
                this._height = value;
            }
        }
    }

    public class Cube : Rectangle
    {
        private long _z;
        private long _depth;

        public long Z
        {
            get
            {
                return this._z;
            }
            set
            {
                this._z = value;
            }
        }

        public long Depth
        {
            get
            {
                return this._depth;
            }
            set
            {
                this._depth = value;
            }
        }

    }
}
