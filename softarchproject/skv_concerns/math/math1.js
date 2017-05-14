An extensive math library for JavaScript and Node.js

Math.js is an extensive math library for JavaScript and Node.js. It features a flexible expression parser with support for symbolic computation, comes with a large set of built-in functions and constants, and offers an integrated solution to work with different data types like numbers, big numbers, complex numbers, fractions, units, and matrices. Powerful and easy to use.
Features

    Supports numbers, big numbers, complex numbers, fractions, units, strings, arrays, and matrices.
    Is compatible with JavaScript’s built-in Math library.
    Contains a flexible expression parser.
    Does symbolic computation.
    Comes with a large set of built-in functions and constants.
    Has no dependencies. Runs on any JavaScript engine.
    Can be used as a command line application as well.
    Is easily extensible.
    Open source.

Example

Here some example code demonstrating how to use the library. Click here to fiddle around.

// functions and constants
math.round(math.e, 3);            // 2.718
math.atan2(3, -3) / math.pi;      // 0.75
math.log(10000, 10);              // 4
math.sqrt(-4);                    // 2i
math.derivative('x^2 + x', 'x');  // 2*x+1
math.pow([[-1, 2], [3, 1]], 2);
     // [[7, 0], [0, 7]]

// expressions
math.eval('1.2 * (2 + 4.5)');     // 7.8
math.eval('5.08 cm to inch');     // 2 inch
math.eval('sin(45 deg) ^ 2');     // 0.5
math.eval('9 / 3 + 2i');          // 3 + 2i
math.eval('det([-1, 2; 3, 1])');  // -7

// chaining
math.chain(3)
    .add(4)
    .multiply(2)
    .done(); // 14

Demo

Try the expression parser below.
See Math Notepad for a full application.

1.2 / (3.3 + 1.7)

0.24

a = 5.08 cm + 2 inch

10.16 cm

a to inch

4 inch

sin(90 deg)

1

f(x, y) = x ^ y

f(x, y)

f(2, 3)

8

Shortcut keys:

    Press S to set focus to the input field
    Press Ctrl+F11 to toggle full screen
    Enter "clear" to clear history

 