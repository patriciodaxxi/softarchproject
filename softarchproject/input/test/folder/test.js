module.exports = {
	sayHelloInEnglish: function() {
		return "HELLO";
	},
	
	sayHelloInSpanish: function() {
		return "Hola";
	}
};

// greetings.js
var exports = module.exports = {};

//import 'app.js';
import * as myModule from 'my-module';

module.exports = {
    sqrt: sqrt,
    square: square,
    diag: diag,
    backing: function(sir, sri){
    },
    nexting: {
    sqrt: sqrt,
    },
    testClass: class test{
    }
};
module.exports.x = x;
module.exports.addX = addX;

module.exports = class Calculator {
}
module.exports = function(sir, sri){
}
    
module.exports = x;

export function sum(x, y) {
  return x + y;
}
export function foo() {
  return 'bar';
}
export function bar() {
  return 'foo';
}
export var pi = 3.141593;
// lib/mathplusplus.js
export * from "lib/math"; //modify to include absolute path

export var e = 2.71828182846;
export var e = {X: "STRING"};
export default function gty(x) {
    return Math.exp(x);
}
export default far;
class ty{}
export default ty;

export let foo = {bar:'my-default'};
export {foo as bar};
export function f() {};
export class c {};
export const sqrt = Math.sqrt;
export function square(x) {
    return x * x;
}
export function diag(x, y) {
    return sqrt(square(x) + square(y));
}

export default function () { };
export default class {  };
export { each as forEach };

module.exports = new AdvancedCalculator()


//------ module1.js ------
export default 123;

//------ module2.js ------
const D = 123;
export { D as default }; //what is this?
export {e as d, y};
export * from "lib/math";
export {e as f, t} from "lib/stat";

export var myVar1 = 123;
export let myVar2 = "sri", sr="io";
export const MY_CONST = 3.14;

export function myFunc() {
    
}
export function* myGeneratorFunc() {
    
}
export class MyClass {
    
}

export default 123;
export default function (x) {
    return x
};
export default x => x;
export default class {
    
};

const MY_CONST = 2.16;
function myFunc() {
    
}

export { MY_CONST, myFunc, myptr as mp };

export { MY_CONST as THE_CONST, myFunc as theFunc };

export default x;

export { cube, foo };