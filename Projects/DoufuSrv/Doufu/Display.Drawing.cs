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
        private int _y;
        private int _x;

        public int Y
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

        public int X
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
        private int _width;
        private int _height;

        public int Width
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

        public int Height
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
        private int _z;
        private int _depth;
        
        public int Z
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

        public int Depth
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
