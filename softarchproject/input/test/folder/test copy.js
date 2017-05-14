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